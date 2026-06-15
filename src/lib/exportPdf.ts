import type { BookMeta, Margins, NumberSettings, PageFormat, Typography } from '../types';
import type { PaginateResult } from './paginate';

interface ExportInput {
  result: PaginateResult;
  meta: BookMeta;
  format: PageFormat;
  margins: Margins;
  typography: Typography;
  numbering: NumberSettings;
  includeCover: boolean;
  includeToc: boolean;
  fileName?: string; // becomes the print document title → suggested PDF filename
}

const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';

/**
 * Builds a print-ready HTML document (one block per physical page) and opens
 * the browser print dialog. User chooses "Save as PDF". Server-side Puppeteer
 * will replace this once the Django backend exists.
 */
export function exportPdf(input: ExportInput) {
  const { result, meta, format, margins, typography, numbering } = input;
  const docTitle = (input.fileName && input.fileName.trim()) || meta.title;

  const sheet = (inner: string, parity: 'odd' | 'even') => `
    <section class="sheet ${parity}">${inner}</section>`;

  const cover = input.includeCover
    ? sheet(
        `<div class="cover">
           <div class="cover-title">${esc(meta.title)}</div>
           <div class="cover-author">${esc(meta.author)}</div>
           <div class="cover-year">${meta.year}</div>
         </div>`,
        'odd',
      )
    : '';

  const tocHtml = input.includeToc
    ? sheet(
        `<h2 class="toc-h">Mundarija</h2>
         <div class="toc">${result.toc
           .map(
             (t) =>
               `<div class="toc-row l${t.level}"><span>${esc(t.text)}</span><span class="dots"></span><span class="pn">${t.pageLabel ?? '—'}</span></div>`,
           )
           .join('')}</div>`,
        'even',
      )
    : '';

  const pages = result.pages
    .map((p) => {
      const parity = (p.index + 1) % 2 === 1 ? 'odd' : 'even';
      const head = `<div class="run-head">${esc(p.runningHead)}</div>`;
      const num = p.pageLabel
        ? `<div class="page-num pos-${numbering.position}">${p.pageLabel}</div>`
        : '';
      return sheet(`${head}<div class="book-body">${p.html}</div>${num}`, parity);
    })
    .join('');

  const doc = `<!doctype html><html lang="uz"><head><meta charset="utf-8">
  <title>${esc(docTitle)}</title>
  <link rel="stylesheet" href="${FONT_LINK}">
  <style>
    @page { size: ${format.widthMm}mm ${format.heightMm}mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: #fff; }
    .sheet {
      width: ${format.widthMm}mm; height: ${format.heightMm}mm;
      padding: ${margins.top}mm ${margins.outer}mm ${margins.bottom}mm ${margins.inner}mm;
      page-break-after: always; position: relative; overflow: hidden;
      display: flex; flex-direction: column;
      font-family: '${typography.bodyFont}', serif;
    }
    .sheet.even { padding: ${margins.top}mm ${margins.inner}mm ${margins.bottom}mm ${margins.outer}mm; }
    .run-head { text-align: center; font-style: italic; color: #8a8074;
      font-size: 7.5pt; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 5mm; }
    .book-body { flex: 1; font-size: ${typography.bodySizePt}pt; line-height: ${typography.lineHeight};
      text-align: ${typography.justify ? 'justify' : 'left'}; color: #1f1b16; overflow: hidden;
      overflow-wrap: break-word; hyphens: auto; }
    .book-body p { margin: 0 0 0.55em; text-align-last: left; }
    .book-body p + p { text-indent: ${typography.paragraphIndent ? '1.4em' : '0'}; }
    .book-body p.cont { text-indent: 0; }
    .book-body h1 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.7em; margin: 0 0 0.6em; }
    .book-body h2 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.3em; margin: 0.8em 0 0.4em; }
    .book-body h3 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.1em; margin: 0.7em 0 0.3em; }
    .book-body blockquote { border-left: 1.5px solid #b5562f80; padding-left: 0.8em; margin: 0.7em 0;
      font-style: italic; font-family: 'Fraunces', serif; color: #5c5347; }
    .book-body ul, .book-body ol { padding-left: 1.4em; margin: 0 0 0.6em; }
    .book-body ul { list-style: disc; } .book-body ol { list-style: decimal; }
    .book-body img { max-width: 100%; }
    .page-num { font-size: 9pt; color: #8a8074; margin-top: 3mm; font-variant-numeric: tabular-nums; }
    .pos-bottom-center { text-align: center; }
    .sheet.odd .pos-bottom-outer { text-align: right; } .sheet.even .pos-bottom-outer { text-align: left; }
    .cover { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .cover-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 28pt; line-height: 1.1; }
    .cover-author { font-family: 'Spectral', serif; font-size: 13pt; margin-top: 8mm; color: #5c5347; }
    .cover-year { font-family: 'Spectral', serif; font-size: 10pt; margin-top: 4mm; color: #8a8074; }
    .toc-h { font-family: 'Fraunces', serif; font-weight: 600; font-size: 20pt; margin: 6mm 0 8mm; }
    .toc-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 2mm; font-size: 11pt; }
    .toc-row.l2 { padding-left: 5mm; font-size: 10pt; color: #5c5347; }
    .toc-row.l3 { padding-left: 10mm; font-size: 10pt; color: #5c5347; }
    .toc-row .dots { flex: 1; border-bottom: 1px dotted #b3a896; transform: translateY(-3px); }
    .toc-row .pn { font-variant-numeric: tabular-nums; color: #8a8074; }
  </style></head>
  <body>${cover}${pages}${tocHtml}</body></html>`;

  // Print via a hidden iframe — no popup blocker, no browser dialogs of our own.
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000);
  };

  iframe.onload = () => {
    const w = iframe.contentWindow;
    if (!w) return;
    const go = () => {
      w.focus();
      w.print();
      cleanup();
    };
    // wait for fonts inside the iframe before printing
    const fdoc = iframe.contentDocument as Document & { fonts?: FontFaceSet };
    if (fdoc?.fonts?.ready) {
      fdoc.fonts.ready.then(() => window.setTimeout(go, 150));
    } else {
      window.setTimeout(go, 500);
    }
  };

  const idoc = iframe.contentDocument!;
  idoc.open();
  idoc.write(doc);
  idoc.close();
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
