# ⚡ QUICK FIX - OAuth Not Working

## 🚨 Problem
After deploying to `chatbot.iima.ac.in`, clicking "Sign In" tries to redirect to `localhost:3000` and fails.

## ✅ Solution
**Add your domain to Supabase's Redirect URL whitelist** (5 minutes)

---

## 🔧 DO THIS NOW

### 1. Open Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Go to Settings
```
Project → Authentication → Settings (gear icon)
```

### 3. Find "Redirect URLs"
Scroll down in Settings page

### 4. Add These URLs
Copy-paste into the Redirect URLs field:

```
https://chatbot.iima.ac.in
http://chatbot.iima.ac.in:3000
http://localhost:3000
```

### 5. Click Save
Green notification = success ✓

### 6. Restart Server
```bash
pkill -f 'node server'
npm start
```

### 7. Test Sign In
- Open: `https://chatbot.iima.ac.in`
- Click "Sign In"
- Google popup should appear
- After signing in, should return to your domain (NOT localhost)

---

## ✨ That's It!

If it still doesn't work, see `SUPABASE_REDIRECT_CONFIG.md` for detailed troubleshooting.

---

## 📋 What We Fixed in Code

1. **`server/index.js`** - Added `app.set('trust proxy', true)` so Express understands Apache headers
2. **`client/app-with-db.js`** - Updated OAuth to send `https://chatbot.iima.ac.in` as redirect URL instead of localhost

**But Supabase MUST whitelist this domain or it will reject the redirect.**

That's why this guide is critical! 👆
