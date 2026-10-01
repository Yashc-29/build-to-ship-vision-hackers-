import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import db, { initDatabase } from './index.js';
import { hashPassword } from '../services/auth.service.js';

dotenv.config();

export async function runSeed() {
  console.log('🌌 Starting Nebula Voice database seeding...');
  await initDatabase();

  const now = new Date().toISOString();

  // 1. Seed Demo Agent
  const agentEmail = 'agent@nebula.ai';
  let agentRes = await db.query('SELECT id FROM users WHERE email = $1', [agentEmail]);
  let agentId;

  if (agentRes.rows.length === 0) {
    agentId = uuidv4();
    const agentPasswordHash = await hashPassword('Agent@123');
    await db.query(
      `INSERT INTO users (id, email, password_hash, full_name, preferred_language, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        agentId,
        agentEmail,
        agentPasswordHash,
        'Sarah Connor (Support Specialist)',
        'en',
        'agent',
        now,
        now
      ]
    );
    console.log('✅ Demo Agent created: agent@nebula.ai / Agent@123');
  } else {
    agentId = agentRes.rows[0].id;
  }

  // 2. Seed Demo Admin
  const adminEmail = 'admin@nebula.ai';
  let adminRes = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  let adminId;

  if (adminRes.rows.length === 0) {
    adminId = uuidv4();
    const adminPasswordHash = await hashPassword('Admin@123');
    await db.query(
      `INSERT INTO users (id, email, password_hash, full_name, preferred_language, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        adminId,
        adminEmail,
        adminPasswordHash,
        'Alex Mercer (VP Operations)',
        'en',
        'admin',
        now,
        now
      ]
    );
    console.log('✅ Demo Admin created: admin@nebula.ai / Admin@123');
  } else {
    adminId = adminRes.rows[0].id;
  }

  // 3. Seed Sample Conversation Session with Memory Buffer
  const sessionCheck = await db.query('SELECT id FROM conversation_sessions WHERE user_id = $1', [agentId]);
  if (sessionCheck.rows.length === 0) {
    const sessionId = uuidv4();
    await db.query(
      `INSERT INTO conversation_sessions (id, user_id, title, language, channel, status, is_pinned, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [sessionId, agentId, 'Enterprise Order Status: ORD-9482', 'en', 'voice', 'active', true, now, now]
    );

    // Initial user turn
    const msg1Id = uuidv4();
    await db.query(
      `INSERT INTO messages (id, session_id, role, content, language, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [msg1Id, sessionId, 'user', 'Hi, I need an immediate update on Order #ORD-9482. The delivery was scheduled for yesterday and our team is blocked.', 'en', now]
    );

    // Assistant reply with intent and entities
    const msg2Id = uuidv4();
    await db.query(
      `INSERT INTO messages (
        id, session_id, role, content, language, intent, entities, sentiment_score, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        msg2Id,
        sessionId,
        'assistant',
        'I completely understand the urgency. I have pulled up Order #ORD-9482. It cleared regional transit and is out on a priority courier van for delivery before 2:00 PM today. I have also flagged your account for priority SMS tracking.',
        'en',
        'OrderStatus',
        { OrderId: 'ORD-9482', IssueType: 'DelayedDelivery' },
        -0.2,
        { sentiment_label: 'neutral', suggested_actions: ['Trigger courier webhook', 'Send SMS tracking'], confidence: 0.98 },
        now
      ]
    );

    // Seed Memory Buffer Slots
    const memoryItems = [
      { key: 'customer_tier', val: 'Enterprise Elite' },
      { key: 'order_id', val: 'ORD-9482' },
      { key: 'escalation_level', val: 'Tier-1 Priority' },
      { key: 'carrier_tracking', val: 'FDX-77492104' }
    ];

    for (const item of memoryItems) {
      await db.query(
        `INSERT INTO memory_slots (id, session_id, slot_key, slot_value, confidence, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), sessionId, item.key, item.val, 0.96, now, now]
      );
    }

    console.log('✅ Sample Nebula session with memory buffer seeded successfully');
  }

  console.log('🌌 Nebula Voice database seeding complete!');
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
