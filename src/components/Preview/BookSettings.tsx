import { useRef } from 'react';
import { useBookStore } from '../../store/bookStore';
import { Modal } from '../ui/Modal';
import { Icon, ICONS } from '../ui/Icon';
import type { NumberPosition, NumberStyle } from '../../types';

/** Visual book layout settings — cover, margins, page numbering. */
export function BookSettings({ onClose }: { onClose: () => void }) {
  const meta = useBookStore((s) => s.meta);
  const setMeta = useBookStore((s) => s.setMeta);
  const margins = useBookStore((s) => s.margins);
  const setMargins = useBookStore((s) => s.setMargins);
  const numbering = useBookStore((s) => s.numbering);
  const setNumbering = useBookStore((s) => s.setNumbering);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMeta({ cover: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const field = 'h-9 px-2.5 rounded-lg bg-paper border border-line text-[13px] w-full';
  const label = 'text-[11px] uppercase tracking-[0.12em] text-muted font-medium';

  return (
    <Modal title="Kitob sozlamalari" onClose={onClose} width={440}>
      <div className="space-y-5">

        {/* Cover image */}
        <div className="space-y-2">
          <span className={label}>Muqova rasmi (ixtiyoriy)</span>
          {meta.cover ? (
            <div className="flex items-start gap-3">
              <img
                src={meta.cover}
                alt="muqova"
                className="w-20 h-28 object-cover rounded border border-line shrink-0"
              />
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="h-8 px-3 rounded-lg text-[12px] border border-line hover:bg-line/50 transition"
                >
                  Rasmni almashtirish
                </button>
                <button
                  onClick={() => setMeta({ cover: undefined })}
                  className="h-8 px-3 rounded-lg text-[12px] border border-line hover:bg-red-50 text-red-600 transition"
                >
                  Muqovani olib tashlash
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-line hover:bg-line/30 transition text-[13px] text-muted w-full"
            >
              <Icon d={ICONS.image} className="w-4 h-4" />
              Muqova rasmi yuklash
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFile}
          />
          <p className="text-[11px] text-muted">Ko'rish rejimida birinchi sahifa sifatida ko'rsatiladi.</p>
        </div>

        {/* margins */}
        <div className="space-y-2 border-t border-line pt-4">
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
            <Icon d={ICONS.check} className="w-3.5 h-3.5 text-muted" />
            <span className={label}>Sahifa raqami</span>
          </label>

          {numbering.enabled && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[11px] text-muted">Nechinchi sahifadan raqam boshlash</span>
                <input
                  type="number"
                  min={1}
                  className={field}
                  value={numbering.startAtPage}
                  onChange={(e) => setNumbering({ startAtPage: Math.max(1, Number(e.target.value)) })}
                />
                <p className="text-[10px] text-muted/70">Muqaddima sahifalarini raqamsiz qoldirish uchun</p>
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
