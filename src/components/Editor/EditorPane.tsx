import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useMemo, useState } from 'react';
import { Toolbar } from './Toolbar';
import { ImageNodeView } from './ImageNodeView';
import { useBookStore } from '../../store/bookStore';
import { Icon, ICONS } from '../ui/Icon';

// Strip HTML tags and count words from raw HTML — avoids stale editor.getText() reads
function countWordsFromHtml(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Defined outside the component so it is not re-created on every render
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      'data-align': { default: 'left' },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
}).configure({ inline: false, allowBase64: true });

export function EditorPane() {
  const content = useBookStore((s) => s.content);
  const setContent = useBookStore((s) => s.setContent);
  const savedAt = useBookStore((s) => s.savedAt);
  const dirty = useBookStore((s) => s.dirty);
  const flushSave = useBookStore((s) => s.flushSave);

  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await flushSave();
    setSaving(false);
    // Always show "Saqlandi" after press — even if network failed
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Bu yerda matn yozishda davom etasiz…' }),
    ],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none' },

      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        imageFiles.forEach(async (file) => {
          const src = await fileToBase64(file);
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src });
          const tr = view.state.tr.replaceSelectionWith(node);
          view.dispatch(tr);
        });
        return true;
      },

      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const imageItems = Array.from(items).filter((i) => i.type.startsWith('image/'));
        if (imageItems.length === 0) return false;
        event.preventDefault();
        imageItems.forEach(async (item) => {
          const file = item.getAsFile();
          if (!file) return;
          const src = await fileToBase64(file);
          const view = _view;
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src });
          const tr = view.state.tr.replaceSelectionWith(node);
          view.dispatch(tr);
        });
        return true;
      },
    },
  });

  // Keep editor in sync when content is replaced externally (e.g. loadProject async).
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  const words = useMemo(() => countWordsFromHtml(content), [content]);
  const readMin = Math.max(1, Math.round(words / 200));

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-paper grain">
      <Toolbar editor={editor} />

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-5 sm:px-10 py-6 sm:py-12">
          <EditorContent
            editor={editor}
            className="text-[17px] sm:text-[18px] leading-[1.8] sm:leading-[1.85] font-book text-ink"
          />
        </div>
      </div>

      <div className="h-9 shrink-0 border-t border-line flex items-center justify-between px-4 text-[11px] bg-paper/80">
        <div className="flex items-center gap-4 text-muted">
          <span className="tnum">{words.toLocaleString('ru')} so'z</span>
          <span className="tnum hidden sm:inline">{readMin} daqiqa o'qish</span>
        </div>

        {dirty && !justSaved ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition disabled:opacity-60 font-medium"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
            ) : (
              <Icon d={ICONS.save} className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saqlanmoqda…' : 'Saqlash'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-muted">
            <Icon d={ICONS.check} className="w-3.5 h-3.5" />
            <span>Saqlandi</span>
          </div>
        )}
      </div>
    </main>
  );
}
