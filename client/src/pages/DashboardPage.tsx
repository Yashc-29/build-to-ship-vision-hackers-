import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Square,
  Download,
  History,
  Sparkles,
  Layers,
  Radio,
  FileText,
  FileCode,
  Check,
  AlertCircle
} from 'lucide-react';
import { useSessionStore } from '../stores/sessionStore';
import { useLanguageStore } from '../stores/languageStore';
import { VoiceIntelligenceDashboard } from '../components/dashboard/VoiceIntelligenceDashboard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChannelType } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    activeSession,
    sessions,
    messages,
    memorySlots,
    isLoading,
    loadSessions,
    loadSession,
    createSession,
    endSession
  } = useSessionStore();

  const { currentLanguage } = useLanguageStore();
  const navigate = useNavigate();

  const [isInitializing, setIsInitializing] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newChannel, setNewChannel] = useState<ChannelType>('voice');
  const [newTitle, setNewTitle] = useState('');

  // Initial load: ensure active session is loaded or auto-created
  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsInitializing(true);
      try {
        const sessionList = await loadSessions();
        if (!mounted) return;

        if (!activeSession) {
          if (sessionList && sessionList.length > 0) {
            // Load the most recently updated active or first session
            const activeOne = sessionList.find(s => s.status === 'active') || sessionList[0];
            await loadSession(activeOne.id);
          } else {
            // Auto create first live session
            await createSession('voice', currentLanguage, 'Live Voice Session #1');
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const title = newTitle.trim() || `Live ${newChannel.toUpperCase()} Session #${(sessions?.length || 0) + 1}`;
      await createSession(newChannel, currentLanguage, title);
      setShowNewModal(false);
      setNewTitle('');
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (window.confirm('Are you sure you want to end this active session? Memory slots and transcript will be archived.')) {
      await endSession();
    }
  };

  const handleExport = (format: 'json' | 'txt') => {
    if (!activeSession) return;

    let content = '';
    let mimeType = 'text/plain';
    let fileName = `nebula-session-${activeSession.id.slice(0, 8)}`;

    if (format === 'json') {
      mimeType = 'application/json';
      fileName += '.json';
      content = JSON.stringify(
        {
          session: activeSession,
          memory_slots: memorySlots,
          messages: messages,
          exported_at: new Date().toISOString()
        },
        null,
        2
      );
    } else {
      fileName += '.txt';
      content = `NEBULA VOICE & CONVERSATIONAL INTELLIGENCE SESSION REPORT\n`;
      content += `=========================================================\n`;
      content += `Session ID: ${activeSession.id}\n`;
      content += `Title: ${activeSession.title}\n`;
      content += `Channel: ${activeSession.channel.toUpperCase()}\n`;
      content += `Language: ${activeSession.language}\n`;
      content += `Status: ${activeSession.status}\n`;
      content += `Created At: ${activeSession.created_at}\n\n`;
      content += `MEMORY BUFFER SLOTS:\n`;
      memorySlots.forEach(s => {
        content += `- ${s.slot_key}: ${s.slot_value} (confidence: ${s.confidence || 1.0})\n`;
      });
      content += `\nCONVERSATION TRANSCRIPT (${messages.length} turns):\n`;
      content += `---------------------------------------------------------\n`;
      messages.forEach((m, idx) => {
        content += `[Turn ${idx + 1}] ${m.role.toUpperCase()} (${new Date(m.created_at).toLocaleTimeString()}):\n`;
        content += `${m.content}\n`;
        if (m.intent) content += `Intent: ${m.intent} | Sentiment: ${m.sentiment_score || 'N/A'}\n`;
        content += `\n`;
      });
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    setExportNotice(`Exported as ${format.toUpperCase()}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  if (isInitializing && !activeSession) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" label="Synchronizing Nebula Live Intelligence Mesh..." />
        <p className="text-xs text-slate-500">Connecting audio nodes and persistent memory buffer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          {activeSession?.status === 'active' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Console Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Session Ended</span>
            </div>
          )}

          <span className="text-slate-600 hidden sm:inline">|</span>

          <button
            onClick={() => navigate('/sessions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Archive ({sessions?.length || 0})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 relative">
          {exportNotice && (
            <span className="text-xs text-cyan-400 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              {exportNotice}
            </span>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
              title="Export Conversation"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl nebula-panel border border-white/10 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left"
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold">JSON Export</div>
                    <div className="text-[10px] text-slate-400">Slots, telemetry & turns</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold">Plain Text</div>
                    <div className="text-[10px] text-slate-400">Human-readable report</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* End Session */}
          {activeSession?.status === 'active' && (
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
              title="End Active Session"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">End Session</span>
            </button>
          )}

          {/* New Session Button */}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Archived session notification */}
      {activeSession?.status === 'ended' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>This conversation session is ended and archived. Context slots and transcript are permanently saved.</span>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-sm transition-all"
          >
            Launch New Session +
          </button>
        </div>
      )}

      {/* Main Voice Intelligence Bento Console */}
      <VoiceIntelligenceDashboard />

      {/* New Session Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md nebula-panel rounded-3xl p-6 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-cyan-300">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Start Live Session</h3>
                  <p className="text-xs text-slate-400">Initialize context and memory channels</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Session Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Customer Support Call"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Initial Entry Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['voice', 'webchat', 'whatsapp', 'sms'] as ChannelType[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setNewChannel(ch)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        newChannel === ch
                          ? 'bg-indigo-600/30 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="capitalize">{ch}</span>
                      {newChannel === ch && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md transition-all"
                >
                  Launch Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
