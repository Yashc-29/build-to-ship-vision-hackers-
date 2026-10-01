import React from 'react';

interface LivingOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel?: number; // 0 - 100
  className?: string;
}

export const LivingOrb: React.FC<LivingOrbProps> = ({
  isListening,
  isSpeaking,
  audioLevel = 0,
  className = ''
}) => {
  // Scale dynamics based on state & audio level
  const dynamicScale = isListening
    ? 1.0 + (audioLevel / 100) * 0.35
    : isSpeaking
    ? 1.08 + Math.sin(Date.now() / 250) * 0.06
    : 1.0;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow Halo */}
      <div
        className={`absolute rounded-full transition-all duration-300 blur-2xl pointer-events-none ${
          isListening
            ? 'w-64 h-64 bg-gradient-to-tr from-cyan-500/40 via-indigo-600/50 to-violet-500/40 opacity-90'
            : isSpeaking
            ? 'w-72 h-72 bg-gradient-to-tr from-violet-600/50 via-fuchsia-500/40 to-indigo-600/50 opacity-90'
            : 'w-52 h-52 bg-gradient-to-tr from-indigo-900/30 via-violet-800/20 to-cyan-900/20 opacity-60'
        }`}
        style={{ transform: `scale(${dynamicScale * 1.15})` }}
      />

      {/* Outer Concentric Animated Ring */}
      <div
        className={`absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-indigo-500/20 transition-all duration-500 ${
          isListening ? 'border-cyan-400/50 animate-spin' : isSpeaking ? 'border-violet-400/50 animate-pulse' : 'animate-orb-pulse'
        }`}
        style={{ animationDuration: isListening ? '6s' : '10s' }}
      />

      {/* Middle Glowing Ring */}
      <div
        className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border transition-all duration-300 ${
          isListening
            ? 'border-cyan-400/60 ring-2 ring-cyan-500/20'
            : isSpeaking
            ? 'border-violet-400/60 ring-2 ring-violet-500/20'
            : 'border-white/10'
        }`}
        style={{ transform: `scale(${dynamicScale})` }}
      />

      {/* Living Core Orb */}
      <div
        className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full transition-transform duration-150 flex items-center justify-center shadow-2xl overflow-hidden ${
          isListening
            ? 'bg-gradient-to-br from-cyan-400 via-indigo-600 to-violet-700 animate-orb-glow'
            : isSpeaking
            ? 'bg-gradient-to-br from-violet-400 via-fuchsia-600 to-indigo-800 animate-orb-glow'
            : 'bg-gradient-to-br from-indigo-600 via-slate-900 to-violet-900 animate-orb-pulse'
        }`}
        style={{ transform: `scale(${dynamicScale})` }}
      >
        {/* Core highlight reflection */}
        <div className="absolute top-2 left-4 w-10 h-6 bg-white/30 rounded-full blur-xs transform -rotate-45" />

        {/* Dynamic inner particles / waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full mix-blend-screen filter blur-md transition-all duration-300 ${
              isListening
                ? 'bg-cyan-300 opacity-90 animate-ping'
                : isSpeaking
                ? 'bg-fuchsia-300 opacity-80 animate-pulse'
                : 'bg-indigo-400 opacity-40'
            }`}
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* State Label overlay */}
        <span className="relative z-10 text-[10px] font-black tracking-widest uppercase text-white/80 select-none">
          {isListening ? 'Listening' : isSpeaking ? 'Nebula AI' : 'Standby'}
        </span>
      </div>
    </div>
  );
};
