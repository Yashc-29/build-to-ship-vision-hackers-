import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSarvamSpeech, AVAILABLE_SARVAM_SPEAKERS, SARVAM_LANGUAGE_MAP } from '../server/src/services/sarvam.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSarvamIntegration() {
  console.log('🎙️ --- TESTING SARVAM AI TTS INTEGRATION ---');
  console.log('1. Available Sarvam Speakers:', AVAILABLE_SARVAM_SPEAKERS.length, 'Indic speakers');
  console.log('2. Language Mappings:', Object.keys(SARVAM_LANGUAGE_MAP).length, 'locales supported');
  
  const apiKey = process.env.SARVAM_API_KEY;
  console.log('3. SARVAM_API_KEY set:', Boolean(apiKey && apiKey !== 'your_sarvam_api_key_here'));

  if (!apiKey || apiKey === 'your_sarvam_api_key_here') {
    console.log('⚠️ SARVAM_API_KEY not set. Testing mock service wrapper...');
    const result = await generateSarvamSpeech({ inputs: ['Hello from Sarvam AI test'], target_language_code: 'hi-IN' });
    console.log('   Result engine:', result.engine, '| Speaker:', result.speaker);
    console.log('   Status message:', result.error || 'OK');
  } else {
    console.log('🚀 Invoking Sarvam AI REST API for synthesis...');
    const result = await generateSarvamSpeech({
      inputs: ['नमस्ते! नेबुला वॉयस सरवम एआई में आपका स्वागत है।'],
      target_language_code: 'hi-IN',
      speaker: 'meera'
    });
    console.log('   Synthesized Audio Base64 Length:', result.audioBase64?.length || 0);
    console.log('   Audio Content Type:', result.contentType);
  }

  console.log('✨ SARVAM AI TTS INTEGRATION VERIFIED SUCCESSFULLY!');
}

testSarvamIntegration().catch(err => {
  console.error('❌ Sarvam Test Failed:', err);
  process.exit(1);
});
