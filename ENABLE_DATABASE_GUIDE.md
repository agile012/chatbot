# Enable Supabase Database Features - Step-by-Step Guide

This guide will help you enable authentication and chat history features in your chatbot.

## Current Status ✅
- ✅ Simple chatbot working perfectly (no auth, no database)
- ✅ Beautiful UI with IIMA branding
- ✅ All database code is ready but **disabled**
- ✅ Auth modal designed and ready

## Prerequisites Checklist

Before enabling database features, ensure you have:
- [ ] Supabase project created (URL: `lruhvniqyrdngltarfmq.supabase.co`)
- [ ] Supabase anon key available
- [ ] Google OAuth credentials ready
- [ ] Admin access to Supabase dashboard

---

## Step 1: Set Up Database Schema

### 1.1 Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### 1.2 Run Database Setup Script
1. Open the file `database-setup.sql` from your project
2. Copy **ALL** contents (entire file)
3. Paste into Supabase SQL Editor
4. Click **"RUN"** button
5. Wait for success message: ✓ Success. No rows returned

### 1.3 Verify Tables Created
1. Click **"Table Editor"** in left sidebar
2. You should see 3 new tables:
   - `user_profiles`
   - `chat_sessions`
   - `messages`

---

## Step 2: Configure Google OAuth

### 2.1 In Supabase Dashboard
1. Click **"Authentication"** → **"Providers"**
2. Find **"Google"** and click to expand
3. **Enable** the toggle switch

### 2.2 Google OAuth Credentials
If you already have credentials:
1. Enter your **Client ID**
2. Enter your **Client Secret**
3. Click **"Save"**

If you need to create credentials:
1. Go to https://console.cloud.google.com
2. Select project `iimachatbot`
3. Go to **APIs & Services** → **Credentials**
4. Find OAuth 2.0 Client IDs or create new one
5. Add authorized redirect URIs:
   ```
   https://lruhvniqyrdngltarfmq.supabase.co/auth/v1/callback
   http://localhost:3000/auth/v1/callback
   ```
6. Copy Client ID and Secret to Supabase

### 2.3 Configure Site URL
1. In Supabase: **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**:
   ```
   http://localhost:3000
   http://localhost:3000/
   ```
4. Click **"Save"**

---

## Step 3: Update Environment Variables

### 3.1 Check Server .env File
Make sure your server has these variables:
```env
SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
```

### 3.2 Get Keys from Supabase
1. Go to **Project Settings** → **API**
2. Copy **Project URL** (should match above)
3. Copy **anon/public key** → use as SUPABASE_KEY
4. Copy **service_role key** → use as SUPABASE_SERVICE_KEY
5. Update your `.env` file with these values

---

## Step 4: Update Client Supabase Configuration

### 4.1 Update supabase-client.js
Open `client/supabase-client.js` and verify:
```javascript
const supabaseUrl = 'https://lruhvniqyrdngltarfmq.supabase.co';
const supabaseKey = 'your_supabase_anon_key_here'; // ← Update this!
```

Replace the anon key with your actual key from Step 3.2

---

## Step 5: Enable Database-Enabled App

### 5.1 Switch JavaScript File
Open `client/index.html` and find line ~196:
```html
<script src="app-simple.js"></script>
```

Change it to:
```html
<script type="module" src="app-with-db.js"></script>
```

⚠️ **Important**: Add `type="module"` because the new file uses ES6 imports.

### 5.2 Verify Script Loads Supabase
The new `app-with-db.js` imports supabase-client, so make sure:
- `client/supabase-client.js` exists
- Supabase key is configured
- File uses `export default` syntax

---

## Step 6: Add Sign In/Sign Out Buttons

### 6.1 Update Header HTML
In `client/index.html`, find the header section with `<div class="header-actions">`.

Add this **after** the "New Chat" button:
```html
<!-- User Profile (shown when signed in) -->
<div class="user-profile" id="userProfile" style="display: none;">
    <img id="userAvatar" class="user-avatar" alt="User Avatar">
    <span id="userName" class="user-name">User</span>
    <button class="sign-out-btn" id="signOutBtn">Sign Out</button>
</div>

<!-- Sign In Button (shown when signed out) -->
<button class="sign-in-btn" id="signInBtnHeader" title="Sign In">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
    </svg>
    <span>Sign In</span>
</button>
```

