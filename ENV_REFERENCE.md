# 🔐 Environment Variables - Complete Reference

This file contains all environment variables needed for the complete Supabase-enabled chatbot.

---

## 📝 How to Use

1. Copy this file to `.env` in your project root
2. Replace all `your_*_here` placeholders with actual values
3. **Never commit this file to Git** (already in `.gitignore`)

---

## 🔑 Backend Environment Variables

Create/update `.env` in project root:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from: https://supabase.com/dashboard/project/lruhvniqyrdngltarfmq/settings/api

SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ============================================
# GOOGLE CLOUD / DIALOGFLOW CX
# ============================================
# Your Dialogflow CX agent details

PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
GOOGLE_APPLICATION_CREDENTIALS=./iimachatbot-542362f8fdae.json

# ============================================
# SERVER CONFIGURATION
# ============================================

PORT=3000
NODE_ENV=development

# ============================================
# CHAT CONFIGURATION
# ============================================

LANGUAGE_CODE=en
SESSION_TTL=3600

# ============================================
# OPTIONAL: CORS CONFIGURATION
# ============================================
# Uncomment and set for production

# ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com

# ============================================
# OPTIONAL: RATE LIMITING
# ============================================
# Requests per window

# RATE_LIMIT_WINDOW=15
# RATE_LIMIT_MAX=100
```

---

## 🌐 Frontend Environment Variables

The frontend uses hardcoded values in `client/supabase-client.js`. Update these:

```javascript
const SUPABASE_URL = 'https://lruhvniqyrdngltarfmq.supabase.co';
const SUPABASE_ANON_KEY = 'your_supabase_anon_key_here';
```

**For production**, consider using environment variables:

Create `client/.env.production`:
```env
VITE_SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## 🔍 Where to Find Each Value

### Supabase URL & Keys

1. Go to: https://supabase.com/dashboard/project/lruhvniqyrdngltarfmq
2. Click **Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`

### Google Cloud Credentials

**Already have these:**
- `PROJECT_ID`: iimachatbot
- `LOCATION`: us-central1
- `AGENT_ID`: a9d8bab5-5db3-4131-93d4-175fef446bdc
- `GOOGLE_APPLICATION_CREDENTIALS`: ./iimachatbot-542362f8fdae.json

---

## 🚀 Deployment Environment Variables

### Railway Deployment

Add these in Railway dashboard (Settings → Variables):

```
SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
GOOGLE_APPLICATION_CREDENTIALS=<paste entire JSON content>
NODE_ENV=production
PORT=${{PORT}}
```

**Note:** For `GOOGLE_APPLICATION_CREDENTIALS`, paste the entire JSON file content as a string.

### Render Deployment

Add these in Render dashboard (Environment):

```
SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
NODE_ENV=production
```

For Google credentials on Render:
1. Upload `iimachatbot-542362f8fdae.json` to your repo (in `.gitignore`)
2. Or use Render's secret files feature

### Vercel/Netlify (Frontend)

If using build-time environment variables:

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify:**
Add in **Site settings → Build & deploy → Environment**:
```
VITE_SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## 🔐 Security Notes

### ✅ Safe to Commit (Public Keys)
- `SUPABASE_URL` - Project URL is public
- `SUPABASE_ANON_KEY` - Anon key is meant for client-side use
- `PROJECT_ID`, `LOCATION`, `AGENT_ID` - Not sensitive

### ❌ Never Commit (Private Keys)
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account JSON
- `SUPABASE_SERVICE_ROLE_KEY` - If you use it
- Any custom API keys or secrets

### 🛡️ Best Practices

1. **Always use `.env` file** for local development
2. **Add `.env` to `.gitignore`** (already done)
3. **Use platform secret managers** in production (Railway Secrets, Render Secret Files, etc.)
4. **Rotate keys regularly** if compromised
5. **Use Row Level Security** in Supabase (already configured)
6. **Enable environment validation** in your code

---

## 📋 Checklist Before Deploying

- [ ] All environment variables set
- [ ] `.env` file NOT committed to Git
- [ ] Service account JSON secured
- [ ] Supabase RLS policies enabled
- [ ] Google OAuth configured
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled (optional)
- [ ] Error tracking configured (optional)

---

## 🧪 Testing Environment Variables

Add this script to `package.json`:

```json
"scripts": {
  "check-env": "node -e \"console.log('✅ Environment loaded:', !!process.env.SUPABASE_URL)\""
}
```

Run:
```bash
npm run check-env
```

---

## 📞 Troubleshooting

### Issue: Environment variables not loading

**Solution:**
```bash
# Verify .env file exists
ls -la | grep .env

# Check content (be careful not to expose secrets)
cat .env | grep -E "^[A-Z_]+"

# Restart server
npm start
```

### Issue: Supabase connection failing

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Check Supabase project is active
3. Test connection:
```bash
curl https://lruhvniqyrdngltarfmq.supabase.co/rest/v1/
```

### Issue: Dialogflow authentication failing

**Solution:**
1. Verify `GOOGLE_APPLICATION_CREDENTIALS` path
2. Check JSON file has correct permissions
3. Test service account:
```bash
gcloud auth list
```

---

## 🔄 Updating Environment Variables

### Local Development
```bash
# Edit .env file
nano .env

# Restart server
npm start
```

### Railway
```bash
railway variables set KEY=value
```

### Render
Update in dashboard or use Render CLI:
```bash
render env set KEY=value
```

### Vercel
```bash
vercel env add KEY
```

---

**Last Updated:** December 2024  
**Maintained by:** IIM Ahmedabad IT Team

---

⚠️ **IMPORTANT:** Keep this file secure. Never share or commit the actual `.env` file with real values.
