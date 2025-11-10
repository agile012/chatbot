# 🚀 Setup Checklist - IIM Ahmedabad Chatbot

Use this checklist to set up your Supabase-powered chatbot with Google authentication and chat history.

---

## ✅ Step 1: Database Setup (5 minutes)

- [ ] Open your Supabase dashboard: https://supabase.com/dashboard/project/lruhvniqyrdngltarfmq
- [ ] Go to **SQL Editor** (left sidebar)
- [ ] Open the `database-setup.sql` file from your project
- [ ] Copy all content and paste into SQL Editor
- [ ] Click **Run** to execute
- [ ] Go to **Table Editor** to verify these tables exist:
  - `user_profiles`
  - `chat_sessions`
  - `messages`

**Result:** ✅ Database schema created with Row Level Security enabled

---

## ✅ Step 2: Google OAuth Configuration (10 minutes)

### 2A: Get Google Credentials

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Select your project: `iimachatbot`
- [ ] Navigate to: **APIs & Services** → **Credentials**
- [ ] Click **Create Credentials** → **OAuth 2.0 Client ID**
- [ ] Application type: **Web application**
- [ ] Name it: `IIM Ahmedabad Chatbot`
- [ ] Under **Authorized redirect URIs**, add:
  ```
  https://lruhvniqyrdngltarfmq.supabase.co/auth/v1/callback
  ```
- [ ] Click **Create**
- [ ] **Copy** the Client ID and Client Secret

### 2B: Configure in Supabase

- [ ] In Supabase dashboard, go to: **Authentication** → **Providers**
- [ ] Find **Google** and click to enable
- [ ] Paste your **Client ID** from Google
- [ ] Paste your **Client Secret** from Google
- [ ] Click **Save**

**Result:** ✅ Google sign-in is now enabled

---

## ✅ Step 3: Test Locally (5 minutes)

- [ ] Open terminal in your project folder
- [ ] Run: `npm start`
- [ ] Open browser to: `http://localhost:3000`
- [ ] You should see a Google sign-in modal
- [ ] Click **Sign in with Google**
- [ ] Sign in with your Google account
- [ ] You should be redirected back to the chat interface
- [ ] Send a test message
- [ ] Check if it appears in the chat

**Result:** ✅ Local testing successful

---

## ✅ Step 4: Verify Database (2 minutes)

- [ ] In Supabase dashboard, go to **Table Editor**
- [ ] Click on **user_profiles** table
  - [ ] Your Google profile should be there
- [ ] Click on **chat_sessions** table
  - [ ] You should see your active session
- [ ] Click on **messages** table
  - [ ] Your test messages should be saved

**Result:** ✅ Data is being saved correctly

---

## ✅ Step 5: Deploy Backend (15 minutes)

### Option A: Railway (Recommended)

- [ ] Install Railway CLI: `npm install -g railway-cli`
- [ ] Login: `railway login`
- [ ] Initialize: `railway init`
- [ ] Link or create new project
- [ ] Add environment variables in Railway dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `PROJECT_ID`
  - `LOCATION`
  - `AGENT_ID`
  - `GOOGLE_APPLICATION_CREDENTIALS` (paste JSON content)
- [ ] Deploy: `railway up`
- [ ] Copy your backend URL (e.g., `https://your-app.railway.app`)

### Option B: Render

- [ ] Go to [render.com](https://render.com)
- [ ] Click **New** → **Web Service**
- [ ] Connect your GitHub repo
- [ ] Configure:
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Copy your backend URL

**Result:** ✅ Backend is deployed and accessible

---

## ✅ Step 6: Deploy Frontend (10 minutes)

### Option A: Vercel (Recommended)

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Navigate to your `client` folder: `cd client`
- [ ] Run: `vercel`
- [ ] Follow the prompts:
  - Link to existing project? No
  - Project name: `iima-chatbot`
  - Directory: `./` (current folder)
- [ ] Deploy
- [ ] Copy your frontend URL

### Option B: Netlify

- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Navigate to your `client` folder: `cd client`
- [ ] Run: `netlify deploy --prod`
- [ ] Select or create site
- [ ] Publish directory: `./`
- [ ] Deploy
- [ ] Copy your frontend URL

**Result:** ✅ Frontend is live

---

## ✅ Step 7: Update Frontend API URL (3 minutes)

- [ ] Open `client/app.js`
- [ ] Find the API calls (e.g., `/api/dialogflow/message`)
- [ ] Replace with your backend URL:
  ```javascript
  // Before:
  const response = await fetch('/api/dialogflow/message', {
  
  // After:
  const response = await fetch('https://your-backend-url.railway.app/api/dialogflow/message', {
  ```
- [ ] Do this for all API endpoints:
  - `/api/dialogflow/message`
  - `/api/dialogflow/reset`
  - `/api/chat/sessions`
  - `/api/chat/messages`
  - etc.
- [ ] Redeploy frontend: `vercel --prod` or `netlify deploy --prod`

**Result:** ✅ Frontend connected to deployed backend

---

## ✅ Step 8: Update Google OAuth Redirect (2 minutes)

- [ ] In [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Go to your OAuth credentials
- [ ] Add your frontend URL to **Authorized redirect URIs**:
  ```
  https://your-app.vercel.app
  ```
- [ ] Save

**Result:** ✅ Google OAuth works on production

---

## ✅ Step 9: Final Testing (5 minutes)

- [ ] Open your production URL
- [ ] Sign in with Google
- [ ] Send multiple messages
- [ ] Check sidebar for chat history
- [ ] Start a new chat
- [ ] Switch between chats
- [ ] Delete a chat
- [ ] Sign out and sign back in
- [ ] Verify your chats are still there

**Result:** ✅ Everything works in production!

---

## 🎉 You're Done!

Your IIM Ahmedabad chatbot is now:
- ✅ Deployed and live
- ✅ Using Google authentication
- ✅ Saving chat history (last 10 chats)
- ✅ Connected to Dialogflow CX
- ✅ Looking professional with IIMA navy blue branding

---

## 📊 What You Have

### Frontend
- URL: `https://your-app.vercel.app`
- Hosting: Vercel or Netlify
- Framework: Vanilla JavaScript

### Backend
- URL: `https://your-app.railway.app`
- Hosting: Railway or Render
- Framework: Node.js + Express

### Database
- Provider: Supabase (PostgreSQL)
- Tables: users, sessions, messages
- Security: Row Level Security enabled

### Authentication
- Provider: Google OAuth
- Managed by: Supabase Auth

---

## 🔧 Troubleshooting

### Can't sign in with Google
- Check that Google OAuth is enabled in Supabase
- Verify redirect URI in Google Cloud Console
- Make sure client ID and secret are correct

### Messages not saving
- Check Supabase connection in backend
- Verify environment variables are set
- Check browser console for errors

### Chat history not loading
- Ensure database schema was run
- Check that RLS policies are created
- Verify user is authenticated

### Backend not responding
- Check that service is running
- Verify environment variables
- Check service logs for errors

---

## 📞 Need Help?

Check these resources:
- [Supabase Docs](https://supabase.com/docs)
- [Dialogflow CX Docs](https://cloud.google.com/dialogflow/cx/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

**Created:** December 2024  
**Last Updated:** December 2024  
**Status:** Ready for Production 🚀
