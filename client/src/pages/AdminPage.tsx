import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Radio,
  MessageSquare,
  Database,
  BarChart3,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.admin.getStats();
      setStats(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Aggregating platform telemetry and session volumes..." />
      </div>
    );
  }

  const summary = stats?.summary || {};
  const channelDistribution = stats?.channel_distribution || [];
  const intentDistribution = stats?.intent_distribution || [];

  const totalSessions = summary.total_sessions || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Platform Operations & Intelligence Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time enterprise metrics, channel distribution, and conversational intent telemetry
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Agents & Users</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-display">
            {summary.total_users ?? 0}
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Role-Based Access Enforced</span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-display">
            {summary.total_sessions ?? 0}
          </div>
          <div className="mt-2 text-[10px] text-cyan-300 font-semibold flex items-center gap-1">
            <span>Voice & Omnichannel Hopping</span>
          </div>
        </div>

        {/* Total Messages */}
        <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Dialogue Turns</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-display">
            {summary.total_messages ?? 0}
          </div>
          <div className="mt-2 text-[10px] text-violet-300 font-semibold flex items-center gap-1">
            <span>NLU Intent & Entity Tagged</span>
          </div>
        </div>

        {/* Memory Buffer Slots */}
        <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Memory Slots</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-display">
            {summary.total_memory_slots ?? 0}
          </div>
          <div className="mt-2 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
            <span>Zero-Loss Context Retention</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Volume Distribution */}
        <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Channel Volume Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Omnichannel Mesh</span>
          </div>

          {channelDistribution.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No channel data logged yet.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {channelDistribution.map((item: any) => {
                const count = parseInt(item.count, 10);
                const pct = Math.round((count / (summary.total_sessions || 1)) * 100);
                return (
                  <div key={item.channel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-300 font-semibold">{item.channel}</span>
                      <span className="text-slate-400 font-mono">
                        {count} sessions ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Extracted Intents */}
        <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Top Extracted NLU Intents</span>
            </h3>
            <span className="text-xs text-slate-400">Gemini Structured Output</span>
          </div>

          {intentDistribution.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No intents classified yet.
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {intentDistribution.map((item: any) => (
                <div
                  key={item.intent}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 font-mono text-cyan-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{item.intent}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px]">
                    {item.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Architecture & Security Health */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Infrastructure & Security Controls</span>
          </h3>
          <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 font-semibold">
            All Systems Nominal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Data Isolation</div>
            <div className="text-white font-semibold">JWT-Enforced Tenant RLS</div>
            <p className="text-[11px] text-slate-400">Every query verifies authenticated user ownership</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Database Engine</div>
            <div className="text-white font-semibold">PostgreSQL + Local SQLite</div>
            <p className="text-[11px] text-slate-400">Dual-adapter runs with zero config or cloud Postgres</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">NLU Model</div>
            <div className="text-white font-semibold">Gemini 2.0 / 1.5 Flash + Fallback</div>
            <p className="text-[11px] text-slate-400">Zod JSON validation with self-healing fallback</p>
          </div>
        </div>
      </div>
    </div>
  );
};
