import { useState } from 'react';
import { useBookStore } from '../store/bookStore';
import { exportPdf } from '../lib/exportPdf';
import type { PaginateResult } from '../lib/paginate';
import type { NumberPosition, NumberStyle } from '../types';
import { Icon, ICONS } from './ui/Icon';

export function ExportDialog({
  result,
  onClose,
}: {
  result: PaginateResult;
  onClose: () => void;
}) {
  const meta = useBookStore((s) => s.meta);
  const format = useBookStore((s) => s.format);
  const margins = useBookStore((s) => s.margins);
  const typography = useBookStore((s) => s.typography);
  const numbering = useBookStore((s) => s.numbering);
  const setNumbering = useBookStore((s) => s.setNumbering);
  const setMargins = useBookStore((s) => s.setMargins);
  const setMeta = useBookStore((s) => s.setMeta);

  const [includeCover, setIncludeCover] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);

  const run = () => {
    exportPdf({ result, meta, format, margins, typography, numbering, includeCover, includeToc });
  };

  const field = 'h-9 px-2.5 rounded-lg bg-panel border border-line text-[13px] w-full';
  const label = 'text-[11px] uppercase tracking-[0.12em] text-muted font-medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center no-print">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[480px] max-w-[92vw] max-h-[88vh] overflow-y-auto scroll-thin bg-panel rounded-2xl border border-line shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-panel">
          <h3 className="font-display text-lg font-semibold">Eksport sozlamalari</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-line/60 transition text-muted">
            <Icon d={ICONS.x} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <span className={label}>Kitob nomi</span>
              <input className={field} value={meta.title} onChange={(e) => setMeta({ title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <span className={label}>Muallif</span>
              <input className={field} value={meta.author} onChange={(e) => setMeta({ author: e.target.value })} />
            </div>
            <div className="space-y-1">
              <span className={label}>Yil</span>
              <input
                type="number"
                className={field}
                value={meta.year}
                onChange={(e) => setMeta({ year: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* front matter */}
          <div className="space-y-2">
            <span className={label}>Old qism</span>
            <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
              <input type="checkbox" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} className="accent-accent w-4 h-4" />
              Muqova sahifasi (nom, muallif, yil)
            </label>
            <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
              <input type="checkbox" checked={includeToc} onChange={(e) => setIncludeToc(e.target.checked)} className="accent-accent w-4 h-4" />
              Mundarija sahifasi (avto)
            </label>
          </div>

          {/* numbering */}
          <div className="space-y-2">
            <span className={label}>Sahifa raqami</span>
            <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
              <input type="checkbox" checked={numbering.enabled} onChange={(e) => setNumbering({ enabled: e.target.checked })} className="accent-accent w-4 h-4" />
              Raqamlash yoqilgan
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Qaysi sahifadan boshlansin</span>
                <input
                  type="number"
                  min={1}
                  className={field}
                  value={numbering.startAtPage}
                  onChange={(e) => setNumbering({ startAtPage: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Boshlang'ich raqam</span>
                <input
                  type="number"
                  min={1}
                  className={field}
                  value={numbering.startFrom}
                  onChange={(e) => setNumbering({ startFrom: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Joylashuv</span>
                <select
                  className={field}
                  value={numbering.position}
                  onChange={(e) => setNumbering({ position: e.target.value as NumberPosition })}
                >
                  <option value="bottom-center">Past · o'rta</option>
                  <option value="bottom-outer">Past · chekka</option>
                  <option value="top-outer">Tepa · chekka</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Uslub</span>
                <select
                  className={field}
                  value={numbering.style}
                  onChange={(e) => setNumbering({ style: e.target.value as NumberStyle })}
                >
                  <option value="arabic">Arab (1, 2, 3)</option>
                  <option value="roman">Rim (i, ii, iii)</option>
                </select>
              </div>
            </div>
          </div>

          {/* margins */}
          <div className="space-y-2">
            <span className={label}>Chekkalar (mm)</span>
            <div className="grid grid-cols-4 gap-2">
              {(['top', 'bottom', 'inner', 'outer'] as const).map((k) => (
                <div key={k} className="space-y-1">
                  <span className="text-[10px] text-muted">
                    {k === 'top' ? 'Tepa' : k === 'bottom' ? 'Past' : k === 'inner' ? 'Ich' : 'Tash'}
                  </span>
                  <input
                    type="number"
                    className="h-9 px-2 rounded-lg bg-panel border border-line text-[13px] w-full tnum"
                    value={margins[k]}
                    onChange={(e) => setMargins({ [k]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-line sticky bottom-0 bg-panel">
          <span className="text-[12px] text-muted">{result.pages.length} sahifa · {format.label}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-lg text-[13px] hover:bg-line/60 transition">
              Bekor
            </button>
            <button onClick={run} className="h-9 px-4 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition flex items-center gap-1.5">
              <Icon d={ICONS.download} className="w-4 h-4" />
              PDF chiqarish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