### 6.2 Add CSS for Auth Buttons
Add to `client/styles.css`:
```css
/* User Profile */
.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #fff;
}

.user-name {
    color: #fff;
    font-weight: 500;
    font-size: 14px;
}

.sign-out-btn {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.sign-out-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.sign-in-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sign-in-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
}
```

### 6.3 Connect Sign In Button to Modal
In `app-with-db.js`, add event listener in `attachEventListeners()`:
```javascript
// Header sign in button
const signInBtnHeader = document.getElementById('signInBtnHeader');
if (signInBtnHeader) {
    signInBtnHeader.addEventListener('click', () => this.showAuthModal());
}
```

---

## Step 7: Restart Server

### 7.1 Stop Current Server
If server is running in terminal:
1. Press `Ctrl+C` to stop
2. Wait for process to terminate

### 7.2 Restart with New Configuration
```bash
npm start
```

OR if using nodemon:
```bash
npm run dev
```

---

## Step 8: Test Database Features

### 8.1 Test Sign In Flow
1. Open http://localhost:3000
2. Click **"Sign In"** button in header
3. Beautiful modal should appear
4. Click **"Continue with Google"**
5. Complete Google OAuth flow
6. Should redirect back to chatbot
7. Check:
   - User profile appears in header (avatar + name)
   - Sign Out button visible
   - Sidebar appears (chat history section)

### 8.2 Test Chat History
1. Send a message to the bot
2. Get a response
3. Check Supabase **Table Editor**:
   - `chat_sessions`: Should have 1 row
   - `messages`: Should have 2 rows (user + bot)
4. Start new chat (click "New Chat")
5. Send another message
6. Sidebar should show 2 conversations

### 8.3 Test Session Loading
1. Click on a previous chat in sidebar
2. Messages should load from database
3. Current chat should be marked as active
4. Continue conversation (new messages saved to same session)

### 8.4 Test Sign Out
1. Click **"Sign Out"** button
2. Should see toast: "Signed out successfully"
3. UI should reset:
   - No user profile visible
   - Sidebar hidden
   - Messages cleared
   - Welcome screen shown

---

## Troubleshooting

### ❌ Error: "Failed to load Supabase"
**Solution**: Check `supabase-client.js` has correct URL and anon key

### ❌ Error: "Auth not configured"
**Solution**: 
1. Verify Google OAuth is enabled in Supabase
2. Check redirect URLs are correct
3. Make sure Site URL is set

### ❌ Error: "Failed to load chat history"
**Solution**: 
1. Verify database schema was run successfully
2. Check RLS policies are created
3. Make sure user is authenticated

### ❌ Modal doesn't appear on Sign In
**Solution**: Check CSS - auth modal should not have `display: none` by default

### ❌ "TypeError: Cannot read properties of null"
**Solution**: Make sure all HTML elements exist (user profile, sign in button, etc.)

### ❌ Messages not saving to database
**Solution**:
1. Check browser console for errors
2. Verify `currentSessionId` is set
3. Check server logs for database errors
4. Ensure JWT token is being sent correctly

---

## Rollback Plan (If Something Breaks)

If you encounter issues and want to revert:

### Quick Rollback
1. Open `client/index.html`
2. Change back to:
   ```html
   <script src="app-simple.js"></script>
   ```
3. Refresh browser
4. Simple working chatbot restored ✅

---

## Success Criteria

When everything works, you should have:
- ✅ Google sign-in button in header
- ✅ Beautiful auth modal appears on click
- ✅ OAuth flow completes successfully
- ✅ User profile shown with avatar and name
- ✅ Sidebar with chat history (last 10 chats)
- ✅ Messages automatically save to database
- ✅ Click previous chat to reload conversation
- ✅ Sign out works and clears everything
- ✅ Can use as guest without signing in

---

## Support

If you get stuck:
1. Check browser console for errors (F12 → Console tab)
2. Check server logs in terminal
3. Verify Supabase dashboard shows tables and data
4. Test each step individually before moving to next

**Remember**: You can always rollback to simple version if needed!
