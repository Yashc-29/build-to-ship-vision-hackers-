import React from 'react';
import { PhoneCall, MessageCircle, Globe, Smartphone, ArrowRightLeft, Radio, Gauge } from 'lucide-react';
import { ChannelType } from '../../types';

interface ChannelHoppingCardProps {
  currentChannel: ChannelType;
  onSwitchChannel: (channel: ChannelType) => void;
  asrLatency?: number;
  className?: string;
}

export const ChannelHoppingCard: React.FC<ChannelHoppingCardProps> = ({
  currentChannel,
  onSwitchChannel,
  asrLatency = 142,
  className = ''
}) => {
  const channels: Array<{ id: ChannelType; label: string; icon: any; color: string; desc: string }> = [
    { id: 'voice', label: 'Voice Call', icon: PhoneCall, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', desc: 'Real-time WebRTC/ASR stream' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: 'Async mobile chat session' },
    { id: 'webchat', label: 'Web Chat', icon: Globe, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', desc: 'Interactive browser widget' },
    { id: 'sms', label: 'SMS Gateway', icon: Smartphone, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: 'Cellular fallback alerts' },
  ];

  return (
    <div className={`nebula-panel rounded-3xl p-5 shadow-xl flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display">
              Omnichannel State & Hopping
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Radio className="w-3 h-3 animate-pulse" /> Zero Context Loss
          </span>
        </div>

        {/* Channel Selection Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isActive = currentChannel === ch.id;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSwitchChannel(ch.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-900/60 to-cyan-900/40 border-cyan-400/60 ring-2 ring-cyan-500/20 shadow-md'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${ch.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {ch.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block line-clamp-1">{ch.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Latency & Telemetry Metric Bar */}
      <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ASR Latency</span>
          <span className="font-mono font-bold text-cyan-400">{asrLatency} ms</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">TTFT (AI)</span>
          <span className="font-mono font-bold text-indigo-400">284 ms</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Audio Stream</span>
          <span className="font-mono font-bold text-emerald-400">48 kHz OPUS</span>
        </div>
      </div>
    </div>
  );
};
