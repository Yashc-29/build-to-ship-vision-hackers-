import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { generateSarvamSpeech, AVAILABLE_SARVAM_SPEAKERS, SARVAM_LANGUAGE_MAP } from '../services/sarvam.service.js';

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/tts/voices - list available Sarvam AI speakers and language mappings
 */
router.get('/voices', (req, res) => {
  const isSarvamConfigured = Boolean(
    process.env.SARVAM_API_KEY?.trim() && process.env.SARVAM_API_KEY !== 'your_sarvam_api_key_here'
  );
  res.json({
    sarvam_configured: isSarvamConfigured,
    speakers: AVAILABLE_SARVAM_SPEAKERS,
    voices: AVAILABLE_SARVAM_SPEAKERS, // Alias for backward compatibility
    default_mappings: SARVAM_LANGUAGE_MAP
  });
});

/**
 * POST /api/tts/generate - generate high-fidelity speech using Sarvam AI REST API
 */
router.post('/generate', async (req, res, next) => {
  try {
    const {
      inputs,
      text,
      target_language_code,
      language = 'hi-IN',
      speaker,
      voiceId,
      pitch,
      pace,
      loudness,
      customApiKey,
      format
    } = req.body;

    const textToSynthesize = inputs || text;
    if (!textToSynthesize) {
      return res.status(400).json({ error: 'Bad Request', message: 'Field "text" or "inputs" is required' });
    }

    const speechResult = await generateSarvamSpeech({
      inputs: Array.isArray(textToSynthesize) ? textToSynthesize : [textToSynthesize],
      target_language_code: target_language_code || language,
      speaker: speaker || voiceId,
      pitch: pitch !== undefined ? Number(pitch) : 0,
      pace: pace !== undefined ? Number(pace) : 1.05,
      loudness: loudness !== undefined ? Number(loudness) : 1.5,
      customApiKey
    });

    if (speechResult.error) {
      return res.status(400).json(speechResult);
    }

    // Stream raw audio buffer if raw audio format is requested
    if (format === 'raw' || format === 'audio' || req.headers.accept?.includes('audio/')) {
      if (speechResult.audioBuffer) {
        res.setHeader('Content-Type', speechResult.contentType || 'audio/wav');
        res.setHeader('Content-Length', speechResult.audioBuffer.length);
        return res.send(speechResult.audioBuffer);
      }
    }

    // Standard JSON response with base64 and data URL
    res.json({
      audioUrl: speechResult.audioUrl,
      audioBase64: speechResult.audioBase64,
      engine: 'sarvam',
      speaker: speechResult.speaker,
      target_language_code: speechResult.target_language_code
    });
  } catch (err) {
    next(err);
  }
});

export default router;
