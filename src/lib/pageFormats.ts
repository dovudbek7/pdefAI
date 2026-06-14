import type { PageFormat, PageFormatId } from '../types';

export const MM_PER_INCH = 25.4;
export const SCREEN_DPI = 96; // CSS px reference
export const PT_PER_INCH = 72;

export const FORMATS: Record<Exclude<PageFormatId, 'custom'>, PageFormat> = {
  a4: { id: 'a4', label: 'A4', widthMm: 210, heightMm: 297 },
  a5: { id: 'a5', label: 'A5', widthMm: 148, heightMm: 210 },
  b5: { id: 'b5', label: 'B5', widthMm: 176, heightMm: 250 },
};

export const mmToPx = (mm: number) => (mm / MM_PER_INCH) * SCREEN_DPI;
export const ptToPx = (pt: number) => (pt / PT_PER_INCH) * SCREEN_DPI;

export function formatLabel(f: PageFormat) {
  return `${f.widthMm} × ${f.heightMm} mm`;
}

export function toRoman(n: number): string {
  if (n <= 0) return '';
  const map: [number, string][] = [
    [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
    [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
  ];
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}
