# Sakha v1.0 — Student Diagnostic Platform
By Young Tulip x PECMS Framework by Kunaal Jaiswal

## Tonight Steps

### STEP 1 - Install Node.js
Go to nodejs.org, download LTS, install. Then in terminal:
  node --version
  npm --version

### STEP 2 - Set Up Project
  cd sakha
  npm install

### STEP 3 - Set Up Supabase
1. Go to supabase.com, sign up free
2. New Project, name it sakha
3. Go to SQL Editor, paste ALL of supabase/schema.sql, click Run
4. Go to Settings > Data API, copy Project URL and Anon key

### STEP 4 - Create .env File
  cp .env.example .env
Fill in all keys (see below for where to get them free)

### STEP 5 - Test Locally
  npm run dev
Open http://localhost:5173

### STEP 6 - Deploy to Netlify
  npm run build
Drag the dist folder to netlify.com
OR connect GitHub repo in Netlify dashboard.
Add all .env variables in Netlify > Site Settings > Environment Variables.

## Free API Keys

GEMINI: aistudio.google.com > Get API Key (free)
GROQ: console.groq.com > Sign up > API Keys (free)
RAZORPAY: razorpay.com > Sign up > Dashboard > Test keys

## Admin Panel
Visit /admin on your site. Password = VITE_ADMIN_PASSWORD in .env
