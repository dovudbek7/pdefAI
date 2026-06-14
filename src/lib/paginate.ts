import type {
  Margins,
  NumberSettings,
  PageFormat,
  RenderedPage,
  TocEntry,
  Typography,
} from '../types';
import { mmToPx, ptToPx, toRoman } from './pageFormats';

export interface PaginateInput {
  html: string;
  format: PageFormat;
  margins: Margins;
  typography: Typography;
  numbering: NumberSettings;
  bookTitle: string;
}

export interface PaginateResult {
  pages: RenderedPage[];
  toc: TocEntry[];
  contentWidthPx: number;
  contentHeightPx: number;
}

const HEADING_TAGS = new Set(['H1', 'H2', 'H3']);

/** Compute the visible page label for a 0-based physical page index. */
export function pageLabelFor(index: number, n: NumberSettings): string | null {
  if (!n.enabled) return null;
  const physical = index + 1;
  if (physical < n.startAtPage) return null;
  const num = n.startFrom + (physical - n.startAtPage);
  return n.style === 'roman' ? toRoman(num) : String(num);
}

/**
 * Measurement-based paginator. Lays blocks into an offscreen box sized to the
 * page content area and breaks to a new page when content overflows. Long
 * paragraphs are split at word boundaries. Headings get basic orphan control.
 */
