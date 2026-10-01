import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  Volume2,
  Radio,
  ArrowRightLeft,
  Database,
  TrendingUp,
  Cpu,
  Sparkles,
  ArrowRight,
  Shield,
  Play,
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { LivingOrb } from '../components/dashboard/LivingOrb';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'refund' | 'escalation'>('order');

  const demoScenarios = {
    order: {
      user: 'Hi, where is my order #ORD-9482? I needed it before our deployment today.',
      ai: 'Hello! I see Order #ORD-9482. It has cleared regional dispatch and is out on express courier van for delivery before 2:00 PM today. I have sent real-time SMS tracking to your phone.',
      intent: 'OrderStatus',
      sentiment: '+0.4',
      memory: 'order_id = ORD-9482'
    },
    refund: {
      user: 'I was double-billed for invoice INV-4102 and need an immediate refund processed.',
      ai: 'I apologize for the billing discrepancy. I have located invoice INV-4102 and initiated an immediate credit refund of $240.00 to your card on file. Confirmation has been emailed to you.',
      intent: 'RefundRequest',
      sentiment: '-0.3 → +0.6',
      memory: 'invoice_id = INV-4102, refund_status = pending'
    },
    escalation: {
      user: 'I need to speak to a Senior Solutions Architect right away regarding API rate limits.',
      ai: 'Understood. I am transferring your session to our Tier-2 Architecture Desk with our complete conversation transcript and context slots intact so you will not need to repeat yourself.',
      intent: 'Escalation',
      sentiment: 'frustrated → resolved',
      memory: 'escalation_tier = Tier-2, routing = Architecture Desk'
    }
  };

  const handleHearDemo = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isPlayingDemo) {
      setIsPlayingDemo(false);
      return;
    }

    const currentScenario = demoScenarios[activeTab];
    const utterance = new SpeechSynthesisUtterance(currentScenario.ai);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;

    utterance.onstart = () => setIsPlayingDemo(true);
    utterance.onend = () => setIsPlayingDemo(false);
    utterance.onerror = () => setIsPlayingDemo(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleQuickLogin = async (role: 'agent' | 'admin') => {
    try {
      if (role === 'agent') {
        await login({ email: 'agent@nebula.ai', password: 'Agent@123' });
      } else {
        await login({ email: 'admin@nebula.ai', password: 'Admin@123' });
      }
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-sm animate-in fade-in duration-500">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Next-Gen Enterprise Conversational Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight font-display leading-[1.1]">
            Voice & Conversational Intelligence with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Zero Context Loss</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate fragmented interactions. Deliver human-like, real-time voice and text intelligence across Voice Calls, WhatsApp, and Web Chat with persistent memory buffers and live sentiment trajectory.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Launch Live Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/25 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>Start Live Session</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('agent')}
                  className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm sm:text-base flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Explore Demo (1-Click)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Living Orb Simulation Card */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="nebula-panel-glow rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border border-indigo-500/30">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-display">
                Live Interactive Scenario Simulation
              </h3>
            </div>

            {/* Scenario Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab('order'); window.speechSynthesis?.cancel(); setIsPlayingDemo(false); }}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'order' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Order Status
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('refund'); window.speechSynthesis?.cancel(); setIsPlayingDemo(false); }}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'refund' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Refund Request
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('escalation'); window.speechSynthesis?.cancel(); setIsPlayingDemo(false); }}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'escalation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Escalation
              </button>
            </div>
          </div>

          {/* Living Orb Centerpiece */}
          <div className="flex justify-center my-4">
            <LivingOrb
              isListening={false}
              isSpeaking={isPlayingDemo}
              audioLevel={isPlayingDemo ? 75 : 0}
            />
          </div>

          {/* Simulated Turns */}
          <div className="space-y-3 my-6">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customer Speech:</span>
              <p className="text-slate-200 font-medium">"{demoScenarios[activeTab].user}"</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-cyan-300">Nebula Intelligence Reply:</span>
                <span className="text-[10px] font-mono text-emerald-400">Intent: {demoScenarios[activeTab].intent}</span>
              </div>
              <p className="text-white font-medium leading-relaxed">"{demoScenarios[activeTab].ai}"</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs text-slate-400 font-mono">
              Memory Slot: <span className="text-cyan-300 font-bold">{demoScenarios[activeTab].memory}</span>
            </span>

            <button
              type="button"
              onClick={handleHearDemo}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                isPlayingDemo
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:brightness-110'
              }`}
            >
              {isPlayingDemo ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlayingDemo ? 'Speaking Reply...' : 'Hear Spoken Reply (TTS)'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Built for Modern Enterprise Operations
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
            The full intelligence stack: from raw ASR streaming to persistent memory buffers and channel orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="nebula-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Real-Time Voice Streaming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Browser Web Speech API + Web Audio frequency visualizers with low-latency turn-around and auto-play TTS speech synthesis.
            </p>
          </div>

          <div className="nebula-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Omnichannel Channel Hopping</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hop seamlessly between Voice Call, WhatsApp, Web Chat, and SMS without losing customer context or needing customers to repeat themselves.
            </p>
          </div>

          <div className="nebula-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Persistent Memory Buffer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI continuously extracts named entities, sentiment trajectories, and intent metadata into structured session slots.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
