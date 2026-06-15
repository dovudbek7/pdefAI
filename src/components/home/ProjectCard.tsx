import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../store/bookStore';
import { useBookStore } from '../../store/bookStore';
import { Modal } from '../ui/Modal';
import { Icon, ICONS } from '../ui/Icon';

function wordCount(html: string) {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function fmtDate(ts: number) {
  try {
    return new Intl.DateTimeFormat('uz', { day: 'numeric', month: 'short', year: 'numeric' }).format(ts);
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const renameProject = useBookStore((s) => s.renameProject);
  const deleteProject = useBookStore((s) => s.deleteProject);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const open = () => navigate(`/editor/${project.id}`);
  const words = wordCount(project.content);

  return (
    <div className="group relative bg-panel rounded-2xl border border-line hover:border-muted/40 hover:shadow-lg transition">
      {/* mini cover */}
      <button onClick={open} className="block w-full text-left rounded-t-2xl overflow-hidden">
        <div className="aspect-[3/2] grain bg-[#ece5d8] relative flex items-center justify-center p-5 border-b border-line">
          <div
            className="book-page bg-[#fdfbf6] w-[58%] aspect-[1/1.414] rounded-[2px] flex flex-col items-center justify-center px-3 text-center"
            style={{ boxShadow: '0 1px 1px rgba(31,27,22,0.05), 0 10px 24px -12px rgba(31,27,22,0.3)' }}
          >
            <div className="font-display font-semibold text-ink text-[13px] leading-snug line-clamp-3">
              {project.meta.title}
            </div>
            {project.meta.author && (
              <div className="text-[8px] uppercase tracking-[0.12em] text-muted mt-2">
                {project.meta.author}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* info */}
      <div className="p-3.5 flex items-start gap-2">
        <button onClick={open} className="flex-1 min-w-0 text-left">
          <div className="font-medium text-[14px] truncate">{project.name}</div>
          <div className="text-[11px] text-muted mt-0.5 tnum">
            {words.toLocaleString('ru')} so'z · {fmtDate(project.updatedAt)}
          </div>
        </button>

        {/* 3-dot menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 grid place-items-center rounded-lg text-muted hover:bg-line/60 hover:text-ink transition"
            aria-label="Menyu"
          >
            <Icon d={ICONS.dots} stroke={2.2} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 bg-panel border border-line rounded-xl shadow-xl py-1 fade-up">
              <button
                onClick={() => { setMenuOpen(false); open(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-line/50 transition"
              >
                <Icon d={ICONS.pencil} className="w-4 h-4 text-muted" /> Tahrirlash
              </button>
              <button
                onClick={() => { setMenuOpen(false); setNewName(project.name); setRenameOpen(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-line/50 transition"
              >
                <Icon d={ICONS.edit} className="w-4 h-4 text-muted" /> Nomini o'zgartirish
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate(`/editor/${project.id}?export=1`); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-line/50 transition"
              >
                <Icon d={ICONS.download} className="w-4 h-4 text-muted" /> Eksport
              </button>
              <button
                onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-accent hover:bg-accentsoft/30 transition"
              >
                <Icon d={ICONS.trash} className="w-4 h-4" /> O'chirish
              </button>
            </div>
          )}
        </div>
      </div>

      {renameOpen && (
        <Modal title="Nomini o'zgartirish" onClose={() => setRenameOpen(false)}>
          <div className="space-y-4">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (renameProject(project.id, newName), setRenameOpen(false))}
              className="w-full h-10 px-3 rounded-lg bg-paper border border-line text-[14px]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameOpen(false)} className="h-9 px-4 rounded-lg text-[13px] hover:bg-line/60 transition">
                Bekor
              </button>
              <button
                onClick={() => { renameProject(project.id, newName); setRenameOpen(false); }}
                className="h-9 px-4 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition"
              >
                Saqlash
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteOpen && (
        <Modal title="O'chirish" onClose={() => setDeleteOpen(false)}>
          <div className="space-y-4">
            <p className="text-[14px] text-ink/80">
              <span className="font-medium">"{project.name}"</span> o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteOpen(false)} className="h-9 px-4 rounded-lg text-[13px] hover:bg-line/60 transition">
                Bekor
              </button>
              <button
                onClick={() => { deleteProject(project.id); setDeleteOpen(false); }}
                className="h-9 px-4 rounded-lg text-[13px] font-medium bg-accent text-white hover:bg-accent/90 transition"
              >
                O'chirish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
