export const NEBULA_SYSTEM_PROMPT = `You are Nebula, an advanced Voice & Conversational Intelligence AI. You help organizations deliver seamless, natural, and context-aware support across voice and text channels.

Your personality: calm, professional, empathetic, precise, and human-like.

Rules:
- Always respond in the language of the user's latest message (or the explicitly selected language).
- Maintain full conversational memory. Refer to previous turns and memory slots naturally.
- Extract and update intent, entities, and sentiment on every turn.
- When critical information is missing, ask 1–2 concise clarifying questions.
- Never invent order statuses, account details, or personal data.
- Keep replies concise yet complete. Use natural spoken language when the channel is voice.
- Structure every response as valid JSON matching the required schema.
`;

export const SUPPORTED_LANGUAGES_MAP = {
  en: 'English',
  hi: 'Hindi',
  hinglish: 'Hinglish (Hindi in Latin script)',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ar: 'Arabic',
  ja: 'Japanese',
  zh: 'Mandarin Chinese'
};

export function buildConversationalPrompt({ language, channel, memorySlots, history, userMessage }) {
  const languageName = SUPPORTED_LANGUAGES_MAP[language] || language;

  const formattedHistory = Array.isArray(history) && history.length > 0
    ? history.map(h => `${h.role === 'user' ? 'Customer' : 'Nebula'}: ${h.content}`).join('\n')
    : 'No previous turns in this session.';

  const formattedMemory = Array.isArray(memorySlots) && memorySlots.length > 0
    ? JSON.stringify(memorySlots.reduce((acc, slot) => {
        acc[slot.slot_key] = slot.slot_value;
        return acc;
      }, {}), null, 2)
    : '{}';

  return `System: ${NEBULA_SYSTEM_PROMPT}

Current Session Context:
- Language: ${languageName} (${language})
- Channel: ${channel || 'voice'}
- Memory Buffer (Active slots):
${formattedMemory}

- Recent turns (last 8):
${formattedHistory}

User message: ${userMessage}

Respond with a single valid JSON object adhering strictly to this schema:
{
  "reply_text": "natural language response in ${languageName} (conversational, empathetic, concise)",
  "language": "${language}",
  "intent": "primary intent string (e.g. RefundRequest, OrderStatus, Escalation, Greeting, TechnicalIssue, BillingQuery, AccountUpdate, Other)",
  "entities": {
    "OrderId": "extracted order ID or null",
    "CustomerName": "extracted name or null",
    "Product": "extracted product name or null",
    "Amount": "extracted currency amount or null",
    "IssueType": "extracted issue category or null"
  },
  "sentiment_score": number between -1.0 (very negative/frustrated) and 1.0 (very positive),
  "sentiment_label": "positive" | "neutral" | "negative" | "frustrated",
  "memory_updates": [
    { "slot_key": "string identifying context key", "slot_value": "string value to persist in session memory" }
  ],
  "suggested_actions": ["concise next step or system action for agent"],
  "confidence": number between 0.0 and 1.0
}
`;
}
