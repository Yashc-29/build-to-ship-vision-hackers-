import { create } from 'zustand';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../types';
import { api } from '../lib/api';

export type TtsEngine = 'sarvam' | 'browser';

interface AudioState {
  isTtsEnabled: boolean;
  isSpeaking: boolean;
  ttsEngine: TtsEngine;
  selectedSarvamSpeaker: string;
  isSarvamConfigured: boolean;
  currentlySpeakingId: string | null;

  toggleTts: () => void;
  setTtsEnabled: (enabled: boolean) => void;
  setTtsEngine: (engine: TtsEngine) => void;
  setSelectedSarvamSpeaker: (speakerId: string) => void;
  checkSarvamStatus: () => Promise<void>;
  speak: (text: string, langCode?: LanguageCode, messageId?: string) => Promise<void>;
  stopSpeaking: () => void;

  // Backward compatibility aliases
  selectedMurfVoice?: string;
  isMurfConfigured?: boolean;
  setSelectedMurfVoice?: (voiceId: string) => void;
  checkMurfStatus?: () => Promise<void>;
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
  ttsEngine: (localStorage.getItem('nebula_tts_engine') as TtsEngine) === 'browser' ? 'browser' : 'sarvam',
  selectedSarvamSpeaker: localStorage.getItem('nebula_sarvam_speaker') || 'meera',
  isSarvamConfigured: false,
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

  setSelectedSarvamSpeaker: (speakerId: string) => {
    localStorage.setItem('nebula_sarvam_speaker', speakerId);
    set({ selectedSarvamSpeaker: speakerId });
  },

  checkSarvamStatus: async () => {
    try {
      const res = await api.tts.getVoices();
      const isConfigured = Boolean(res.sarvam_configured || res.murf_configured);
      set({ isSarvamConfigured: isConfigured });
      if (isConfigured) {
        const stored = localStorage.getItem('nebula_tts_engine');
        if (!stored || stored === 'sarvam' || stored === 'murf') {
          set({ ttsEngine: 'sarvam' });
        }
      }
    } catch {
      set({ isSarvamConfigured: false });
    }
  },

  // Backward compatibility methods
  get selectedMurfVoice() {
    return get().selectedSarvamSpeaker;
  },
  get isMurfConfigured() {
    return get().isSarvamConfigured;
  },
  setSelectedMurfVoice: (voiceId: string) => {
    get().setSelectedSarvamSpeaker(voiceId);
  },
  checkMurfStatus: async () => {
    await get().checkSarvamStatus();
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
    const customSarvamKey = localStorage.getItem('nebula_sarvam_key') || localStorage.getItem('nebula_murf_key') || undefined;

    // 1. Attempt Sarvam AI Synthesis if selected and either custom key or server key is configured
    if (engine === 'sarvam' && (customSarvamKey || get().isSarvamConfigured)) {
      try {
        const langMap: Record<string, string> = {
          hi: 'hi-IN',
          en: 'en-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          kn: 'kn-IN',
          ml: 'ml-IN',
          bn: 'bn-IN',
          mr: 'mr-IN',
          gu: 'gu-IN',
          pa: 'pa-IN',
          or: 'or-IN'
        };
        const targetLangCode = langMap[langCode] || 'hi-IN';

        const res = await api.tts.generate({
          inputs: [cleanText],
          target_language_code: targetLangCode,
          speaker: get().selectedSarvamSpeaker,
          customApiKey: customSarvamKey
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
            console.warn('Sarvam AI audio playback error, falling back to browser synthesis:', e);
            fallbackBrowserSpeech(cleanText, langCode, messageId, set);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Sarvam AI request failed, falling back to browser TTS:', err);
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
  activeUtterance = utterance;

  const langOpt = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  const speechCode = langOpt?.speechCode || 'en-US';
  utterance.lang = speechCode;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const langPrefix = speechCode.slice(0, 2).toLowerCase();
    const matchedVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
    
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
