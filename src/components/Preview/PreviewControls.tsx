import { useState } from 'react';
import { useBookStore } from '../../store/bookStore';
import { FORMATS } from '../../lib/pageFormats';
import { Icon, ICONS } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { BookSettings } from './BookSettings';
import type { PageFormatId } from '../../types';

export function PreviewControls() {
  const format = useBookStore((s) => s.format);
  const setFormat = useBookStore((s) => s.setFormat);
  const zoom = useBookStore((s) => s.zoom);
  const setZoom = useBookStore((s) => s.setZoom);
  const spread = useBookStore((s) => s.spread);
  const toggleSpread = useBookStore((s) => s.toggleSpread);

  const [customOpen, setCustomOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cw, setCw] = useState(format.widthMm);
  const [ch, setCh] = useState(format.heightMm);

  const handleFormatChange = (id: string) => {
    if (id === 'custom') {
      setCw(format.widthMm);
      setCh(format.heightMm);
      setCustomOpen(true);
      return;
    }
    setFormat(FORMATS[id as keyof typeof FORMATS]);
  };

  const applyCustom = () => {
    if (cw > 30 && ch > 30) {
      setFormat({ id: 'custom', label: 'Maxsus', widthMm: cw, heightMm: ch });
      setCustomOpen(false);
    }
  };

  return (
    <>
      <div className="h-12 shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 border-b border-line bg-panel/60 backdrop-blur">
        {/* Format select */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium hidden sm:inline shrink-0">
            Format
          </span>
          <select
            value={format.id}
            onChange={(e) => handleFormatChange(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-panel border border-line text-[12px] font-medium cursor-pointer hover:border-muted/40 transition"
          >
            <option value="a5">A5</option>
            <option value="a4">A4</option>
            <option value="b5">B5</option>
            <option value="custom">Maxsus</option>
          </select>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 text-muted">
          <button
            className="w-7 h-7 grid place-items-center rounded-md hover:bg-line/60 transition"
            onClick={() => setZoom(zoom - 0.1)}
            title="Kichiklashtirish"
          >
            <Icon d={ICONS.minus} />
          </button>
          <span className="text-[11px] tnum w-9 text-center">{Math.round(zoom * 100)}%</span>
          <button
            className="w-7 h-7 grid place-items-center rounded-md hover:bg-line/60 transition"
            onClick={() => setZoom(zoom + 0.1)}
            title="Kattalashtirish"
          >
            <Icon d={ICONS.plus} />
          </button>
          <div className="w-px h-5 bg-line mx-1" />
          <button
            className={`w-7 h-7 grid place-items-center rounded-md transition ${spread ? 'bg-line/70 text-ink' : 'hover:bg-line/60'}`}
            title="Ikki sahifa"
            onClick={toggleSpread}
          >
            <Icon d={ICONS.spread} />
          </button>
          <button
            className="w-7 h-7 grid place-items-center rounded-md hover:bg-line/60 transition"
            title="Kitob sozlamalari"
            onClick={() => setSettingsOpen(true)}
          >
            <Icon d={ICONS.settings} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {settingsOpen && <BookSettings onClose={() => setSettingsOpen(false)} />}

      {customOpen && (
        <Modal title="Maxsus razmer" onClose={() => setCustomOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">Eni (mm)</span>
                <input
                  type="number"
                  autoFocus
                  value={cw}
                  onChange={(e) => setCw(Number(e.target.value))}
                  className="h-9 px-2.5 rounded-lg bg-paper border border-line text-[13px] w-full tnum"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">Bo'yi (mm)</span>
                <input
                  type="number"
                  value={ch}
                  onChange={(e) => setCh(Number(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
                  className="h-9 px-2.5 rounded-lg bg-paper border border-line text-[13px] w-full tnum"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCustomOpen(false)} className="h-9 px-4 rounded-lg text-[13px] hover:bg-line/60 transition">
                Bekor
              </button>
              <button onClick={applyCustom} className="h-9 px-4 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition">
                Qo'llash
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
