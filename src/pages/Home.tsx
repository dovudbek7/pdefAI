import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useAuthStore } from '../store/authStore';
import { ProjectCard } from '../components/home/ProjectCard';
import { Icon, ICONS } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';

export default function Home() {
  const navigate = useNavigate();
  const projects = useBookStore((s) => s.projects);
  const loading = useBookStore((s) => s.loading);
  const error = useBookStore((s) => s.error);
  const loadProjects = useBookStore((s) => s.loadProjects);
  const createProject = useBookStore((s) => s.createProject);
  const user = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const [newBookOpen, setNewBookOpen] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookFormat, setNewBookFormat] = useState('a5');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  const openNewBook = () => {
    setNewBookName('');
    setNewBookFormat('a5');
    setNewBookOpen(true);
  };

  const handleCreate = async () => {
    setCreating(true);
    const id = await createProject(newBookName.trim() || 'Yangi kitob', newBookFormat);
    setCreating(false);
    setNewBookOpen(false);
    if (id) navigate(`/editor/${id}`);
  };

  const field = 'h-10 px-3 rounded-xl bg-paper border border-line text-[14px] w-full focus:outline-none focus:border-accent/50 transition';

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="grain bg-panel border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-ink text-paper grid place-items-center font-display font-semibold text-lg leading-none">
              M
            </div>
            <div className="leading-tight hidden xs:block">
              <div className="font-display font-semibold text-[16px]">Muslihun</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted">yozuvchi muhiti</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[13px] text-muted hidden sm:inline">{user?.name ?? user?.email}</span>
            <button
              onClick={logout}
              className="h-9 px-3 rounded-lg text-[13px] hover:bg-line/60 transition flex items-center gap-1.5 text-ink"
            >
              <Icon d={ICONS.logout} className="w-4 h-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold">Kitoblarim</h1>
            <p className="text-[13px] sm:text-[14px] text-muted mt-1">
              {loading ? 'Yuklanmoqda…' : projects.length > 0 ? `${projects.length} ta loyiha` : 'Hali loyiha yo`q'}
            </p>
          </div>
          <button
            onClick={openNewBook}
            disabled={loading}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-ink text-paper font-medium text-[14px] hover:bg-ink/90 transition flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Icon d={ICONS.plus} className="w-4 h-4" stroke={2.2} />
            <span className="hidden xs:inline">Yangi kitob</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-accentsoft/30 border border-accentsoft text-accent text-[13px] px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <button
            onClick={openNewBook}
            className="w-full rounded-2xl border-2 border-dashed border-line hover:border-accent/40 hover:bg-panel/60 transition py-16 sm:py-24 flex flex-col items-center gap-3 text-muted"
          >
            <Icon d={ICONS.plusBook} className="w-10 h-10" stroke={1.3} />
            <span className="font-display text-lg text-ink">Birinchi kitobingizni yarating</span>
            <span className="text-[13px]">Bosing — yozishni boshlaysiz</span>
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {sorted.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {/* New book modal */}
      {newBookOpen && (
        <Modal title="Yangi kitob" onClose={() => setNewBookOpen(false)} width={400}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">Kitob nomi</label>
              <input
                type="text"
                autoFocus
                className={field}
                placeholder="Yangi kitob"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !creating && handleCreate()}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">Sahifa formati</label>
              <select
                className={field}
                value={newBookFormat}
                onChange={(e) => setNewBookFormat(e.target.value)}
              >
                <option value="a5">A5 (148 × 210 mm) — kitob uchun standart</option>
                <option value="a4">A4 (210 × 297 mm) — katta format</option>
                <option value="b5">B5 (176 × 250 mm) — o'rta format</option>
              </select>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="h-10 px-5 rounded-xl text-[14px] font-medium bg-ink text-paper hover:bg-ink/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {creating && (
                  <span className="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
                )}
                Davom etish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
