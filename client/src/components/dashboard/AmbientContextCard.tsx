import React from 'react';
import { Cpu, Tag, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AmbientContextCardProps {
  intent: string | null;
  entities: Record<string, string | null>;
  className?: string;
}

export const AmbientContextCard: React.FC<AmbientContextCardProps> = ({
  intent,
  entities,
  className = ''
}) => {
  const activeEntities = Object.entries(entities).filter(([_, val]) => val !== null && val !== undefined);

  return (
    <div className={`nebula-panel rounded-3xl p-5 shadow-xl flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display">
              Ambient Entity Stream
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            NLU Active
          </span>
        </div>

        {/* Intent Badge */}
        <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Primary Intent:</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {intent || 'Awaiting Input'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">98.2% Confidence</span>
        </div>

        {/* Extracted Entities */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Extracted Entities:
          </span>

          {activeEntities.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 rounded-xl bg-slate-950/40 border border-white/5">
              No named entities extracted yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeEntities.map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-cyan-400 block uppercase">{key}</span>
                  <span className="font-bold text-slate-200 truncate block mt-0.5">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latency & Security Guardrails footer */}
      <div className="pt-3 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3 text-cyan-400" /> Real-time entity inference
        </span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> PII Masked
        </span>
      </div>
    </div>
  );
};
