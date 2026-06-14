import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BookMeta,
  Margins,
  NumberSettings,
  PageFormat,
  Typography,
  ViewMode,
} from '../types';
import { FORMATS } from '../lib/pageFormats';

const SAMPLE = `
<h1>Tog'ga chiqish</h1>
<p>Tong saharda yo'lga tushdik. Havo musaffo, osmon hali xira tortib turardi. Tog' yo'li tik va tosh-tuproq edi, har qadamda nafas yetmay qolardi.</p>
<p>Karvonboshimiz oldinda yurar, bizga yo'l ko'rsatardi. "Shoshmang," derdi u tez-tez. "Tog' shoshganni kechirmaydi."</p>
<p>Quyosh chiqqach, manzara butunlay o'zgardi. Pastda — biz kelgan vodiy, daryolar kumush ip kabi tovlanardi. Tepada — bulutlarga tutash cho'qqilar.</p>
<h2>Birinchi tong</h2>
<p>Shu lahzada o'zimni butun olamning ustida his qildim. Pastdagi shahar uzoq, kichkina ko'rinardi. Yo'lda bir cholni uchratdik. U toshga suyanib o'tirar, qo'lida tasbeh.</p>
<blockquote>"Yo'lning oxiri — boshqa yo'lning boshi," dedi u nihoyat.</blockquote>
<p>Bu so'zlar uzoq vaqt yodimdan chiqmadi. Balki butun safar shu jumlaga sig'ar edi. Biz yana yo'lga tushdik, har qadamda yangi manzara ochilardi.</p>
<p>Tushgacha to'xtamadik. Quyosh tikka kelganda soya izlab, katta archaning tagiga o'tirdik. Non va pishloq yedik, muzdek buloq suvidan ichdik.</p>
`.trim();

interface BookState {
  meta: BookMeta;
  format: PageFormat;
  margins: Margins;
  numbering: NumberSettings;
  typography: Typography;
  content: string; // TipTap HTML
  viewMode: ViewMode;
  zoom: number;
  spread: boolean; // two-page view
  savedAt: number;

  setMeta: (m: Partial<BookMeta>) => void;
  setFormat: (f: PageFormat) => void;
  setMargins: (m: Partial<Margins>) => void;
  setNumbering: (n: Partial<NumberSettings>) => void;
  setTypography: (t: Partial<Typography>) => void;
  setContent: (html: string) => void;
  setViewMode: (v: ViewMode) => void;
  cycleViewMode: () => void;
  setZoom: (z: number) => void;
  toggleSpread: () => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      meta: { title: "Tog'lar ortidagi shahar", author: 'Muallif', year: 2026 },
      format: FORMATS.a5,
      margins: { top: 18, bottom: 18, inner: 20, outer: 16 },
      numbering: {
        enabled: true,
        startAtPage: 1,
        startFrom: 1,
        position: 'bottom-center',
        style: 'arabic',
      },
      typography: {
        bodyFont: 'Spectral',
        bodySizePt: 11,
        lineHeight: 1.5,
        paragraphIndent: true,
        justify: true,
        pageBreak: 'fill',
      },
      content: SAMPLE,
      viewMode: 'split',
      zoom: 1,
      spread: false,
      savedAt: 0,

      setMeta: (m) => set((s) => ({ meta: { ...s.meta, ...m }, savedAt: nowSafe() })),
      setFormat: (f) => set({ format: f, savedAt: nowSafe() }),
      setMargins: (m) => set((s) => ({ margins: { ...s.margins, ...m }, savedAt: nowSafe() })),
      setNumbering: (n) => set((s) => ({ numbering: { ...s.numbering, ...n }, savedAt: nowSafe() })),
      setTypography: (t) => set((s) => ({ typography: { ...s.typography, ...t }, savedAt: nowSafe() })),
      setContent: (html) => set({ content: html, savedAt: nowSafe() }),
      setViewMode: (v) => set({ viewMode: v }),
      cycleViewMode: () =>
        set((s) => {
          const order: ViewMode[] = ['split', 'editor', 'preview'];
          const i = order.indexOf(s.viewMode);
          return { viewMode: order[(i + 1) % order.length] };
        }),
      setZoom: (z) => set({ zoom: Math.min(1.6, Math.max(0.5, z)) }),
      toggleSpread: () => set((s) => ({ spread: !s.spread })),
    }),
    {
      name: 'kitob-session-v2',
      partialize: (s) => ({
        meta: s.meta,
        format: s.format,
        margins: s.margins,
        numbering: s.numbering,
        typography: s.typography,
        content: s.content,
        viewMode: s.viewMode,
        zoom: s.zoom,
        spread: s.spread,
      }),
    },
  ),
);

function nowSafe() {
  // Date.now is fine in the app runtime (not in workflow scripts)
  return Date.now();
}
