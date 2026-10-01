import { create } from 'zustand';
import { ConversationSession, Message, MemorySlot, ChannelType, LanguageCode } from '../types';
import { api } from '../lib/api';
import { useAudioStore } from './audioStore';

interface SentimentPoint {
  time: string;
  score: number;
  label: string;
}

interface SessionState {
  sessions: ConversationSession[];
  activeSession: ConversationSession | null;
  messages: Message[];
  memorySlots: MemorySlot[];
  activeChannel: ChannelType;
  sentimentTrajectory: SentimentPoint[];
  latestIntent: string | null;
  latestEntities: Record<string, string | null>;
  asrLatency: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  loadSessions: () => Promise<ConversationSession[]>;
  loadSession: (id: string) => Promise<void>;
  createSession: (channel?: ChannelType, language?: LanguageCode, title?: string) => Promise<ConversationSession>;
  sendMessage: (content: string, language?: LanguageCode) => Promise<void>;
  switchChannel: (newChannel: ChannelType) => Promise<void>;
  endSession: () => Promise<void>;
  updateMemorySlot: (key: string, value: string) => Promise<void>;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSession: null,
  messages: [],
  memorySlots: [],
  activeChannel: 'voice',
  sentimentTrajectory: [],
  latestIntent: null,
  latestEntities: {},
  asrLatency: 142,
  isLoading: false,
  isSending: false,
  error: null,

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.sessions.list();
      const sessions = res.sessions || [];
      set({ sessions, isLoading: false });
      return sessions;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return [];
    }
  },

  loadSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.sessions.get(id);
      const session = res.session;
      const messages = res.messages || [];
      const memorySlots = res.memory_slots || [];

      // Reconstruct sentiment trajectory from messages
      const trajectory: SentimentPoint[] = messages
        .filter(m => m.sentiment_score !== null && m.sentiment_score !== undefined)
        .map(m => ({
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          score: Number(m.sentiment_score),
          label: m.metadata?.sentiment_label || 'neutral'
        }));

      // Get last assistant turn's intent and entities
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');

      set({
        activeSession: session,
        activeChannel: session?.channel || 'voice',
        messages,
        memorySlots,
        sentimentTrajectory: trajectory,
        latestIntent: lastAssistant?.intent || null,
        latestEntities: lastAssistant?.entities || {},
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createSession: async (channel = 'voice', language = 'en', title) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.sessions.create({ channel, language, title });
      await get().loadSessions();
      await get().loadSession(res.session.id);
      return res.session;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  sendMessage: async (content: string, language = 'en') => {
    let session = get().activeSession;
    if (!session) {
      session = await get().createSession(get().activeChannel, language as LanguageCode, 'Live Intelligence Session');
    }

    set({ isSending: true, error: null });

    // Measure simulated latency
    const startMs = performance.now();

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      role: 'user',
      content,
      language,
      created_at: new Date().toISOString()
    };

    set(state => ({
      messages: [...state.messages, tempUserMsg]
    }));

    try {
      const res = await api.sessions.sendMessage(session.id, {
        content,
        channel: get().activeChannel,
        language
      });

      const elapsed = Math.round(performance.now() - startMs);
      const measuredAsr = Math.min(320, Math.max(85, Math.round(elapsed * 0.25)));

      const newTrajectoryPoint: SentimentPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: Number(res.intelligence.sentiment_score || 0),
        label: res.intelligence.sentiment_label || 'neutral'
      };

      set(state => ({
        messages: [
          ...state.messages.filter(m => m.id !== tempUserMsg.id),
          res.user_message,
          res.assistant_message
        ],
        memorySlots: res.memory_slots || state.memorySlots,
        sentimentTrajectory: [...state.sentimentTrajectory, newTrajectoryPoint],
        latestIntent: res.intelligence.intent,
        latestEntities: res.intelligence.entities || {},
        asrLatency: measuredAsr,
        isSending: false
      }));

      // Auto-play TTS if enabled
      try {
        const audioState = useAudioStore.getState();
        if (audioState.isTtsEnabled && res.assistant_message?.content) {
          audioState.speak(res.assistant_message.content, language as LanguageCode, res.assistant_message.id);
        }
      } catch (ttsErr) {
        console.warn('Auto TTS playback error:', ttsErr);
      }

      // Refresh sessions to get updated titles
      get().loadSessions();
    } catch (err: any) {
      set({ error: err.message || 'Failed to send message', isSending: false });
      throw err;
    }
  },

  switchChannel: async (newChannel: ChannelType) => {
    const session = get().activeSession;
    if (!session) return;

    try {
      await api.sessions.switchChannel(session.id, newChannel);
      set({ activeChannel: newChannel });
      await get().loadSession(session.id);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  endSession: async () => {
    const session = get().activeSession;
    if (!session) return;

    try {
      await api.sessions.end(session.id);
      await get().loadSession(session.id);
      await get().loadSessions();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateMemorySlot: async (key: string, value: string) => {
    const session = get().activeSession;
    if (!session) return;

    try {
      await api.memory.update(session.id, key, value);
      await get().loadSession(session.id);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearError: () => set({ error: null })
}));
