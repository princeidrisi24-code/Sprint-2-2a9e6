# 💸 FinMentor AI — AI Personal Finance Mentor

A stunning, AI-powered personal finance mentor built with **Next.js 14** + **Supabase** + **OpenAI**.

---

## ✨ Features

- 🏆 **Dynamic Financial Health Score** — Live 0-100 score across 5 dimensions
- ⚡ **Weekly AI Nudges** — 3 personalized, bite-sized actions every week
- 🎯 **Goal Tracker** — Multi-goal progress with milestone celebrations
- 💳 **Debt Planner** — Avalanche & Snowball strategy visualization
- 🤖 **AI Mentor Chat** — Context-aware financial advice powered by GPT-4
- 📊 **Rich Insights** — Monthly AI-written summaries, charts, streak tracking

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed ([Download here](https://nodejs.org))
- A Supabase account ([supabase.com](https://supabase.com)) — free tier works!
- An OpenAI API key ([platform.openai.com](https://platform.openai.com)) — optional for AI chat

---

### Step 1: Install Dependencies

```bash
cd "Sprint 2"
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In Supabase Dashboard → **SQL Editor**, paste and run the contents of `supabase-schema.sql`
3. This creates all 10 tables with proper security policies
4. (Optional) Enable Google OAuth: Go to Authentication → Providers → Google

### Step 3: Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

**Where to find these:**
- Supabase URL & Anon Key: Supabase Dashboard → Settings → API
- OpenAI key: platform.openai.com/api-keys

### Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
Sprint 2/
├── app/
│   ├── page.jsx              ← Landing Page
│   ├── auth/page.jsx         ← Login / Sign Up
│   ├── onboarding/page.jsx   ← 5-step setup wizard
│   ├── dashboard/page.jsx    ← Main Dashboard
│   ├── budget/page.jsx       ← Budget Center
│   ├── goals/page.jsx        ← Goals Hub
│   ├── debt/page.jsx         ← Debt Tracker
│   ├── mentor/page.jsx       ← AI Chat
│   ├── insights/page.jsx     ← Reports & Insights
│   ├── settings/page.jsx     ← User Settings
│   ├── api/chat/route.js     ← AI Chat API (OpenAI)
│   ├── layout.jsx
│   └── globals.css           ← Full design system
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── BottomNav.jsx
│   │   └── AppLayout.jsx
│   └── ui/
│       ├── ScoreRing.jsx     ← Animated score ring
│       ├── NudgeCard.jsx     ← Weekly nudge actions
│       ├── GoalCard.jsx      ← Goal progress cards
│       ├── MetricCard.jsx    ← Stats cards
│       ├── DebtCard.jsx      ← Debt items
│       └── BudgetBar.jsx     ← Category budget bars
│
├── lib/
│   ├── supabase.js           ← Browser Supabase client
│   ├── supabase-server.js    ← Server-side client
│   ├── formatters.js         ← Currency, dates, constants
│   ├── scoreCalculator.js    ← Health Score algorithm
│   └── nudgeEngine.js        ← Nudge generation logic
│
└── supabase-schema.sql       ← Run this in Supabase SQL Editor
```

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User info, income, life stage, health score |
| `fixed_expenses` | Recurring monthly commitments (rent, EMI) |
| `transactions` | Day-to-day income & expense entries |
| `goals` | Financial goals with progress tracking |
| `debts` | Loans and credit cards |
| `budgets` | Monthly category budgets |
| `nudges` | Weekly AI-generated action nudges |
| `ai_messages` | Chat history with AI mentor |
| `streaks` | Habit consistency tracking |
| `score_history` | Health score over time for trend charts |

---

## 🎨 Design System

Premium dark theme built with CSS custom properties:
- **Background**: Deep navy `#070B14`
- **Brand**: Indigo `#6366F1` + Emerald `#10B981`
- **Typography**: Inter (headings) + DM Sans (body)
- **Effects**: Glassmorphism cards, glow shadows, smooth animations

---

## 🤖 AI Chat (No OpenAI Key?)

The app works without an OpenAI key! It falls back to a smart rule-based response engine that uses your actual financial data to generate personalized advice. To unlock full GPT-4 powered responses, add your OpenAI key to `.env.local`.

---

## 🔒 Security

- All database access secured with Supabase **Row-Level Security**
- Users can only ever read/write their own data
- Authentication via Supabase Auth (email + Google OAuth)
- No financial data ever sent to third parties (only to your own Supabase project)

---

## 📱 Responsive

- **Desktop**: Sidebar navigation + 2-3 column layouts
- **Mobile**: Bottom tab navigation + single column layouts
- Optimized for iOS Safari and Android Chrome

---

*Built for Sprint II — AI Personal Finance Mentor*
