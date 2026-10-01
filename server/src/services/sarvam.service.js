/**
 * Sarvam AI Text-to-Speech (TTS) Integration Service
 * API Documentation: https://docs.sarvam.ai/api-reference-endpoints/text-to-speech
 * Endpoint: https://api.sarvam.ai/text-to-speech
 */

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';

// Curated Sarvam AI speakers mapped by language code
export const SARVAM_LANGUAGE_MAP = {
  hi: { default: 'meera', name: 'Hindi', code: 'hi-IN' },
  'hi-IN': { default: 'meera', name: 'Hindi (India)', code: 'hi-IN' },
  en: { default: 'meera', name: 'English (India)', code: 'en-IN' },
  'en-IN': { default: 'meera', name: 'English (India)', code: 'en-IN' },
  bn: { default: 'pavithra', name: 'Bengali', code: 'bn-IN' },
  'bn-IN': { default: 'pavithra', name: 'Bengali (India)', code: 'bn-IN' },
  ta: { default: 'pavithra', name: 'Tamil', code: 'ta-IN' },
  'ta-IN': { default: 'pavithra', name: 'Tamil (India)', code: 'ta-IN' },
  te: { default: 'pavithra', name: 'Telugu', code: 'te-IN' },
  'te-IN': { default: 'pavithra', name: 'Telugu (India)', code: 'te-IN' },
  kn: { default: 'maitreyi', name: 'Kannada', code: 'kn-IN' },
  'kn-IN': { default: 'maitreyi', name: 'Kannada (India)', code: 'kn-IN' },
  ml: { default: 'maitreyi', name: 'Malayalam', code: 'ml-IN' },
  'ml-IN': { default: 'maitreyi', name: 'Malayalam (India)', code: 'ml-IN' },
  mr: { default: 'amol', name: 'Marathi', code: 'mr-IN' },
  'mr-IN': { default: 'amol', name: 'Marathi (India)', code: 'mr-IN' },
  gu: { default: 'amol', name: 'Gujarati', code: 'gu-IN' },
  'gu-IN': { default: 'amol', name: 'Gujarati (India)', code: 'gu-IN' },
  pa: { default: 'amartya', name: 'Punjabi', code: 'pa-IN' },
  'pa-IN': { default: 'amartya', name: 'Punjabi (India)', code: 'pa-IN' },
  or: { default: 'amartya', name: 'Odia', code: 'or-IN' },
  'or-IN': { default: 'amartya', name: 'Odia (India)', code: 'or-IN' }
};

export const AVAILABLE_SARVAM_SPEAKERS = [
  { id: 'meera', name: 'Meera (Female)', gender: 'female', languages: ['hi-IN', 'en-IN'] },
  { id: 'pavithra', name: 'Pavithra (Female)', gender: 'female', languages: ['ta-IN', 'te-IN', 'bn-IN'] },
  { id: 'maitreyi', name: 'Maitreyi (Female)', gender: 'female', languages: ['kn-IN', 'ml-IN'] },
  { id: 'arvind', name: 'Arvind (Male)', gender: 'male', languages: ['hi-IN', 'en-IN'] },
  { id: 'amol', name: 'Amol (Male)', gender: 'male', languages: ['mr-IN', 'gu-IN'] },
  { id: 'amartya', name: 'Amartya (Male)', gender: 'male', languages: ['pa-IN', 'or-IN'] }
];

/**
 * Generate Neural Speech via Sarvam AI REST API
 *
 * @param {Object} params
 * @param {string|string[]} params.inputs - Text string or array of text strings to synthesize
 * @param {string} [params.target_language_code] - Language code (e.g. 'hi-IN', 'en-IN')
 * @param {string} [params.speaker] - Speaker name (e.g. 'meera', 'arvind')
 * @param {number} [params.pitch] - Pitch adjustment (-1.0 to 1.0, default 0)
 * @param {number} [params.pace] - Pace adjustment (0.5 to 2.0, default 1.05)
 * @param {number} [params.loudness] - Loudness adjustment (0.5 to 2.0, default 1.5)
 * @param {number} [params.speech_sample_rate] - Audio sample rate in Hz (default 8000)
 * @param {boolean} [params.enable_preprocessing] - Enable text normalization (default true)
 * @param {string} [params.model] - Model name (default 'bulbul:v1')
 * @param {string} [params.customApiKey] - Custom API Key override
 */
