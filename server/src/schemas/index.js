import { z } from 'zod';

export const UserRegisterSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  preferred_language: z.string().default('en'),
  role: z.enum(['agent', 'supervisor', 'admin']).default('agent')
});

export const UserLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const SessionCreateSchema = z.object({
  title: z.string().optional().nullable(),
  language: z.string().default('en'),
  channel: z.enum(['voice', 'whatsapp', 'webchat', 'sms']).default('voice')
});

export const SessionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  channel: z.enum(['voice', 'whatsapp', 'webchat', 'sms']).optional(),
  status: z.enum(['active', 'ended', 'archived']).optional(),
  is_pinned: z.boolean().optional()
});

export const MessageCreateSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
  channel: z.enum(['voice', 'whatsapp', 'webchat', 'sms']).optional(),
  language: z.string().optional()
});

export const MemorySlotSchema = z.object({
  slot_key: z.string().min(1, 'Memory slot key is required'),
  slot_value: z.string().min(1, 'Memory slot value is required'),
  confidence: z.number().min(0).max(1).optional().default(0.95)
});

export const AIResponseSchema = z.object({
  reply_text: z.string(),
  language: z.string().default('en'),
  intent: z.string().default('GeneralInquiry'),
  entities: z.record(z.string(), z.string().nullable()).default({}),
  sentiment_score: z.number().min(-1).max(1).default(0.0),
  sentiment_label: z.enum(['positive', 'neutral', 'negative', 'frustrated']).default('neutral'),
  memory_updates: z.array(
    z.object({
      slot_key: z.string(),
      slot_value: z.string()
    })
  ).default([]),
  suggested_actions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.95)
});
