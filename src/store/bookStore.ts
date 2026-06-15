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
<p>Tong saharda yo'lga tushdik. Havo musaffo, osmon hali xira tortib turardi. Tog' yo'li tik va tosh-tuproq edi, har qadamda nafas yetmay qolardi. Yelkamizdagi xurjun og'ir, ammo ko'nglimiz yengil edi — oldinda bizni noma'lum cho'qqilar kutardi.</p>
<p>Karvonboshimiz oldinda yurar, bizga yo'l ko'rsatardi. "Shoshmang," derdi u tez-tez. "Tog' shoshganni kechirmaydi." Uning ovozida ko'p yillik tajriba sezilardi, biz esa har so'zini diqqat bilan tinglardik.</p>
<p>Quyosh chiqqach, manzara butunlay o'zgardi. Pastda — biz kelgan vodiy, daryolar kumush ip kabi tovlanardi. Tepada — bulutlarga tutash cho'qqilar, ularning oppoq qorlari quyoshda yarqirar edi. Havo shu qadar toza ediki, har nafas ichimizni yangilab yuborardi.</p>
<h2>Birinchi tong</h2>
<p>Shu lahzada o'zimni butun olamning ustida his qildim. Pastdagi shahar uzoq, kichkina ko'rinardi — go'yo bir hovuch tosh sochilgandek. Odamlar, mashinalar, shovqin — hammasi shu balandlikdan tinch va arzimas bo'lib tuyulardi.</p>
<p>Yo'lda bir cholni uchratdik. U toshga suyanib o'tirar, qo'lida tasbeh. Bizga qarab jilmaydi-yu, hech narsa demadi. Yuzidagi ajinlar tog' so'qmoqlariga o'xshardi — har biri bir hikoyani yashirardi.</p>
<blockquote>"Yo'lning oxiri — boshqa yo'lning boshi," dedi u nihoyat.</blockquote>
<p>Bu so'zlar uzoq vaqt yodimdan chiqmadi. Balki butun safar shu jumlaga sig'ar edi. Biz yana yo'lga tushdik, har qadamda yangi manzara ochilardi. Ba'zan to'xtab, orqamizga qarardik — bosib o'tgan yo'limiz endi ishonib bo'lmas darajada uzoq tuyulardi.</p>
<p>Tushgacha to'xtamadik. Quyosh tikka kelganda soya izlab, katta archaning tagiga o'tirdik. Non va pishloq yedik, muzdek buloq suvidan ichdik. Suvning ta'mi shahardagi hech narsaga o'xshamasdi — toza, sovuq va tirik edi.</p>
<h2>Cho'qqi sari</h2>
<p>Peshindan keyin yo'l yanada tiklashdi. Oyoqlarimiz og'irlashdi, lekin to'xtashni hech kim istamasdi. Karvonboshi: "Mana shu joydan keyin oson bo'ladi," derdi har safar — biz esa kulib qo'yardik, chunki "oson" so'zi tog'da boshqa ma'no kasb etardi.</p>
<p>Nihoyat, oxirgi qoyaga chiqqanimizda shamol yuzimizga urildi. Cho'qqi qarshimizda turardi — ulug'vor, sokin, abadiy. Biz uzoq jim qoldik. So'z keraksiz edi. Tog' bizni qabul qilgandek tuyuldi, biz esa o'zimizni qaytadan topgandek his qildik.</p>
<p>Quyosh botar chog'i pastga tusha boshladik. Orqamizda qolgan cho'qqi qizg'ish nurda yonardi. O'sha tong boshlangan safar shu kech tugamasligini, balki butun umrga cho'zilishini hali bilmasdik.</p>
`.trim();

// The set of fields that make up a book document.
export interface BookDoc {
  meta: BookMeta;
  format: PageFormat;
  margins: Margins;
  numbering: NumberSettings;
  typography: Typography;
  content: string; // TipTap HTML
}

export interface Project extends BookDoc {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface BookState extends BookDoc {
  // multi-project
  projects: Project[];
  activeId: string | null;

  // UI (not part of a project)
  viewMode: ViewMode;
  zoom: number;
  spread: boolean;
  savedAt: number;

  // document setters (operate on the active working copy + sync to project)
  setMeta: (m: Partial<BookMeta>) => void;
  setFormat: (f: PageFormat) => void;
  setMargins: (m: Partial<Margins>) => void;
  setNumbering: (n: Partial<NumberSettings>) => void;
  setTypography: (t: Partial<Typography>) => void;
  setContent: (html: string) => void;

  // UI setters
  setViewMode: (v: ViewMode) => void;
  cycleViewMode: () => void;
  setZoom: (z: number) => void;
  toggleSpread: () => void;

  // project CRUD
  createProject: (name?: string, sample?: boolean) => string;
  loadProject: (id: string) => boolean;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  ensureDemo: () => void; // seed one sample project if the list is empty
}

const nowSafe = () => Date.now();
const newId = () => `p_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;