export async function generateSarvamSpeech({
  inputs,
  text,
  target_language_code,
  language,
  speaker,
  pitch = 0,
  pace = 1.05,
  loudness = 1.5,
  speech_sample_rate = 8000,
  enable_preprocessing = true,
  model = 'bulbul:v1',
  customApiKey
}) {
  const apiKey = (customApiKey || process.env.SARVAM_API_KEY || '').trim();

  // Normalize text input array
  let inputTextArray = [];
  if (Array.isArray(inputs) && inputs.length > 0) {
    inputTextArray = inputs.map(t => String(t).trim()).filter(Boolean);
  } else if (typeof inputs === 'string' && inputs.trim()) {
    inputTextArray = [inputs.trim()];
  } else if (typeof text === 'string' && text.trim()) {
    inputTextArray = [text.trim()];
  }

  if (inputTextArray.length === 0) {
    throw new Error('Text input ("inputs" or "text") is required for Sarvam AI TTS generation.');
  }

  // Resolve target language code and speaker
  const langKey = target_language_code || language || 'hi-IN';
  const langConfig = SARVAM_LANGUAGE_MAP[langKey] || SARVAM_LANGUAGE_MAP[langKey.split('-')[0]] || SARVAM_LANGUAGE_MAP['hi-IN'];
  
  const resolvedTargetLanguageCode = target_language_code || langConfig.code;
  const resolvedSpeaker = speaker || langConfig.default;

  // Check API Key
  if (!apiKey || apiKey === 'your_sarvam_api_key_here') {
    return {
      audioUrl: null,
      audioBase64: null,
      audioBuffer: null,
      engine: 'sarvam',
      speaker: resolvedSpeaker,
      target_language_code: resolvedTargetLanguageCode,
      error: 'SARVAM_API_KEY not configured. Please add a valid Sarvam AI API key in environment variables.'
    };
  }

  const payload = {
    inputs: inputTextArray,
    target_language_code: resolvedTargetLanguageCode,
    speaker: resolvedSpeaker,
    pitch,
    pace,
    loudness,
    speech_sample_rate,
    enable_preprocessing,
    model
  };

  try {
    const response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errBody = '';
      try {
        errBody = await response.text();
      } catch {
        errBody = response.statusText;
      }
      console.warn(`Sarvam AI API responded with status ${response.status}:`, errBody);
      return {
        audioUrl: null,
        audioBase64: null,
        audioBuffer: null,
        engine: 'sarvam',
        speaker: resolvedSpeaker,
        error: `Sarvam AI HTTP ${response.status}: ${errBody}`
      };
    }

    const data = await response.json();
    const base64Audio = data.audios && data.audios[0] ? data.audios[0] : null;

    if (!base64Audio) {
      return {
        audioUrl: null,
        audioBase64: null,
        audioBuffer: null,
        engine: 'sarvam',
        speaker: resolvedSpeaker,
        error: 'Sarvam AI response did not contain audio data.'
      };
    }

    const dataUrl = `data:audio/wav;base64,${base64Audio}`;
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    return {
      audioUrl: dataUrl,
      audioBase64: base64Audio,
      audioBuffer,
      contentType: 'audio/wav',
      engine: 'sarvam',
      speaker: resolvedSpeaker,
      target_language_code: resolvedTargetLanguageCode
    };
  } catch (err) {
    console.error('Sarvam AI TTS invocation error:', err.message);
    return {
      audioUrl: null,
      audioBase64: null,
      audioBuffer: null,
      engine: 'sarvam',
      speaker: resolvedSpeaker,
      error: `Failed to connect to Sarvam AI TTS: ${err.message}`
    };
  }
}

export default {
  generateSarvamSpeech,
  AVAILABLE_SARVAM_SPEAKERS,
  SARVAM_LANGUAGE_MAP
};
