import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pin,
  Clock,
  Mic,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Sparkles,
  Download,
  Volume2,
  Database,
  TrendingUp,
  Tag,
  Check,
  Radio
} from 'lucide-react';
import { api } from '../lib/api';
import { useSessionStore } from '../stores/sessionStore';
import { ConversationSession, Message, MemorySlot, ChannelType } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadSession } = useSessionStore();

  const [session, setSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memorySlots, setMemorySlots] = useState<MemorySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    async function fetchSessionDetails() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.sessions.get(id);
        setSession(res.session);
        setMessages(res.messages || []);
        setMemorySlots(res.memory_slots || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load session details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessionDetails();
  }, [id]);

  const handleResumeInConsole = async () => {
    if (!id) return;
    await loadSession(id);
    navigate('/dashboard');
  };

  const handleSpeakTurn = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (activeSpeechIndex === index) {
      setActiveSpeechIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = session?.language || 'en-US';
    utterance.onend = () => setActiveSpeechIndex(null);
    utterance.onerror = () => setActiveSpeechIndex(null);
    setActiveSpeechIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyJson = () => {
    const data = JSON.stringify({ session, memory_slots: memorySlots, messages }, null, 2);
    navigator.clipboard.writeText(data);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const channelIcons: Record<ChannelType, any> = {
    voice: Mic,
    webchat: MessageSquare,
    whatsapp: MessageCircle,
    sms: Smartphone
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <LoadingSpinner size="lg" label="Replaying conversational context & memory buffer..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="nebula-panel rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          ✕
        </div>
        <h2 className="text-lg font-bold text-white">Session Replay Unavailable</h2>
        <p className="text-xs text-slate-400">{error || 'Session could not be located.'}</p>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions Archive</span>
        </Link>
      </div>
    );
  }

  const ChannelIcon = channelIcons[session.channel] || Mic;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/sessions"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            title="Back to Sessions"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                {session.title || 'Conversational Session'}
              </h1>
              {session.is_pinned && <Pin className="w-4 h-4 fill-indigo-400 text-indigo-400" />}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>ID: {session.id.slice(0, 8)}...</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(session.created_at).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleResumeInConsole}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Resume in Console</span>
          </button>
        </div>
      </div>

      {/* Meta Specs Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="nebula-panel rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <ChannelIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Channel</div>
            <div className="text-xs font-bold text-white capitalize">{session.channel}</div>
          </div>
        </div>

        <div className="nebula-panel rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            {session.language.toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Language</div>
            <div className="text-xs font-bold text-white">ISO: {session.language}</div>
          </div>
        </div>

        <div className="nebula-panel rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Memory Slots</div>
            <div className="text-xs font-bold text-white">{memorySlots.length} Persisted</div>
          </div>
        </div>

        <div className="nebula-panel rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Turns</div>
            <div className="text-xs font-bold text-white">{messages.length} Exchanges</div>
          </div>
        </div>
      </div>

      {/* Main Bento Layout: Replay + Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Historical Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Transcript Replay</span>
              </h3>
              <span className="text-[11px] text-slate-400">{messages.length} turns recorded</span>
            </div>

            {messages.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No message exchanges recorded for this session yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                {messages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  const isSystem = m.role === 'system';

                  if (isSystem) {
                    return (
                      <div key={m.id || idx} className="text-center my-3">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                          {m.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-slate-400">
                        <span className="font-bold uppercase text-slate-300">
                          {isUser ? 'Customer / User' : 'Nebula Voice'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {m.intent && (
                          <span className="px-2 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                            {m.intent}
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                            : 'nebula-panel border border-white/10 text-slate-200 rounded-tl-none shadow-md'
                        }`}
                      >
                        <p>{m.content}</p>

                        {!isUser && (
                          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-2">
                              {m.sentiment_score !== null && (
                                <span className="font-mono text-cyan-300">
                                  Sentiment: {Number(m.sentiment_score) > 0 ? '+' : ''}
                                  {m.sentiment_score}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSpeakTurn(m.content, idx)}
                              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{activeSpeechIndex === idx ? 'Stop' : 'Play TTS'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Memory Slots & Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Memory Buffer Card */}
          <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Memory Buffer Slots</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">{memorySlots.length} Active Slots</span>
            </div>

            {memorySlots.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No persistent context slots extracted yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {memorySlots.map((slot) => (
                  <div
                    key={slot.id || slot.slot_key}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono text-indigo-300 truncate">
                        {slot.slot_key}
                      </div>
                      <div className="text-white font-semibold text-xs mt-0.5 truncate">
                        {slot.slot_value}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                        {Math.round((slot.confidence || 0.95) * 100)}% conf
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Context Summary Card */}
          <div className="nebula-panel rounded-3xl p-5 border border-white/10 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span>Session Intelligence Summary</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Total Turns</span>
                <span className="text-white font-mono font-bold">{messages.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Language Detected</span>
                <span className="text-cyan-300 uppercase font-mono font-bold">{session.language}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Omnichannel Flow</span>
                <span className="text-violet-300 capitalize font-semibold">{session.channel}</span>
              </div>
            </div>

            <button
              onClick={handleResumeInConsole}
              className="w-full mt-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Continue Conversation in Console</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
