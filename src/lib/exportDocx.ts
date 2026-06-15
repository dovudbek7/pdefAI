import { asBlob } from 'html-docx-js-typescript';
import type { BookMeta, Typography } from '../types';
import type { PaginateResult } from './paginate';

interface ExportDocxInput {
  content: string; // book HTML (TipTap)
  meta: BookMeta;
  typography: Typography;
  result: PaginateResult; // used for the optional TOC list
  includeCover: boolean;
  includeToc: boolean;
  fileName?: string;
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function slugFile(name: string) {
  const base = name.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-') || 'kitob';
  return `${base}.docx`;
}

/**
 * The HTML→docx converter ignores <style> blocks and only reads INLINE styles.
 * So we walk the TipTap HTML and stamp inline styles on every block element.
 */
function inlineStyledContent(html: string, typography: Typography): string {
  const align = typography.justify ? 'justify' : 'left';
  const lh = typography.lineHeight;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  const set = (el: Element, style: string) => el.setAttribute('style', style);

  body.querySelectorAll('p').forEach((el) => {
    const indent = typography.paragraphIndent ? 'text-indent:24pt;' : '';
    set(el, `margin:0 0 8pt;text-align:${align};line-height:${lh};font-size:${typography.bodySizePt}pt;${indent}`);
  });
  body.querySelectorAll('h1').forEach((el) =>
    set(el, 'font-size:20pt;font-weight:bold;margin:14pt 0 8pt;line-height:1.2;'),
  );
  body.querySelectorAll('h2').forEach((el) =>
    set(el, 'font-size:15pt;font-weight:bold;margin:12pt 0 6pt;line-height:1.2;'),
  );
  body.querySelectorAll('h3').forEach((el) =>
    set(el, 'font-size:13pt;font-weight:bold;margin:10pt 0 4pt;'),
  );
  body.querySelectorAll('blockquote').forEach((el) =>
    set(el, 'margin:8pt 0 8pt 24pt;font-style:italic;color:#444;'),
  );
  body.querySelectorAll('li').forEach((el) =>
    set(el, `margin:0 0 4pt;font-size:${typography.bodySizePt}pt;line-height:${lh};`),
  );
  body.querySelectorAll('img').forEach((el) => set(el, 'max-width:100%;'));

  return body.innerHTML;
}

/**
 * Exports the book as a flowing .docx (Word reflows pages itself, so our
 * pagination/page-numbers don't apply). Headings are kept so Word can build
 * its own table of contents. Conversion via html-docx-js-typescript.
 */
export async function exportDocx(input: ExportDocxInput) {
  const { content, meta, typography, result } = input;

  const cover = input.includeCover
    ? `<p style="text-align:center;font-size:30pt;font-weight:bold;margin:120pt 0 0">${esc(meta.title)}</p>
       <p style="text-align:center;font-size:14pt;margin:24pt 0 0">${esc(meta.author)}</p>
       <p style="text-align:center;font-size:11pt;color:#666;margin:8pt 0 0">${meta.year}</p>
       <p style="page-break-before:always">&nbsp;</p>`
    : '';

  const toc = input.includeToc && result.toc.length
    ? `<p style="font-size:20pt;font-weight:bold;margin:0 0 12pt">Mundarija</p>` +
      result.toc
        .map(
          (t) =>
            `<p style="margin:0 0 4pt;padding-left:${(t.level - 1) * 18}pt;font-size:${t.level === 1 ? 12 : 11}pt">${esc(t.text)}</p>`,
        )
        .join('') +
      `<p style="page-break-before:always">&nbsp;</p>`
    : '';

  const bodyHtml = inlineStyledContent(content, typography);

  const doc = `<!doctype html><html><head><meta charset="utf-8"></head>
    <body style="font-family:'${typography.bodyFont}',Georgia,serif">${cover}${toc}${bodyHtml}</body></html>`;

  const out = await asBlob(doc, {
    margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch = 1440 twips
  });
  const blob = out instanceof Blob ? out : new Blob([out as BlobPart]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = slugFile(input.fileName || meta.title);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
