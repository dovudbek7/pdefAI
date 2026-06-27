import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  is_staff?: boolean;
}

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  init: () => Promise<void>;
}

type AuthResponse = { access: string; refresh: string; user: User };

function saveTokens(data: AuthResponse) {
  localStorage.setItem('kitob-access', data.access);
  localStorage.setItem('kitob-refresh', data.refresh);
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  loading: false,

  init: async () => {
    if (!localStorage.getItem('kitob-access')) return;
    set({ loading: true });
    try {
      const res = await apiFetch('/api/auth/me/');
      if (res.ok) {
        const user = await res.json() as User;
        set({ currentUser: user });
      } else {
        localStorage.removeItem('kitob-access');
        localStorage.removeItem('kitob-refresh');
      }
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await apiFetch('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json() as AuthResponse & Record<string, string[] | string | undefined>;
      if (!res.ok) {
        const firstError = Object.values(data).find((v) => v !== undefined);
        const msg = Array.isArray(firstError) ? firstError[0] : (firstError as string | undefined);
        return { ok: false, error: msg ?? 'Xatolik yuz berdi.' };
      }
      saveTokens(data);
      set({ currentUser: data.user });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Tarmoq xatosi. Internetni tekshiring.' };
    }
  },

  login: async (email, password) => {
    try {
      const res = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json() as AuthResponse & { detail?: string };
      if (!res.ok) return { ok: false, error: data.detail ?? 'Email yoki parol noto\'g\'ri.' };
      saveTokens(data);
      set({ currentUser: data.user });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Tarmoq xatosi. Internetni tekshiring.' };
    }
  },

  logout: () => {
    localStorage.removeItem('kitob-access');
    localStorage.removeItem('kitob-refresh');
    set({ currentUser: null });
  },
}));
