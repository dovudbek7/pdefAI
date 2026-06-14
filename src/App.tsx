import { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { ChapterRail } from './components/ChapterRail';
import { EditorPane } from './components/Editor/EditorPane';
import { BookPreview } from './components/Preview/BookPreview';
import { ExportDialog } from './components/ExportDialog';
import { usePaginate } from './components/Preview/usePaginate';
import { useBookStore } from './store/bookStore';

function App() {
  const viewMode = useBookStore((s) => s.viewMode);
  const cycleViewMode = useBookStore((s) => s.cycleViewMode);
  const result = usePaginate();
  const [exportOpen, setExportOpen] = useState(false);

  // Cmd/Ctrl + \  → cycle view mode (handy for testing).
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
  const showRail = viewMode !== 'preview';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar onExport={() => setExportOpen(true)} />

      <div className="flex flex-1 min-h-0">
        {showRail && <ChapterRail result={result} />}

        {showEditor && (
          <div className={showPreview ? 'flex-1 min-w-0 flex' : 'flex-1 min-w-0 flex'}>
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

      {exportOpen && <ExportDialog result={result} onClose={() => setExportOpen(false)} />}
    </div>
  );
}

export default App;
