import { create } from 'zustand';
import type {
  BookMeta,
  Margins,
  NumberSettings,
  PageBorder,
  PageFormat,
  PageFormatId,
  Typography,
  ViewMode,
} from '../types';
import { FORMATS } from '../lib/pageFormats';
import { apiFetch } from '../lib/api';

export interface BookDoc {
  meta: BookMeta;
  format: PageFormat;
  margins: Margins;
  numbering: NumberSettings;
  typography: Typography;
  content: string;
  border: PageBorder;
}

export interface Project extends BookDoc {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface BookState extends BookDoc {
  projects: Project[];
  activeId: string | null;
  viewMode: ViewMode;
  zoom: number;
  spread: boolean;
  savedAt: number;
  dirty: boolean;
  loading: boolean;
  error: string | null;

  setMeta: (m: Partial<BookMeta>) => void;
  setFormat: (f: PageFormat) => void;
  setMargins: (m: Partial<Margins>) => void;
  setNumbering: (n: Partial<NumberSettings>) => void;
  setTypography: (t: Partial<Typography>) => void;
  setContent: (html: string) => void;
  setBorder: (b: Partial<PageBorder>) => void;

  setViewMode: (v: ViewMode) => void;
  cycleViewMode: () => void;
  setZoom: (z: number) => void;
  toggleSpread: () => void;

  flushSave: () => Promise<void>;

  loadProjects: () => Promise<void>;
  createProject: (name?: string, formatId?: string) => Promise<string | null>;
  loadProject: (id: string) => Promise<boolean | null>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => void;
}

function defaultDoc(title = 'Yangi kitob'): BookDoc {
  return {
    meta: { title, author: '', year: new Date().getFullYear() },
    format: FORMATS.a5,
    margins: { top: 18, bottom: 18, inner: 20, outer: 16 },
    numbering: { enabled: true, startAtPage: 1, startFrom: 1, position: 'bottom-center', style: 'arabic', kolontitulEnabled: true, kolontitulText: '' },
    typography: {
      bodyFont: 'Spectral',
      bodySizePt: 11,
      lineHeight: 1.5,
      paragraphIndent: true,
      justify: true,
      pageBreak: 'fill',
    },
    content: '<h1>Yangi bob</h1><p></p>',
    border: { type: 'none', color: '#1a1a1a', numBorderType: 'none', numBorderColor: '#1a1a1a' },
  };
}

const DEFAULT_BORDER: PageBorder = { type: 'none', color: '#1a1a1a', numBorderType: 'none', numBorderColor: '#1a1a1a' };

function docFields(p: Project): BookDoc {
  return {
    meta: p.meta,
    format: p.format,
    margins: p.margins,
    numbering: p.numbering,
    typography: p.typography,
    content: p.content,
    border: (p as Project & { border?: PageBorder }).border ?? DEFAULT_BORDER,
  };
}

// Debounced PATCH: fires 8000ms after the last setter call (backup only — manual save is primary).
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(getState: () => BookState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = getState();
    if (!s.activeId) return;
    const patch: Partial<BookDoc> = {
      meta: s.meta,
      format: s.format,
      margins: s.margins,
      numbering: s.numbering,
      typography: s.typography,
      content: s.content,
      border: s.border,
    };
    apiFetch(`/api/projects/${s.activeId}/`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }).then((res) => {
      if (res.ok) {
        useBookStore.setState({ savedAt: Date.now(), dirty: false });
      }
    }).catch(() => {});
  }, 8000);
}

