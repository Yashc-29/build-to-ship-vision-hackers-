import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Pin,
  Mic,
  MessageSquare,
  Smartphone,
  MessageCircle,
  Play,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';
import { useLanguageStore } from '../stores/languageStore';
import { ConversationSession, ChannelType } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../lib/api';

export const SessionsPage: React.FC = () => {
  const { sessions, isLoading, loadSessions, loadSession, createSession } = useSessionStore();
  const { currentLanguage } = useLanguageStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const handleResumeSession = async (session: ConversationSession) => {
    await loadSession(session.id);
    navigate('/dashboard');
  };

  const handleTogglePin = async (e: React.MouseEvent, session: ConversationSession) => {
    e.stopPropagation();
    try {
      await api.sessions.update(session.id, { is_pinned: !session.is_pinned });
      await loadSessions();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session and all associated turns and memory slots?')) return;
    setDeletingId(id);
    try {
      await api.sessions.delete(id);
      await loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartNew = async () => {
    try {
      await createSession('voice', currentLanguage, `Live Voice Session #${(sessions?.length || 0) + 1}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to start new session:', err);
    }
  };

  const channelIcons: Record<ChannelType, any> = {
    voice: Mic,
    webchat: MessageSquare,
    whatsapp: MessageCircle,
    sms: Smartphone
  };

  const channelColors: Record<ChannelType, string> = {
    voice: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    webchat: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    whatsapp: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sms: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  const filteredSessions = (sessions || []).filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.channel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || s.channel === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  // Sort pinned first, then by updated_at descending
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 text-cyan-300 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <span>Conversational Sessions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, replay, and resume multi-turn customer dialogues with full memory buffers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSessions()}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleStartNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Start Live Session</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="nebula-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sessions by title, ID, or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Channel Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'voice', 'whatsapp', 'webchat', 'sms'] as const).map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedChannel === channel
                  ? 'bg-indigo-600/40 text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid / List */}
      {isLoading && (!sessions || sessions.length === 0) ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Retrieving session index..." />
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="nebula-panel rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No conversation sessions found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No sessions matched "${searchQuery}". Try clearing filters.`
                : 'Start a voice or text interaction on the live console to create your first session.'}
            </p>
          </div>
          <button
            onClick={handleStartNew}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md hover:from-indigo-500 hover:to-cyan-400 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Live Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSessions.map((session) => {
            const Icon = channelIcons[session.channel] || Mic;
            const badgeClass = channelColors[session.channel] || 'text-slate-300 bg-white/5 border-white/10';

            return (
              <div
                key={session.id}
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="nebula-panel rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden shadow-lg"
              >
                {/* Subtle top indicator if pinned */}
                {session.is_pinned && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400" />
                )}

                {/* Card Top */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                      <Icon className="w-3 h-3" />
                      <span>{session.channel}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(e, session)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          session.is_pinned
                            ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                        title={session.is_pinned ? 'Unpin session' : 'Pin session'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${session.is_pinned ? 'fill-indigo-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        disabled={deletingId === session.id}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 font-display">
                    {session.title || 'Untitled Session'}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(session.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                      {session.language}
                    </span>
                    <span>•</span>
                    <span className={`capitalize ${session.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {session.status}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResumeSession(session);
                    }}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold group-hover:translate-x-0.5 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-cyan-400" />
                    <span>Live Console</span>
                  </button>

                  <span className="text-slate-500 flex items-center gap-1 font-medium group-hover:text-slate-300 transition-colors">
                    Replay <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
