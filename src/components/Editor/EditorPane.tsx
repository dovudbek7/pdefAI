import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useMemo } from 'react';
import { Toolbar } from './Toolbar';
import { useBookStore } from '../../store/bookStore';
import { Icon, ICONS } from '../ui/Icon';

function countWords(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function EditorPane() {
  const content = useBookStore((s) => s.content);
  const setContent = useBookStore((s) => s.setContent);
  const savedAt = useBookStore((s) => s.savedAt);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Bu yerda matn yozishda davom etasiz…' }),
    ],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none' },
    },
  });

  // Keep editor in sync if content is replaced externally (e.g. restored).
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const words = useMemo(() => countWords(editor?.getText() ?? ''), [editor, content]);
  const readMin = Math.max(1, Math.round(words / 200));
  const savedLabel = savedAt ? 'Saqlandi' : 'Tayyor';

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-paper grain">
      <Toolbar editor={editor} />

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-10 py-12">
          <EditorContent
            editor={editor}
            className="text-[18px] leading-[1.85] font-book text-ink"
          />
        </div>
      </div>

      <div className="h-9 shrink-0 border-t border-line flex items-center justify-between px-4 text-[11px] text-muted bg-paper/80">
        <div className="flex items-center gap-4">
          <span className="tnum">{words.toLocaleString('ru')} so'z</span>
          <span className="tnum hidden sm:inline">{readMin} daqiqa o'qish</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon d={ICONS.check} className="w-3.5 h-3.5" />
          <span>{savedLabel} · avtosaqlash</span>
        </div>
      </div>
    </main>
  );
}
