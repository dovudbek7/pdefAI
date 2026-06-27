// 22 decorative page border pattern definitions.
// Each border is rendered as an SVG overlay on the full page.

export interface BorderDef {
  id: string;
  label: string;
  preview: string; // short SVG string for thumbnail
}

// Inset from page edge in px (at FULL resolution ~3.78px/mm → ~5.3mm)
export const BORDER_INSET = 20;
export const CORNER_SIZE = 48; // size of corner ornament in px

export const BORDER_DEFS: BorderDef[] = [
  { id: 'none',            label: "Yo'q",              preview: '' },
  { id: 'thin-line',       label: 'Ingichka chiziq',   preview: 'rect-1' },
  { id: 'medium-line',     label: "O'rtacha chiziq",   preview: 'rect-2' },
  { id: 'thick-line',      label: 'Qalin chiziq',      preview: 'rect-4' },
  { id: 'double-thin',     label: 'Qo'sh ingichka',    preview: 'double-1' },
  { id: 'double-thick',    label: 'Qo'sh qalin',       preview: 'double-3' },
  { id: 'triple',          label: 'Uch chiziq',        preview: 'triple' },
  { id: 'dashed',          label: 'Uzuq-uzuq',         preview: 'dashed' },
  { id: 'dotted',          label: 'Nuqtali',           preview: 'dotted' },
  { id: 'dot-dash',        label: 'Nuqta-chiziq',      preview: 'dot-dash' },
  { id: 'corner-bracket',  label: 'Burchak qavs',      preview: 'corner-brk' },
  { id: 'corner-l',        label: 'L-burchak',         preview: 'corner-l' },
  { id: 'corner-bevel',    label: 'Qiyshiq burchak',   preview: 'bevel' },
  { id: 'corner-double',   label: 'Qo'sh burchak',     preview: 'corner-dbl' },
  { id: 'corner-cross',    label: 'Xoch burchak',      preview: 'corner-cross' },
  { id: 'corner-leaf',     label: 'Barg burchak',      preview: 'corner-leaf' },
  { id: 'corner-scroll',   label: 'Aylanma naqsh',     preview: 'corner-scroll' },
  { id: 'corner-fleur',    label: 'Gul naqsh',         preview: 'corner-fleur' },
  { id: 'corner-art-deco', label: 'Art Deko',          preview: 'artdeco' },
  { id: 'corner-victorian',label: 'Viktorian',         preview: 'victorian' },
  { id: 'diamond-chain',   label: 'Olmos zanjir',      preview: 'diamond' },
  { id: 'rope',            label: 'Arqon',             preview: 'rope' },
];

/**
 * Returns SVG inner content (children of <svg>) for the given border.
 * w, h = page pixel size at FULL resolution; color = hex string.
 */
export function renderBorderSVG(
  type: string,
  w: number,
  h: number,
  color: string,
): string {
  const i = BORDER_INSET;
  const rx = w - i;
  const ry = h - i;
  const c = color;

  switch (type) {
    case 'thin-line':
      return `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1.5" fill="none"/>`;

    case 'medium-line':
      return `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="3" fill="none"/>`;

    case 'thick-line':
      return `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="6" fill="none"/>`;

    case 'double-thin': {
      const i2 = i + 5;
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1.5" fill="none"/>`,
        `<rect x="${i2}" y="${i2}" width="${rx-i-10}" height="${ry-i-10}" stroke="${c}" stroke-width="1.5" fill="none"/>`,
      ].join('');
    }

    case 'double-thick': {
      const i2 = i + 7;
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="3" fill="none"/>`,
        `<rect x="${i2}" y="${i2}" width="${rx-i-14}" height="${ry-i-14}" stroke="${c}" stroke-width="3" fill="none"/>`,
      ].join('');
    }

    case 'triple': {
      const i2 = i + 5; const i3 = i + 10;
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1.5" fill="none"/>`,
        `<rect x="${i2}" y="${i2}" width="${rx-i-10}" height="${ry-i-10}" stroke="${c}" stroke-width="0.8" fill="none"/>`,
        `<rect x="${i3}" y="${i3}" width="${rx-i-20}" height="${ry-i-20}" stroke="${c}" stroke-width="1.5" fill="none"/>`,
      ].join('');
    }

    case 'dashed':
      return `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="2" fill="none" stroke-dasharray="12 6"/>`;

    case 'dotted':
      return `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="3" fill="none" stroke-dasharray="1 8" stroke-linecap="round"/>`;

    case 'dot-dash':
      return `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="2" fill="none" stroke-dasharray="1 5 10 5" stroke-linecap="round"/>`;

    case 'corner-bracket': {
      const arm = 28;
      return [
        // top-left
        `<path d="M ${i} ${i+arm} L ${i} ${i} L ${i+arm} ${i}" stroke="${c}" stroke-width="2" fill="none"/>`,
        // top-right
        `<path d="M ${rx-arm} ${i} L ${rx} ${i} L ${rx} ${i+arm}" stroke="${c}" stroke-width="2" fill="none"/>`,
        // bottom-left
        `<path d="M ${i} ${ry-arm} L ${i} ${ry} L ${i+arm} ${ry}" stroke="${c}" stroke-width="2" fill="none"/>`,
        // bottom-right
        `<path d="M ${rx-arm} ${ry} L ${rx} ${ry} L ${rx} ${ry-arm}" stroke="${c}" stroke-width="2" fill="none"/>`,
        // edges (thin)
        `<line x1="${i+arm}" y1="${i}" x2="${rx-arm}" y2="${i}" stroke="${c}" stroke-width="0.8"/>`,
        `<line x1="${i+arm}" y1="${ry}" x2="${rx-arm}" y2="${ry}" stroke="${c}" stroke-width="0.8"/>`,
        `<line x1="${i}" y1="${i+arm}" x2="${i}" y2="${ry-arm}" stroke="${c}" stroke-width="0.8"/>`,
        `<line x1="${rx}" y1="${i+arm}" x2="${rx}" y2="${ry-arm}" stroke="${c}" stroke-width="0.8"/>`,
      ].join('');
    }

    case 'corner-l': {
      const arm = 40;
      return [
        `<path d="M ${i} ${i+arm} L ${i} ${i} L ${i+arm} ${i}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="square"/>`,
        `<path d="M ${rx-arm} ${i} L ${rx} ${i} L ${rx} ${i+arm}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="square"/>`,
        `<path d="M ${i} ${ry-arm} L ${i} ${ry} L ${i+arm} ${ry}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="square"/>`,
        `<path d="M ${rx-arm} ${ry} L ${rx} ${ry} L ${rx} ${ry-arm}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="square"/>`,
      ].join('');
    }

    case 'corner-bevel': {
      const bev = 20;
      return `<polygon points="${i+bev},${i} ${rx-bev},${i} ${rx},${i+bev} ${rx},${ry-bev} ${rx-bev},${ry} ${i+bev},${ry} ${i},${ry-bev} ${i},${i+bev}" stroke="${c}" stroke-width="2" fill="none"/>`;
    }

    case 'corner-double': {
      const arm = 28; const gap = 6;
      const lines = (x1: number, y1: number, x2: number, y2: number) =>
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.5"/>`;
      return [
        // outer bracket corners
        `<path d="M ${i} ${i+arm} L ${i} ${i} L ${i+arm} ${i}" stroke="${c}" stroke-width="2" fill="none"/>`,
        `<path d="M ${rx-arm} ${i} L ${rx} ${i} L ${rx} ${i+arm}" stroke="${c}" stroke-width="2" fill="none"/>`,
        `<path d="M ${i} ${ry-arm} L ${i} ${ry} L ${i+arm} ${ry}" stroke="${c}" stroke-width="2" fill="none"/>`,
        `<path d="M ${rx-arm} ${ry} L ${rx} ${ry} L ${rx} ${ry-arm}" stroke="${c}" stroke-width="2" fill="none"/>`,
        // inner bracket corners
        `<path d="M ${i+gap} ${i+arm+gap} L ${i+gap} ${i+gap} L ${i+arm+gap} ${i+gap}" stroke="${c}" stroke-width="1" fill="none"/>`,
        `<path d="M ${rx-arm-gap} ${i+gap} L ${rx-gap} ${i+gap} L ${rx-gap} ${i+arm+gap}" stroke="${c}" stroke-width="1" fill="none"/>`,
        `<path d="M ${i+gap} ${ry-arm-gap} L ${i+gap} ${ry-gap} L ${i+arm+gap} ${ry-gap}" stroke="${c}" stroke-width="1" fill="none"/>`,
        `<path d="M ${rx-arm-gap} ${ry-gap} L ${rx-gap} ${ry-gap} L ${rx-gap} ${ry-arm-gap}" stroke="${c}" stroke-width="1" fill="none"/>`,
        // edges
        lines(i+arm, i, rx-arm, i), lines(i+arm, ry, rx-arm, ry),
        lines(i, i+arm, i, ry-arm), lines(rx, i+arm, rx, ry-arm),
      ].join('');
    }

    case 'corner-cross': {
      const cs = 12;
      function cross(cx: number, cy: number): string {
        return `<line x1="${cx-cs}" y1="${cy}" x2="${cx+cs}" y2="${cy}" stroke="${c}" stroke-width="2"/>` +
               `<line x1="${cx}" y1="${cy-cs}" x2="${cx}" y2="${cy+cs}" stroke="${c}" stroke-width="2"/>`;
      }
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1.5" fill="none"/>`,
        cross(i, i), cross(rx, i), cross(i, ry), cross(rx, ry),
      ].join('');
    }

    case 'corner-leaf': {
      function leaf(tx: number, ty: number, rot: number): string {
        return `<g transform="translate(${tx},${ty}) rotate(${rot})">` +
          `<path d="M 0 0 Q 12 -8 20 -20 Q 8 -12 0 0 Z" fill="${c}" opacity="0.9"/>` +
          `<path d="M 0 0 Q -12 -8 -20 -20 Q -8 -12 0 0 Z" fill="${c}" opacity="0.9"/>` +
          `<line x1="0" y1="0" x2="0" y2="-18" stroke="${c}" stroke-width="0.8"/>` +
          `</g>`;
      }
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1.5" fill="none"/>`,
        leaf(i, i, 135), leaf(rx, i, 225), leaf(i, ry, 45), leaf(rx, ry, 315),
      ].join('');
    }

    case 'corner-scroll': {
      function scroll(tx: number, ty: number, sx: number, sy: number): string {
        return `<g transform="translate(${tx},${ty}) scale(${sx},${sy})">` +
          `<path d="M 0 0 Q 0 -20 14 -20 Q 28 -20 28 -10 Q 28 0 18 0 Q 8 0 8 -8 Q 8 -16 16 -16" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
          `<path d="M 0 0 Q -20 0 -20 14 Q -20 28 -10 28 Q 0 28 0 18 Q 0 8 -8 8 Q -16 8 -16 16" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
          `</g>`;
      }
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1" fill="none"/>`,
        scroll(i, i, 1, 1), scroll(rx, i, -1, 1), scroll(i, ry, 1, -1), scroll(rx, ry, -1, -1),
      ].join('');
    }

    case 'corner-fleur': {
      function fleur(tx: number, ty: number, rot: number): string {
        return `<g transform="translate(${tx},${ty}) rotate(${rot})">` +
          `<circle cx="0" cy="-16" r="5" fill="${c}"/>` +
          `<circle cx="-11" cy="-11" r="4" fill="${c}"/>` +
          `<circle cx="-16" cy="0" r="5" fill="${c}"/>` +
          `<circle cx="0" cy="0" r="3" fill="${c}"/>` +
          `</g>`;
      }
      return [
        `<rect x="${i}" y="${i}" width="${rx-i}" height="${ry-i}" stroke="${c}" stroke-width="1" fill="none"/>`,
        fleur(i, i, 0), fleur(rx, i, 90), fleur(rx, ry, 180), fleur(i, ry, 270),
      ].join('');
    }

    case 'corner-art-deco': {
      function artDeco(tx: number, ty: number, sx: number, sy: number): string {
        return `<g transform="translate(${tx},${ty}) scale(${sx},${sy})">` +
          `<polygon points="0,0 30,0 30,4 4,4 4,30 0,30" fill="${c}"/>` +
          `<polygon points="8,8 22,8 22,12 12,12 12,22 8,22" fill="${c}"/>` +
          `<polygon points="16,0 20,0 20,16 16,16" fill="${c}" opacity="0.4"/>` +
          `<polygon points="0,16 0,20 16,20 16,16" fill="${c}" opacity="0.4"/>` +
          `</g>`;
      }
      return [
        artDeco(i, i, 1, 1), artDeco(rx, i, -1, 1), artDeco(i, ry, 1, -1), artDeco(rx, ry, -1, -1),
        `<line x1="${i+30}" y1="${i+2}" x2="${rx-30}" y2="${i+2}" stroke="${c}" stroke-width="4"/>`,
        `<line x1="${i+30}" y1="${ry-2}" x2="${rx-30}" y2="${ry-2}" stroke="${c}" stroke-width="4"/>`,
        `<line x1="${i+2}" y1="${i+30}" x2="${i+2}" y2="${ry-30}" stroke="${c}" stroke-width="4"/>`,
        `<line x1="${rx-2}" y1="${i+30}" x2="${rx-2}" y2="${ry-30}" stroke="${c}" stroke-width="4"/>`,
      ].join('');
    }

    case 'corner-victorian': {
      function victorian(tx: number, ty: number, sx: number, sy: number): string {
        return `<g transform="translate(${tx},${ty}) scale(${sx},${sy})">` +
          `<path d="M 0 0 L 36 0 L 36 3 L 3 3 L 3 36 L 0 36 Z" fill="${c}"/>` +
          `<path d="M 6 6 Q 6 18 18 18 Q 6 18 6 30 L 6 30 Q 18 30 18 18 Q 18 30 30 30 L 30 6 L 24 6 Q 24 12 18 12 Q 24 12 24 18 Q 24 12 18 12 Q 12 12 12 6 Z" fill="${c}" opacity="0.6"/>` +
          `<circle cx="3" cy="3" r="3" fill="${c}"/>` +
          `</g>`;
      }
      return [
        victorian(i, i, 1, 1), victorian(rx, i, -1, 1), victorian(i, ry, 1, -1), victorian(rx, ry, -1, -1),
        `<line x1="${i+36}" y1="${i+1.5}" x2="${rx-36}" y2="${i+1.5}" stroke="${c}" stroke-width="3"/>`,
        `<line x1="${i+36}" y1="${ry-1.5}" x2="${rx-36}" y2="${ry-1.5}" stroke="${c}" stroke-width="3"/>`,
        `<line x1="${i+1.5}" y1="${i+36}" x2="${i+1.5}" y2="${ry-36}" stroke="${c}" stroke-width="3"/>`,
        `<line x1="${rx-1.5}" y1="${i+36}" x2="${rx-1.5}" y2="${ry-36}" stroke="${c}" stroke-width="3"/>`,
      ].join('');
    }

    case 'diamond-chain': {
      const spacing = 22;
      const ds = 5;
      function diamond(cx: number, cy: number): string {
        return `<polygon points="${cx},${cy-ds} ${cx+ds},${cy} ${cx},${cy+ds} ${cx-ds},${cy}" fill="${c}"/>`;
      }
      let elems = '';
      for (let x = i + spacing; x < rx - spacing; x += spacing) {
        elems += diamond(x, i);
        elems += diamond(x, ry);
      }
      for (let y = i + spacing; y < ry - spacing; y += spacing) {
        elems += diamond(i, y);
        elems += diamond(rx, y);
      }
      elems += diamond(i, i) + diamond(rx, i) + diamond(i, ry) + diamond(rx, ry);
      return elems;
    }

    case 'rope': {
      const period = 20;
      const amp = 4;
      let topPath = `M ${i} ${i}`;
      for (let x = i; x <= rx; x += period / 2) {
        const peak = x % period === 0;
        topPath += ` Q ${x + period/4} ${i + (peak ? -amp : amp)} ${x + period/2} ${i}`;
      }
      let botPath = `M ${i} ${ry}`;
      for (let x = i; x <= rx; x += period / 2) {
        const peak = x % period === 0;
        botPath += ` Q ${x + period/4} ${ry + (peak ? -amp : amp)} ${x + period/2} ${ry}`;
      }
      return [
        `<path d="${topPath}" stroke="${c}" stroke-width="2" fill="none"/>`,
        `<path d="${botPath}" stroke="${c}" stroke-width="2" fill="none"/>`,
        `<line x1="${i}" y1="${i}" x2="${i}" y2="${ry}" stroke="${c}" stroke-width="2"/>`,
        `<line x1="${rx}" y1="${i}" x2="${rx}" y2="${ry}" stroke="${c}" stroke-width="2"/>`,
      ].join('');
    }

    default:
      return '';
  }
}

