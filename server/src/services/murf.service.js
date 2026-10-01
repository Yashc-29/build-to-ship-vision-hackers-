/**
 * Murf AI Text-to-Speech (TTS) Integration Service
 * Endpoints: https://api.murf.ai/v1/speech/generate
 * Falcon 2 & Gen2 Studio Neural Voice Models
 */

const MURF_API_URL = 'https://api.murf.ai/v1/speech/generate';

// Curated high-fidelity Murf AI voice catalogue mapped to language codes
export const MURF_VOICE_MAP = {
  en: {
    female: 'en-US-natalie',
    male: 'en-US-marcus',
    default: 'en-US-natalie'
  },
  hi: {
    female: 'hi-IN-ananya',
    male: 'hi-IN-kabir',
    default: 'hi-IN-kabir'
  },
  hinglish: {
    female: 'en-IN-eashwar',
    male: 'hi-IN-kabir',
    default: 'en-IN-eashwar'
  },
  es: {
    female: 'es-ES-carmen',
    male: 'es-ES-enrique',
    default: 'es-ES-enrique'
  },
  fr: {
    female: 'fr-FR-josephine',
    male: 'fr-FR-adrien',
    default: 'fr-FR-adrien'
  },
  de: {
    female: 'de-DE-greta',
    male: 'de-DE-sebastian',
    default: 'de-DE-sebastian'
  },
  ar: {
    female: 'ar-AE-fatima',
    male: 'ar-AE-zayd',
    default: 'ar-AE-zayd'
  },
  pt: {
    female: 'pt-BR-marcia',
    male: 'pt-BR-antonio',
    default: 'pt-BR-antonio'
  }
};

export const AVAILABLE_MURF_VOICES = [
  { id: 'en-US-natalie', name: 'Natalie', lang: 'en', gender: 'Female', desc: 'Conversational, warm, empathetic' },
  { id: 'en-US-marcus', name: 'Marcus', lang: 'en', gender: 'Male', desc: 'Authoritative, clear, professional' },
  { id: 'hi-IN-kabir', name: 'Kabir', lang: 'hi', gender: 'Male', desc: 'Natural Hindi, customer support' },
  { id: 'hi-IN-ananya', name: 'Ananya', lang: 'hi', gender: 'Female', desc: 'Expressive, clear Hindi/Hinglish' },
  { id: 'en-IN-eashwar', name: 'Eashwar', lang: 'hinglish', gender: 'Male', desc: 'Indian English & Hinglish accent' },
  { id: 'es-ES-enrique', name: 'Enrique', lang: 'es', gender: 'Male', desc: 'Spanish, clear & articulate' },
  { id: 'fr-FR-adrien', name: 'Adrien', lang: 'fr', gender: 'Male', desc: 'French, smooth European dialect' },
  { id: 'de-DE-sebastian', name: 'Sebastian', lang: 'de', gender: 'Male', desc: 'German, precise & calm' },
  { id: 'ar-AE-zayd', name: 'Zayd', lang: 'ar', gender: 'Male', desc: 'Arabic, modern standard' }
];

/**
 * Clean text for audio synthesis: remove markdown symbols and links
 */
function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/[*#_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n+/g, '. ')
    .trim();
}

/**
 * Generate Neural Speech via Murf AI API
 * @param {Object} options
 * @param {string} options.text - Raw text to synthesize
 * @param {string} [options.language='en'] - Dialect code
 * @param {string} [options.voiceId] - Explicit Murf Voice ID
 * @param {string} [options.customApiKey] - Client-provided Murf API Key override
 * @returns {Promise<{audioUrl: string|null, audioBase64: string|null, engine: string, voiceId: string, duration?: number}>}
 */
export async function generateMurfSpeech({
  text,
  language = 'en',
  voiceId,
  customApiKey
}) {
  const apiKey = (customApiKey || process.env.MURF_API_KEY || '').trim();

  // Pick suitable voice ID
  const selectedVoiceId =
    voiceId ||
    MURF_VOICE_MAP[language]?.default ||
    MURF_VOICE_MAP.en.default;

  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    throw new Error('Empty text content for speech synthesis');
  }

  // If no Murf API key is configured, return fallback directive to client
  if (!apiKey) {
    return {
      audioUrl: null,
      audioBase64: null,
      engine: 'browser_fallback',
      voiceId: selectedVoiceId,
      message: 'MURF_API_KEY not configured. Falling back to high-fidelity browser SpeechSynthesis.'
    };
  }

  try {
    const payload = {
      voiceId: selectedVoiceId,
      text: cleanedText,
      format: 'MP3',
      channelType: 'MONO',
      sampleRate: 24000,
      encodeAsBase64: false
    };

    const response = await fetch(MURF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'token': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`Murf AI API responded with ${response.status}:`, errBody);
      return {
        audioUrl: null,
        audioBase64: null,
        engine: 'browser_fallback',
        voiceId: selectedVoiceId,
        error: `Murf AI HTTP ${response.status}: ${errBody}`
      };
    }

    const data = await response.json();

    const audioUrl = data.audioFile || data.url || data.audio_url || null;
    const audioBase64 = data.encodedAudio || null;
    const duration = data.audioLengthInSeconds || null;

    return {
      audioUrl,
      audioBase64,
      engine: 'murf',
      voiceId: selectedVoiceId,
      duration
    };
  } catch (err) {
    console.error('Murf AI invocation error:', err.message);
    return {
      audioUrl: null,
      audioBase64: null,
      engine: 'browser_fallback',
      voiceId: selectedVoiceId,
      error: err.message
    };
  }
}
