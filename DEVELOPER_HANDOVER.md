# SAKHA v1 — Developer Handover Document
## Confidential · For Developer Use Only

**Product:** Sakha — Student Self-Awareness Diagnostic Platform  
**Version:** 1.0  
**Framework:** PECMS × 7-Layer (35-Node) Human Diagnostic System  
**Owner:** Kunaal Jaiswal, IIITDM Kancheepuram (B.Tech ME + M.Tech AI & Robotics, Batch 2029)  
**Initiative:** Young Tulip  
**Contact:** skunaaljaiswal.com  

---

## 1. WHAT IS SAKHA

Sakha is India's first PECMS-based student self-awareness and dropout risk diagnostic platform.

**Core idea:** A student answers 35 questions mapped across 5 psychological dimensions (Physical, Emotional, Cognitive, Moral, Spiritual) and 7 developmental layers (Foundation → Purpose). The system scores their responses, identifies their personality archetype from 8 types, calculates dropout risk %, and generates an AI-powered personal insight report.

**Target users:**
- Students preparing for JEE / NEET / UPSC / competitive exams
- Government school students (future)
- General public (future — relationship diagnostic, career diagnostic)

**Revenue model:**
- Diagnostic is free always
- Full AI report: ₹49 (configurable from admin panel)
- Institutional access (counsellor panel): ₹5,000–15,000/month per institution
- API licensing: ₹5/call to external developers

---

## 2. TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast, component-based |
| Styling | Pure CSS (no framework) | Zero bloat, full control |
| Backend/DB | Supabase (PostgreSQL) | Free tier, auth, realtime |
| AI (free tier) | Gemini 1.5 Flash | 1500 free calls/day |
| AI (fallback) | Groq + Llama 3.1 8B | Free, very fast |
| AI (premium) | Claude Haiku/Sonnet | Best quality, paid users only |
| Payments | Razorpay + Cashfree | Both integrated, admin switches |
| Hosting | Netlify | Free tier, auto-deploy from GitHub |
| Routing | React Router v6 | SPA routing |

