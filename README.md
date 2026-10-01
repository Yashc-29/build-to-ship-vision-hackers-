# 🌌 Nebula Voice & Conversational Intelligence Platform

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Postgres%20%7C%20Gemini-indigo.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

**Nebula Voice** is an enterprise-grade AI-powered Voice & Conversational Intelligence platform engineered for modern customer support centers, customer success teams, and omnichannel operations. It eliminates slow response times, fragmented communication, and loss of context across voice and text channels.

Equipped with real-time speech recognition (STT), conversational NLU, persistent multi-turn memory buffers, live sentiment trajectory tracking, high-fidelity TTS, and zero-loss **Channel Hopping** (Voice Call ↔ WhatsApp ↔ Web Chat ↔ SMS), Nebula Voice empowers organizations to deliver human-like, context-aware service at scale.

---

## 🚀 Key Architectural Pillars

### 1. 🎙️ Living 3D Orb & Voice-First Console
- **Prominent Mic Pill**: Tactile push-to-talk / tap-to-talk control with expanding ripples and audio level frequency bars.
- **Living 3D Visualizer Orb**: Organic, multi-layered cosmic sphere reacting dynamically to user speech, agent playback, and listening modes.
- **Web Speech API STT + TTS**: Real-time streaming transcription with edit-before-send capability, language detection tags, and toggleable auto-play voice output.

### 2. 🧠 Intelligent Multi-Turn Conversational Memory
- **Persistent Memory Buffer**: Dynamic key-value context slots (e.g. `order_id`, `customer_name`, `issue_category`, `routing_tier`) extracted on every turn with confidence scoring.
- **Context Injection**: Each turn passes the active memory buffer alongside recent turns to Google Gemini.
- **Clarifying Logic**: If essential data is missing, the assistant naturally asks 1–2 concise clarifying questions rather than hallucinating details.

### 3. 🔀 Omnichannel "Channel Hopping" with Zero Context Loss
- Seamlessly transition between **Voice Call**, **WhatsApp**, **Web Chat**, and **SMS** within the same ongoing session.
- When an interaction hops channels, a system transition event is stamped while all conversation history, extracted entities, and memory slots remain completely intact.

### 4. 📈 Real-Time Intelligence Bento Grid
- **Transcript Card**: Live streaming transcription, role tags, intent labels, sentiment badges, and turn-by-turn TTS replay.
- **Sentiment Trajectory Card**: Continuous emotional trajectory graph tracking customer valence from -1.0 (frustrated) to +1.0 (delighted) with emotional velocity.
- **Channel Hopping Card**: Interactive channel switcher, omnichannel state indicator, and live ASR latency monitor (ms).
- **Memory Buffer Card**: Active slot visualizer displaying extracted context items with confidence percentages.
- **Ambient Context Card**: Live entity stream, intent badges, and telemetry feed.

### 5. 🌐 Multilingual Voice & Dialect Support
- Automatic language detection and dialect matching.
- Explicit language selector supporting **English, Hindi, Hinglish, Spanish, French, German, Portuguese, Arabic, and more**.

### 6. 🛡️ Enterprise Data Isolation & Security
- **JWT Authentication** with password hashing using bcrypt.
- **Row-Level Tenant Isolation**: All queries strictly enforce `WHERE user_id = current_user_id`.
- **Strict Zod Validation**: Every inbound request body and outbound AI response is validated against formal Zod schemas.
- **Dual-Engine Persistence**: Seamless operation on PostgreSQL or Node 24 native SQLite (`nebula.db`) with zero external configuration required.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS (Cosmic Nebula Palette), Zustand, Lucide React, Web Speech API |
| **Backend** | Node.js (v20+ / v24), Express.js, `@google/genai` SDK, Zod, bcryptjs, jsonwebtoken |
| **Database** | PostgreSQL 14+ / Dual-Engine Node Native SQLite (`nebula.db`) with parameterized queries |
| **AI Models** | Google Gemini 2.0 Flash / Gemini 1.5 Flash with structured JSON output + self-healing fallback |
| **Security** | Helmet, CORS, Express Rate Limit, JWT Bearer Auth, Parameterized SQL |

---

## 📋 Application Routes

- `/` – Landing Page: Value proposition, interactive audio scenarios, feature highlights.
- `/login` – Agent & Admin authentication with 1-click demo login buttons.
- `/register` – New agent registration with dialect and role selection.
- `/dashboard` – Live Session Command Center: The master bento-grid Voice Intelligence console.
- `/sessions` – Conversational Archive: Searchable history, channel badges, pin toggles, and deletion.
- `/sessions/:id` – Session Replay: Complete turn-by-turn transcript replay, audio playback, and memory slot snapshots.
- `/settings` – Platform Settings: Dialect preferences, speech synthesis rate, voice tester, and agent profile.
- `/admin` – Platform Analytics (Admin only): Aggregated channel volumes, intent distribution, and infrastructure health.

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js v20.x or higher
- npm v10.x or higher

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd nebula-voice

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Environment Configuration
Create a `.env` file in the project root (or copy `.env.example`):
```bash
cp .env.example .env
```

Key environment variables:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=nebula-voice-super-secret-jwt-key-minimum-32-chars-enterprise-2026!
DATABASE_URL=
GEMINI_API_KEY=your-gemini-api-key-here
```
> **Note**: If `DATABASE_URL` is omitted, Nebula Voice automatically initializes and operates on embedded local SQLite storage (`nebula.db`). If `GEMINI_API_KEY` is omitted, the platform uses its built-in self-healing NLU conversational engine.

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Servers
Start both the backend server (port 3001) and Vite frontend (port 5173):
```bash
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Support Agent** | `agent@nebula.ai` | `Agent@123` | Full Live Console, Sessions, Memory, Settings |
| **Platform Admin** | `admin@nebula.ai` | `Admin@123` | Platform Analytics, All Features + Metrics |

*(Quick 1-click fill buttons for both accounts are provided directly on the `/login` screen).*

---

## 🧪 Automated Verification & Testing

Nebula Voice includes a comprehensive automated end-to-end integration test covering all 11 core architectural requirements:

```bash
npm run test:e2e
```

**Verification Suite:**
1. Health check & database engine detection
2. Agent JWT login & profile retrieval
3. Live session initialization (Voice channel)
4. AI conversational turn with intent, entity, and sentiment extraction
5. Live Channel Hopping (Voice -> WhatsApp)
6. Follow-up turn context retention across channels
7. Memory Buffer CRUD operations
8. Session completion and archiving
9. Administrator platform metrics & intent aggregation
10. Tenant data isolation and unauthorized request blocking

---

## 🛡️ Enterprise Security Model

1. **Strict Data Isolation**: All customer sessions, message exchanges, and memory buffer slots are strictly keyed to the authenticated user's ID.
2. **Sanitized Parameterized SQL**: All database operations use positional parameters (`$1, $2, ...`) preventing SQL injection.
3. **Zod JSON Schema Enforcement**: Both inbound HTTP requests and outbound Gemini completions are validated against formal Zod definitions.
4. **Zero Client Leakage**: Gemini API keys and database credentials reside exclusively on the server.

---

## 📄 License
This project is licensed under the MIT License.
