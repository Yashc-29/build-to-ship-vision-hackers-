import React from 'react';
import { Mic, Square, Activity } from 'lucide-react';

interface MicPillProps {
  isListening: boolean;
  onToggle: () => void;
  audioLevel?: number;
  disabled?: boolean;
  className?: string;
}

export const MicPill: React.FC<MicPillProps> = ({
  isListening,
  onToggle,
  audioLevel = 0,
  disabled = false,
  className = ''
}) => {
  const bars = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Expanding Ripple container */}
      <div className="relative flex items-center justify-center">
        {/* Animated outer haptic ripples */}
        {isListening && (
          <>
            <div className="absolute w-full h-full rounded-full bg-cyan-500/20 animate-ripple-wave pointer-events-none" />
            <div
              className="absolute w-full h-full rounded-full bg-indigo-500/25 animate-ripple-wave pointer-events-none"
              style={{ animationDelay: '0.6s' }}
            />
          </>
        )}

        {/* Large Gradient Mic Pill */}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={isListening ? 'Stop recording voice' : 'Start speaking'}
          className={`relative z-10 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-base sm:text-lg flex items-center gap-4 transition-all duration-300 transform active:scale-95 shadow-2xl ${
            isListening
              ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white mic-active-nebula ring-4 ring-rose-500/30'
              : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white hover:shadow-indigo-500/25 ring-2 ring-white/10'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* Icon */}
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0">
            {isListening ? (
              <Square className="w-4 h-4 fill-white animate-pulse" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Label & Frequency Meter */}
          <div className="flex flex-col text-left">
            <span className="text-sm sm:text-base font-extrabold tracking-wide uppercase font-display leading-tight">
              {isListening ? 'Stop Speaking' : 'Tap to Talk'}
            </span>
            <span className="text-[11px] text-white/70 font-medium">
              {isListening ? 'Transcribing live voice...' : 'Speech-to-Text Enabled'}
            </span>
          </div>

          {/* Mini Waveform Bars inside pill */}
          <div className="flex items-center gap-1 h-5 ml-1">
            {bars.map((b, i) => {
              const height = isListening
                ? Math.max(20, Math.min(100, audioLevel * (1 - Math.abs(i - 3.5) * 0.15) * 1.5))
                : 25;
              return (
                <div
                  key={b}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isListening ? 'bg-white' : 'bg-white/40'
                  }`}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
              );
            })}
          </div>
        </button>
      </div>

      {/* Subtext info */}
      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-cyan-400" />
        <span>Continuous multi-turn voice memory active</span>
      </span>
    </div>
  );
};
