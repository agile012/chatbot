# 🔐 Enable Row Level Security (RLS) in Supabase

## What is RLS?
Row Level Security (RLS) is a security feature that restricts what data each user can see/edit. It's ALREADY enabled on your tables (that's why you got the error!). 

## Check RLS Status

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor** (left menu)

### Step 2: Check Your Tables
You should see 3 tables:
- ✅ `chat_sessions`
- ✅ `messages`
- ✅ `user_profiles`

### Step 3: Check RLS Status
1. Click on `chat_sessions` table
2. At the top, look for: **"RLS is ON"** or **"RLS is OFF"**
3. If it says **"RLS is ON"** → ✅ Already enabled!

---

## If RLS is OFF (needs to be enabled)

### To Enable RLS:
1. Click on the table (`chat_sessions`)
2. Click the **3-dot menu** (top right)
3. Click **"Enable RLS"**
4. Repeat for `messages` and `user_profiles` tables

---

## The REAL Issue: Get the Service Role Key

The RLS error happens because we're using the wrong key. We need the **Secret/Service Role key**, not the Publishable key.

### Step 1: Go to API Settings
1. In Supabase: **Project Settings** (gear icon) → **API**
2. You'll see two sections:
   - **Publishable key** (safe for browser) ← You found this
   - **Secret key** (for server only!) ← This is what we need

### Step 2: Find Secret Key
1. Look for section labeled **"secret"** or **"Service role"**
2. You should see a key that looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`
3. Click **Copy** icon

### Step 3: Add to .env
```bash
SUPABASE_SERVICE_KEY=<paste_the_secret_key_here>
```

---

## Visual Guide

### In Supabase Dashboard:

```
Project Settings → API
│
├── Publishable key (safe to share)
│   Key: sb_publishable_8FsDIUjt2huHSmdL2ITJjQ_HkMhePbU
│   ✓ Can use in browser
│
└── Secret key (PRIVATE - server only!)
    Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
    ✗ NEVER share this!
    ✗ Only use in backend (.env file)
```

---

## Your Current .env File

You have:
```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

You NEED to add:
```env
SUPABASE_SERVICE_KEY=<the_secret_key>
```

---

## Why This Matters

| Key | Purpose | Can write data? | RLS blocks it? |
|-----|---------|-----------------|----------------|
| **Publishable** | Browser/frontend | ❌ No* | ✅ Yes |
| **Secret** | Server/backend | ✅ Yes | ❌ No (bypasses RLS) |

*Only if RLS policies allow it

The server needs the **Secret key** to create/update records and bypass the RLS policy.

---

## Quick Checklist

- [ ] Go to Supabase Project Settings → API
- [ ] Scroll down to find **Secret** or **Service role** section
- [ ] Copy the secret key (starts with `eyJ...`)
- [ ] Add to `.env`: `SUPABASE_SERVICE_KEY=<paste_here>`
- [ ] Restart server: `npm start`
- [ ] Test: Refresh browser, sign in, send message

---

## Still Can't Find the Secret Key?

1. Make sure you're logged into Supabase
2. Make sure you're viewing the correct project
3. Go to: Settings → API (not "Authentication" or other menu)
4. Look for a section with a **toggle** labeled "Reveal" or "Show"
5. Click it to reveal the secret key

---

## Example .env (Complete)

```env
# Google Cloud Configuration
PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc

# Google Service Account Key File Path
GOOGLE_APPLICATION_CREDENTIALS=./iimachatbot-542362f8fdae.json

# Supabase Configuration
SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydWh2bmlxeXJkbmdsdGFyZm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDMzNDcsImV4cCI6MjA3ODM3OTM0N30.dntOb-6eWK8VyF3vqgVYpaGPh5jF5SHxq7g3Q1VcSpo
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydWh2bmlxeXJkbmdsdGFyZm1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgwMzM0NywiZXhwIjoyMDc4Mzc5MzQ3fQ...

# Server Configuration
PORT=3000
NODE_ENV=development

# Language Configuration
LANGUAGE_CODE=en

# Session Configuration
SESSION_TTL=3600
```

---

**TL;DR**: You need the **Secret/Service Role key** from Supabase API settings, not the Publishable key. Add it to `.env` and restart the server. The RLS is already enabled! 🚀
