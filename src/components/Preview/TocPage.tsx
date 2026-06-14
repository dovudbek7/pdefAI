import type { TocEntry } from '../../types';
import { mmToPx, ptToPx } from '../../lib/pageFormats';
import { useBookStore } from '../../store/bookStore';

/** Auto-generated table-of-contents page (front matter, unnumbered). */
export function TocPage({ toc }: { toc: TocEntry[] }) {
  const format = useBookStore((s) => s.format);
  const margins = useBookStore((s) => s.margins);

  const w = mmToPx(format.widthMm);
  const h = mmToPx(format.heightMm);

  return (
    <div
      className="fade-up bg-[#fdfbf6] relative shrink-0"
      style={{
        width: w,
        height: h,
        boxShadow: '0 1px 1px rgba(31,27,22,0.04), 0 12px 30px -12px rgba(31,27,22,0.22)',
      }}
    >
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          paddingTop: mmToPx(margins.top + 6),
          paddingBottom: mmToPx(margins.bottom),
          paddingLeft: mmToPx(margins.inner),
          paddingRight: mmToPx(margins.outer),
        }}
      >
        <h2
          className="font-display font-semibold text-ink"
          style={{ fontSize: ptToPx(20), marginBottom: mmToPx(8) }}
        >
          Mundarija
        </h2>
        <div className="flex-1" style={{ fontFamily: "'Spectral', serif" }}>
          {toc.length === 0 ? (
            <p className="text-muted italic" style={{ fontSize: ptToPx(10) }}>
              Sarlavhalar qo'shilsa, mundarija avtomatik shakllanadi.
            </p>
          ) : (
            toc.map((t) => (
              <div
                key={t.id}
                className="flex items-baseline gap-2 text-ink/90"
                style={{
                  fontSize: ptToPx(t.level === 1 ? 11 : 10),
                  marginBottom: mmToPx(t.level === 1 ? 3 : 1.8),
                  paddingLeft: mmToPx((t.level - 1) * 5),
                  fontWeight: t.level === 1 ? 600 : 400,
                  fontFamily: t.level === 1 ? "'Fraunces', serif" : "'Spectral', serif",
                }}
              >
                <span className="whitespace-nowrap">{t.text}</span>
                <span
                  className="flex-1 border-b border-dotted border-muted/40"
                  style={{ transform: 'translateY(-3px)' }}
                />
                <span className="tnum text-muted">{t.pageLabel ?? '—'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
