import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { ChapterRail } from '../components/ChapterRail';
import { EditorPane } from '../components/Editor/EditorPane';
import { BookPreview } from '../components/Preview/BookPreview';
import { ExportDialog } from '../components/ExportDialog';
import { usePaginate } from '../components/Preview/usePaginate';
import { useBookStore } from '../store/bookStore';
import { useMediaQuery } from '../lib/useMediaQuery';
import { Icon, ICONS } from '../components/ui/Icon';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const viewMode = useBookStore((s) => s.viewMode);
  const setViewMode = useBookStore((s) => s.setViewMode);
  const cycleViewMode = useBookStore((s) => s.cycleViewMode);
  const loadProject = useBookStore((s) => s.loadProject);
  const activeId = useBookStore((s) => s.activeId);

  const result = usePaginate();
  const [exportOpen, setExportOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  // Load the requested project; redirect home if it doesn't exist.
  useEffect(() => {
    if (!id) return;
    if (activeId !== id) {
      loadProject(id).then((ok) => {
        if (!ok) navigate('/', { replace: true });
      });
    }
  }, [id, activeId, loadProject, navigate]);

  // Opened from Home's "Eksport" menu (?export=1) → open the export dialog once.
  useEffect(() => {
    if (searchParams.get('export') === '1' && activeId === id) {
      setExportOpen(true);
      searchParams.delete('export');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, activeId, id]);

  // On mobile, split makes no sense → default to the writing pane.
  useEffect(() => {
    if (!isDesktop && viewMode === 'split') setViewMode('editor');
  }, [isDesktop, viewMode, setViewMode]);

  // Cmd/Ctrl + \  → cycle view mode (desktop testing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        cycleViewMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cycleViewMode]);

  const showEditor = viewMode !== 'preview';
  const showPreview = viewMode !== 'editor';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar
        onExport={() => setExportOpen(true)}
        onBack={() => navigate('/')}
        onMenu={() => setRailOpen(true)}
      />

      {/* ===== Desktop layout ===== */}
      {isDesktop ? (
        <div className="flex flex-1 min-h-0">
          {viewMode !== 'preview' && <ChapterRail result={result} />}
          {showEditor && (
            <div className="flex-1 min-w-0 flex">
              <EditorPane />
            </div>
          )}
          {showPreview && (
            <div
              className={
                viewMode === 'preview'
                  ? 'flex-1 min-w-0'
                  : 'w-[44%] max-w-[680px] shrink-0 border-l border-line'
              }
            >
              <BookPreview result={result} />
            </div>
          )}
        </div>
      ) : (
        /* ===== Mobile layout: one pane + bottom tabs ===== */
        <>
          <div className="flex-1 min-h-0 relative">
            <div className={`${viewMode === 'preview' ? 'hidden' : 'flex'} h-full`}>
              <EditorPane />
            </div>
            <div className={`${viewMode === 'preview' ? 'block' : 'hidden'} h-full`}>
              <BookPreview result={result} />
            </div>
          </div>

          {/* bottom tab bar */}
          <div className="h-14 shrink-0 border-t border-line bg-panel grid grid-cols-2 no-print">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                viewMode !== 'preview' ? 'text-accent' : 'text-muted'
              }`}
            >
              <Icon d={ICONS.write} className="w-5 h-5" />
              Yozish
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                viewMode === 'preview' ? 'text-accent' : 'text-muted'
              }`}
            >
              <Icon d={ICONS.bookOnly} className="w-5 h-5" />
              Kitob
            </button>
          </div>

          {/* chapters drawer */}
          {railOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setRailOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[82vw] shadow-2xl animate-[fadeUp_.2s_ease]" onClick={(e) => e.stopPropagation()}>
                <ChapterRail result={result} onNavigate={() => setRailOpen(false)} />
              </div>
            </div>
          )}
        </>
      )}

      {exportOpen && <ExportDialog result={result} onClose={() => setExportOpen(false)} />}
    </div>
  );
}