**No TypeScript** (by owner's choice — keep it JS for now)  
**No Tailwind** (pure CSS variables in index.css)  
**No Redux** (useState is sufficient for v1)

---

## 3. PROJECT STRUCTURE

```
sakha/
├── src/
│   ├── lib/
│   │   ├── framework.js      ← CORE: All 35 questions, 8 archetypes,
│   │   │                        scoring engine, language data
│   │   ├── ai.js             ← AI cascade: Gemini → Groq → Claude
│   │   ├── db.js             ← All Supabase CRUD operations
│   │   └── supabase.js       ← Supabase client + full SQL schema
│   │
│   ├── pages/
│   │   ├── IntakePage.jsx    ← Landing: name, email, phone, T&C,
│   │   │                        language picker
│   │   ├── QuizPage.jsx      ← 35 questions, layer bands,
│   │   │                        dot navigation, scale buttons
│   │   ├── ResultsPage.jsx   ← Personality type, multilingual names,
│   │   │                        self-declare, AI insight, paywall,
│   │   │                        crisis popup, full report
│   │   └── AdminPage.jsx     ← Price control, AI config, user table,
│   │                            API settings, stats dashboard
│   │
│   ├── components/
│   │   └── LoadingScreen.jsx
│   │
│   ├── App.jsx               ← Stage orchestrator (intro→quiz→processing→results→admin)
│   ├── main.jsx              ← React entry point
│   └── index.css             ← Global CSS with CSS variables
│
├── index.html                ← Google Fonts loaded here
├── vite.config.js
├── netlify.toml              ← SPA redirect rule (/* → index.html)
├── package.json
└── .env.example              ← All required environment variables
```

---

## 4. DATABASE SCHEMA (Supabase / PostgreSQL)

Run the SQL in `src/lib/supabase.js` (inside the large comment block).

### Tables:

**sakha_users**
```sql
id uuid PRIMARY KEY
name text
email text
phone text
city text
education_level text
agreed_to_terms boolean
language_preference text
self_declared_type text      -- what user says they are
is_premium boolean           -- set from admin panel
created_at timestamp
```

**sakha_submissions**
```sql
id uuid PRIMARY KEY
user_id uuid → sakha_users.id
answers jsonb                -- { "0": -2, "1": 0, ... "34": 1 }
scores jsonb                 -- { overall: 42, integration: 18 }
personality_type text        -- 'SURVIVOR', 'BUILDER', etc.
overall_risk integer         -- 0-100
layer_scores jsonb           -- { M1: {points, max}, ... }
dim_scores jsonb             -- { P: {points, max}, ... }
ai_report text               -- JSON stringified AI response
ai_model_used text           -- 'gemini-1.5-flash', 'groq-llama-3.1-8b', etc.
is_paid boolean
payment_id text
payment_gateway text
created_at timestamp
```

**sakha_config** (key-value store for admin panel)
```
report_price_inr = '49'
report_free = 'false'
active_gateway = 'razorpay'
ai_model_free = 'gemini'
ai_model_premium = 'claude'
premium_enabled = 'true'
crisis_popup_enabled = 'true'
api_access_enabled = 'false'
api_price_per_call = '5'
```

**sakha_api_log** — logs external API calls (future feature)

### Row Level Security:
- Public insert on users and submissions (no auth needed to take test)
- Public read on config (to get price/free mode)
- Admin reads all via service key (add in future for security)

---

## 5. SCORING ENGINE (framework.js)

### How scores work:
Each of 35 questions has two statements:
- **Statement A** = Z- direction (under-activation / collapse)
- **Statement B** = Z+ direction (over-activation / excess)
- **Middle (0)** = Balanced / healthy

User picks: -2 (Strongly A), -1 (Mostly A), 0 (Neither), +1 (Mostly B), +2 (Strongly B)

### Risk weighting:
```
score -2 → 3.0 risk points  (critical, harmful under-activation)
score -1 → 1.5 risk points  (moderate under-activation)
score  0 → 0   risk points  (healthy, balanced)
score +1 → 0.5 risk points  (mild over-activation)
score +2 → 1.0 risk points  (harmful over-activation)
```

**Why Z- is weighted higher:** Under-activation (collapse, shutdown, numbness) is a stronger dropout signal than over-activation (excess, hyper-focus). A student who can't get out of bed is more at risk than one who studies too much.

### Dropout risk %:
```
totalPoints / maxPossiblePoints × 100
maxPossiblePoints = 35 questions × 3 (max per question) = 105
```

### Archetype detection:
1. If 4+ layers have >60% risk → WANDERER (multi-layer collapse)
2. Otherwise: find highest-risk layer → map to archetype
3. If overall risk is low → look at which dimension is strongest (inverse)

### Integration Index:
Count of nodes where answer === 0 (perfectly balanced). Max 35.

---

## 6. AI CASCADE (ai.js)

```
Free users:
  1. Try Gemini 1.5 Flash (1500 free calls/day)
  2. If Gemini fails/rate-limited → Groq Llama 3.1 8B (fallback)
  3. If both fail → static fallback response

Premium users (flag set from admin panel):
  → Claude Haiku or Sonnet
  → NOTE: Claude calls should be made from Supabase Edge Function
    (not from frontend) to protect API key. This is v2 work.
```

### AI prompt structure:
The prompt sends: overall risk %, archetype, integration index, top 5 critical nodes, layer risk percentages.

Expected JSON response:
```json
{
  "headline": "One powerful sentence naming their pattern",
  "body": "3-4 sentences of empathetic honest insight",
  "strength": "One genuine strength",
  "challenge": "One honest challenge",
  "first_step": "One specific actionable step for today",
  "message_to_self": "Short phrase for hard moments (10-15 words)"
}
```

---

## 7. ENVIRONMENT VARIABLES

All in `.env` (copy from `.env.example`):

```bash
# Supabase (required for data storage)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# AI APIs (optional - app works without, just no AI insight)
VITE_GEMINI_API_KEY=        # aistudio.google.com (free)
VITE_GROQ_API_KEY=          # console.groq.com (free)

# Payments (optional - paywall won't work without)
VITE_RAZORPAY_KEY_ID=       # dashboard.razorpay.com
VITE_CASHFREE_APP_ID=       # merchant.cashfree.com

# Admin panel password
VITE_ADMIN_SECRET=          # choose anything secure
```

**Security note:** All VITE_ prefixed variables are exposed to the browser. This is fine for anon keys and publishable payment keys. Never put secret keys here. Claude API key must go in a Supabase Edge Function (v2 work).

---

## 8. ADMIN PANEL

Access: `yoursite.com/#admin` or click the tiny ⚙ button (bottom right corner, opacity 0.4 — intentionally hidden from regular users).

Password = `VITE_ADMIN_SECRET` env variable.

**What you can control from admin:**
- Toggle report free/paid
- Set report price (any amount)
- Switch payment gateway (Razorpay / Cashfree)
- Switch AI models per tier
- Enable/disable API access
- Set API price per call
- View all user submissions table
- View stats (total users, assessments, paid reports, revenue)

---

## 9. PAYMENT FLOW

### Razorpay (primary):
1. User clicks "Pay ₹49 & Unlock" in paywall modal
2. Razorpay checkout opens (their SDK handles UI)
3. On success: `handler` function fires with `response.razorpay_payment_id`
4. Frontend calls `markPaid(submissionId, paymentId, 'razorpay')` in Supabase
5. Full report unlocks

**Add Razorpay SDK to index.html:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Cashfree (alternative):
Admin switches gateway from panel. Cashfree integration needs to be wired in ResultsPage.jsx (same pattern, different SDK).

### TODO for v2:
- Server-side payment verification (webhook from Razorpay to Supabase Edge Function)
- Currently trusting client-side success callback (OK for v1, fix for v2)

---

## 10. PERSONALITY ARCHETYPES

8 archetypes, each with names in 9 languages:

| Key | English | Hindi | Sanskrit | Trigger |
|-----|---------|-------|---------|---------|
| SURVIVOR | Survivor | Yoddha | Vira | M1 (Foundation) dominant risk |
| DREAMER | Dreamer | Sapnadrishta | Svapnadrishti | M2/M7 dominant, high Z+ |
| BUILDER | Builder | Nirmata | Rachayita | M3 strong, cognitive dominant |
| SEEKER | Seeker | Jigyasu | Anvesha | M6 (Clarity) + Spiritual dominant |
| CONNECTOR | Connector | Sangathi | Sahayogi | M4 (Connection) dominant |
| VOICE | Voice | Awaaz | Vakta | M5 (Expression) dominant |
| GUARDIAN | Guardian | Rakshak | Dharmapalaka | Moral dimension dominant |
| WANDERER | Wanderer | Raahi | Pathika | 4+ layers in critical risk |

**Languages supported:** English, Hindi, Sanskrit, Tamil, Bengali, Telugu, Marathi, Gujarati, Punjabi

**Self-declare feature:** User can choose their own type. System stores it as `self_declared_type` in DB. After 3+ assessments, if data-detected type ≠ self-declared type, the app will surface a gentle "your data has something to tell you" card. **(This drift detection is v2 work — data model is ready, UI logic needs building.)**

---

## 11. CRISIS DETECTION

If `answers[0] === -2` (Physical Foundation critical) OR `answers[1] === -2` (Emotional Foundation critical), a crisis modal fires immediately on results page.

Shows:
- iCall: 9152987821
- Tele-MANAS: 14416
- Vandrevala Foundation: 1860-2662-345

**Never block or skip this.** Owner's explicit requirement: crisis resources always show before report content when triggered.

---

## 12. WHAT'S DONE ✅ vs WHAT'S v2 🔲

### Done in v1:
- ✅ 35-question diagnostic (all questions written)
- ✅ PECMS × 7-Layer scoring engine
- ✅ 8 archetypes in 9 languages
- ✅ Language switcher on results page
- ✅ Self-declare personality type
- ✅ Gemini → Groq AI cascade
- ✅ Supabase schema (users, submissions, config, api_log)
- ✅ Intake form (name, email, phone, T&C, language)
- ✅ Crisis detection + helpline modal
- ✅ Payment wall (Razorpay client-side)
- ✅ Admin panel (price, AI, gateway, users, stats)
- ✅ Netlify deploy config

### v2 Todo:
- 🔲 Razorpay webhook verification (server-side)
- 🔲 Claude API via Supabase Edge Function (secure)
- 🔲 Hindi language questions (currently English only)
- 🔲 Drift detection (self-declared vs data-detected type)
- 🔲 PDF report download
- 🔲 Counsellor panel (anonymous student data for institutions)
- 🔲 Institutional login + cohort dashboard
- 🔲 API endpoint for external developers
- 🔲 90-day reassessment reminder email
- 🔲 Cashfree full integration
- 🔲 User login (currently stateless — each assessment is new)
- 🔲 Mobile app (React Native, same framework)

---

## 13. KNOWN ISSUES / NOTES

1. **No user auth in v1.** Each assessment is a fresh entry. User identified only by email — no login/password system yet. This means same person can take multiple assessments — which is actually desired (track progress over time). v2 adds optional login.

2. **AI keys in frontend.** Gemini and Groq keys are in `VITE_` env vars (browser-exposed). This is acceptable for free-tier keys with usage limits. For Claude, move to Edge Function before exposing.

3. **Admin auth is basic.** Password comparison against env var. For production, consider Supabase auth with admin role.

4. **Razorpay script not in index.html yet.** Add `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` before `</body>` for payments to work.

5. **Config table is public read.** Anyone can read pricing config. This is intentional (frontend needs price to show paywall). Keep write operations in admin only.

6. **`self_declared_type` not yet saved to DB.** The UI captures it but `saveUser` doesn't update it. Add an UPDATE call after user selects their type. Small fix.

---

## 14. LOCAL SETUP (5 minutes)

```bash
# 1. Clone or unzip
cd sakha

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Fill in your Supabase URL and anon key

# 4. Supabase SQL
# Go to supabase.com → your project → SQL Editor
# Paste and run the SQL from src/lib/supabase.js (inside the comment block)

# 5. Run
npm run dev
# Opens at http://localhost:5173

# 6. Admin panel
# Go to http://localhost:5173/#admin
# Password: whatever you set as VITE_ADMIN_SECRET
```

---

## 15. DEPLOY TO NETLIFY

```bash
# 1. Build test
npm run build
# Should output dist/ with no errors

# 2. Push to GitHub
git init && git add . && git commit -m "Sakha v1"
git push origin main

# 3. Netlify
# netlify.com → New site → Import from GitHub
# Build command: npm run build
# Publish directory: dist
# Add all env vars from .env in Site Settings > Environment Variables
# Deploy
```

The `netlify.toml` file handles SPA routing automatically (all routes → index.html).

---

## 16. CONTACT & CONTEXT

This is not a typical client project. Sakha is a mission-driven product built on a proprietary diagnostic framework (PECMS × 7-Layer / Mother Source) developed by Kunaal Jaiswal.

The framework is based on:
- Indian philosophical foundations (Ashtanga Yoga, chakra system — used as developmental psychology map, not metaphysics)
- Cross-referenced with Erikson's psychosocial stages and Western developmental psychology
- Applied specifically to the Indian student dropout problem

**Do not:**
- Change the 35 questions without consulting Kunaal (they are precisely mapped to nodes)
- Replace the archetype system with generic MBTI-style labels
- Remove the crisis detection or helpline references
- Make the diagnostic paid (the diagnostic must always be free)

**Do feel free to:**
- Improve the UI/UX
- Add TypeScript if you prefer
- Add proper error boundaries
- Improve the payment flow security
- Build the v2 features listed above
- Optimize the Supabase queries

---

*Sakha v1 · Young Tulip Initiative · Kunaal Jaiswal · IIITDM Kancheepuram*  
*Framework: Mother Source (PECMS × 7-Layer Diagnostic System) — Personal Draft, Not Published*
