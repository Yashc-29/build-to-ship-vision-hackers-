import { create } from 'zustand';
import { User, LanguageCode } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updatePreferredLanguage: (lang: LanguageCode) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem('nebula_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('nebula_token'),
  isAuthenticated: Boolean(localStorage.getItem('nebula_token')),
  isLoading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('nebula_token', res.token);
      localStorage.setItem('nebula_user', JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.register(userData);
      localStorage.setItem('nebula_token', res.token);
      localStorage.setItem('nebula_user', JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('nebula_token');
    localStorage.removeItem('nebula_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
    api.auth.logout().catch(() => {});
  },

  checkAuth: async () => {
    const token = localStorage.getItem('nebula_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.auth.me();
      localStorage.setItem('nebula_user', JSON.stringify(res.user));
      set({ user: res.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('nebula_token');
      localStorage.removeItem('nebula_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),

  updatePreferredLanguage: (lang: LanguageCode) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, preferred_language: lang };
      localStorage.setItem('nebula_user', JSON.stringify(updated));
      set({ user: updated });
    }
  }
}));
