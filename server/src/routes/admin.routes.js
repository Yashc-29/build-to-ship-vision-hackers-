import express from 'express';
import db from '../db/index.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * GET /api/admin/stats - anonymized system metrics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      usersCount,
      sessionsCount,
      messagesCount,
      slotsCount,
      channelsRes,
      intentsRes
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM conversation_sessions'),
      db.query('SELECT COUNT(*) as count FROM messages'),
      db.query('SELECT COUNT(*) as count FROM memory_slots'),
      db.query('SELECT channel, COUNT(*) as count FROM conversation_sessions GROUP BY channel ORDER BY count DESC'),
      db.query("SELECT intent, COUNT(*) as count FROM messages WHERE intent IS NOT NULL AND intent != '' GROUP BY intent ORDER BY count DESC LIMIT 10")
    ]);

    const totalUsers = parseInt(usersCount.rows[0]?.count || 0, 10);
    const totalSessions = parseInt(sessionsCount.rows[0]?.count || 0, 10);
    const totalMessages = parseInt(messagesCount.rows[0]?.count || 0, 10);
    const totalMemorySlots = parseInt(slotsCount.rows[0]?.count || 0, 10);

    res.json({
      summary: {
        total_users: totalUsers,
        total_sessions: totalSessions,
        total_messages: totalMessages,
        total_memory_slots: totalMemorySlots
      },
      channel_distribution: channelsRes.rows,
      intent_distribution: intentsRes.rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;
