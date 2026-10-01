import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { generateMurfSpeech, AVAILABLE_MURF_VOICES, MURF_VOICE_MAP } from '../services/murf.service.js';

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/tts/voices - list available Murf AI studio neural voices
 */
router.get('/voices', (req, res) => {
  const isMurfConfigured = Boolean(process.env.MURF_API_KEY?.trim());
  res.json({
    murf_configured: isMurfConfigured,
    voices: AVAILABLE_MURF_VOICES,
    default_mappings: MURF_VOICE_MAP
  });
});

/**
 * POST /api/tts/generate - generate high-fidelity speech using Murf AI
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { text, language = 'en', voiceId, customApiKey } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Bad Request', message: 'Field "text" is required' });
    }

    const speechResult = await generateMurfSpeech({
      text: text.trim(),
      language,
      voiceId,
      customApiKey
    });

    res.json(speechResult);
  } catch (err) {
    next(err);
  }
});

export default router;
