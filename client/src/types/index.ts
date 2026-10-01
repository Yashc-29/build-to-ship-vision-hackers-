export type UserRole = 'agent' | 'supervisor' | 'admin';

export type ChannelType = 'voice' | 'whatsapp' | 'webchat' | 'sms';

export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'frustrated';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'hinglish'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ar'
  | 'ja'
  | 'zh';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechCode: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_language: LanguageCode;
  role: UserRole;
  created_at: string;
}

export interface ConversationSession {
  id: string;
  user_id: string;
  title: string;
  language: LanguageCode;
  channel: ChannelType;
  status: 'active' | 'ended' | 'archived';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_activity_at?: string | null;
}

export interface MessageMetadata {
  sentiment_label?: SentimentLabel;
  suggested_actions?: string[];
  confidence?: number;
  [key: string]: any;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: string | null;
  intent?: string | null;
  entities?: Record<string, string | null>;
  sentiment_score?: number | null;
  metadata?: MessageMetadata;
  created_at: string;
}

export interface MemorySlot {
  id?: string;
  slot_key: string;
  slot_value: string;
  confidence?: number;
  updated_at?: string;
}

export interface AIResponse {
  reply_text: string;
  language: string;
  intent: string;
  entities: Record<string, string | null>;
  sentiment_score: number;
  sentiment_label: SentimentLabel;
  memory_updates: Array<{ slot_key: string; slot_value: string }>;
  suggested_actions: string[];
  confidence: number;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (US/UK)', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (Conversational)', speechCode: 'hi-IN' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', speechCode: 'de-DE' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', speechCode: 'pt-BR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', speechCode: 'ar-SA' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', speechCode: 'ja-JP' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', speechCode: 'zh-CN' }
];
