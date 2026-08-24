<div align="center">

# ⚡ ClerX AI
### Modern Full-Stack AI Chat Workspace & Neural Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-8.x-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI_Gateway-6366F1?style=for-the-badge)](https://openrouter.ai/)

**A high-performance, ChatGPT-style AI chat studio powered by OpenRouter (GLM-5.2, Nemotron Omni, Gemma), Next.js 16 App Router (Turbopack), React 19, and MongoDB Atlas.**

[Getting Started](#-getting-started) • [Features](#-key-features) • [Architecture](#-project-architecture) • [API Reference](#-api-endpoints) • [Vercel Deployment](#-deployment-to-vercel)

</div>

---

## 🌟 Overview

**ClerX AI** is a production-ready, full-stack AI chat assistant built for developers and teams. Powered by Next.js 16, React 19, MongoDB Atlas, and OpenRouter, ClerX delivers a unified conversational experience featuring multi-session management, dynamic model switching, real-time token/latency telemetry, system persona customization, multimodal photo & PDF intelligence, and cryptographic JWT security.

---

## 🚀 Key Features

### 1. 💬 Modern AI Chat Studio (`/` and `/c/[id]`)
- **Full-Screen Workspace**: Clean, distraction-free dark interface with collapsible sidebar navigation and direct URL routing per conversation (`/c/:id`).
- **Real-Time Token-by-Token SSE Stream**: Instant Server-Sent Events stream with live reasoning token emission.
- **Collapsible Thought Process**: DeepSeek / ChatGPT-style expandable reasoning accordion with live thinking duration stopwatch.
- **Smart Sticky Scroll**: Anti-jitter scroll stabilization that respects manual upward scroll gestures during streaming without vibrating or jumping.
- **Multi-Conversation Management**: Create, rename, search, pin, and delete conversation threads stored persistently in MongoDB Atlas.
- **Dynamic Model Switching & Fallback**:
  - `z-ai/glm-5.2:free` (Default Fast Reasoning)
  - `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` (Multimodal Vision & Reasoning)
  - Automatic multi-model waterfall failover prevents service interruption during provider outages.
- **Multimodal Photos & PDF Intelligence**: Client-side canvas rendering and text extraction (`pdfjs-dist`) for instant document and image analysis.
- **Voice Note Dictation**: Real-time Web Speech API voice-to-text prompt transcription.
- **System Persona Customizer**: Tailor AI behavior on the fly (Software Architect, Security Auditor, Technical Writer, or Custom System Instructions).
- **Rich Markdown & Code Studio**: Syntax-highlighted code blocks with 1-click clipboard copying, language badges, and formatted tables.
- **Real-Time Telemetry**: Live token counter and latency (ms) recorded per response.
- **Export & Share**: 1-click Markdown export (`.md`) for any conversation thread.

### 2. 🔐 Enterprise Authentication & Edge Security
- **Stateless JWT Sessions**: Encrypted HTTP-only cookies powered by `jose` and `bcryptjs`.
- **Edge Route Protection**: Next.js 16 Proxy (`proxy.ts`) managing authentication flow and protecting endpoints.
- **Guest & Auth Modes**: Instant guest chat mode with automatic session persistence upon user authentication.

### 3. ✍️ Studio Copilot
- **AI Workspace Actions**: Executive summaries, detailed expansion, clear rewrites, automated bug fixes, test generation, and code translation.

---

## 📂 Project Architecture

```
ClerX/
├── .env.local                  # Local environment configuration (git-ignored)
├── .gitignore                  # Git ignore rules (protects env & agent files)
├── package.json                # Project dependencies (Next.js 16.3.2, React 19)
├── tailwind.config.ts          # Theme & style definitions
├── tsconfig.json               # TypeScript strict configuration
├── next.config.mjs             # Next.js 16 Turbopack build configuration
│
├── public/                     # Static assets & SVG icons
│   ├── favicon.svg             # Favicon
│   └── icon.svg                # Brand icon
│
└── src/
    ├── proxy.ts                # Next.js 16 Edge proxy with JWT authentication
    │
    ├── context/
    │   └── AuthContext.tsx     # Client-side user auth state & session provider
    │
    ├── lib/
    │   ├── mongodb.ts          # Cached MongoDB Atlas connection singleton
    │   ├── auth.ts             # Password hashing, JWT signing & cookie management
    │   ├── openrouter.ts       # OpenRouter AI gateway client with fallback models
    │   ├── pdfHelper.ts        # Client-side PDF canvas rendering & text extractor
    │   ├── empty-module.js     # Turbopack stub module for node canvas
    │   └── models/
    │       ├── User.ts         # User schema & credentials
    │       ├── Conversation.ts # Multi-session chat schema
    │       ├── Message.ts      # Multi-turn chat message schema & attachments
    │       ├── Document.ts     # Studio document workspace schema
    │       ├── ApiKey.ts       # Developer API key schema
    │       └── UsageLog.ts     # Telemetry & token consumption schema
    │
    ├── components/
    │   ├── ui/
    │   │   └── ClerXLogo.tsx   # Vector ClerX branding component
    │   └── chat/
    │       └── ClerXChat.tsx   # Complete multi-session Chat Studio interface
    │
    └── app/
        ├── layout.tsx          # Root HTML layout with AuthProvider & Fonts
        ├── globals.css         # Global cyber styling, scrollbars & animations
        ├── page.tsx            # Main AI Chat Studio landing page
        ├── c/[id]/page.tsx     # Direct conversation permalink view
        ├── login/page.tsx      # Authentication: Sign In
        ├── signup/page.tsx     # Authentication: Register
        │
        └── api/                # Full-Stack API Route Handlers
            ├── auth/
            │   ├── login/route.ts       # User login & cookie dispatch
            │   ├── signup/route.ts      # User signup & initial setup
            │   ├── logout/route.ts      # Session termination
            │   └── me/route.ts          # Authenticated profile lookup
            ├── chat/route.ts            # AI chat completion & SSE streaming
            ├── conversations/
            │   ├── route.ts             # List & create conversation sessions
            │   └── [id]/
            │       ├── route.ts         # Update, rename & delete conversation
            │       └── messages/route.ts# Message history & thread lookup
            ├── studio/
            │   ├── generate/route.ts    # Copilot generation actions
            │   └── documents/           # Studio document store & CRUD
            ├── keys/route.ts            # Developer API key management
            ├── analytics/route.ts       # Telemetry metrics & logs
            └── test-db/route.ts         # MongoDB Atlas diagnostic ping
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Create account and issue JWT cookie | No |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT cookie | No |
| `POST` | `/api/auth/logout` | Invalidate and clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `POST` | `/api/chat` | Generate direct AI completion / SSE stream | No |
| `GET` | `/api/conversations` | Fetch all user chat sessions | Yes |
| `POST` | `/api/conversations` | Create a new chat session | Yes |
| `PATCH` | `/api/conversations/:id` | Rename / pin / update a chat session | Yes |
| `DELETE` | `/api/conversations/:id` | Delete a chat session | Yes |
| `GET` | `/api/conversations/:id/messages` | Fetch messages for a chat session | Yes |
| `POST` | `/api/studio/generate` | Run Copilot action (summary, rewrite, tests, etc.) | Yes |
| `GET` | `/api/studio/documents` | List studio workspace documents | Yes |
| `POST` | `/api/studio/documents` | Save new studio document | Yes |
| `GET` | `/api/keys` | List developer API keys | Yes |
| `POST` | `/api/keys` | Generate a new developer API key | Yes |
| `DELETE` | `/api/keys?id=...` | Revoke a developer API key | Yes |
| `GET` | `/api/analytics` | Retrieve usage statistics and telemetry logs | Yes |
| `GET` | `/api/test-db` | Health diagnostic to MongoDB Atlas | Yes |

---

## 🛠️ Environment Configuration

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.bazlqbd.mongodb.net/x_db?retryWrites=true&w=majority

# OpenRouter AI Gateway Configuration
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key_here
DEFAULT_AI_MODEL=z-ai/glm-5.2:free
SITE_URL=http://localhost:3000
SITE_NAME=ClerX AI

# Session Authentication
JWT_SECRET=your_super_secret_jwt_key_here
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** 18.18+ or 20+
- **npm**, **pnpm**, or **yarn**
- **MongoDB Atlas** cluster
- **OpenRouter API Key** (Free tier available at [openrouter.ai](https://openrouter.ai))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/GOHANX1234/AI.git
cd AI

# Install dependencies
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com)**.
3. In **Project Settings > Environment Variables**, add:
   - `MONGODB_URI`
   - `OPENROUTER_API_KEY`
   - `DEFAULT_AI_MODEL` (`z-ai/glm-5.2:free`)
   - `JWT_SECRET`
   - `SITE_URL` (`https://your-domain.vercel.app`)
4. Click **Deploy**.

---

## 🛡️ Security & Privacy
- **Stateless Tokens**: Auth tokens are cryptographically signed with HS256 and stored strictly in `HttpOnly`, `SameSite=Lax` cookies.
- **Credential Hashing**: User passwords are salted and hashed using `bcryptjs` with 10 salt rounds.
- **Sanitized Inputs**: MongoDB injection safeguards with strict schema validation.
- **Failover Protection**: Automatic model fallback array prevents service interruption during provider outages.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ by the ClerX AI Engineering Team. &copy; 2026 ClerX AI Inc. All rights reserved.</sub>
</div>
