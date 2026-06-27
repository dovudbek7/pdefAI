import type { BookMeta, PageFormat, Margins } from '../../types';
import { SCREEN_DPI, MM_PER_INCH } from '../../lib/pageFormats';

interface Props {
  meta: BookMeta;
  format: PageFormat;
  margins: Margins;
  scale: number;
}

const FULL_PX_PER_MM = SCREEN_DPI / MM_PER_INCH;

export function CoverPage({ meta, format, margins, scale }: Props) {
  const w = format.widthMm * FULL_PX_PER_MM;
  const h = format.heightMm * FULL_PX_PER_MM;
  const padV = margins.top * FULL_PX_PER_MM;
  const padH = margins.outer * FULL_PX_PER_MM;

  return (
    <div
      style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className="relative overflow-hidden bg-[#1a1a1a] shadow-[0_4px_32px_rgba(0,0,0,.35)] rounded-sm select-none"
    >
      {/* Background image */}
      <img
        src={meta.cover}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        draggable={false}
      />

      {/* Gradient overlay for text legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.80) 100%)',
        }}
      />

      {/* Title / author block at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: padV,
          left: padH,
          right: padH,
          color: '#fff',
        }}
      >
        {meta.author && (
          <p
            style={{
              fontSize: 11 * FULL_PX_PER_MM * 0.35,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.75,
              marginBottom: 4 * FULL_PX_PER_MM * 0.35,
              fontFamily: 'Spectral, Georgia, serif',
            }}
          >
            {meta.author}
          </p>
        )}
        <p
          style={{
            fontSize: 18 * FULL_PX_PER_MM * 0.35,
            fontWeight: 700,
            lineHeight: 1.2,
            fontFamily: 'Spectral, Georgia, serif',
          }}
        >
          {meta.title || 'Nomsiz kitob'}
        </p>
        {meta.year && (
          <p
            style={{
              fontSize: 9 * FULL_PX_PER_MM * 0.35,
              opacity: 0.55,
              marginTop: 6 * FULL_PX_PER_MM * 0.35,
              fontFamily: 'Spectral, Georgia, serif',
            }}
          >
            {meta.year}
          </p>
        )}
      </div>
    </div>
  );
}
