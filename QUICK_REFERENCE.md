# SAKHA v1 — Quick Reference Cheatsheet

## Start in 3 commands
```bash
npm install
cp .env.example .env   # fill in keys
npm run dev            # → localhost:5173
```

## Key Files
| File | Purpose |
|------|---------|
| `src/lib/framework.js` | All questions, archetypes, scoring — DON'T TOUCH without Kunaal |
| `src/lib/ai.js` | Gemini → Groq → Claude cascade |
| `src/lib/db.js` | All DB calls |
| `src/pages/AdminPage.jsx` | Admin panel (access at /#admin) |
| `src/pages/ResultsPage.jsx` | Most complex page — personality + paywall + crisis |

## App Stages
```
intro → (quiz) → processing → results
                                ↓
                            /#admin
```

## Scoring Quick Reference
```
Score -2 = Z-(D) Harmful underactivation = 3.0 risk pts  ← DROPOUT SIGNAL
Score -1 = Z-(H) Mild underactivation    = 1.5 risk pts
Score  0 = Z=0   Balanced/healthy        = 0   risk pts  ← IDEAL
Score +1 = Z+(H) Mild overactivation     = 0.5 risk pts
Score +2 = Z+(D) Harmful overactivation  = 1.0 risk pts
```

## 8 Archetypes
```
SURVIVOR   → M1 (Foundation) high risk
DREAMER    → M2/M7 high, Z+ pattern
BUILDER    → M3 (Confidence) dominant
SEEKER     → M6 (Clarity) + Spiritual
CONNECTOR  → M4 (Connection) dominant
VOICE      → M5 (Expression) dominant
GUARDIAN   → Moral dimension dominant
WANDERER   → 4+ layers in critical risk (catch-all)
```

## Database Tables
```
sakha_users         ← intake form data
sakha_submissions   ← diagnostic results
sakha_config        ← admin settings (key-value)
sakha_api_log       ← future API usage tracking
```

## Required ENV Keys
```
VITE_SUPABASE_URL         ← required
VITE_SUPABASE_ANON_KEY    ← required
VITE_GEMINI_API_KEY       ← optional (AI insight)
VITE_GROQ_API_KEY         ← optional (AI fallback)
VITE_RAZORPAY_KEY_ID      ← optional (payments)
VITE_ADMIN_SECRET         ← required (admin login)
```

## Crisis Detection
```javascript
// Fires modal if these are critical:
answers[0] === -2  // Physical Foundation
answers[1] === -2  // Emotional Foundation
// Shows: iCall, Tele-MANAS, Vandrevala
// NEVER remove or bypass this
```

## Admin Panel
```
URL: yoursite.com/#admin
Controls: price, free/paid toggle, AI model, gateway, users
```

## Add Razorpay to index.html
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## Deploy
```bash
npm run build    # → dist/
# Connect GitHub repo to Netlify
# Build: npm run build | Publish: dist
# Add env vars in Netlify dashboard
```

## v2 Priority Tasks
1. Razorpay webhook verification (server-side)
2. Claude via Supabase Edge Function
3. User login / session persistence
4. Drift detection (self-declared vs data type)
5. PDF report download
6. Hindi questions
7. Counsellor/institutional panel
