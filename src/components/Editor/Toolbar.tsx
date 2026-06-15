import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Icon, ICONS } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { useBookStore } from '../../store/bookStore';

const BODY_FONTS = ['Spectral', 'Fraunces', 'Georgia', 'Literata'];

function styleOf(editor: Editor): string {
  if (editor.isActive('heading', { level: 1 })) return 'h1';
  if (editor.isActive('heading', { level: 2 })) return 'h2';
  if (editor.isActive('heading', { level: 3 })) return 'h3';
  if (editor.isActive('blockquote')) return 'quote';
  return 'p';
}

export function Toolbar({ editor }: { editor: Editor | null }) {
  const typography = useBookStore((s) => s.typography);
  const setTypography = useBookStore((s) => s.setTypography);
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  if (!editor) return <div className="h-12 border-b border-line" />;

  const applyStyle = (v: string) => {
    const c = editor.chain().focus();
    if (v === 'h1') c.setHeading({ level: 1 }).run();
    else if (v === 'h2') c.setHeading({ level: 2 }).run();
    else if (v === 'h3') c.setHeading({ level: 3 }).run();
    else if (v === 'quote') c.toggleBlockquote().run();
    else c.setParagraph().run();
  };

  const insertImage = () => {
    const url = imgUrl.trim();
    if (url) editor.chain().focus().setImage({ src: url }).run();
    setImgUrl('');
    setImgOpen(false);
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: String(reader.result) }).run();
      setImgOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const btn = (active: boolean) =>
    `w-8 h-8 grid place-items-center rounded-lg transition ${
      active ? 'bg-line/70 text-ink' : 'hover:bg-line/60 text-ink'
    }`;

  return (
    <>
    <div className="h-12 shrink-0 border-b border-line flex items-center gap-1 px-3 bg-paper/80 backdrop-blur overflow-x-auto scroll-thin">
      <select
        value={styleOf(editor)}
        onChange={(e) => applyStyle(e.target.value)}
        className="h-8 px-2.5 rounded-lg bg-panel border border-line text-[12px] font-medium hover:border-muted/40 transition cursor-pointer"
      >
        <option value="h1">Sarlavha 1</option>
        <option value="h2">Sarlavha 2</option>
        <option value="h3">Sarlavha 3</option>
        <option value="p">Asosiy matn</option>
        <option value="quote">Iqtibos</option>
      </select>

      <div className="w-px h-5 bg-line mx-1.5" />

      <select
        value={typography.bodyFont}
        onChange={(e) => setTypography({ bodyFont: e.target.value })}
        className="h-8 px-2.5 rounded-lg bg-panel border border-line text-[12px] hover:border-muted/40 transition cursor-pointer"
        style={{ fontFamily: typography.bodyFont }}
      >
        {BODY_FONTS.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>

      <div className="flex items-center bg-panel border border-line rounded-lg h-8 ml-1">
        <button
          className="w-7 h-full grid place-items-center text-muted hover:text-ink"
          onClick={() => setTypography({ bodySizePt: Math.max(7, typography.bodySizePt - 0.5) })}
        >
          −
        </button>
        <span className="text-[12px] tnum w-8 text-center">{typography.bodySizePt}pt</span>
        <button
          className="w-7 h-full grid place-items-center text-muted hover:text-ink"
          onClick={() => setTypography({ bodySizePt: Math.min(24, typography.bodySizePt + 0.5) })}
        >
          +
        </button>
      </div>

      <div className="w-px h-5 bg-line mx-1.5" />

      <div className="flex items-center gap-0.5">
        <button className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold text-[15px]">B</span>
        </button>
        <button className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic font-display text-[15px]">I</span>
        </button>
        <button className={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline text-[15px]">U</span>
        </button>
      </div>

      <div className="w-px h-5 bg-line mx-1.5" />

      <div className="flex items-center gap-0.5">
        <button className={btn(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <Icon d={ICONS.alignLeft} />
        </button>
        <button className={btn(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <Icon d={ICONS.alignCenter} />
        </button>
        <button className={btn(editor.isActive({ textAlign: 'justify' }))} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <Icon d={ICONS.alignJustify} />
        </button>
      </div>

      <div className="w-px h-5 bg-line mx-1.5" />

      <div className="flex items-center gap-0.5">
        <button className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <Icon d={ICONS.list} />
        </button>
        <button className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <Icon d={ICONS.listOrdered} />
        </button>
        <button className={btn(false)} onClick={() => setImgOpen(true)} title="Rasm qo'shish">
          <Icon d={ICONS.image} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1 text-muted pl-2">
        <button className={btn(false)} title="Bekor" onClick={() => editor.chain().focus().undo().run()}>
          <Icon d={ICONS.undo} />
        </button>
        <button className={btn(false)} title="Qaytar" onClick={() => editor.chain().focus().redo().run()}>
          <Icon d={ICONS.redo} />
        </button>
      </div>
    </div>

      {imgOpen && (
        <Modal title="Rasm qo'shish" onClose={() => setImgOpen(false)}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">URL manzil</span>
              <div className="flex gap-2 mt-1">
                <input
                  autoFocus
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                  placeholder="https://…"
                  className="h-9 px-2.5 rounded-lg bg-paper border border-line text-[13px] flex-1"
                />
                <button
                  onClick={insertImage}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium bg-ink text-paper hover:bg-ink/90 transition"
                >
                  Qo'sh
                </button>
              </div>
            </label>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex-1 h-px bg-line" />
              yoki
              <span className="flex-1 h-px bg-line" />
            </div>
            <label className="flex items-center justify-center gap-2 h-20 rounded-xl border border-dashed border-line hover:border-accent/50 hover:bg-line/30 transition cursor-pointer text-[13px] text-muted">
              <Icon d={ICONS.image} className="w-5 h-5" />
              Fayl tanlash (kompyuterdan)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>
          </div>
        </Modal>
      )}
    </>
  );
}
