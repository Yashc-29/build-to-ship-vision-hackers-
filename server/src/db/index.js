import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

let pgPool = null;
let sqliteDb = null;
let activeEngine = 'sqlite'; // 'postgres' or 'sqlite'

const databaseUrl = process.env.DATABASE_URL?.trim();

// Try connecting to PostgreSQL if DATABASE_URL is configured
if (databaseUrl) {
  try {
    const isSslRequired = !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1');
    pgPool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: isSslRequired ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  } catch (err) {
    console.warn('⚠️ PostgreSQL pool initialization failed, using local SQLite:', err.message);
    pgPool = null;
  }
}

// Fallback SQLite initialization
function getSqliteInstance() {
  if (!sqliteDb) {
    const dbFilePath = process.env.VERCEL ? '/tmp/nebula.db' : path.join(rootDir, 'nebula.db');
    sqliteDb = new DatabaseSync(dbFilePath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
  }
  return sqliteDb;
}

export async function initDatabase() {
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      console.log('✅ Connected to PostgreSQL database successfully.');
      activeEngine = 'postgres';

      // Create PostgreSQL schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          preferred_language TEXT NOT NULL DEFAULT 'en',
          role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'supervisor', 'admin')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS conversation_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT,
          language TEXT NOT NULL DEFAULT 'en',
          channel TEXT NOT NULL DEFAULT 'voice' CHECK (channel IN ('voice', 'whatsapp', 'webchat', 'sms')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'archived')),
          is_pinned BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          language TEXT,
          intent TEXT,
          entities JSONB DEFAULT '{}',
          sentiment_score DECIMAL(5,2),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS memory_slots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
          slot_key TEXT NOT NULL,
          slot_value TEXT NOT NULL,
          confidence DECIMAL(3,2) DEFAULT 0.95,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(session_id, slot_key)
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_user ON conversation_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_memory_session ON memory_slots(session_id);
      `);

      client.release();
      return;
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed, switching to local SQLite:', err.message);
      activeEngine = 'sqlite';
      pgPool = null;
    }
  }

  // SQLite Schema Setup
  console.log('📦 Using local SQLite storage (nebula.db). All operations fully supported.');
  activeEngine = 'sqlite';
  const sqlite = getSqliteInstance();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      role TEXT NOT NULL DEFAULT 'agent',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      language TEXT NOT NULL DEFAULT 'en',
      channel TEXT NOT NULL DEFAULT 'voice',
      status TEXT NOT NULL DEFAULT 'active',
      is_pinned INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT,
      intent TEXT,
      entities TEXT DEFAULT '{}',
      sentiment_score REAL,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memory_slots (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
      slot_key TEXT NOT NULL,
      slot_value TEXT NOT NULL,
      confidence REAL DEFAULT 0.95,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(session_id, slot_key)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON conversation_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_memory_session ON memory_slots(session_id);
  `);
}

/**
 * Universal query runner: translates $1, $2 to ? for SQLite and formats JSON objects cleanly.
 */
export async function query(sqlText, params = []) {
  if (activeEngine === 'postgres' && pgPool) {
    const res = await pgPool.query(sqlText, params);
    return res;
  }

  // SQLite execution
  const sqlite = getSqliteInstance();
  const sqliteSql = sqlText.replace(/\$\d+/g, () => '?');

  const cleanParams = params.map(val => {
    if (val === undefined) return null;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
      return JSON.stringify(val);
    }
    if (val instanceof Date) return val.toISOString();
    return val;
  });

  const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqlText);

  try {
    const stmt = sqlite.prepare(sqliteSql);
    if (isSelect) {
      const rows = stmt.all(...cleanParams);
      const parsedRows = rows.map(r => parseRow(r));
      return { rows: parsedRows, rowCount: parsedRows.length };
    } else {
      const info = stmt.run(...cleanParams);
      if (sqlText.toUpperCase().includes('RETURNING')) {
        try {
          const retRows = stmt.all(...cleanParams).map(r => parseRow(r));
          return { rows: retRows, rowCount: retRows.length };
        } catch {
          return { rows: [], rowCount: info.changes };
        }
      }
      return { rows: [], rowCount: info.changes };
    }
  } catch (err) {
    console.error('SQL Execution Error:', err.message, '\nSQL:', sqliteSql, '\nParams:', cleanParams);
    throw err;
  }
}

function parseRow(row) {
  if (!row) return row;
  const newRow = { ...row };
  for (const key of Object.keys(newRow)) {
    const val = newRow[key];
    if (key === 'is_pinned') {
      newRow[key] = Boolean(val);
    } else if ((key === 'entities' || key === 'metadata') && typeof val === 'string') {
      try {
        newRow[key] = JSON.parse(val);
      } catch {
        // Keep as string
      }
    }
  }
  return newRow;
}

export function getActiveEngine() {
  return activeEngine;
}

export default {
  query,
  initDatabase,
  getActiveEngine
};
