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

const SARVAM_SPEAKER_OPTIONS = [
  { id: 'meera', name: 'Meera', lang: 'Hindi / English (IN)', gender: 'Female', badge: 'Warm & Natural' },
  { id: 'arvind', name: 'Arvind', lang: 'Hindi / English (IN)', gender: 'Male', badge: 'Professional' },
  { id: 'pavithra', name: 'Pavithra', lang: 'Tamil / Telugu / Bengali', gender: 'Female', badge: 'South & East Dialects' },
  { id: 'maitreyi', name: 'Maitreyi', lang: 'Kannada / Malayalam', gender: 'Female', badge: 'Expressive' },
  { id: 'amol', name: 'Amol', lang: 'Marathi / Gujarati', gender: 'Male', badge: 'Regional Clear' },
  { id: 'amartya', name: 'Amartya', lang: 'Punjabi / Odia', gender: 'Male', badge: 'Articulate' }
];

export const SettingsPage: React.FC = () => {
  const { user, updatePreferredLanguage } = useAuthStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const {
    isTtsEnabled,
    toggleTts,
    ttsEngine,
    setTtsEngine,
    selectedSarvamSpeaker,
    setSelectedSarvamSpeaker,
    speak,
    stopSpeaking,
    isSpeaking
  } = useAudioStore();

  const [savedNotice, setSavedNotice] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState(
    localStorage.getItem('nebula_gemini_key') || ''
  );
  const [sarvamKeyOverride, setSarvamKeyOverride] = useState(
    localStorage.getItem('nebula_sarvam_key') || localStorage.getItem('nebula_murf_key') || ''
  );

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

    if (sarvamKeyOverride.trim()) {
      localStorage.setItem('nebula_sarvam_key', sarvamKeyOverride.trim());
    } else {
      localStorage.removeItem('nebula_sarvam_key');
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
      en: 'Hello! This is Nebula Voice powered by Sarvam AI neural speech synthesis.',
      hi: 'नमस्ते! नेबुला वॉयस सरवम एआई न्यूरल स्पीच सिंथेसिस द्वारा संचालित है।',
      hinglish: 'Hello! Nebula Voice Sarvam AI neural voice ke sath bilkul tayyar hai.',
      es: 'Hola, este es Nebula Voice con síntesis de voz neuronal de Sarvam AI.',
      fr: 'Bonjour, ceci est Nebula Voice avec la synthèse vocale Sarvam AI.',
      de: 'Hallo, dies ist Nebula Voice mit Sarvam AI Sprachsynthese.',
      ar: 'مرحبا! هذا هو نيبولا فويس مدعومًا بتقنية سروم للذكاء الاصطناعي.'
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
          Configure Sarvam AI studio voice synthesis, dialect defaults, and console preferences
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      {/* Sarvam AI Studio Voice Synthesis Engine */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <AudioWaveform className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-display">
                  Sarvam AI Neural Speech Synthesis
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                  Bulbul:v1 Model
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ultra-realistic Indic neural voice synthesis with automatic browser fallback
              </p>
            </div>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTtsEngine('sarvam');
                triggerNotice();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                ttsEngine === 'sarvam'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sarvam AI
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

        {/* Sarvam Speaker Selection Grid */}
        {ttsEngine === 'sarvam' && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Sarvam AI Speaker
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SARVAM_SPEAKER_OPTIONS.map((v) => {
                const isSelected = selectedSarvamSpeaker === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedSarvamSpeaker(v.id);
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
                Engine: <span className="text-cyan-300 font-semibold">{ttsEngine === 'sarvam' ? `Sarvam AI (${selectedSarvamSpeaker})` : 'Browser Native'}</span>
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

      {/* API Keys Configuration (Sarvam AI & Gemini) */}
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
              Configure Sarvam AI API key and Google Gemini API key overrides
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Sarvam AI API Key
            </label>
            <input
              type="password"
              placeholder="Paste Sarvam AI API key (from https://sarvam.ai)"
              value={sarvamKeyOverride}
              onChange={(e) => setSarvamKeyOverride(e.target.value)}
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
