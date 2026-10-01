import React from 'react';
import { LivingOrb } from './LivingOrb';
import { MicPill } from './MicPill';
import { TranscriptCard } from './TranscriptCard';
import { SentimentTrajectoryCard } from './SentimentTrajectoryCard';
import { ChannelHoppingCard } from './ChannelHoppingCard';
import { MemoryBufferCard } from './MemoryBufferCard';
import { AmbientContextCard } from './AmbientContextCard';
import { LanguageSelector } from '../LanguageSelector';
import { useSessionStore } from '../../stores/sessionStore';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioStore } from '../../stores/audioStore';
import { useLanguageStore } from '../../stores/languageStore';
import { Volume2, VolumeX, Radio, Sparkles, Pin, AlertCircle } from 'lucide-react';

export const VoiceIntelligenceDashboard: React.FC = () => {
  const {
    activeSession,
    messages,
    memorySlots,
    activeChannel,
    sentimentTrajectory,
    latestIntent,
    latestEntities,
    asrLatency,
    isSending,
    sendMessage,
    switchChannel,
    updateMemorySlot
  } = useSessionStore();

  const { currentLanguage, setLanguage } = useLanguageStore();
  const { isTtsEnabled, toggleTts, isSpeaking } = useAudioStore();

  // Speech-to-Text hook with auto-send on final speech
  const {
    isListening,
    transcript,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition({
    language: currentLanguage,
    onFinalTranscript: (finalText) => {
      if (finalText && finalText.trim().length > 3) {
        stopListening();
        handleSendTurn(finalText.trim());
      }
    }
  });

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript && transcript.trim()) {
        handleSendTurn(transcript.trim());
      }
    } else {
      startListening();
    }
  };

  const handleSendTurn = async (content: string) => {
    if (isListening) {
      stopListening();
    }
    resetTranscript();
    await sendMessage(content, currentLanguage);
  };

  return (
    <div className="space-y-6">
      {speechError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => resetTranscript()}
            className="text-amber-400 hover:text-white px-2 py-0.5 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Top Session Command Bar */}
      <div className="nebula-panel rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                {activeSession?.title || 'Nebula Live Intelligence Session'}
              </h2>
              {activeSession?.is_pinned && (
                <Pin className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="capitalize text-cyan-400 font-semibold">Channel: {activeChannel}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Memory Buffer Synced</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <LanguageSelector compact onLanguageSelected={(l) => setLanguage(l)} />

          <button
            type="button"
            onClick={toggleTts}
            aria-label="Toggle auto voice TTS"
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isTtsEnabled
                ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200 shadow-md shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={isTtsEnabled ? 'Auto-TTS Voice is Active' : 'TTS Voice Muted'}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isTtsEnabled ? 'Voice Auto-Play' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Main Living Orb & Mic Pill Hero Card */}
      <div className="nebula-panel-glow rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        {/* Living 3D Animated Orb */}
        <LivingOrb
          isListening={isListening}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          className="mb-6 sm:mb-8"
        />

        {/* Large Prominent Mic Pill */}
        <MicPill
          isListening={isListening}
          onToggle={handleMicToggle}
          audioLevel={audioLevel}
          disabled={isSending}
        />

        {/* Live speech heard preview with instant Send */}
        {transcript && (
          <div className="mt-4 px-4 py-2 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex flex-wrap items-center justify-center gap-3 animate-in fade-in">
            <span>Heard: <strong className="text-white italic">"{transcript}"</strong></span>
            <button
              type="button"
              onClick={() => handleSendTurn(transcript)}
              className="px-3 py-1 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Send Voice Turn Now ➔
            </button>
          </div>
        )}

        {/* Quick Scenario Chips for 1-click testing */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-xl">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Scenarios:</span>
          {[
            { label: '📦 Order #ORD-84920 Status', text: 'Where is order #ORD-84920 for Acme Corp?' },
            { label: '💳 Double-Billed Refund', text: 'I was double-billed for invoice INV-4102 and need a refund.' },
            { label: '🎧 Escalate to Tier-2', text: 'I need to speak with a Senior Solutions Architect right away.' }
          ].map((sc) => (
            <button
              key={sc.label}
              type="button"
              onClick={() => handleSendTurn(sc.text)}
              disabled={isSending}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all shadow-xs disabled:opacity-50"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Master Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Live Transcript Card (7 Cols) */}
        <div className="lg:col-span-7">
          <TranscriptCard
            messages={messages}
            isListening={isListening}
            transcript={transcript}
            isSending={isSending}
            onSendMessage={handleSendTurn}
            onClearTranscript={resetTranscript}
            language={currentLanguage}
          />
        </div>

        {/* Column 2: Intelligence Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sentiment Trajectory */}
          <SentimentTrajectoryCard
            trajectory={sentimentTrajectory}
          />

          {/* Omnichannel & Hopping */}
          <ChannelHoppingCard
            currentChannel={activeChannel}
            onSwitchChannel={switchChannel}
            asrLatency={asrLatency}
          />

          {/* Persistent Memory Buffer */}
          <MemoryBufferCard
            memorySlots={memorySlots}
            onAddSlot={(k, v) => updateMemorySlot(k, v)}
          />

          {/* Ambient Entity Stream */}
          <AmbientContextCard
            intent={latestIntent}
            entities={latestEntities}
          />
        </div>
      </div>
    </div>
  );
};
