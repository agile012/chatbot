# CRITICAL: Configure Supabase Redirect URLs

## ⚠️ Why You're Getting "Can't Connect to localhost:3000"

Supabase is redirecting users back to `localhost:3000` because **your production domain is NOT configured in Supabase's redirect URL whitelist**.

Supabase only allows redirects to URLs you explicitly permit in your dashboard.

---

## 🔧 Step-by-Step Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Sign in with your account
3. Click on your project: **iimachatbot** (or whatever your project name is)

### Step 2: Navigate to Authentication Settings
1. In the left sidebar, click: **Authentication**
2. Then click: **Settings** (gear icon at bottom of left menu)
3. Scroll down to find: **URL Configuration** section

### Step 3: Add Your Production Domain

In the **Redirect URLs** section, you will see a text box or list. Add these URLs:

**For HTTP (development/testing)**:
```
http://chatbot.iima.ac.in:3000
```

**For HTTPS (production - recommended)**:
```
https://chatbot.iima.ac.in
```

**You can also keep localhost for local testing**:
```
http://localhost:3000
http://localhost:3000/
```

### Step 4: Save Changes
- Click the **Save** button (should be at the bottom right)
- You should see a green notification: "Settings saved successfully"

### Step 5: Verify It Worked

1. Go back to your browser: `https://chatbot.iima.ac.in` (or `http://chatbot.iima.ac.in:3000` for testing)
2. Open DevTools: Press F12 → Console tab
3. Click "Sign In" button
4. You should see in console:
   ```
   📍 Production domain detected, redirect URL: https://chatbot.iima.ac.in
   ```
5. Google OAuth popup should appear
6. After you sign in, you should be redirected back to `chatbot.iima.ac.in` (NOT localhost)

---

## 📸 Screenshots of Where to Click

### In Supabase Dashboard:

1. **Left Sidebar** → Click "Authentication"
2. **Settings gear icon** (bottom of left sidebar)
3. **Scroll down** to "URL Configuration"
4. **Redirect URLs** section - add your domains
5. **Save** button

---

## ✅ Checklist Before Testing

- [ ] Logged into https://supabase.com/dashboard
- [ ] Navigated to your project
- [ ] Clicked Authentication → Settings
- [ ] Found "Redirect URLs" section
- [ ] Added `https://chatbot.iima.ac.in` (or your domain)
- [ ] Clicked Save
- [ ] Saw green "Settings saved" notification
- [ ] Restarted Node.js server on your server machine

---

## 🚀 After Configuring Supabase

### On Your Server Machine:
1. Pull latest code:
   ```bash
   cd /path/to/GAIM-CP
   git pull origin main
   ```

2. Restart the server:
   ```bash
   pkill -f 'node server'
   npm start
   ```

3. Or if using PM2:
   ```bash
   pm2 restart chatbot
   ```

### In Your Browser:
1. Open: `https://chatbot.iima.ac.in`
2. Click "Sign In"
3. **Should redirect to Google OAuth**, then back to your domain (NOT localhost)

---

## 🔍 If It Still Doesn't Work

### Check 1: Verify Redirect URL was Saved
1. Go back to Supabase Dashboard → Authentication → Settings
2. Scroll to "Redirect URLs"
3. Confirm your domain is listed there
4. If not, go back to Step 3 and add it again

### Check 2: Check Browser Console Errors
1. Open F12 → Console tab
2. Click "Sign In"
3. Look for errors like:
   - `Invalid redirect_uri: https://chatbot.iima.ac.in not in whitelist`
   - This means Supabase didn't save your URL

### Check 3: Check If Apache Proxy is Working
```bash
# SSH to your server and test:
curl -I http://chatbot.iima.ac.in/api/health
# Should return: HTTP/1.1 200 OK
```

### Check 4: Clear Browser Cache
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear cookies and cached images
3. Try Sign In again

---

## 📋 Current Supabase Settings

**Your Supabase Project:**
- **URL**: https://lruhvniqyrdngltarfmq.supabase.co
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (in your `.env`)

**What to Add to Redirect URLs:**
- `https://chatbot.iima.ac.in` (MAIN - production)
- `http://chatbot.iima.ac.in:3000` (testing)
- `http://localhost:3000` (local development)

---

## 🎯 Common Redirect URL Mistakes

❌ **Wrong** - using IP address only:
```
http://192.168.1.100:3000
```
**Should be** - your domain:
```
http://chatbot.iima.ac.in:3000
```

❌ **Wrong** - adding a path:
```
https://chatbot.iima.ac.in/auth/callback
```
**Should be** - just the domain:
```
https://chatbot.iima.ac.in
```

❌ **Wrong** - typo in domain:
```
https://chatbot.iima.co.in  (missing 'ac')
```
**Should be** - exact domain:
```
https://chatbot.iima.ac.in
```

---

## 🔄 If You Need to Also Configure Google OAuth

If you created your own Google OAuth credentials (not using Supabase's built-in Google auth):

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click to edit
4. Add to **Authorized redirect URIs**:
   ```
   https://lruhvniqyrdngltarfmq.supabase.co/auth/v1/callback
   ```
   (This is Supabase's callback URL; Supabase will then redirect to your app)
5. Save

---

## 💡 How OAuth Flow Works

```
User clicks "Sign In"
    ↓
Your app redirects to Google/Supabase with redirect_uri=https://chatbot.iima.ac.in
    ↓
Google/Supabase checks: Is this domain in my whitelist?
    - If YES → User signs in
    - If NO → Error (what you're seeing)
    ↓
After sign in, Google/Supabase redirects back to: https://chatbot.iima.ac.in?code=...
    ↓
Your app exchanges the code for a session
    ↓
User is logged in! 🎉
```

**The error you're seeing means Supabase is trying to redirect to `localhost:3000` because that's the ONLY domain currently allowed.**

---

## ✨ After This Works

Once Sign In works:
1. User will be logged in
2. Chat history sidebar will load
3. You can send messages to the chatbot
4. Messages will be saved to Supabase

If chat doesn't work after sign in, check:
- Dialogflow is configured and responding
- Node.js server logs for errors
- Browser console for API errors

---

## Quick Help

**Got confused?** Just remember:
1. Supabase Dashboard
2. Authentication → Settings
3. Add your domain to Redirect URLs
4. Save
5. Test Sign In

That's it! The code changes have already been deployed.
