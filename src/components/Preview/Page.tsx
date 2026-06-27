import type { RenderedPage } from '../../types';
import { mmToPx, ptToPx } from '../../lib/pageFormats';
import { wrapPageLabel } from '../../lib/pageBorders';
import { useBookStore } from '../../store/bookStore';
import { PageBorderOverlay } from './PageBorderOverlay';

interface PageProps {
  page: RenderedPage;
  delay?: number;
}

/**
 * Renders one page at FULL resolution (mmToPx), matching the paginator's
 * measuring box exactly. BookPreview scales it down for display.
 */
export function Page({ page, delay = 0 }: PageProps) {
  const format = useBookStore((s) => s.format);
  const margins = useBookStore((s) => s.margins);
  const typography = useBookStore((s) => s.typography);
  const numbering = useBookStore((s) => s.numbering);
  const border = useBookStore((s) => s.border);

  const w = mmToPx(format.widthMm);
  const h = mmToPx(format.heightMm);
  const isOdd = (page.index + 1) % 2 === 1; // odd = right page

  // Mirror margins by parity (inner toward spine).
  const left = isOdd ? margins.inner : margins.outer;
  const right = isOdd ? margins.outer : margins.inner;

  const numPos = numbering.position;
  const numAlign =
    numPos === 'bottom-center'
      ? 'center'
      : isOdd
        ? 'right'
        : 'left';

  const numBorderType = border?.numBorderType ?? 'none';
  const numBorderColor = border?.numBorderColor ?? (border?.color ?? '#1a1a1a');

  const pageLabel = page.pageLabel
    ? (numBorderType !== 'none'
        ? wrapPageLabel(page.pageLabel, numBorderType, numBorderColor)
        : page.pageLabel)
    : null;

  return (
    <div
      className="fade-up book-page bg-[#fdfbf6] relative shrink-0"
      style={{
        width: w,
        height: h,
        boxShadow:
          '0 1px 1px rgba(31,27,22,0.04), 0 12px 30px -12px rgba(31,27,22,0.22)',
        animationDelay: `${delay}s`,
      }}
    >
      {/* Page border overlay */}
      <PageBorderOverlay
        type={border?.type ?? 'none'}
        color={border?.color ?? '#1a1a1a'}
        width={w}
        height={h}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{
          paddingTop: mmToPx(margins.top),
          paddingBottom: mmToPx(margins.bottom),
          paddingLeft: mmToPx(left),
          paddingRight: mmToPx(right),
        }}
      >
        {/* running head (top-outer) */}
        {numPos === 'top-outer' && page.pageLabel ? (
          <div
            className="flex items-baseline justify-between text-muted/70 font-book italic"
            style={{ fontSize: ptToPx(8), marginBottom: mmToPx(4) }}
          >
            <span>{isOdd ? '' : page.pageLabel}</span>
            <span className="not-italic uppercase tracking-[0.18em]" style={{ fontSize: ptToPx(7) }}>
              {page.runningHead}
            </span>
            <span>{isOdd ? page.pageLabel : ''}</span>
          </div>
        ) : page.runningHead ? (
          <div
            className="text-center text-muted/70 font-book italic uppercase tracking-[0.18em] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontSize: ptToPx(7.5), marginBottom: mmToPx(5) }}
          >
            {page.runningHead}
          </div>
        ) : (
          <div style={{ marginBottom: mmToPx(5) }} />
        )}

        {/* body */}
        <div
          className={`book-body flex-1 overflow-hidden text-ink/90${
            typography.paragraphIndent ? '' : ' no-indent'
          }`}
          style={{
            fontFamily: `'${typography.bodyFont}', serif`,
            fontSize: ptToPx(typography.bodySizePt),
            lineHeight: typography.lineHeight,
            textAlign: typography.justify ? 'justify' : 'left',
          }}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />

        {/* page number (bottom) */}
        {numPos !== 'top-outer' && pageLabel ? (
          <div
            className="font-book tnum text-muted"
            style={{
              fontSize: ptToPx(9),
              marginTop: mmToPx(3),
              textAlign: numAlign as 'center' | 'left' | 'right',
            }}
            dangerouslySetInnerHTML={{ __html: pageLabel }}
          />
        ) : null}
      </div>
    </div>
  );
}
