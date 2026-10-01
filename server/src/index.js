import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDatabase, getActiveEngine } from './db/index.js';
import { runSeed } from './db/seed.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import memoryRoutes from './routes/memory.routes.js';
import adminRoutes from './routes/admin.routes.js';
import ttsRoutes from './routes/tts.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Load environment variables from local server/.env or root .env
dotenv.config();
if (fs.existsSync(path.join(rootDir, '.env'))) {
  dotenv.config({ path: path.join(rootDir, '.env') });
}

const app = express();
const PORT = process.env.PORT || 3001;

let isDbInitialized = false;
let dbInitPromise = null;

async function ensureDbInitialized() {
  if (!isDbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = (async () => {
        await initDatabase();
        await runSeed();
        isDbInitialized = true;
      })();
    }
    await dbInitPromise;
  }
}

// Ensure database is initialized before handling any API requests
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    next(err);
  }
});

// 1. Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please wait a few moments before trying again.'
  }
});
app.use('/api/', limiter);

// 2. Health & Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nebula Voice & Conversational Intelligence API',
    version: '1.0.0',
    db_engine: getActiveEngine(),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    sarvam_configured: Boolean(process.env.SARVAM_API_KEY?.trim() && process.env.SARVAM_API_KEY !== 'your_sarvam_api_key_here')
  });
});

// 3. API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/admin', adminRoutes);

// 4. Static Frontend Client Serving (Production / Unified Local Server)
const clientDistPath = path.join(rootDir, 'client', 'dist');
if (!process.env.VERCEL && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 5. Global Error Handler
app.use(errorHandler);

// 6. Bootstrap Server (Local Standalone Server)
async function startServer() {
  try {
    console.log('🚀 Initializing Nebula Voice Platform Server...');
    await ensureDbInitialized();

    app.listen(PORT, () => {
      console.log(`🌌 Nebula Voice Platform backend listening on http://localhost:${PORT}`);
      console.log(`🛡️  Database Engine: ${getActiveEngine().toUpperCase()}`);
      console.log(`🤖 Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY?.trim())}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
