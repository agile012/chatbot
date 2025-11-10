# 🔑 Get Your Supabase Service Key - Step by Step

## Why You Need It
The RLS (Row-Level Security) policy is blocking database writes because the server doesn't have admin privileges. The service key gives the server permission to bypass RLS for backend operations.

## Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project: **lruhvniqyrdngltarfmq**
3. Click **Project Settings** (gear icon, bottom left)

## Step 2: Find API Keys
1. In left menu, click **API**
2. You'll see three keys:
   - **Project URL** - This is your SUPABASE_URL (already have it ✓)
   - **anon public** - This is your SUPABASE_ANON_KEY (already have it ✓)
   - **service_role secret** - This is what you NEED! ⭐

## Step 3: Copy Service Role Key
1. Find "service_role secret" section
2. Click the copy icon (or eye icon to see it)
3. The key starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`

**⚠️ IMPORTANT: This key is PRIVATE! Never share it publicly.**

## Step 4: Add to .env File
Open your `.env` file and add this line:

```env
SUPABASE_SERVICE_KEY=<paste_the_key_you_copied_here>
```

Example (with fake key):
```env
SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

## Step 5: Restart Server
```bash
npm start
```

## Verify It Worked
1. Open browser console (F12)
2. Look for: "Supabase URL or Service Key is missing"
3. If you DON'T see it → ✅ Service key is loaded!
4. Try signing in again → Should work!

---

## Quick Copy-Paste

Here's what your final `.env` should look like:

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
SUPABASE_SERVICE_KEY=<PASTE_SERVICE_KEY_HERE>

# Server Configuration
PORT=3000
NODE_ENV=development

# Language Configuration
LANGUAGE_CODE=en

# Session Configuration
SESSION_TTL=3600
```

---

## What's the Difference?

| Key | Purpose | Can bypass RLS? |
|-----|---------|-----------------|
| **anon_key** | Frontend use | ❌ No |
| **service_role_key** | Backend use | ✅ Yes |

The frontend uses `anon_key` (already in supabase-client.js).
The backend needs `service_role_key` to create/update data.

---

## Still Having Issues?

1. **Can't find service role key?**
   - Make sure you're in Project Settings → API
   - Scroll down, it should be there

2. **Key starts with something else?**
   - Copy the full key including all dots (.)
   - Don't include quotes or extra spaces

3. **Still getting RLS error?**
   - Verify key is pasted correctly in .env
   - Make sure you restarted the server (npm start)
   - Check terminal for "Supabase URL or Service Key is missing" message

---

**Once you add the service key and restart, it should work!** 🚀
