import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { MemorySlotSchema } from '../schemas/index.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

/**
 * GET /api/sessions/:id/memory - get memory buffer slots for session
 */
router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    const sessionCheck = await db.query(
      'SELECT id FROM conversation_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Session not found or unauthorized' });
    }

    const memoryRes = await db.query(
      'SELECT id, slot_key, slot_value, confidence, updated_at FROM memory_slots WHERE session_id = $1 ORDER BY updated_at DESC',
      [sessionId]
    );

    res.json({ memory_slots: memoryRes.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/sessions/:id/memory - manual update or insert memory slot
 */
router.put('/', validateBody(MemorySlotSchema), async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { slot_key, slot_value, confidence = 0.95 } = req.validatedBody;
    const now = new Date().toISOString();

    const sessionCheck = await db.query(
      'SELECT id FROM conversation_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Session not found or unauthorized' });
    }

    const existing = await db.query(
      'SELECT id FROM memory_slots WHERE session_id = $1 AND slot_key = $2',
      [sessionId, slot_key]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE memory_slots SET slot_value = $1, confidence = $2, updated_at = $3 WHERE session_id = $4 AND slot_key = $5',
        [slot_value, confidence, now, sessionId, slot_key]
      );
    } else {
      await db.query(
        'INSERT INTO memory_slots (id, session_id, slot_key, slot_value, confidence, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [uuidv4(), sessionId, slot_key, slot_value, confidence, now, now]
      );
    }

    res.json({ message: 'Memory slot updated successfully', slot_key, slot_value });
  } catch (err) {
    next(err);
  }
});

export default router;
