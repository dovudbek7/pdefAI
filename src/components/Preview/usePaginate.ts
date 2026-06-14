import { useEffect, useState } from 'react';
import { paginate, type PaginateResult } from '../../lib/paginate';
import { useBookStore } from '../../store/bookStore';

const EMPTY: PaginateResult = {
  pages: [],
  toc: [],
  contentWidthPx: 0,
  contentHeightPx: 0,
};

/** Re-paginates (debounced) whenever content or layout settings change. */
export function usePaginate(): PaginateResult {
  const content = useBookStore((s) => s.content);
  const format = useBookStore((s) => s.format);
  const margins = useBookStore((s) => s.margins);
  const typography = useBookStore((s) => s.typography);
  const numbering = useBookStore((s) => s.numbering);
  const bookTitle = useBookStore((s) => s.meta.title);

  const [result, setResult] = useState<PaginateResult>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const r = paginate({ html: content, format, margins, typography, numbering, bookTitle });
      if (!cancelled) setResult(r);
    };
    // Wait for fonts so measurement matches rendering.
    const t = window.setTimeout(() => {
      if (document.fonts?.ready) {
        document.fonts.ready.then(run);
      } else {
        run();
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [content, format, margins, typography, numbering, bookTitle]);

  return result;
}
