interface IconProps {
  d: string;
  className?: string;
  stroke?: number;
  fill?: boolean;
}

/** Minimal stroked-path icon. */
export function Icon({ d, className = 'w-4 h-4', stroke = 1.6, fill = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d.split('|').map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

export const ICONS = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5|M17.6 3.4a2 2 0 112.8 2.8L12 16l-4 1 1-4 8.6-9.6z',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
  users: 'M9 17v-2a4 4 0 014-4h6m0 0l-3-3m3 3l-3 3',
  check: 'M5 13l4 4L19 7',
  alignLeft: 'M4 6h16M4 12h12M4 18h16',
  alignCenter: 'M4 6h16M7 12h10M4 18h16',
  alignJustify: 'M4 6h16M4 12h16M4 18h16',
  image: 'M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14M4 6h16v12H4z',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-1',
  redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 000 10h1',
  sparkles:
    'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 6.5L22 14l-6.5 2.5L13 23l-2.5-6.5L4 14l6.5-2.5L13 3z',
  quote: 'M7 7h4v4H7zM7 11c0 2-1 3-3 3M13 7h4v4h-4zM13 11c0 2-1 3-3 3',
  list: 'M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  listOrdered: 'M9 6h11M9 12h11M9 18h11M4 6h1v4M4 10h2M4 16h2a1 1 0 010 2H4v-2',
  split: 'M3 4h18v16H3zM12 4v16',
  textOnly: 'M3 4h18v16H3zM7 9h10M7 13h7',
  bookOnly: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h3',
  spread: 'M3 4h8v16H3zM13 4h8v16h-8z',
  x: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z|M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 005.5 19l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003 13.6H3a2 2 0 010-4h.1A1.6 1.6 0 004.5 7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 002.7-1.1V3a2 2 0 014 0v.1A1.6 1.6 0 0019 4.5l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0021 10.4h.1a2 2 0 010 4z',
};
