import { useBookStore } from '../store/bookStore';
import { Icon, ICONS } from './ui/Icon';
import type { ViewMode } from '../types';

export function TopBar({ onExport }: { onExport: () => void }) {
  const meta = useBookStore((s) => s.meta);
  const viewMode = useBookStore((s) => s.viewMode);
  const setViewMode = useBookStore((s) => s.setViewMode);
  const savedAt = useBookStore((s) => s.savedAt);

  const modes: { id: ViewMode; icon: string; label: string }[] = [
    { id: 'editor', icon: ICONS.textOnly, label: 'Faqat matn' },
    { id: 'split', icon: ICONS.split, label: 'Split' },
    { id: 'preview', icon: ICONS.bookOnly, label: 'Faqat kitob' },
  ];

  return (
    <header className="grain h-14 flex items-center justify-between px-4 bg-panel border-b border-line relative z-20 no-print">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-ink text-paper grid place-items-center font-display font-semibold text-lg leading-none">
            K
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-display font-semibold text-[15px]">Kitob</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">yozuvchi muhiti</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-line min-w-0">
          <span className="font-display text-[15px] italic truncate">"{meta.title}"</span>
          <button className="text-muted hover:text-ink transition shrink-0">
            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* view-mode toggle */}
        <div className="flex items-center bg-paper border border-line rounded-lg p-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              title={m.label}
              onClick={() => setViewMode(m.id)}
              className={`w-8 h-7 grid place-items-center rounded-md transition ${
                viewMode === m.id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon d={m.icon} className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted mx-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
          <span className="tnum">{savedAt ? 'Saqlandi' : 'Tayyor'}</span>
        </div>

        <button
          onClick={onExport}
          className="h-9 px-4 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition flex items-center gap-1.5"
        >
          <Icon d={ICONS.download} className="w-4 h-4" />
          <span className="hidden sm:inline">Eksport PDF</span>
        </button>
      </div>
    </header>
  );
}
