import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { UserRegisterSchema, UserLoginSchema } from '../schemas/index.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', validateBody(UserRegisterSchema), async (req, res, next) => {
  try {
    const { email, password, full_name, preferred_language, role } = req.validatedBody;

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Conflict',
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const password_hash = await hashPassword(password);
    const userId = uuidv4();
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO users (id, email, password_hash, full_name, preferred_language, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        email.toLowerCase().trim(),
        password_hash,
        full_name.trim(),
        preferred_language || 'en',
        role || 'agent',
        now,
        now
      ]
    );

    const user = {
      id: userId,
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      preferred_language: preferred_language || 'en',
      role: role || 'agent',
      created_at: now
    };

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', validateBody(UserLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const result = await db.query(
      'SELECT id, email, password_hash, full_name, preferred_language, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const userRow = result.rows[0];
    const passwordMatch = await comparePassword(password, userRow.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const user = {
      id: userRow.id,
      email: userRow.email,
      full_name: userRow.full_name,
      preferred_language: userRow.preferred_language,
      role: userRow.role,
      created_at: userRow.created_at
    };

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, preferred_language, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
