import { useState } from 'react';
import { useBookStore } from '../store/bookStore';
import { exportPdf } from '../lib/exportPdf';
import { exportDocx } from '../lib/exportDocx';
import type { PaginateResult } from '../lib/paginate';
import { Icon, ICONS } from './ui/Icon';
import { FileIcon } from './ui/FileIcon';

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
  const setMeta = useBookStore((s) => s.setMeta);
  const content = useBookStore((s) => s.content);

  const [includeCover, setIncludeCover] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState(meta.title);

  const runPdf = () => {
    exportPdf({ result, meta, format, margins, typography, numbering, includeCover, includeToc, fileName });
    onClose();
  };
  const runDocx = async () => {
    setBusy(true);
    try {
      await exportDocx({ content, meta, typography, result, includeCover, includeToc, fileName });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const field = 'h-9 px-2.5 rounded-lg bg-paper border border-line text-[13px] w-full';
  const label = 'text-[11px] uppercase tracking-[0.12em] text-muted font-medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center no-print">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[460px] max-w-[92vw] max-h-[88vh] flex flex-col bg-panel rounded-2xl border border-line shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h3 className="font-display text-lg font-semibold">Eksport</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-line/60 transition text-muted">
            <Icon d={ICONS.x} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin p-5 space-y-5">
          {/* file name */}
          <div className="space-y-1">
            <span className={label}>Fayl nomi</span>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Kitob nomi"
              className={field}
            />
          </div>

          {/* format cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={runPdf}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-line hover:border-accent/50 hover:bg-paper transition"
            >
              <FileIcon kind="pdf" />
              <div className="text-center">
                <div className="text-[14px] font-medium">PDF</div>
                <div className="text-[11px] text-muted">Bosishga tayyor</div>
              </div>
            </button>

            <button
              onClick={runDocx}
              disabled={busy}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-line hover:border-accent/50 hover:bg-paper transition disabled:opacity-60"
            >
              <FileIcon kind="docx" />
              <div className="text-center">
                <div className="text-[14px] font-medium">{busy ? 'Tayyorlanmoqda…' : 'Word (DOCX)'}</div>
                <div className="text-[11px] text-muted">Tahrirlash uchun</div>
              </div>
            </button>
          </div>

          {/* PowerPoint — coming soon */}
          <button
            disabled
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-line opacity-60 cursor-not-allowed"
          >
            <FileIcon kind="pptx" className="w-8 h-10" />
            <div className="text-left flex-1">
              <div className="text-[13px] font-medium">PowerPoint (PPTX)</div>
              <div className="text-[11px] text-muted">Slayd shaklida — tez orada</div>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-muted border border-line rounded-full px-2 py-0.5">
              tez orada
            </span>
          </button>

          {/* include toggles */}
          <div className="space-y-2 border-t border-line pt-4">
            <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
              <input type="checkbox" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} className="accent-accent w-4 h-4" />
              Muqova sahifasi (nom, muallif, yil)
            </label>
            <label className="flex items-center gap-2.5 text-[13px] cursor-pointer">
              <input type="checkbox" checked={includeToc} onChange={(e) => setIncludeToc(e.target.checked)} className="accent-accent w-4 h-4" />
              Mundarija sahifasi (avto)
            </label>
          </div>

          {/* advanced (collapsed by default) */}
          <div className="border-t border-line pt-3">
            <button
              onClick={() => setAdvanced((v) => !v)}
              className="w-full flex items-center justify-between text-[13px] font-medium text-ink hover:text-accent transition"
            >
              <span>Qo'shimcha sozlamalar</span>
              <Icon d={ICONS.chevron} className={`w-4 h-4 transition-transform ${advanced ? 'rotate-90' : ''}`} />
            </button>

            {advanced && (
              <div className="grid grid-cols-2 gap-3 mt-3">
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
                  <input type="number" className={field} value={meta.year} onChange={(e) => setMeta({ year: Number(e.target.value) })} />
                </div>
                <p className="col-span-2 text-[11px] text-muted">
                  Chekka va sahifa raqami sozlamalari kitob ko'rinishidagi ⚙ tugmasida.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-line flex items-center justify-between shrink-0">
          <span className="text-[12px] text-muted">{result.pages.length} sahifa · {format.label}</span>
          <a
            href="https://t.me/ContactKaizenBot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted hover:text-ink transition underline underline-offset-2"
          >
            Murojat
          </a>
        </div>
      </div>
    </div>
  );
}
