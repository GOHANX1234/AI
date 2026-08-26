<div align="center">

# ⚡ ClerX AI
### Modern Full-Stack AI Chat Workspace & Neural Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-8.x-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI_Gateway-6366F1?style=for-the-badge)](https://openrouter.ai/)

**A high-performance, ChatGPT-style AI chat studio powered by OpenRouter (GLM-5.2, Nemotron Omni, Gemma), Clerk Authentication, Next.js 16 App Router (Turbopack), React 19, and MongoDB Atlas.**

[Getting Started](#-getting-started) • [Features](#-key-features) • [Architecture](#-project-architecture) • [API Reference](#-api-endpoints) • [Vercel Deployment](#-deployment-to-vercel)

</div>

---

## 🌟 Overview

**ClerX AI** is a production-ready, full-stack AI chat assistant built for developers and teams. Powered by Next.js 16, React 19, Clerk Authentication, MongoDB Atlas, and OpenRouter, ClerX delivers a unified conversational experience featuring multi-session management, dynamic model switching, real-time token/latency telemetry, system persona customization, multimodal photo & PDF intelligence, and seamless Clerk-to-MongoDB profile synchronization.

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
- **Clerk Authentication**: Production-grade identity management with social logins, email/password, session lifecycle management, and `@clerk/themes` dark mode styling.
- **Custom Auth UI & Profile Manager**: Custom branded login and signup flows (`/login`, `/signup`), dedicated profile settings (`/profile`), and SSO callback handler (`/sso-callback`).
- **Automatic MongoDB Sync**: On-the-fly provisioning and real-time syncing of Clerk user accounts (name, email, avatar, token usage, plans) directly with MongoDB Atlas.
- **Edge Route Protection & Rate Limiting**: Next.js 16 Edge proxy (`proxy.ts`) powered by `clerkMiddleware` and in-memory IP-based rate limiting on sensitive API routes.
- **Guest & Auth Modes**: Instant guest chat mode with automatic conversation migration upon sign in.

### 3. ✍️ Studio Copilot
- **AI Workspace Actions**: Executive summaries, detailed expansion, clear rewrites, automated bug fixes, test generation, and code translation.

---

## 📂 Project Architecture

```
ClerX/
├── .env.local                  # Local environment configuration (git-ignored)
├── .gitignore                  # Git ignore rules (protects env & agent files)
├── package.json                # Project dependencies (Next.js 16.3.2, React 19, Clerk)
├── tailwind.config.ts          # Theme & style definitions
├── tsconfig.json               # TypeScript strict configuration
├── next.config.mjs             # Next.js 16 Turbopack build configuration
│
├── public/                     # Static assets & SVG icons
│   ├── favicon.svg             # Favicon
│   └── icon.svg                # Brand icon
│
└── src/
    ├── proxy.ts                # Next.js 16 Edge proxy with clerkMiddleware & rate limiting
    │
    ├── context/
    │   └── AuthContext.tsx     # Unified auth state provider bridging Clerk & MongoDB profile
    │
    ├── lib/
    │   ├── mongodb.ts          # Cached MongoDB Atlas connection singleton
    │   ├── auth.ts             # Clerk session resolution & MongoDB user synchronizer
    │   ├── rateLimit.ts        # Server-side sliding window rate limiting
    │   ├── openrouter.ts       # OpenRouter AI gateway client with fallback models
    │   ├── pdfHelper.ts        # Client-side PDF canvas rendering & text extractor
    │   ├── empty-module.js     # Turbopack stub module for node canvas
    │   └── models/
    │       ├── User.ts         # User schema linked with Clerk ID & profile details
    │       ├── Conversation.ts # Multi-session chat schema
    │       ├── Message.ts      # Multi-turn chat message schema & attachments
    │       ├── Document.ts     # Studio document workspace schema
    │       ├── ApiKey.ts       # Developer API key schema
    │       └── UsageLog.ts     # Telemetry & token consumption schema
    │
    ├── components/
    │   ├── auth/
    │   │   └── CustomAuthForm.tsx # Custom branded authentication forms
    │   ├── ui/
    │   │   ├── ClerXLogo.tsx   # Vector ClerX branding component
    │   │   └── UserAvatar.tsx  # Dynamic user avatar component with fallback
    │   └── chat/
    │       └── ClerXChat.tsx   # Complete multi-session Chat Studio interface
    │
    └── app/
        ├── layout.tsx          # Root HTML layout with ClerkProvider & AuthProvider
        ├── globals.css         # Global cyber styling, scrollbars & animations
        ├── page.tsx            # Main AI Chat Studio landing page
        ├── c/[id]/page.tsx     # Direct conversation permalink view
        ├── login/page.tsx      # Branded Sign In page
        ├── signup/page.tsx     # Branded Sign Up page
        ├── profile/page.tsx    # User profile & account management
        ├── sso-callback/page.tsx # Clerk SSO callback handler
        │
        └── api/                # Full-Stack API Route Handlers
            ├── auth/
            │   ├── sign-in/route.ts     # Custom sign-in ticket generation
            │   └── me/route.ts          # Authenticated Clerk & MongoDB profile lookup
            ├── chat/route.ts            # AI chat completion & SSE streaming
            ├── conversations/
            │   ├── route.ts             # List & create conversation sessions
            │   └── [id]/
            │       ├── route.ts         # Update, rename & delete conversation
            │       └── messages/route.ts# Message history & thread lookup
            ├── studio/
            │   ├── generate/route.ts    # Copilot generation actions (Rate-limited)
            │   └── documents/           # Studio document store & CRUD
            ├── keys/route.ts            # Developer API key management (Rate-limited)
            ├── analytics/route.ts       # Telemetry metrics & logs
            └── test-db/route.ts         # MongoDB Atlas diagnostic ping
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile from Clerk & MongoDB | Yes (Clerk) |
| `POST` | `/api/auth/sign-in` | Generate short-lived Clerk sign-in ticket for custom auth | No |
| `POST` | `/api/chat` | Generate direct AI completion / SSE stream | No (Guest/Auth) |
| `GET` | `/api/conversations` | Fetch all user chat sessions | Yes (Clerk) |
| `POST` | `/api/conversations` | Create a new chat session | Yes (Clerk) |
| `PATCH` | `/api/conversations/:id` | Rename / pin / update a chat session | Yes (Clerk) |
| `DELETE` | `/api/conversations/:id` | Delete a chat session | Yes (Clerk) |
| `GET` | `/api/conversations/:id/messages` | Fetch messages for a chat session | Yes (Clerk) |
| `POST` | `/api/studio/generate` | Run Copilot action (summary, rewrite, tests, etc.) | Yes (Clerk) |
| `GET` | `/api/studio/documents` | List studio workspace documents | Yes (Clerk) |
| `POST` | `/api/studio/documents` | Save new studio document | Yes (Clerk) |
| `GET` | `/api/keys` | List developer API keys | Yes (Clerk) |
| `POST` | `/api/keys` | Generate a new developer API key | Yes (Clerk) |
| `DELETE` | `/api/keys?id=...` | Revoke a developer API key | Yes (Clerk) |
| `GET` | `/api/analytics` | Retrieve usage statistics and telemetry logs | Yes (Clerk) |
| `GET` | `/api/test-db` | Health diagnostic to MongoDB Atlas | Yes (Clerk) |

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

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** 18.18+ or 20+
- **npm**, **pnpm**, or **yarn**
- **MongoDB Atlas** cluster
- **Clerk Account** ([clerk.com](https://clerk.com))
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
   - `SITE_URL` (`https://your-domain.vercel.app`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (`/login`)
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (`/signup`)
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` (`/`)
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` (`/`)
4. Click **Deploy**.

---

## 🛡️ Security & Privacy
- **Clerk Identity Management**: Industry-standard session security, token verification via `@clerk/nextjs/server`, and SSO integrations.
- **Real-Time Data Sync**: Fast, automated synchronization between Clerk identity events and MongoDB Atlas user documents.
- **Edge Protection & Rate Limiting**: Edge-level request routing through `clerkMiddleware` and in-memory rate limiting against spam/abuse.
- **Sanitized Inputs**: MongoDB injection safeguards with strict schema validation.
- **Failover Protection**: Automatic model fallback array prevents service interruption during provider outages.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ by the ClerX AI Engineering Team. &copy; 2026 ClerX AI Inc. All rights reserved.</sub>
</div>
