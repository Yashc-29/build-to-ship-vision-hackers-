import { create } from 'zustand';
import { LanguageCode, SUPPORTED_LANGUAGES, LanguageOption } from '../types';

interface LanguageState {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  getLanguageOption: () => LanguageOption;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: (localStorage.getItem('nebula_lang') as LanguageCode) || 'en',

  setLanguage: (lang: LanguageCode) => {
    localStorage.setItem('nebula_lang', lang);
    set({ currentLanguage: lang });
  },

  getLanguageOption: () => {
    const code = get().currentLanguage;
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
  }
}));
