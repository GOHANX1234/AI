# ⚡ ClerX AI — Next-Gen Autonomous AI Platform & Neural Workspace

> **Enterprise-grade autonomous AI workspace, multi-agent pipelines, and neural reasoning powered by GLM-5.2 and MongoDB Atlas.**

Built with the latest **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas (Mongoose)**, and **OpenRouter AI Gateway**.

---

## 🚀 Key Features

### 1. 🌐 Futuristic Landing Page & Live Sandbox
- High-impact dark futuristic theme with cyber-mesh gradients and glow effects.
- **Interactive Live AI Sandbox**: Test GLM-5.2 models directly in the browser without signup.
- Feature breakdown, open models catalog, multi-agent pipeline overview, interactive pricing tables, testimonials, and FAQs.

### 2. 🔐 Full Authentication & Session Security
- Custom **JWT Session Authentication** with HTTP-Only encrypted cookies using `jose` & `bcryptjs`.
- User registration (`/signup`) with company role, plan quotas, and automatic welcome conversation creation.
- Login (`/login`) with session persistence.
- Next.js Edge Middleware route protection for `/dashboard/*`.

### 3. 💬 Flagship AI Chat Studio (`/dashboard/chat`)
- Multi-conversation drawer with search, pin, rename, and delete capabilities.
- Live OpenRouter Model Switching (Default: `z-ai/glm-5.2:free`, NVIDIA Nemotron, Google Gemma, etc.).
- Custom System Prompt Persona modal.
- Markdown rendering with code syntax styling and 1-click **Copy Code** button.
- Real-time token counter and latency (ms) telemetry on every message.
- Chat export to Markdown (`.md`).

### 4. 📝 AI Document Studio (`/dashboard/studio`)
- Split-screen rich Markdown editor with live preview toggle.
- **AI Copilot Actions**:
  - Executive Summarization
  - Deepen & Expand Technical Detail
  - Professional Polish & Rewrite
  - Code Bug Fix & Optimization
  - Unit & Integration Test Generation
  - Custom Transformation Prompt
- Persistent document storage in MongoDB Atlas.

### 5. 🤖 Autonomous Multi-Agent Swarms (`/dashboard/agents`)
- 5 Pre-configured Autonomous Agents:
  - **ClerX Architect**: Distributed systems, microservices & database schemas.
  - **ClerX SecOps & Bug Hunter**: Vulnerability audits & security patches.
  - **ClerX Research Synthesizer**: Academic whitepapers & technical benchmarks.
  - **ClerX Growth Marketer**: Technical copywriting, SEO & GTM strategy.
  - **ClerX Data Engineer**: Database aggregation pipelines & indexing.
- Interactive multi-step reasoning visualization and artifact synthesis.

### 6. ⚡ Models Hub & Developer API (`/dashboard/models`)
- Real-time specifications for `z-ai/glm-5.2:free`, context window (128k), latency, and pricing.
- Interactive SDK code snippet generator (cURL, Node.js fetch, Python requests).
- Developer API Key manager with masked keys, secure hashing, and instant revocation.

### 7. 📈 Real-Time Analytics & Telemetry (`/dashboard/analytics`)
- Visual quota gauge tracking monthly tokens.
- Feature consumption breakdown (Chat vs Studio vs Agents vs API).
- Real-time execution logs with timestamps and response latency.

### 8. ⚙️ Settings & Database Diagnostics (`/dashboard/settings`)
- User profile management.
- Default model & temperature sliders.
- Live MongoDB Atlas diagnostic ping.

---

## 🛠️ Environment Configuration

The application is pre-configured with environment variables in `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://bayef85829_db_user:B19PExYFETX7O7lU@cluster0.bazlqbd.mongodb.net/x_db?retryWrites=true&w=majority&appName=Cluster0

# OpenRouter AI
OPENROUTER_API_KEY=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
DEFAULT_AI_MODEL=z-ai/glm-5.2:free
SITE_URL=http://localhost:3000
SITE_NAME=ClerX AI

# Authentication
JWT_SECRET=clerx_ai_super_secret_jwt_key_2026_x984920491823901823908
NEXT_PUBLIC_APP_NAME="ClerX AI"
```

---

## 📦 Getting Started

### 1. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 2. Build for Production
```bash
npm run build
npm run start
```

---

## 📂 Project Architecture

```
/workspaces/ClerX/
├── .env.local                  # Environment variables (MongoDB Atlas & OpenRouter)
├── package.json                # Next.js 15, React 19, Mongoose, Jose, Lucide
├── tailwind.config.ts          # Custom cyber-dark theme with glowing accents
├── src/
│   ├── middleware.ts           # Route protection with JWT verification
│   ├── lib/
│   │   ├── mongodb.ts          # Cached MongoDB Atlas connection singleton
│   │   ├── auth.ts             # Password hashing, JWT signing & cookies
│   │   ├── openrouter.ts       # OpenRouter completion handler with fallback
│   │   └── models/
│   │       ├── User.ts         # User schema & credentials
│   │       ├── Conversation.ts # Chat sessions
│   │       ├── Message.ts      # Multi-turn messages
│   │       ├── Document.ts     # Studio notes & docs
│   │       ├── ApiKey.ts       # Developer API keys
│   │       └── UsageLog.ts     # Analytics & telemetry
│   ├── context/
│   │   └── AuthContext.tsx     # Client-side user auth state
│   ├── components/
│   │   ├── landing/            # Hero, Playground, Features, Pricing, Footer
│   │   └── dashboard/          # Sidebar, Header
│   └── app/
│       ├── page.tsx            # Corporate Landing Page
│       ├── login/page.tsx      # Sign In Page
│       ├── signup/page.tsx     # Account Creation Page
│       ├── dashboard/
│       │   ├── page.tsx        # Overview Command Center
│       │   ├── chat/page.tsx   # AI Chat Studio
│       │   ├── studio/page.tsx # AI Document Studio
│       │   ├── agents/page.tsx # Autonomous AI Agents
│       │   ├── models/page.tsx # Models Hub & API Keys
│       │   ├── analytics/page.tsx # Telemetry Dashboard
│       │   └── settings/page.tsx  # Settings & DB Ping
│       └── api/                # 14 Next.js Route Handlers
```

---

&copy; 2026 ClerX AI Inc.
