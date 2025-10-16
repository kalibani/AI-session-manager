# AI Session Manager

A production-quality AI conversation manager built with Next.js 15, TypeScript, and Google Gemini AI. Manage your AI chat sessions with persistent storage, real-time streaming, and a beautiful UI.

![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🌐 Live Demo

**[https://ai-session-manager.vercel.app](https://ai-session-manager.vercel.app)**

Try the live application deployed on Vercel!

## ✨ Features

- 🤖 **AI-Powered Conversations** - Powered by Google Gemini 2.0 Flash
- 💬 **Real-time Streaming** - Smooth, ChatGPT-like streaming responses
- 🔐 **Secure Authentication** - Email magic link (passwordless)
- 💾 **Persistent Storage** - All conversations saved to Supabase
- 🌓 **Dark Mode** - Beautiful light/dark theme support
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🏗️ **Clean Architecture** - Domain-Driven Design (DDD)
- 🔍 **Error Monitoring** - Integrated Sentry tracking
- ⚡ **Optimized Performance** - No unnecessary refetches, smooth UX

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.20.0 or higher
- **pnpm** (recommended) or npm
- **Supabase account** - [Sign up here](https://supabase.com)
- **Google AI Studio API key** - [Get it here](https://aistudio.google.com/app/apikey)
- **Sentry account** (optional) - [Sign up here](https://sentry.io)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd AI-session-manager

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Supabase (get from: https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Sentry (optional - for error monitoring)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

**How to get these values:**

**Gemini API Key:**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

**Supabase Credentials:**

1. Create a project at [Supabase](https://supabase.com)
2. Go to: Project Settings → API
3. Copy **Project URL** and **anon/public key**

**Sentry DSN (optional):**

1. Create a project at [Sentry](https://sentry.io)
2. Copy the DSN from project settings

### 3. Database Setup

Run the database migrations in your Supabase SQL Editor:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of:
   - `supabase/migrations/001_create_sessions_messages_profiles_with_rls.sql`
   - `supabase/migrations/002_cleanup_empty_messages.sql`
5. Click **Run** for each file

This will create:

- `profiles` table (user profiles)
- `sessions` table (chat sessions)
- `messages` table (chat messages)
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp triggers

### 4. Run the Application

```bash
# Development mode
pnpm dev

# The app will be available at http://localhost:3000
```

### 5. First Login

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter your email
3. Click "Send link"
4. Check your email inbox
5. Click the magic link to sign in

## 📁 Project Structure

```
src/
├── app/                      # Next.js 15 App Router
│   ├── api/chat/            # AI streaming API endpoint
│   ├── auth/                # Auth callback & error pages
│   ├── sessions/            # Session list & detail pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing/login page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── AuthForm.tsx         # Login form
│   ├── SessionList.tsx      # Session list view
│   ├── SessionDetail.tsx    # Chat interface
│   └── ...
├── domain/                  # Domain-Driven Design layers
│   ├── entities/            # Business entities (Session, Message)
│   ├── repositories/        # Data access layer
│   └── usecases/            # Business logic
├── hooks/                   # React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useSessions.ts      # Session list hook
│   └── useSessionDetail.ts # Chat session hook
├── services/               # External services
│   ├── db.ts              # Supabase client
│   ├── gemini.ts          # Gemini AI service
│   └── sentry.ts          # Error monitoring
├── types/                  # TypeScript types
│   ├── index.ts           # Common types
│   └── supabase.ts        # Generated Supabase types
└── tests/                  # Unit tests
```

## 🏗️ Architecture

This project follows **Domain-Driven Design (DDD)** principles:

### Layers

1. **Presentation Layer** (`app/`, `components/`)

   - Next.js pages and React components
   - UI logic and user interactions

2. **Application Layer** (`hooks/`)

   - React hooks that connect UI to domain logic
   - State management

3. **Domain Layer** (`domain/`)

   - **Entities**: Core business objects (Session, Message)
   - **Repositories**: Data access interfaces
   - **Use Cases**: Business logic operations

4. **Infrastructure Layer** (`services/`)
   - External service integrations (Supabase, Gemini, Sentry)
   - Database clients

### Key Design Patterns

- **Repository Pattern**: Abstraction over data access
- **Use Case Pattern**: Encapsulated business logic
- **Hooks Pattern**: Reusable stateful logic
- **Streaming Pattern**: Real-time AI responses

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Run linting
pnpm lint
```

## 🚀 Production Deployment

### Build

```bash
pnpm build
pnpm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SENTRY_DSN` (optional)

## 🎨 Customization

### Changing the AI Model

Edit `src/app/api/chat/route.ts`:

```typescript
const result = await streamText({
  model: google("gemini-2.0-flash-exp"), // Change this
  messages: formattedMessages,
  temperature: 0.7,
});
```

### Customizing Email Templates

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Edit the "Magic Link" template
3. Customize subject, body, and styling

### Theming

Edit `src/app/globals.css` to customize colors and styles.

## 👨‍💻 Author

**Kautzar Alibani**

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://ai.google.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

---
