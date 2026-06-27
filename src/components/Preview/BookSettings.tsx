import { useRef } from 'react';
import { useBookStore } from '../../store/bookStore';
import { Modal } from '../ui/Modal';
import { Icon, ICONS } from '../ui/Icon';
import { BORDER_DEFS, NUM_BORDER_DEFS, renderBorderSVG } from '../../lib/pageBorders';
import type { NumberPosition, NumberStyle } from '../../types';

// Full-resolution A5 page dimensions for the thumbnail viewBox
const PREVIEW_W = 559;
const PREVIEW_H = 794;

function BorderThumb({ type, color, selected }: { type: string; color: string; selected: boolean }) {
  const inner = type === 'none' ? '' : renderBorderSVG(type, PREVIEW_W, PREVIEW_H, color || '#1a1a1a');
  return (
    <svg
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      width="100%"
      style={{ display: 'block', background: '#fdfbf6', borderRadius: 4 }}
      className={selected ? 'ring-2 ring-accent' : ''}
      dangerouslySetInnerHTML={{ __html: inner || `<rect x="0" y="0" width="${PREVIEW_W}" height="${PREVIEW_H}" fill="#f5f0e8"/>` }}
    />
  );
}

/** Visual book layout settings — cover, margins, page numbering. */
export function BookSettings({ onClose }: { onClose: () => void }) {
  const meta = useBookStore((s) => s.meta);
  const setMeta = useBookStore((s) => s.setMeta);
  const margins = useBookStore((s) => s.margins);
  const setMargins = useBookStore((s) => s.setMargins);
  const numbering = useBookStore((s) => s.numbering);
  const setNumbering = useBookStore((s) => s.setNumbering);
  const border = useBookStore((s) => s.border);
  const setBorder = useBookStore((s) => s.setBorder);
  const pageBreak = useBookStore((s) => s.typography.pageBreak);
  const setTypography = useBookStore((s) => s.setTypography);

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
  const sectionLabel = 'text-[11px] uppercase tracking-[0.12em] text-muted font-medium';

  return (
    <Modal title="Kitob sozlamalari" onClose={onClose} width={520}>
      <div className="space-y-5">

        {/* Cover image */}
        <div className="space-y-2">
          <span className={sectionLabel}>Muqova rasmi (ixtiyoriy)</span>
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
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
          <p className="text-[11px] text-muted">Ko'rish rejimida birinchi sahifa sifatida ko'rsatiladi.</p>
        </div>

        {/* margins */}
        <div className="space-y-2 border-t border-line pt-4">
          <span className={sectionLabel}>Chekkalar (mm)</span>
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

        {/* Page border — visual grid thumbnails */}
        <div className="space-y-2 border-t border-line pt-4">
          <span className={sectionLabel}>Sahifa ramkasi</span>
          <div className="grid grid-cols-4 gap-2">
            {BORDER_DEFS.map((bd) => (
              <button
                key={bd.id}
                onClick={() => setBorder({ type: bd.id })}
                title={bd.label}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition ${
                  border.type === bd.id
                    ? 'border-accent bg-accent/8'
                    : 'border-line hover:bg-line/40'
                }`}
              >
                <div className="w-full aspect-[3/4]">
                  <BorderThumb type={bd.id} color={border.color} selected={false} />
                </div>
                <span className={`text-[9px] leading-tight text-center truncate w-full ${border.type === bd.id ? 'text-accent font-medium' : 'text-muted'}`}>
                  {bd.label}
                </span>
              </button>
            ))}
          </div>
          {border.type !== 'none' && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted">Rang:</span>
              <input
                type="color"
                value={border.color}
                onChange={(e) => setBorder({ color: e.target.value })}
                className="w-8 h-7 rounded border border-line cursor-pointer"
              />
              <span className="tnum text-[11px] text-muted">{border.color}</span>
            </div>
          )}
        </div>

        {/* Page number decorative border — select */}
        <div className="space-y-2 border-t border-line pt-4">
          <span className={sectionLabel}>Sahifa raqami bezagi</span>
          <div className="flex items-center gap-3">
            <select
              value={border.numBorderType}
              onChange={(e) => setBorder({ numBorderType: e.target.value })}
              className={field}
            >
              {NUM_BORDER_DEFS.map((nb) => (
                <option key={nb.id} value={nb.id}>{nb.label}</option>
              ))}
            </select>
            {border.numBorderType !== 'none' && (
              <input
                type="color"
                value={border.numBorderColor}
                onChange={(e) => setBorder({ numBorderColor: e.target.value })}
                className="w-9 h-9 rounded border border-line cursor-pointer shrink-0"
                title="Rang"
              />
            )}
          </div>
        </div>

        {/* Page break mode (moved from preview toolbar) */}
        <div className="space-y-2 border-t border-line pt-4">
          <span className={sectionLabel}>Sahifa bo'linishi</span>
          <select
            value={pageBreak}
            onChange={(e) => setTypography({ pageBreak: e.target.value as 'fill' | 'paragraph' })}
            className={field}
          >
            <option value="fill">So'zlab to'ldirish</option>
            <option value="paragraph">Butun abzas ko'chirish</option>
          </select>
          <p className="text-[11px] text-muted">Abzas sahifaga sig'masa qanday davom etish.</p>
        </div>

        {/* Numbering */}
        <div className="space-y-2 border-t border-line pt-4">
          <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={numbering.enabled}
              onChange={(e) => setNumbering({ enabled: e.target.checked })}
              className="accent-accent w-4 h-4"
            />
            <Icon d={ICONS.check} className="w-3.5 h-3.5 text-muted" />
            <span className={sectionLabel}>Sahifa raqami</span>
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

        {/* Kolontitul */}
        <div className="space-y-2 border-t border-line pt-4">
          <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={numbering.kolontitulEnabled}
              onChange={(e) => setNumbering({ kolontitulEnabled: e.target.checked })}
              className="accent-accent w-4 h-4"
            />
            <span className={sectionLabel}>Kolontitul (sarlavha satri)</span>
          </label>
          {numbering.kolontitulEnabled && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-muted">Matn (bo'sh = bobdan avtomatik)</span>
              <input
                type="text"
                className={field}
                placeholder="Masalan: mening kitobim"
                value={numbering.kolontitulText}
                onChange={(e) => setNumbering({ kolontitulText: e.target.value })}
              />
              <p className="text-[10px] text-muted/70">Har bir sahifaning yuqorisida ko'rsatiladi</p>
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
