import { useMemo } from 'react';
import { useBookStore } from '../store/bookStore';
import type { PaginateResult } from '../lib/paginate';
import { Icon, ICONS } from './ui/Icon';

function wordCount(html: string) {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function ChapterRail({
  result,
  onNavigate,
}: {
  result: PaginateResult;
  onNavigate?: () => void;
}) {
  const content = useBookStore((s) => s.content);
  const words = useMemo(() => wordCount(content), [content]);
  const pages = result.pages.length;

  return (
    <aside className="w-64 shrink-0 h-full bg-panel border-r border-line flex flex-col">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">Mundarija</h2>
        <span className="text-muted/60">
          <Icon d={ICONS.list} className="w-4 h-4" />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin px-2 space-y-0.5 text-[13px]">
        {result.toc.length === 0 ? (
          <p className="px-3 py-4 text-[12px] text-muted italic leading-relaxed">
            Sarlavha (H1/H2) qo'shsangiz, bu yerda avtomatik paydo bo'ladi.
          </p>
        ) : (
          result.toc.map((t, i) => (
            <div
              key={t.id}
              onClick={() => {
                document
                  .getElementById(`page-${t.pageIndex}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const headings = document.querySelectorAll<HTMLElement>(
                  '.ProseMirror h1, .ProseMirror h2, .ProseMirror h3',
                );
                headings[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                onNavigate?.();
              }}
              className={`group flex items-center gap-2 rounded-lg hover:bg-line/50 transition cursor-pointer ${
                t.level === 1 ? 'px-2.5 py-2' : 'pl-7 pr-2.5 py-1.5 text-muted'
              }`}
            >
              {t.level === 1 && (
                <span className="font-mono text-[10px] text-muted w-5 tnum">
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
              <span className={`flex-1 truncate ${t.level === 1 ? 'font-medium text-ink' : 'text-[12px]'}`}>
                {t.level > 1 && '— '}
                {t.text}
              </span>
              <span className="font-mono text-[10px] text-muted tnum">{t.pageLabel ?? '—'}</span>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-line p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-2xl leading-none tnum">{words.toLocaleString('ru')}</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted mt-1">so'z</div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl leading-none tnum">{pages}</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted mt-1">sahifa</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
