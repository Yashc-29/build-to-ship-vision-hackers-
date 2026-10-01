import { create } from 'zustand';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../types';
import { api } from '../lib/api';

export type TtsEngine = 'murf' | 'browser';

interface AudioState {
  isTtsEnabled: boolean;
  isSpeaking: boolean;
  ttsEngine: TtsEngine;
  selectedMurfVoice: string;
  isMurfConfigured: boolean;
  currentlySpeakingId: string | null;

  toggleTts: () => void;
  setTtsEnabled: (enabled: boolean) => void;
  setTtsEngine: (engine: TtsEngine) => void;
  setSelectedMurfVoice: (voiceId: string) => void;
  checkMurfStatus: () => Promise<void>;
  speak: (text: string, langCode?: LanguageCode, messageId?: string) => Promise<void>;
  stopSpeaking: () => void;
}

let activeAudioEl: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let resumeTimer: any = null;

// Pre-warm browser speech voices
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isTtsEnabled: localStorage.getItem('nebula_tts') !== 'false',
  isSpeaking: false,
  ttsEngine: (localStorage.getItem('nebula_tts_engine') as TtsEngine) || 'murf',
  selectedMurfVoice: localStorage.getItem('nebula_murf_voice') || 'en-US-natalie',
  isMurfConfigured: false,
  currentlySpeakingId: null,

  toggleTts: () => {
    const next = !get().isTtsEnabled;
    localStorage.setItem('nebula_tts', String(next));
    if (!next) {
      get().stopSpeaking();
    }
    set({ isTtsEnabled: next });
  },

  setTtsEnabled: (enabled: boolean) => {
    localStorage.setItem('nebula_tts', String(enabled));
    if (!enabled) {
      get().stopSpeaking();
    }
    set({ isTtsEnabled: enabled });
  },

  setTtsEngine: (engine: TtsEngine) => {
    localStorage.setItem('nebula_tts_engine', engine);
    set({ ttsEngine: engine });
  },

  setSelectedMurfVoice: (voiceId: string) => {
    localStorage.setItem('nebula_murf_voice', voiceId);
    set({ selectedMurfVoice: voiceId });
  },

  checkMurfStatus: async () => {
    try {
      const res = await api.tts.getVoices();
      set({ isMurfConfigured: res.murf_configured });
      if (res.murf_configured) {
        const stored = localStorage.getItem('nebula_tts_engine');
        if (!stored || stored === 'murf') {
          set({ ttsEngine: 'murf' });
        }
      }
    } catch {
      set({ isMurfConfigured: false });
    }
  },

  speak: async (text: string, langCode: LanguageCode = 'en', messageId?: string) => {
    get().stopSpeaking();

    if (!text || text.trim() === '') return;

    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const engine = get().ttsEngine;
    const customMurfKey = localStorage.getItem('nebula_murf_key') || undefined;

    // 1. Attempt Murf AI Synthesis if selected and either custom key or server key is configured
    if (engine === 'murf' && (customMurfKey || get().isMurfConfigured)) {
      try {
        const res = await api.tts.generate({
          text: cleanText,
          language: langCode,
          voiceId: get().selectedMurfVoice,
          customApiKey: customMurfKey
        });

        if (res.audioUrl) {
          const audio = new Audio(res.audioUrl);
          activeAudioEl = audio;

          audio.onplay = () => {
            set({ isSpeaking: true, currentlySpeakingId: messageId || null });
          };

          audio.onended = () => {
            set({ isSpeaking: false, currentlySpeakingId: null });
            activeAudioEl = null;
          };

          audio.onerror = (e) => {
            console.warn('Murf audio playback error, falling back to browser synthesis:', e);
            fallbackBrowserSpeech(cleanText, langCode, messageId, set);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Murf AI request failed, falling back to browser TTS:', err);
      }
    }

    // 2. High-fidelity Browser SpeechSynthesis Fallback
    fallbackBrowserSpeech(cleanText, langCode, messageId, set);
  },

  stopSpeaking: () => {
    if (activeAudioEl) {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
      activeAudioEl = null;
    }

    if (resumeTimer) {
      clearInterval(resumeTimer);
      resumeTimer = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    activeUtterance = null;
    set({ isSpeaking: false, currentlySpeakingId: null });
  }
}));

function fallbackBrowserSpeech(
  cleanText: string,
  langCode: LanguageCode,
  messageId: string | undefined,
  set: any
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech Synthesis API not supported.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  activeUtterance = utterance; // Prevent garbage collection in Chrome

  const langOpt = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  const speechCode = langOpt?.speechCode || 'en-US';
  utterance.lang = speechCode;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Find best available voice (prefer natural / neural / google / edge voices)
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const langPrefix = speechCode.slice(0, 2).toLowerCase();
    const matchedVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
    
    // Prioritize natural or studio-grade voices
    const premiumVoice = matchedVoices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Google') || 
      v.name.includes('Online') || 
      v.name.includes('Neural')
    );

    if (premiumVoice) {
      utterance.voice = premiumVoice;
    } else if (matchedVoices.length > 0) {
      utterance.voice = matchedVoices[0];
    }
  }

  utterance.onstart = () => {
    set({ isSpeaking: true, currentlySpeakingId: messageId || null });
  };

  utterance.onend = () => {
    set({ isSpeaking: false, currentlySpeakingId: null });
    activeUtterance = null;
    if (resumeTimer) {
      clearInterval(resumeTimer);
      resumeTimer = null;
    }
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    set({ isSpeaking: false, currentlySpeakingId: null });
    activeUtterance = null;
    if (resumeTimer) {
      clearInterval(resumeTimer);
      resumeTimer = null;
    }
  };

  // Keep Chrome's speech synthesis from going to sleep on longer sentences
  if (resumeTimer) clearInterval(resumeTimer);
  resumeTimer = setInterval(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
    } else {
      clearInterval(resumeTimer);
      resumeTimer = null;
    }
  }, 5000);

  window.speechSynthesis.speak(utterance);
}
