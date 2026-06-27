import { useEffect, type ReactNode } from 'react';
import { Icon, ICONS } from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

/** Lightweight centered modal with backdrop. Replaces window.prompt/alert. */
export function Modal({ title, onClose, children, width = 380 }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center no-print">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-panel rounded-2xl border border-line shadow-2xl fade-up"
        style={{ width, maxWidth: '92vw' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-line/60 transition text-muted"
          >
            <Icon d={ICONS.x} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto scroll-thin" style={{ maxHeight: 'calc(85vh - 64px)' }}>{children}</div>
      </div>
    </div>
  );
}