export const useBookStore = create<BookState>()((set, get) => ({
  ...defaultDoc(),
  projects: [],
  activeId: null,
  viewMode: 'split',
  zoom: 1,
  spread: false,
  savedAt: 0,
  dirty: false,
  loading: false,
  error: null,

  setMeta: (m) => {
    set((s) => ({ meta: { ...s.meta, ...m }, dirty: true }));
    scheduleSave(get);
  },
  setFormat: (f) => {
    set({ format: f, dirty: true });
    scheduleSave(get);
  },
  setMargins: (m) => {
    set((s) => ({ margins: { ...s.margins, ...m }, dirty: true }));
    scheduleSave(get);
  },
  setNumbering: (n) => {
    set((s) => ({ numbering: { ...s.numbering, ...n }, dirty: true }));
    scheduleSave(get);
  },
  setTypography: (t) => {
    set((s) => ({ typography: { ...s.typography, ...t }, dirty: true }));
    scheduleSave(get);
  },
  setContent: (html) => {
    set({ content: html, dirty: true });
    scheduleSave(get);
  },

  flushSave: () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    const s = get();
    if (!s.activeId) return Promise.resolve();
    const patch: Partial<BookDoc> = {
      meta: s.meta,
      format: s.format,
      margins: s.margins,
      numbering: s.numbering,
      typography: s.typography,
      content: s.content,
      border: s.border,
    };
    return apiFetch(`/api/projects/${s.activeId}/`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }).then((res) => {
      if (res.ok) useBookStore.setState({ savedAt: Date.now(), dirty: false });
    }).catch(() => {});
  },

  setBorder: (b) => {
    set((s) => ({ border: { ...s.border, ...b }, dirty: true }));
    scheduleSave(get);
  },

  setViewMode: (v) => set({ viewMode: v }),
  cycleViewMode: () =>
    set((s) => {
      const order: ViewMode[] = ['split', 'editor', 'preview'];
      const i = order.indexOf(s.viewMode);
      return { viewMode: order[(i + 1) % order.length] };
    }),
  setZoom: (z) => set({ zoom: Math.min(1.6, Math.max(0.4, z)) }),
  toggleSpread: () => set((s) => ({ spread: !s.spread })),

  loadProjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch('/api/projects/');
      if (!res.ok) throw new Error('Serverdan xato javobi.');
      const projects = await res.json() as Project[];
      set({ projects, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Loyihalar yuklanmadi.' });
    }
  },

  createProject: async (name, formatId) => {
    const title = (name && name.trim()) || 'Yangi kitob';
    const doc = defaultDoc(title);
    if (formatId && FORMATS[formatId as PageFormatId]) {
      doc.format = FORMATS[formatId as PageFormatId];
    }
    try {
      const res = await apiFetch('/api/projects/', {
        method: 'POST',
        body: JSON.stringify({ name: title, ...doc }),
      });
      if (!res.ok) return null;
      const project = await res.json() as Project;
      set((s) => ({
        projects: [project, ...s.projects],
        activeId: project.id,
        ...docFields(project),
        savedAt: project.updatedAt,
      }));
      return project.id;
    } catch {
      return null;
    }
  },

  loadProject: async (id) => {
    const p = get().projects.find((x) => x.id === id);
    if (p) {
      set({ activeId: id, ...docFields(p), savedAt: p.updatedAt, dirty: false });
      return true;
    }
    try {
      const res = await apiFetch(`/api/projects/${id}/`);
      if (!res.ok) return false;
      const project = await res.json() as Project;
      set((s) => ({
        projects: [...s.projects, project],
        activeId: id,
        ...docFields(project),
        savedAt: project.updatedAt,
        dirty: false,
      }));
      return true;
    } catch {
      return null;  // network error — caller should NOT redirect
    }
  },

  deleteProject: async (id) => {
    // optimistic removal
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }));
    apiFetch(`/api/projects/${id}/`, { method: 'DELETE' }).catch(() => {});
  },

  renameProject: (id, name) => {
    const trimmed = name.trim() || 'Nomsiz';
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
      ...(s.activeId === id ? { meta: { ...s.meta, title: trimmed } } : {}),
    }));
    apiFetch(`/api/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ name: trimmed }),
    }).catch(() => {});
  },
}));