export function paginate(input: PaginateInput): PaginateResult {
  const { html, format, margins, typography, numbering, bookTitle } = input;

  const contentWidthPx = mmToPx(format.widthMm - margins.inner - margins.outer);
  const fontPx = ptToPx(typography.bodySizePt);

  // Build a real page skeleton offscreen that EXACTLY mirrors Page.tsx
  // (header + body + footer, real paddings). We then measure how much fits in
  // the body's real available height — no estimation, so text can't get clipped.
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';

  const pageEl = document.createElement('div');
  pageEl.style.cssText = [
    `box-sizing:border-box`,
    `width:${mmToPx(format.widthMm)}px`,
    `height:${mmToPx(format.heightMm)}px`,
    `padding:${mmToPx(margins.top)}px ${mmToPx(margins.outer)}px ${mmToPx(margins.bottom)}px ${mmToPx(margins.inner)}px`,
    `display:flex`,
    `flex-direction:column`,
  ].join(';');

  // header (running head — one line, matches Page.tsx center variant)
  const headEl = document.createElement('div');
  headEl.style.cssText = `font-size:${ptToPx(7.5)}px;margin-bottom:${mmToPx(5)}px;text-transform:uppercase;letter-spacing:0.18em;font-style:italic;white-space:nowrap;overflow:hidden;`;
  headEl.textContent = bookTitle || '—';

  // footer (page number — one line). Reserved on every page so nothing clips.
  const footEl = document.createElement('div');
  footEl.style.cssText = `font-size:${ptToPx(9)}px;margin-top:${mmToPx(3)}px;`;
  footEl.textContent = '0';

  // body (the actual measuring area; flex:1 → its clientHeight is exact)
  const box = document.createElement('div');
  box.className = `book-measure${typography.paragraphIndent ? '' : ' no-indent'}`;
  box.style.cssText = [
    `flex:1`,
    `min-height:0`,
    `overflow:hidden`,
    `font-family:'${typography.bodyFont}',serif`,
    `font-size:${fontPx}px`,
    `line-height:${typography.lineHeight}`,
    typography.justify ? 'text-align:justify' : 'text-align:left',
  ].join(';');

  pageEl.appendChild(headEl);
  pageEl.appendChild(box);
  pageEl.appendChild(footEl);
  host.appendChild(pageEl);
  document.body.appendChild(host);

  // Real available body height after layout (header/footer subtracted by flexbox)
  const contentHeightPx = box.clientHeight;

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild as HTMLElement;
  const blocks = Array.from(root?.children ?? []) as HTMLElement[];

  const pages: HTMLElement[][] = [[]]; // each page = list of element nodes
  let current = pages[0];
  const toc: Omit<TocEntry, 'pageLabel'>[] = [];

  const fits = (els: HTMLElement[]) => {
    box.innerHTML = '';
    for (const el of els) box.appendChild(el.cloneNode(true));
    // scrollHeight grows with content; clientHeight is the real cap.
    return box.scrollHeight <= box.clientHeight + 0.5;
  };

  const newPage = () => {
    current = [];
    pages.push(current);
  };

  const placeSplit = (block: HTMLElement) => {
    const parts = splitBlock(block, fits, current);
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) newPage();
      current.push(parts[i]);
    }
  };

  for (const block of blocks) {
    const isHeading = HEADING_TAGS.has(block.tagName);
    // Headings are never split; in 'paragraph' mode nothing is split.
    const keepWhole = isHeading || typography.pageBreak === 'paragraph';

    // Orphan control: avoid a heading stranded at the very bottom.
    if (isHeading && current.length > 0) {
      const probe = block.cloneNode(true) as HTMLElement;
      const line = document.createElement('p');
      line.textContent = 'Ag';
      if (!fits([...current, probe, line])) {
        newPage();
      }
    }

    if (fits([...current, block])) {
      current.push(block);
    } else if (!keepWhole) {
      // 'fill' mode: fill remaining space, overflow words flow to next page.
      placeSplit(block);
    } else {
      // keep whole: move the entire block to a fresh page (split only if it
      // alone is taller than a full page).
      if (current.length > 0) newPage();
      if (fits([block])) current.push(block);
      else placeSplit(block);
    }

    if (isHeading) {
      toc.push({
        id: `h-${toc.length}`,
        level: (Number(block.tagName[1]) as 1 | 2 | 3) || 1,
        text: block.textContent?.trim() ?? '',
        pageIndex: pages.length - 1,
      });
    }
  }

  document.body.removeChild(host);

  // Running head = title of the chapter active on each page (last h1/h2 seen).
  const headPerPage: string[] = [];
  let lastHead = bookTitle;
  for (let p = 0; p < pages.length; p++) {
    const headingOnPage = toc
      .filter((t) => t.pageIndex === p && t.level <= 2)
      .pop();
    if (headingOnPage) lastHead = headingOnPage.text;
    headPerPage[p] = lastHead;
  }

  const rendered: RenderedPage[] = pages.map((els, i) => ({
    index: i,
    html: els.map((e) => e.outerHTML).join(''),
    runningHead: headPerPage[i] ?? bookTitle,
    pageLabel: pageLabelFor(i, numbering),
  }));

  const tocFull: TocEntry[] = toc.map((t) => ({
    ...t,
    pageLabel: pageLabelFor(t.pageIndex, numbering),
  }));

  return { pages: rendered, toc: tocFull, contentWidthPx, contentHeightPx };
}

/** Split a single oversized block (paragraph-like) by words across pages. */
function splitBlock(
  block: HTMLElement,
  fits: (els: HTMLElement[]) => boolean,
  pageStart: HTMLElement[],
): HTMLElement[] {
  // Only split text-bearing blocks; otherwise return as-is.
  const text = block.textContent ?? '';
  if (!text.trim()) return [block];

  const words = text.split(/(\s+)/);
  const make = (chunk: string) => {
    const el = block.cloneNode(false) as HTMLElement;
    el.textContent = chunk;
    return el;
  };

  const out: HTMLElement[] = [];
  let acc = '';
  let onFirstPage = true;
  for (const w of words) {
    const trial = acc + w;
    const el = make(trial);
    const context = onFirstPage && out.length === 0 ? pageStart : [];
    if (fits([...context, el]) || acc === '') {
      acc = trial;
    } else {
      out.push(make(acc));
      acc = w.trimStart();
      onFirstPage = false;
    }
  }
  if (acc.trim()) out.push(make(acc));
  // continuation fragments must not be indented like a new paragraph
  for (let i = 1; i < out.length; i++) out[i].classList.add('cont');
  return out.length ? out : [block];
}