function defaultDoc(title = 'Yangi kitob', withSample = false): BookDoc {
  return {
    meta: { title, author: '', year: new Date().getFullYear() },
    format: FORMATS.a5,
    margins: { top: 18, bottom: 18, inner: 20, outer: 16 },
    numbering: { enabled: true, startAtPage: 1, startFrom: 1, position: 'bottom-center', style: 'arabic' },
    typography: {
      bodyFont: 'Spectral',
      bodySizePt: 11,
      lineHeight: 1.5,
      paragraphIndent: true,
      justify: true,
      pageBreak: 'fill',
    },
    content: withSample ? SAMPLE : '<h1>Yangi bob</h1><p></p>',
  };
}

const docOf = (s: BookState): BookDoc => ({
  meta: s.meta,
  format: s.format,
  margins: s.margins,
  numbering: s.numbering,
  typography: s.typography,
  content: s.content,
});

// Sync the active project with the current working copy (plus a patch).
function syncProjects(s: BookState, patch: Partial<BookDoc>, ts: number): Project[] {
  if (!s.activeId) return s.projects;
  return s.projects.map((p) =>
    p.id === s.activeId ? { ...p, ...docOf(s), ...patch, updatedAt: ts } : p,
  );
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      ...defaultDoc("Tog'lar ortidagi shahar"),
      projects: [],
      activeId: null,

      viewMode: 'split',
      zoom: 1,
      spread: false,
      savedAt: 0,

      setMeta: (m) =>
        set((s) => {
          const ts = nowSafe();
          const meta = { ...s.meta, ...m };
          return { meta, savedAt: ts, projects: syncProjects(s, { meta }, ts) };
        }),
      setFormat: (f) =>
        set((s) => {
          const ts = nowSafe();
          return { format: f, savedAt: ts, projects: syncProjects(s, { format: f }, ts) };
        }),
      setMargins: (m) =>
        set((s) => {
          const ts = nowSafe();
          const margins = { ...s.margins, ...m };
          return { margins, savedAt: ts, projects: syncProjects(s, { margins }, ts) };
        }),
      setNumbering: (n) =>
        set((s) => {
          const ts = nowSafe();
          const numbering = { ...s.numbering, ...n };
          return { numbering, savedAt: ts, projects: syncProjects(s, { numbering }, ts) };
        }),
      setTypography: (t) =>
        set((s) => {
          const ts = nowSafe();
          const typography = { ...s.typography, ...t };
          return { typography, savedAt: ts, projects: syncProjects(s, { typography }, ts) };
        }),
      setContent: (html) =>
        set((s) => {
          const ts = nowSafe();
          return { content: html, savedAt: ts, projects: syncProjects(s, { content: html }, ts) };
        }),

      setViewMode: (v) => set({ viewMode: v }),
      cycleViewMode: () =>
        set((s) => {
          const order: ViewMode[] = ['split', 'editor', 'preview'];
          const i = order.indexOf(s.viewMode);
          return { viewMode: order[(i + 1) % order.length] };
        }),
      setZoom: (z) => set({ zoom: Math.min(1.6, Math.max(0.4, z)) }),
      toggleSpread: () => set((s) => ({ spread: !s.spread })),

      createProject: (name, sample = false) => {
        const id = newId();
        const ts = nowSafe();
        const title = (name && name.trim()) || 'Yangi kitob';
        const doc = defaultDoc(title, sample);
        const project: Project = { id, name: title, ...doc, createdAt: ts, updatedAt: ts };
        set((s) => ({ projects: [project, ...s.projects], activeId: id, savedAt: ts, ...doc }));
        return id;
      },

      loadProject: (id) => {
        const p = get().projects.find((x) => x.id === id);
        if (!p) return false;
        const { meta, format, margins, numbering, typography, content } = p;
        set({ activeId: id, meta, format, margins, numbering, typography, content, savedAt: p.updatedAt });
        return true;
      },

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),

      ensureDemo: () => {
        if (get().projects.length > 0) return;
        const ts = nowSafe();
        const doc = { ...defaultDoc("Tog'lar ortidagi shahar", true), content: SAMPLE };
        const project: Project = {
          id: newId(),
          name: "Tog'lar ortidagi shahar",
          ...doc,
          createdAt: ts,
          updatedAt: ts,
        };
        set({ projects: [project] });
      },

      renameProject: (id, name) =>
        set((s) => {
          const trimmed = name.trim() || 'Nomsiz';
          const ts = nowSafe();
          return {
            projects: s.projects.map((p) => (p.id === id ? { ...p, name: trimmed, updatedAt: ts } : p)),
            // if renaming the active project, also reflect in the book title meta
            ...(s.activeId === id ? { meta: { ...s.meta, title: trimmed } } : {}),
          };
        }),
    }),
    {
      name: 'kitob-app-v3',
      partialize: (s) => ({
        projects: s.projects,
        activeId: s.activeId,
        viewMode: s.viewMode,
        zoom: s.zoom,
        spread: s.spread,
      }),
    },
  ),
);
