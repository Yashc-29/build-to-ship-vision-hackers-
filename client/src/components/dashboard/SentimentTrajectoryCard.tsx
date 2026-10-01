import React from 'react';
import { TrendingUp, Smile, Meh, Frown, AlertCircle } from 'lucide-react';

interface SentimentPoint {
  time: string;
  score: number;
  label: string;
}

interface SentimentTrajectoryCardProps {
  trajectory: SentimentPoint[];
  className?: string;
}

export const SentimentTrajectoryCard: React.FC<SentimentTrajectoryCardProps> = ({
  trajectory,
  className = ''
}) => {
  const currentPoint = trajectory[trajectory.length - 1] || {
    score: 0.2,
    label: 'neutral',
    time: 'Now'
  };

  const getLabelBadge = (label: string) => {
    switch (label) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Smile className="w-3.5 h-3.5" /> Positive (+{Math.round(currentPoint.score * 100)}%)
          </span>
        );
      case 'frustrated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Frustrated ({Math.round(currentPoint.score * 100)}%)
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Frown className="w-3.5 h-3.5" /> Negative ({Math.round(currentPoint.score * 100)}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700/60 text-slate-300 border border-slate-600/40">
            <Meh className="w-3.5 h-3.5" /> Neutral
          </span>
        );
    }
  };

  return (
    <div className={`nebula-panel rounded-3xl p-5 shadow-xl flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display">
              Sentiment Trajectory
            </h3>
          </div>
          {getLabelBadge(currentPoint.label)}
        </div>

        {/* Trajectory Sparkline / Bar Graph */}
        <div className="my-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
            <span>Score: {currentPoint.score > 0 ? `+${currentPoint.score}` : currentPoint.score}</span>
            <span>Range: -1.0 (Frustrated) to +1.0 (Delighted)</span>
          </div>

          {/* SVG Trajectory curve / steps */}
          <div className="h-28 bg-slate-950/60 rounded-2xl p-3 border border-white/5 relative flex items-end justify-between gap-1 overflow-hidden">
            {/* Zero baseline */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none" />

            {trajectory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                Awaiting conversational turn data...
              </div>
            ) : (
              trajectory.slice(-10).map((pt, idx) => {
                // Map score (-1 to 1) to height percentage (0 to 100)
                const heightPct = Math.max(10, Math.min(95, ((pt.score + 1) / 2) * 100));
                const isPositive = pt.score >= 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                      {pt.time}: {pt.score > 0 ? `+${pt.score}` : pt.score} ({pt.label})
                    </div>

                    <div
                      className={`w-full max-w-[18px] rounded-t-lg transition-all duration-300 ${
                        pt.label === 'frustrated' || pt.score < -0.3
                          ? 'bg-gradient-to-t from-rose-900 to-rose-500'
                          : isPositive
                          ? 'bg-gradient-to-t from-indigo-900 via-indigo-600 to-cyan-400'
                          : 'bg-gradient-to-t from-slate-800 to-amber-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-slate-500 mt-1 truncate max-w-full">
                      T{idx + 1}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Trajectory Insights Footer */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-center justify-between">
        <span>Emotional Momentum:</span>
        <span className="font-semibold text-slate-200 capitalize">
          {currentPoint.score >= 0.3
            ? 'Stabilized & Collaborative'
            : currentPoint.score <= -0.3
            ? 'Requires Empathy & Speed'
            : 'Neutral Resolution Flow'}
        </span>
      </div>
    </div>
  );
};
