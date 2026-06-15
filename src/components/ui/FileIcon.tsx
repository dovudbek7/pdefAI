type Kind = 'pdf' | 'docx' | 'pptx';

const META: Record<Kind, { color: string; label: string }> = {
  pdf: { color: '#d83b3b', label: 'PDF' },
  docx: { color: '#2b579a', label: 'DOC' },
  pptx: { color: '#c43e1c', label: 'PPT' },
};

/** Branded file-type glyph (folded-corner document with a colored label band). */
export function FileIcon({ kind, className = 'w-10 h-12' }: { kind: Kind; className?: string }) {
  const { color, label } = META[kind];
  return (
    <svg className={className} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 3a3 3 0 013-3h18l11 11v34a3 3 0 01-3 3H7a3 3 0 01-3-3V3z"
        fill="#fff"
        stroke="#e6ddd0"
        strokeWidth="1.2"
      />
      <path d="M25 0l11 11H28a3 3 0 01-3-3V0z" fill="#e6ddd0" />
      <rect x="4" y="27" width="32" height="13" rx="2.5" fill={color} />
      <text
        x="20"
        y="36.4"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="8.5"
        fontWeight="700"
        fill="#fff"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </svg>
  );
}
