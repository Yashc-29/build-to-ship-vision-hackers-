import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Volume2,
  VolumeX,
  User,
  Shield,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Key,
  Radio,
  AudioWaveform,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import { useAudioStore } from '../stores/audioStore';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../types';

const MURF_VOICE_OPTIONS = [
  { id: 'en-US-natalie', name: 'Natalie', lang: 'English (US)', gender: 'Female', badge: 'Conversational' },
  { id: 'en-US-marcus', name: 'Marcus', lang: 'English (US)', gender: 'Male', badge: 'Professional' },
  { id: 'hi-IN-kabir', name: 'Kabir', lang: 'Hindi (IN)', gender: 'Male', badge: 'Warm & Natural' },
  { id: 'hi-IN-ananya', name: 'Ananya', lang: 'Hindi (IN)', gender: 'Female', badge: 'Expressive' },
  { id: 'en-IN-eashwar', name: 'Eashwar', lang: 'Hinglish / Indian', gender: 'Male', badge: 'Indian Dialect' },
  { id: 'es-ES-enrique', name: 'Enrique', lang: 'Spanish', gender: 'Male', badge: 'Articulate' },
  { id: 'fr-FR-adrien', name: 'Adrien', lang: 'French', gender: 'Male', badge: 'European' },
  { id: 'de-DE-sebastian', name: 'Sebastian', lang: 'German', gender: 'Male', badge: 'Calm & Direct' },
  { id: 'ar-AE-zayd', name: 'Zayd', lang: 'Arabic', gender: 'Male', badge: 'Standard' }
];

export const SettingsPage: React.FC = () => {
  const { user, updatePreferredLanguage } = useAuthStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const {
    isTtsEnabled,
    toggleTts,
    ttsEngine,
    setTtsEngine,
    selectedMurfVoice,
    setSelectedMurfVoice,
    speak,
    stopSpeaking,
    isSpeaking
  } = useAudioStore();

  const [savedNotice, setSavedNotice] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState(
    localStorage.getItem('nebula_gemini_key') || ''
  );
  const [murfKeyOverride, setMurfKeyOverride] = useState(
    localStorage.getItem('nebula_murf_key') || ''
  );
  const [speechRate, setSpeechRate] = useState('1.0');

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code);
    updatePreferredLanguage(code);
    triggerNotice();
  };

  const handleSaveApiKeys = () => {
    if (apiKeyOverride.trim()) {
      localStorage.setItem('nebula_gemini_key', apiKeyOverride.trim());
    } else {
      localStorage.removeItem('nebula_gemini_key');
    }

    if (murfKeyOverride.trim()) {
      localStorage.setItem('nebula_murf_key', murfKeyOverride.trim());
    } else {
      localStorage.removeItem('nebula_murf_key');
    }

    triggerNotice();
  };

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleTestTts = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const testPhrases: Record<string, string> = {
      en: 'Hello! This is Nebula Voice powered by Murf AI studio neural speech synthesis.',
      hi: 'नमस्ते! नेबुला वॉयस मर्फ एआई स्टूडियो स्पीच सिंथेसिस द्वारा संचालित है।',
      hinglish: 'Hello! Nebula Voice Murf AI neural voice ke sath bilkul tayyar hai.',
      es: 'Hola, este es Nebula Voice con síntesis de voz neuronal de Murf AI.',
      fr: 'Bonjour, ceci est Nebula Voice avec la synthèse vocale Murf AI.',
      de: 'Hallo, dies ist Nebula Voice mit Murf AI neuronaler Sprachsynthese.',
      ar: 'مرحبا! هذا هو نيبولا فويس مدعومًا بتقنية مورف للذكاء الاصطناعي.'
    };

    const text = testPhrases[currentLanguage] || testPhrases.en;
    await speak(text, currentLanguage);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 text-cyan-300 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <span>Platform & Speech Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure Murf AI studio voice synthesis, dialect defaults, and console preferences
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      {/* Murf AI Studio Voice Synthesis Engine */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <AudioWaveform className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-display">
                  Murf AI Neural Speech Synthesis
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                  Falcon 2 & Gen2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ultra-realistic, studio-grade voices with automatic browser fallback
              </p>
            </div>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTtsEngine('murf');
                triggerNotice();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                ttsEngine === 'murf'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Murf AI Studio
            </button>
            <button
              type="button"
              onClick={() => {
                setTtsEngine('browser');
                triggerNotice();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                ttsEngine === 'browser'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Browser Native
            </button>
          </div>
        </div>

        {/* Murf Voice Selection Grid */}
        {ttsEngine === 'murf' && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Murf AI Voice Actor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {MURF_VOICE_OPTIONS.map((v) => {
                const isSelected = selectedMurfVoice === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedMurfVoice(v.id);
                      triggerNotice();
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600/30 border-cyan-400 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{v.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono">
                        {v.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{v.lang}</span>
                      <span>{v.gender}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TTS Controls & Test Bar */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTts}
              className={`p-2 rounded-xl border transition-all ${
                isTtsEnabled
                  ? 'bg-indigo-600/30 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {isTtsEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div>
              <div className="text-xs font-bold text-white">
                {isTtsEnabled ? 'Voice Auto-Play Enabled' : 'Voice Output Muted'}
              </div>
              <div className="text-[11px] text-slate-400">
                Engine: <span className="text-cyan-300 font-semibold">{ttsEngine === 'murf' ? `Murf AI (${selectedMurfVoice})` : 'Browser Native'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestTts}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span>{isSpeaking ? 'Stop Voice' : 'Test Speech'}</span>
          </button>
        </div>
      </div>

      {/* Language Dialect Preferences */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              Preferred Console Dialect
            </h3>
            <p className="text-xs text-slate-400">
              Nebula Voice automatically detects and speaks in this preferred default dialect.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-indigo-600/30 border-cyan-400 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold">{lang.nativeName}</div>
                <div className="text-[11px] text-slate-400">{lang.name}</div>
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* API Keys Configuration (Murf AI & Gemini) */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              AI Service API Credentials
            </h3>
            <p className="text-xs text-slate-400">
              Configure Murf AI Studio API key and Google Gemini API key overrides
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Murf AI API Key
            </label>
            <input
              type="password"
              placeholder="Paste Murf AI API key (from https://murf.ai/api)"
              value={murfKeyOverride}
              onChange={(e) => setMurfKeyOverride(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="Paste Gemini API key (or leave blank to use server environment key)"
              value={apiKeyOverride}
              onChange={(e) => setApiKeyOverride(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveApiKeys}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            Save Credentials
          </button>
        </div>
      </div>

      {/* Agent Profile & Permissions */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              Agent Profile & Permissions
            </h3>
            <p className="text-xs text-slate-400">
              Your identity credentials and organizational access role
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
            <p className="text-xs font-bold text-white mt-0.5">{user?.full_name || 'Agent User'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
            <p className="text-xs font-bold text-white mt-0.5 truncate">{user?.email}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400">Access Role</span>
            <p className="text-xs font-bold text-cyan-300 uppercase mt-0.5">{user?.role || 'agent'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
