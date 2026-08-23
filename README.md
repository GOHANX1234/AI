<div align="center">

# ⚡ ClerX AI
### Next-Gen Autonomous AI Platform & Neural Workspace

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-8.x-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI_Gateway-6366F1?style=for-the-badge)](https://openrouter.ai/)

**Enterprise-grade autonomous AI workspace, multi-agent swarms, neural reasoning, and document copilot powered by GLM-5.2 and MongoDB Atlas.**

[Live Demo](http://localhost:3000) • [Getting Started](#-getting-started) • [Features](#-key-features) • [Architecture](#-project-architecture) • [API Reference](#-api-endpoints)

</div>

---

## 🌟 Overview

**ClerX AI** is a full-stack, production-ready AI application platform designed for developers, teams, and enterprises. Built on Next.js 15 App Router, React 19, TypeScript, MongoDB Atlas, and OpenRouter, ClerX delivers a unified suite of AI tools—from low-latency multi-model chat and rich document generation to autonomous agent swarms and developer API key management.

---

## 🚀 Key Features

### 1. 🌐 Futuristic Landing Page & Live AI Sandbox
- **Cyber-Glow UI**: High-impact modern dark aesthetic with neon indigo/cyan accents, glassmorphic cards, and animated gradient badges.
- **Interactive Live AI Sandbox**: Try out AI prompts with real-time streaming directly from the landing page without signing in.
- **Modular Showcase**: Comprehensive sections for Features, Multi-Agent pipelines, Live Models benchmark, Interactive Pricing calculator, Testimonials, and expandable FAQs.

### 2. 🔐 Enterprise Authentication & Edge Security
- **Stateless JWT Sessions**: Encrypted HTTP-only cookies powered by `jose` and `bcryptjs`.
- **Role & Tier Assignment**: Automatic quota initialization (`Free`, `Pro`, `Enterprise`) on signup.
- **Edge Route Protection**: Next.js Middleware (`middleware.ts`) guarding `/dashboard/*` routes from unauthorized access.
- **Onboarding Experience**: Automatically spins up a personalized welcome conversation upon initial registration.

### 3. 💬 Flagship AI Chat Studio (`/dashboard/chat`)
- **Multi-Conversation Management**: Create, rename, search, pin, and delete conversation threads stored persistently in MongoDB Atlas.
- **Dynamic Model Switching**: Switch seamlessly between leading open-weights and proprietary models:
  - `z-ai/glm-5.2:free` (Default Ultra-Fast Reasoning)
  - `nvidia/nemotron-3.5-lightning:free`
  - `nvidia/nemotron-3-nano-30b-a3b:free`
  - `google/gemma-4-31b-it:free`
- **System Persona Customizer**: Tailor AI behavior on the fly (Software Architect, Security Auditor, Technical Writer, or Custom System Instructions).
- **Rich Output Experience**: Markdown rendering with syntax highlighting, 1-click code copying, message retry/regeneration, and Markdown export (`.md`).
- **Live Telemetry**: Real-time token counter and latency (ms) recorded per message.

### 4. 📝 AI Document Studio (`/dashboard/studio`)
- **Split-Screen Workspace**: Side-by-side Markdown editor with live HTML preview toggle.
- **One-Click AI Copilot Actions**:
  - 📊 **Executive Summary**: Synthesize lengthy notes into bulleted briefings.
  - 🔍 **Deepen & Expand**: Add comprehensive technical explanations and citations.
  - ✨ **Polish & Refine**: Upgrade tone, grammar, and professional presentation.
  - 🐛 **Fix Bugs & Optimize**: Analyze code blocks, fix edge cases, and boost performance.
  - 🧪 **Generate Tests**: Automatically scaffold unit and integration test suites.
  - 🪄 **Custom Prompting**: Execute arbitrary AI transformations against highlighted text.
- **Document Management**: Create, search, word-count analytics, autosave, and delete documents with MongoDB Atlas persistence.

### 5. 🤖 Autonomous Multi-Agent Swarms (`/dashboard/agents`)
- **5 Specialized Autonomous Agents**:
  - 🏛️ **ClerX Architect**: Microservice topology, schema design, and distributed systems.
  - 🛡️ **ClerX SecOps & Bug Hunter**: Vulnerability audits, OWASP compliance, and security patches.
  - 🔬 **ClerX Research Synthesizer**: Academic whitepapers, technical benchmarks, and state-of-the-art analysis.
  - 📈 **ClerX Growth Strategist**: Technical copywriting, developer marketing, and product launches.
  - ⚡ **ClerX Data Pipeline Engineer**: Database indexing, ETL orchestration, and aggregation queries.
- **Multi-Step Execution Pipeline**: Visualizes step-by-step reasoning steps and synthesizes actionable code/report artifacts.

### 6. ⚡ Models Hub & Developer API (`/dashboard/models`)
- **Live Models Catalog**: Context window benchmarks (128k+ tokens), latency specs, modality, and pricing metrics.
- **Interactive Code Snippet Generator**: Instantly generate production-ready code in **cURL**, **Node.js (Fetch)**, and **Python (Requests)**.
- **Developer API Key Management**: Generate hashed API keys (`cx_live_...`), view masked strings, copy credentials, and revoke keys with instant invalidation.

### 7. 📈 Real-Time Analytics & Quota Telemetry (`/dashboard/analytics`)
- **Monthly Quota Gauge**: Visual progress meter tracking consumed vs total allocated monthly tokens.
- **Feature Breakdown**: Distribution of token consumption across Chat, Studio, Autonomous Agents, and API calls.
- **Live Telemetry Logs**: Audit stream showing timestamp, feature used, model invoked, tokens consumed, and round-trip latency (ms).

### 8. ⚙️ Settings & System Health (`/dashboard/settings`)
- **Profile Configuration**: Manage name, email, company, and view active plan badge.
- **Inference Preferences**: Configure default model, creativity temperature (0.0 – 1.0), and maximum response token limit.
- **Live MongoDB Atlas Diagnostic**: One-click ping to verify database latency and connection pool health.

---

## 📂 Project Architecture

```
ClerX/
├── .env.example                # Example environment variables template
├── .env.local                  # Local environment configuration
├── package.json                # Project dependencies & scripts
├── tailwind.config.ts          # Cyber-dark theme & neon glow extensions
├── tsconfig.json               # TypeScript strict configuration
├── next.config.mjs             # Next.js build configuration
│
├── public/                     # Static assets & SVG icons
│   ├── favicon.svg             # Favicon
│   └── icon.svg                # Brand icon
│
├── src/
│   ├── middleware.ts           # Edge middleware with JWT route protection
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Client-side user auth state & session provider
│   │
│   ├── lib/
│   │   ├── mongodb.ts          # Cached MongoDB Atlas connection singleton
│   │   ├── auth.ts             # Password hashing, JWT signing & cookie management
│   │   ├── openrouter.ts       # OpenRouter AI gateway client with fallback models
│   │   └── models/
│   │       ├── User.ts         # User schema & credentials
│   │       ├── Conversation.ts # Multi-session chat schema
│   │       ├── Message.ts      # Multi-turn chat message schema
│   │       ├── Document.ts     # Studio Markdown document schema
│   │       ├── ApiKey.ts       # Developer API key schema
│   │       └── UsageLog.ts     # Telemetry & token consumption schema
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── ClerXLogo.tsx   # Vector ClerX branding component
│   │   ├── landing/            # Landing page sections
│   │   │   ├── Navbar.tsx      # Sticky glass navbar with auth status
│   │   │   ├── HeroSection.tsx # Hero title with CTA buttons
│   │   │   ├── LivePlayground.tsx # Real-time interactive AI sandbox
│   │   │   ├── FeaturesGrid.tsx   # Core platform capabilities
│   │   │   ├── WorkflowSection.tsx # Multi-agent swarm pipeline diagram
│   │   │   ├── ModelsShowcase.tsx # Live models comparison table
│   │   │   ├── PricingSection.tsx # Pricing plans with feature matrices
│   │   │   ├── Testimonials.tsx   # Customer reviews & social proof
│   │   │   ├── FAQSection.tsx     # Interactive accordion FAQ
│   │   │   └── Footer.tsx         # Platform footer & navigation links
│   │   ├── dashboard/          # Dashboard layout components
│   │   │   ├── Header.tsx      # Top bar with user profile & quick links
│   │   │   └── Sidebar.tsx     # Collapsible navigation sidebar
│   │   └── chat/
│   │       └── ClerXChat.tsx   # Complete multi-session Chat Studio UI
│   │
│   └── app/
│       ├── layout.tsx          # Root HTML layout with AuthProvider & Fonts
│       ├── globals.css         # Global cyber styling, scrollbars & animations
│       ├── page.tsx            # Main Landing Page
│       ├── login/page.tsx      # Authentication: Sign In
│       ├── signup/page.tsx     # Authentication: Register
│       │
│       ├── dashboard/          # Protected dashboard application
│       │   ├── layout.tsx      # Dashboard layout with persistent Sidebar/Header
│       │   ├── page.tsx        # Overview Command Center
│       │   ├── chat/page.tsx   # Flagship AI Chat Studio
│       │   ├── studio/page.tsx # AI Document Studio
│       │   ├── agents/page.tsx # Autonomous Multi-Agent Swarms
│       │   ├── models/page.tsx # Models Hub & Developer API Keys
│       │   ├── analytics/page.tsx # Real-time Telemetry & Logs
│       │   └── settings/page.tsx  # User Settings & MongoDB Health Ping
│       │
│       └── api/                # 14 Full-Stack Route Handlers
│           ├── auth/
│           │   ├── login/route.ts       # User login & cookie dispatch
│           │   ├── signup/route.ts      # User signup & initial setup
│           │   ├── logout/route.ts      # Session termination
│           │   └── me/route.ts          # Authenticated profile lookup
│           ├── chat/route.ts            # Public/Landing AI completions
│           ├── conversations/
│           │   ├── route.ts             # List & create conversation sessions
│           │   └── [id]/
│           │       ├── route.ts         # Update, rename & delete conversation
│           │       └── messages/route.ts# Send message & receive AI reply
│           ├── studio/
│           │   ├── documents/
│           │   │   ├── route.ts         # List & create documents
│           │   │   └── [id]/route.ts    # Get, update & delete document
│           │   └── generate/route.ts    # AI Copilot document transformations
│           ├── keys/route.ts            # Developer API key CRUD
│           ├── analytics/route.ts       # Telemetry metrics & logs
│           └── test-db/route.ts         # MongoDB Atlas diagnostic ping
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Create account and issue JWT cookie | No |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT cookie | No |
| `POST` | `/api/auth/logout` | Invalidate and clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `POST` | `/api/chat` | Generate direct AI completion (Sandbox) | No |
| `GET` | `/api/conversations` | Fetch all user chat sessions | Yes |
| `POST` | `/api/conversations` | Create a new chat session | Yes |
| `PATCH` | `/api/conversations/:id` | Rename / update a chat session | Yes |
| `DELETE` | `/api/conversations/:id` | Delete a chat session | Yes |
| `POST` | `/api/conversations/:id/messages` | Send user message & get AI response | Yes |
| `GET` | `/api/studio/documents` | Fetch all saved documents | Yes |
| `POST` | `/api/studio/documents` | Create a new document | Yes |
| `PATCH` | `/api/studio/documents/:id` | Autosave / update document | Yes |
| `DELETE` | `/api/studio/documents/:id` | Delete document | Yes |
| `POST` | `/api/studio/generate` | Run AI Copilot action on document text | Yes |
| `GET` | `/api/keys` | List developer API keys | Yes |
| `POST` | `/api/keys` | Generate a new developer API key | Yes |
| `DELETE` | `/api/keys?id=...` | Revoke a developer API key | Yes |
| `GET` | `/api/analytics` | Retrieve usage statistics and telemetry logs | Yes |
| `GET` | `/api/test-db` | Health ping to MongoDB Atlas | Yes |

---

## 🛠️ Environment Configuration

Create a `.env.local` file in the project root with the following keys:

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
NEXT_PUBLIC_APP_NAME="ClerX AI"
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** 18.18+ or 20+
- **npm**, **pnpm**, or **yarn**
- **MongoDB Atlas** cluster or local MongoDB instance
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
Open [http://localhost:3000](http://localhost:3000) in your browser to experience the platform.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🛡️ Security & Privacy
- **Stateless Tokens**: Auth tokens are cryptographically signed with HS256 and stored strictly in `HttpOnly`, `SameSite=Lax` cookies.
- **Credential Hashing**: User passwords are salted and hashed using `bcryptjs` with 12 rounds.
- **Sanitized Inputs**: MongoDB injection safeguards with strict schema validation.
- **Failover Protection**: Automatic model fallback array prevents service interruption during provider outages.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ by the ClerX AI Engineering Team. &copy; 2026 ClerX AI Inc. All rights reserved.</sub>
</div>
