import { useState } from 'react';
import { useBookStore } from '../store/bookStore';
import { Icon, ICONS } from './ui/Icon';
import type { ViewMode } from '../types';

interface TopBarProps {
  onExport: () => void;
  onBack: () => void;
  onMenu: () => void;
}

export function TopBar({ onExport, onBack, onMenu }: TopBarProps) {
  const meta = useBookStore((s) => s.meta);
  const viewMode = useBookStore((s) => s.viewMode);
  const setViewMode = useBookStore((s) => s.setViewMode);
  const flushSave = useBookStore((s) => s.flushSave);

  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await flushSave();
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const modes: { id: ViewMode; icon: string; label: string }[] = [
    { id: 'editor', icon: ICONS.textOnly, label: 'Faqat matn' },
    { id: 'split', icon: ICONS.split, label: 'Split' },
    { id: 'preview', icon: ICONS.bookOnly, label: 'Faqat kitob' },
  ];

  return (
    <header className="grain h-14 flex items-center justify-between px-2 sm:px-4 bg-panel border-b border-line relative z-20 no-print">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onBack}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-line/60 transition shrink-0"
          title="Kitoblarim"
        >
          <Icon d={ICONS.back} className="w-5 h-5" />
        </button>

        {/* chapters drawer toggle — mobile only */}
        <button
          onClick={onMenu}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-line/60 transition shrink-0 lg:hidden"
          title="Mundarija"
        >
          <Icon d={ICONS.menu} className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-display text-[14px] sm:text-[15px] italic truncate">"{meta.title}"</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* view-mode toggle (desktop) */}
        <div className="hidden lg:flex items-center bg-paper border border-line rounded-lg p-0.5">
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

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          title="Saqlash (⌘S)"
          className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-[13px] font-medium border transition flex items-center gap-1.5 disabled:opacity-60 ${
            justSaved
              ? 'border-green-300/70 bg-green-50 text-green-700'
              : 'border-line hover:bg-line/60 text-ink'
          }`}
        >
          {saving ? (
            <span className="w-3.5 h-3.5 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
          ) : justSaved ? (
            <Icon d={ICONS.check} className="w-3.5 h-3.5" />
          ) : (
            <Icon d={ICONS.save} className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {saving ? 'Saqlanmoqda…' : justSaved ? 'Saqlandi' : 'Saqlash'}
          </span>
        </button>

        <button
          onClick={onExport}
          className="h-9 px-2.5 sm:px-4 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition flex items-center gap-1.5"
        >
          <Icon d={ICONS.download} className="w-4 h-4" />
          <span className="hidden sm:inline">Eksport</span>
        </button>
      </div>
    </header>
  );
}
