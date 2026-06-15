import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends User {
  password: string; // demo only — plaintext, replaced by Django backend later
}

interface AuthState {
  users: StoredUser[];
  currentUser: User | null;
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const newId = () => `u_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
const strip = (u: StoredUser): User => ({ id: u.id, name: u.name, email: u.email });

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      register: (name, email, password) => {
        email = email.trim().toLowerCase();
        if (!name.trim() || !email || password.length < 4) {
          return { ok: false, error: "Ism, email va kamida 4 belgili parol kerak." };
        }
        if (get().users.some((u) => u.email === email)) {
          return { ok: false, error: 'Bu email allaqachon ro`yxatdan o`tgan.' };
        }
        const user: StoredUser = { id: newId(), name: name.trim(), email, password };
        set((s) => ({ users: [...s.users, user], currentUser: strip(user) }));
        return { ok: true };
      },

      login: (email, password) => {
        email = email.trim().toLowerCase();
        const u = get().users.find((x) => x.email === email);
        if (!u || u.password !== password) {
          return { ok: false, error: 'Email yoki parol noto`g`ri.' };
        }
        set({ currentUser: strip(u) });
        return { ok: true };
      },

      logout: () => set({ currentUser: null }),
    }),
    { name: 'kitob-auth-v1' },
  ),
);
