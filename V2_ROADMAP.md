# SAKHA — v2 Roadmap & Feature Specs

## Priority 1 — Security & Stability (Do First)

### 1.1 Server-side Payment Verification
**Problem:** v1 trusts Razorpay client-side callback. Anyone can fake payment success.
**Solution:** Supabase Edge Function webhook
```
POST /functions/v1/razorpay-webhook
→ Verify signature with Razorpay secret
→ Call markPaid() with verified payment_id
→ Return 200
```

### 1.2 Claude API via Edge Function
**Problem:** Claude API key cannot be in VITE_ env (exposed in browser)
**Solution:** Supabase Edge Function
```
POST /functions/v1/generate-report
Body: { scores, archetype, lang, user_id }
→ Verify user is premium (check sakha_users.is_premium)
→ Call Claude API server-side
→ Return report JSON
```

### 1.3 Admin Panel Auth
**Problem:** Simple password comparison in frontend
**Solution:** Supabase auth with admin role
```
- Create admin user in Supabase Auth
- Add role column to profiles table
- Protect admin routes with session check
```

---

## Priority 2 — Core Features

### 2.1 User Login / Session Persistence
Users should be able to return and see their history.
```
- Supabase Auth (email magic link or OTP)
- Link existing submissions to auth user
- "My History" page showing past assessments
- 90-day reassessment reminder
```

### 2.2 Drift Detection
When self_declared_type ≠ detected archetype across 3+ assessments:
```javascript
// In ResultsPage, after 3rd assessment:
const history = await getUserHistory(userId)
if (history.length >= 3) {
  const selfType = user.self_declared_type
  const dataTypes = history.map(h => h.personality_type)
  const dominant = mode(dataTypes) // most frequent detected type
  if (selfType && dominant !== selfType) {
    showDriftCard(selfType, dominant, history)
  }
}
```

### 2.3 PDF Report Download
```
- Use jsPDF or react-pdf
- Generate from ResultsPage data
- Include: archetype, risk score, layer breakdown, AI insight
- Watermark with "Sakha v1 · Young Tulip"
- Only available for paid users
```

### 2.4 Hindi Questions
All 35 questions need Hindi translation.
Currently English only. Owner will provide translations.
Structure stays same — just add `a_hi` and `b_hi` fields to each question in framework.js.

---

## Priority 3 — Institutional Features

### 3.1 Counsellor Panel
For institutions (coaching centres, schools, colleges) that pay for access.

**Data shown to counsellor:**
- Anonymous: archetype, risk %, layer breakdown, city, education level
- NOT shown: name, email, phone (until student consents)

**Student consent flow:**
```
In ResultsPage: "Share with counsellor" toggle
→ If ON: counsellor sees name + contact
→ If OFF: anonymous only
```

**Institutional auth:**
```
- Institution gets unique slug: sakha.com/inst/momentum-gorakhpur
- Students at that URL have results automatically linked to institution
- Counsellor logs in with institution credentials
- Sees cohort dashboard: risk distribution, archetype breakdown, flagged students
```

### 3.2 Cohort Dashboard (for institutions)
```
Charts:
- Risk distribution (how many low/moderate/high/critical)
- Archetype distribution pie chart
- Layer risk heatmap across batch
- Trend over time (if reassessments done)

Filters:
- By class / batch
- By education level
- By risk level
- Date range
```

---

## Priority 4 — Platform Features

### 4.1 External API
When `api_access_enabled = 'true'` in config:

```
POST /api/v1/predict
Headers: Authorization: Bearer SAKHA_API_KEY
Body: {
  answers: { "0": -1, "1": 0, ... "34": 2 },
  lang: "english"
}

Response: {
  archetype: "BUILDER",
  archetype_name: "Nirmata",
  risk_percent: 32,
  integration_index: 18,
  layer_risks: { M1: 15, M2: 28, ... },
  report: { headline, body, strength, challenge, first_step },
  credits_remaining: 47
}
```

API key management:
- Keys stored in Supabase with credit balance
- Each call deducts 1 credit
- Admin top-ups credits from panel
- Usage logged in sakha_api_log

### 4.2 New Diagnostics (Expansion Products)
Owner's roadmap — each is a separate product on same platform:

**Relationship Diagnostic** (v3)
- Same PECMS × 7-Layer framework
- Applied to how someone relates to others
- Target: young adults, couples, parents
- Price: ₹149 report

**Career Diagnostic** (v4)
- PECMS × Career Alignment
- Which career fits your actual pattern (not your marks)
- Target: coaching institutes, Class 11-12 students
- Institutional: ₹10,000/month

**Teacher Empathy Diagnostic** (v5)
- For Kunaal's government school research
- Measures whether a teacher has "heart" for students
- Observer-mode (administrator rates teacher)
- Output: school-level heart index report for DM

---

## Tech Debt to Address

1. **No error boundaries** — add React ErrorBoundary components
2. **No loading states on DB calls** — add proper async UX
3. **Quiz state lost on refresh** — add localStorage backup
4. **No form validation on quiz** — currently skips unanswered (treats as 0)
5. **Admin reads all data** — add pagination for sakha_submissions
6. **No rate limiting** — add Supabase RLS or Edge Function rate limit
7. **self_declared_type not saved to DB** — small bug, add UPDATE call

---

*Document prepared for developer handover · Sakha v1 · Young Tulip*
