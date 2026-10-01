import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { SessionCreateSchema, SessionUpdateSchema, MessageCreateSchema } from '../schemas/index.js';
import { processConversationalTurn } from '../services/gemini.service.js';
import memoryRoutes from './memory.routes.js';

const router = express.Router();
router.use(authenticate);

// Nested Memory Buffer Sub-router
router.use('/:id/memory', memoryRoutes);

/**
 * GET /api/sessions - list conversation sessions for authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
        s.*,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_activity_at
       FROM conversation_sessions s
       LEFT JOIN messages m ON s.id = m.session_id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.is_pinned DESC, s.updated_at DESC`,
      [req.user.id]
    );

    res.json({ sessions: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions - create a new session
 */
router.post('/', validateBody(SessionCreateSchema), async (req, res, next) => {
  try {
    const { title, language, channel } = req.validatedBody;
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const sessionLanguage = language || req.user.preferred_language || 'en';
    const sessionChannel = channel || 'voice';
    const initialTitle = title || `Live ${sessionChannel.toUpperCase()} Session`;

    await db.query(
      `INSERT INTO conversation_sessions (id, user_id, title, language, channel, status, is_pinned, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [sessionId, req.user.id, initialTitle, sessionLanguage, sessionChannel, 'active', false, now, now]
    );

    const created = await db.query(
      'SELECT * FROM conversation_sessions WHERE id = $1',
      [sessionId]
    );

    res.status(201).json({
      message: 'Session created successfully',
      session: created.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sessions/:id - retrieve session with messages and memory slots
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sessionRes = await db.query(
      'SELECT * FROM conversation_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Session not found or unauthorized' });
    }

    const messagesRes = await db.query(
      `SELECT id, session_id, role, content, language, intent, entities, sentiment_score, metadata, created_at
       FROM messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [req.params.id]
    );

    const memoryRes = await db.query(
      'SELECT slot_key, slot_value, confidence, updated_at FROM memory_slots WHERE session_id = $1 ORDER BY updated_at DESC',
      [req.params.id]
    );

    res.json({
      session: sessionRes.rows[0],
      messages: messagesRes.rows,
      memory_slots: memoryRes.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/sessions/:id - update session title, channel, status, pin
 */
router.patch('/:id', validateBody(SessionUpdateSchema), async (req, res, next) => {
  try {
    const { title, channel, status, is_pinned } = req.validatedBody;
    const now = new Date().toISOString();

    const existing = await db.query(
      'SELECT * FROM conversation_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Session not found' });
    }

    const s = existing.rows[0];
    const newTitle = title !== undefined ? title : s.title;
    const newChannel = channel !== undefined ? channel : s.channel;
    const newStatus = status !== undefined ? status : s.status;
    const newPinned = is_pinned !== undefined ? is_pinned : s.is_pinned;

    await db.query(
      `UPDATE conversation_sessions
       SET title = $1, channel = $2, status = $3, is_pinned = $4, updated_at = $5
       WHERE id = $6`,
      [newTitle, newChannel, newStatus, newPinned, now, req.params.id]
    );

    res.json({
      message: 'Session updated',
      session: { ...s, title: newTitle, channel: newChannel, status: newStatus, is_pinned: newPinned, updated_at: now }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/sessions/:id - delete session
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await db.query(
      'SELECT id FROM conversation_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Session not found' });
    }

    await db.query('DELETE FROM conversation_sessions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/channel - simulate channel hopping
 */
router.post('/:id/channel', async (req, res, next) => {
  try {
    const { channel } = req.body;
    if (!['voice', 'whatsapp', 'webchat', 'sms'].includes(channel)) {
      return res.status(400).json({ error: 'Invalid channel', message: 'Valid channels: voice, whatsapp, webchat, sms' });
    }

    const now = new Date().toISOString();
    await db.query(
      'UPDATE conversation_sessions SET channel = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
      [channel, now, req.params.id, req.user.id]
    );

    // Insert a system turn announcing channel switch without context loss
    const sysId = uuidv4();
    await db.query(
      `INSERT INTO messages (id, session_id, role, content, language, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        sysId,
        req.params.id,
        'system',
        `Channel hopped to ${channel.toUpperCase()}. Memory buffer and conversation context retained.`,
        'en',
        { event: 'channel_switch', new_channel: channel },
        now
      ]
    );

    res.json({ message: `Channel switched to ${channel}`, channel });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/messages - send message & trigger AI turn with memory retention
 */
router.post('/:id/messages', validateBody(MessageCreateSchema), async (req, res, next) => {
  try {
    const { content, channel, language } = req.validatedBody;
    const sessionId = req.params.id;
    const now = new Date().toISOString();

    // 1. Verify session ownership
    const sessionRes = await db.query(
      'SELECT * FROM conversation_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Session not found or unauthorized' });
    }

    const session = sessionRes.rows[0];
    const currentChannel = channel || session.channel || 'voice';
    const currentLanguage = language || session.language || 'en';

    // 2. Insert User Message
    const userMsgId = uuidv4();
    await db.query(
      `INSERT INTO messages (id, session_id, role, content, language, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userMsgId, sessionId, 'user', content, currentLanguage, now]
    );

    // 3. Load Memory Slots for Session
    const memoryRes = await db.query(
      'SELECT slot_key, slot_value FROM memory_slots WHERE session_id = $1',
      [sessionId]
    );
    const memorySlots = memoryRes.rows;

    // 4. Load Conversation History (last 8 turns)
    const historyRes = await db.query(
      'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 8',
      [sessionId]
    );
    const history = historyRes.rows.reverse();

    // 5. Call Nebula AI
    const aiResult = await processConversationalTurn({
      language: currentLanguage,
      channel: currentChannel,
      memorySlots,
      history,
      userMessage: content
    });

    // 6. Insert Assistant Message
    const assistantMsgId = uuidv4();
    const assistantTimestamp = new Date().toISOString();
    await db.query(
      `INSERT INTO messages (
        id, session_id, role, content, language, intent, entities, sentiment_score, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        assistantMsgId,
        sessionId,
        'assistant',
        aiResult.reply_text,
        aiResult.language,
        aiResult.intent,
        aiResult.entities,
        aiResult.sentiment_score,
        {
          sentiment_label: aiResult.sentiment_label,
          suggested_actions: aiResult.suggested_actions,
          confidence: aiResult.confidence
        },
        assistantTimestamp
      ]
    );

    // 7. Upsert Memory Buffer Updates
    if (Array.isArray(aiResult.memory_updates) && aiResult.memory_updates.length > 0) {
      for (const update of aiResult.memory_updates) {
        if (!update.slot_key || !update.slot_value) continue;

        // Check if slot exists
        const existingSlot = await db.query(
          'SELECT id FROM memory_slots WHERE session_id = $1 AND slot_key = $2',
          [sessionId, update.slot_key]
        );

        if (existingSlot.rows.length > 0) {
          await db.query(
            'UPDATE memory_slots SET slot_value = $1, confidence = $2, updated_at = $3 WHERE session_id = $4 AND slot_key = $5',
            [update.slot_value, 0.95, assistantTimestamp, sessionId, update.slot_key]
          );
        } else {
          await db.query(
            'INSERT INTO memory_slots (id, session_id, slot_key, slot_value, confidence, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [uuidv4(), sessionId, update.slot_key, update.slot_value, 0.95, assistantTimestamp, assistantTimestamp]
          );
        }
      }
    }

    // 8. Auto title if generic
    if (session.title.startsWith('Live ') || session.title === 'New Session') {
      const generatedTitle = aiResult.intent && aiResult.intent !== 'GeneralInquiry'
        ? `${aiResult.intent.replace(/([A-Z])/g, ' $1').trim()}: ${content.slice(0, 30)}...`
        : content.slice(0, 40);
      await db.query(
        'UPDATE conversation_sessions SET title = $1, updated_at = $2 WHERE id = $3',
        [generatedTitle, assistantTimestamp, sessionId]
      );
    } else {
      await db.query(
        'UPDATE conversation_sessions SET updated_at = $1 WHERE id = $2',
        [assistantTimestamp, sessionId]
      );
    }

    // 9. Fetch updated memory slots
    const updatedMemoryRes = await db.query(
      'SELECT slot_key, slot_value, confidence, updated_at FROM memory_slots WHERE session_id = $1 ORDER BY updated_at DESC',
      [sessionId]
    );

    const userMessage = {
      id: userMsgId,
      session_id: sessionId,
      role: 'user',
      content,
      language: currentLanguage,
      created_at: now
    };

    const assistantMessage = {
      id: assistantMsgId,
      session_id: sessionId,
      role: 'assistant',
      content: aiResult.reply_text,
      language: aiResult.language,
      intent: aiResult.intent,
      entities: aiResult.entities,
      sentiment_score: aiResult.sentiment_score,
      metadata: {
        sentiment_label: aiResult.sentiment_label,
        suggested_actions: aiResult.suggested_actions,
        confidence: aiResult.confidence
      },
      created_at: assistantTimestamp
    };

    res.json({
      user_message: userMessage,
      assistant_message: assistantMessage,
      intelligence: aiResult,
      memory_slots: updatedMemoryRes.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/end
 */
router.post('/:id/end', async (req, res, next) => {
  try {
    const now = new Date().toISOString();
    await db.query(
      'UPDATE conversation_sessions SET status = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
      ['ended', now, req.params.id, req.user.id]
    );
    res.json({ message: 'Session ended successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
