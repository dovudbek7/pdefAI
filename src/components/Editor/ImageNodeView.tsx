import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const HANDLE_SIZE = 10;

type Align = 'left' | 'center' | 'right';

export function ImageNodeView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const src = node.attrs.src as string;
  const initWidth = (node.attrs.width as number | null) ?? null;
  const align: Align = (node.attrs['data-align'] as Align) ?? 'left';

  const [width, setWidth] = useState<number | null>(initWidth);
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startW = useRef(0);

  const onNaturalLoad = () => {
    if (!width && imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const maxW = imgRef.current.parentElement?.clientWidth ?? 600;
      const clamped = Math.min(w, maxW);
      setWidth(clamped);
      updateAttributes({ width: clamped });
    }
  };

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startX.current = e.clientX;
      startW.current = width ?? imgRef.current?.clientWidth ?? 300;

      const onMove = (me: MouseEvent) => {
        const delta = me.clientX - startX.current;
        const next = Math.max(60, startW.current + delta);
        setWidth(next);
      };

      const onUp = (me: MouseEvent) => {
        const delta = me.clientX - startX.current;
        const final = Math.max(60, startW.current + delta);
        setWidth(final);
        updateAttributes({ width: final });
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [width, updateAttributes],
  );

  const setAlign = (a: Align) => updateAttributes({ 'data-align': a });

  const deleteNode = () => {
    editor.chain().focus().deleteSelection().run();
  };

  // Sync external attribute changes (e.g. undo/redo)
  useEffect(() => {
    setWidth((node.attrs.width as number | null) ?? null);
  }, [node.attrs.width]);

  const wrapAlign =
    align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  return (
    <NodeViewWrapper className="block my-2">
      <div
        className={`relative inline-block ${wrapAlign} ${selected ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`}
        style={{ width: width ? width : undefined }}
      >
        <img
          ref={imgRef}
          src={src}
          onLoad={onNaturalLoad}
          draggable={false}
          style={{ width: '100%', display: 'block' }}
          className="rounded"
          alt=""
        />

        {/* Controls overlay — only when selected */}
        {selected && (
          <>
            {/* Alignment toolbar */}
            <div className="absolute -top-8 left-0 flex items-center gap-0.5 bg-ink/90 text-paper rounded px-1 py-0.5 text-[11px] z-20">
              {(['left', 'center', 'right'] as Align[]).map((a) => (
                <button
                  key={a}
                  onMouseDown={(e) => { e.preventDefault(); setAlign(a); }}
                  className={`px-1.5 py-0.5 rounded transition ${align === a ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  title={a === 'left' ? 'Chap' : a === 'center' ? 'Markaz' : 'Ong'}
                >
                  {a === 'left' ? '⬛◻◻' : a === 'center' ? '◻⬛◻' : '◻◻⬛'}
                </button>
              ))}
              <div className="w-px h-3.5 bg-white/20 mx-0.5" />
              <button
                onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
                className="px-1.5 py-0.5 rounded hover:bg-red-500/70 transition"
                title="O'chirish"
              >
                ×
              </button>
            </div>

            {/* Right-edge resize handle */}
            <div
              onMouseDown={startResize}
              style={{
                position: 'absolute',
                right: -HANDLE_SIZE / 2,
                bottom: '50%',
                width: HANDLE_SIZE,
                height: HANDLE_SIZE * 3,
                transform: 'translateY(50%)',
                background: 'rgba(59,130,246,0.9)',
                borderRadius: 3,
                cursor: 'ew-resize',
                zIndex: 20,
              }}
            />
            {/* Bottom-right corner handle */}
            <div
              onMouseDown={startResize}
              style={{
                position: 'absolute',
                right: -HANDLE_SIZE / 2,
                bottom: -HANDLE_SIZE / 2,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                background: 'rgba(59,130,246,0.9)',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 20,
              }}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