// Page number decorative frame patterns
export interface NumBorderDef {
  id: string;
  label: string;
}

export const NUM_BORDER_DEFS: NumBorderDef[] = [
  { id: 'none',         label: "Oddiy"         },
  { id: 'underline',    label: 'Chiziq ostida' },
  { id: 'bracket',      label: '[ Qavslar ]'   },
  { id: 'diamond',      label: '◆ Olmos ◆'     },
  { id: 'dash-wrap',    label: '— Tire —'      },
  { id: 'dot-wrap',     label: '• Nuqta •'     },
  { id: 'circle',       label: 'Doira'         },
];

/**
 * Wraps a page label string with the decorative number border.
 * Returns HTML string.
 */
export function wrapPageLabel(label: string, type: string, color: string): string {
  const st = `color:${color};`;
  switch (type) {
    case 'underline':
      return `<span style="${st};border-bottom:1px solid ${color};padding-bottom:1px;">${label}</span>`;
    case 'bracket':
      return `<span style="${st}">[ ${label} ]</span>`;
    case 'diamond':
      return `<span style="${st}">◆ ${label} ◆</span>`;
    case 'dash-wrap':
      return `<span style="${st}">— ${label} —</span>`;
    case 'dot-wrap':
      return `<span style="${st}">• ${label} •</span>`;
    case 'circle':
      return `<span style="${st};display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid ${color};border-radius:50%;">${label}</span>`;
    default:
      return label;
  }
}
