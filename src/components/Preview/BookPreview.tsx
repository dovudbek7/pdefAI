import { Page } from './Page';
import { PreviewControls } from './PreviewControls';
import { CoverPage } from './CoverPage';
import { useBookStore } from '../../store/bookStore';
import { MM_PER_INCH, SCREEN_DPI, formatLabel } from '../../lib/pageFormats';
import type { PaginateResult } from '../../lib/paginate';
import { TocPage } from './TocPage';

const DISPLAY_PX_PER_MM = 2.0;
const FULL_PX_PER_MM = SCREEN_DPI / MM_PER_INCH;

export function BookPreview({ result }: { result: PaginateResult }) {
  const format = useBookStore((s) => s.format);
  const margins = useBookStore((s) => s.margins);
  const numbering = useBookStore((s) => s.numbering);
  const meta = useBookStore((s) => s.meta);
  const zoom = useBookStore((s) => s.zoom);
  const spread = useBookStore((s) => s.spread);

  const pxPerMm = DISPLAY_PX_PER_MM * zoom;
  const scale = pxPerMm / FULL_PX_PER_MM;
  const dispW = format.widthMm * pxPerMm;
  const dispH = format.heightMm * pxPerMm;

  const wrap = (node: React.ReactNode, key: string | number, id?: string) => (
    <div key={key} id={id} style={{ width: dispW, height: dispH }} className="shrink-0 scroll-mt-6">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{node}</div>
    </div>
  );

  const total = result.pages.length;

  return (
    <section className="flex flex-col h-full bg-[#ece5d8] min-w-0">
      <PreviewControls />

      <div className="flex-1 overflow-auto scroll-thin p-8">
        <div
          className={`mx-auto ${
            spread
              ? 'grid grid-cols-2 gap-3 justify-center'
              : 'flex flex-col items-center gap-8'
          }`}
          style={spread ? { width: dispW * 2 + 12 } : undefined}
        >
          {/* Cover page — shown as the very first page when a cover image is set */}
          {meta.cover &&
            wrap(
              <CoverPage meta={meta} format={format} margins={margins} scale={scale} />,
              'cover',
              'page-cover',
            )}

          {result.pages.map((p, i) =>
            wrap(<Page page={p} delay={Math.min(i * 0.04, 0.4)} />, p.index, `page-${p.index}`),
          )}
          {wrap(<TocPage toc={result.toc} />, 'toc')}
        </div>

        <div className="text-center text-[10px] uppercase tracking-[0.25em] text-muted/70 mt-8">
          {meta.cover ? total + 1 : total} sahifa
          {numbering.enabled ? ` · raqam ${numbering.startAtPage}-sahifadan` : ''}
        </div>
      </div>

      <div className="h-9 shrink-0 border-t border-line flex items-center justify-between px-4 text-[11px] text-muted bg-panel/60">
        <span className="tnum">{formatLabel(format)} · {format.label}</span>
        <span>
          Chekka: {margins.top}/{margins.inner}mm · raqam:{' '}
          {numbering.position === 'bottom-center'
            ? 'past o`rta'
            : numbering.position === 'bottom-outer'
              ? 'past chekka'
              : 'tepa chekka'}
        </span>
      </div>
    </section>
  );
}
