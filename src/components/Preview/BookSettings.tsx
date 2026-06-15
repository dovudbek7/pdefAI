import { useBookStore } from '../../store/bookStore';
import { Modal } from '../ui/Modal';
import type { NumberPosition, NumberStyle } from '../../types';

/** Visual book layout settings — margins + page numbering. Edited live while
 *  looking at the preview (not at export time). */
export function BookSettings({ onClose }: { onClose: () => void }) {
  const margins = useBookStore((s) => s.margins);
  const setMargins = useBookStore((s) => s.setMargins);
  const numbering = useBookStore((s) => s.numbering);
  const setNumbering = useBookStore((s) => s.setNumbering);

  const field = 'h-9 px-2.5 rounded-lg bg-paper border border-line text-[13px] w-full';
  const label = 'text-[11px] uppercase tracking-[0.12em] text-muted font-medium';

  return (
    <Modal title="Kitob sozlamalari" onClose={onClose} width={440}>
      <div className="space-y-5">
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
                  className="h-9 px-2 rounded-lg bg-paper border border-line text-[13px] w-full tnum"
                  value={margins[k]}
                  onChange={(e) => setMargins({ [k]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">Ich = muqovaga yaqin (juft/toq sahifa mos qochadi).</p>
        </div>

        {/* numbering */}
        <div className="space-y-2 border-t border-line pt-4">
          <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={numbering.enabled}
              onChange={(e) => setNumbering({ enabled: e.target.checked })}
              className="accent-accent w-4 h-4"
            />
            <span className={label}>Sahifa raqami</span>
          </label>

          {numbering.enabled && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Qaysi sahifadan</span>
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
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition"
          >
            Tayyor
          </button>
        </div>
      </div>
    </Modal>
  );
}
