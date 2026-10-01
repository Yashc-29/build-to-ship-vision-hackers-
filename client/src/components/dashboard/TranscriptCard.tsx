import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Tag,
  Sparkles,
  Edit2,
  X,
  User,
  Bot
} from 'lucide-react';
import { Message, LanguageCode } from '../../types';
import { useAudioStore } from '../../stores/audioStore';

interface TranscriptCardProps {
  messages: Message[];
  isListening: boolean;
  transcript: string;
  isSending: boolean;
  onSendMessage: (text: string) => void;
  onClearTranscript: () => void;
  language: LanguageCode;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  messages,
  isListening,
  transcript,
  isSending,
  onSendMessage,
  onClearTranscript,
  language
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isSpeaking, currentlySpeakingId, speak, stopSpeaking } = useAudioStore();

  // Sync incoming transcript to inputText for live editing capability
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || isSending) return;
    onSendMessage(content);
    setInputText('');
    onClearTranscript();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayTTS = (id: string, text: string) => {
    if (isSpeaking && currentlySpeakingId === id) {
      stopSpeaking();
    } else {
      speak(text, language, id);
    }
  };

  return (
    <div className="nebula-panel rounded-3xl p-5 flex flex-col h-[520px] shadow-xl relative overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display">
            Live Conversation Transcript
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
          {messages.length} turns
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {messages.length === 0 && !transcript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Bot className="w-10 h-10 mb-2 text-indigo-400/40" />
            <p className="text-sm font-semibold text-slate-400">Ready for Live Interaction</p>
            <p className="text-xs max-w-xs mt-1 text-slate-500">
              Speak using the mic pill below or type to start a multi-turn session with persistent memory.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          const isAudioPlaying = isSpeaking && currentlySpeakingId === msg.id;

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  ⚡ {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-1`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-900/90 text-slate-100 border border-white/10 rounded-tl-none shadow-lg'
                }`}
              >
                {/* Meta header for assistant turn */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {msg.intent || 'Detected Intent'}
                      </span>
                      {msg.sentiment_score !== null && msg.sentiment_score !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            msg.sentiment_score > 0.2
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : msg.sentiment_score < -0.2
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Sentiment: {msg.sentiment_score > 0 ? `+${msg.sentiment_score}` : msg.sentiment_score}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(msg.id, msg.content)}
                        className={`p-1 rounded-lg transition-colors ${
                          isAudioPlaying
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={isAudioPlaying ? 'Pause audio' : 'Listen with TTS'}
                      >
                        {isAudioPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Copy turn"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Suggested actions list */}
                {!isUser && msg.metadata?.suggested_actions && msg.metadata.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Suggested Actions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.metadata.suggested_actions.map((act, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Live speech transcription preview while listening or after speech */}
        {(isListening || transcript) && (
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 animate-in fade-in">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold uppercase tracking-wide flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                {isListening ? 'Live Speech Recognition Stream:' : 'Voice Transcribed (Edit below or send):'}
              </span>
              <div className="flex items-center gap-2">
                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendMessage(inputText.trim());
                      setInputText('');
                      onClearTranscript();
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                  >
                    Send Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    onClearTranscript();
                  }}
                  className="text-slate-400 hover:text-white"
                  title="Clear transcript"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm italic font-medium">{inputText || transcript || 'Listening to your microphone...'}</p>
          </div>
        )}

        {/* AI Thinking Indicator */}
        {isSending && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-indigo-500/30 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            <span className="animate-pulse">Nebula AI is analyzing intent & memory slots...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at bottom */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-white/10 flex gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder={isListening ? 'Listening... (or type here)' : 'Type message or use microphone...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
            isSending || !inputText.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
