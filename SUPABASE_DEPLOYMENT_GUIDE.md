# 🚀 Supabase Deployment Guide - IIM Ahmedabad Chatbot

## ✅ What's Been Set Up

### Backend (Complete)
- ✅ Supabase client configuration
- ✅ Database schema (`database-setup.sql`)
- ✅ Chat history service
- ✅ API routes for chat management
- ✅ Environment variables updated

### Database Schema Includes:
- `user_profiles` - User information from Google OAuth
- `chat_sessions` - Chat conversation sessions  
- `messages` - Individual messages
- Row Level Security (RLS) policies
- Automatic functions for user creation
- Function to get last 10 chats

---

## 📋 Step-by-Step Setup

### Step 1: Set Up Supabase Database

1. **Go to your Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/lruhvniqyrdngltarfmq
   ```

2. **Navigate to SQL Editor** (left sidebar)

3. **Run the Database Setup Script**
   - Copy the entire content from `database-setup.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see:
     - `user_profiles`
     - `chat_sessions`
     - `messages`

### Step 2: Configure Google OAuth

1. **In Supabase Dashboard**, go to:
   ```
   Authentication → Providers → Google
   ```

2. **Enable Google Provider**

3. **Get Google OAuth Credentials**:
   
   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Select your project `iimachatbot`
   
   c. Go to "APIs & Services" → "Credentials"
   
   d. Click "Create Credentials" → "OAuth 2.0 Client ID"
   
   e. Application type: "Web application"
   
   f. Add Authorized redirect URI:
   ```
   https://lruhvniqyrdngltarfmq.supabase.co/auth/v1/callback
   ```
   
   g. Copy the Client ID and Client Secret

4. **Back in Supabase**, paste:
   - Client ID
   - Client Secret
   - Click "Save"

### Step 3: Update Frontend with Full Authentication

The HTML has been updated with:
- Auth modal
- Sidebar for chat history
- User profile dropdown
- Sign in/out buttons

Now you need to complete the `app.js` file. Here's the structure needed:

```javascript
import supabase from './supabase-client.js';

class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentSessionId = null;
        this.messages = [];
        
        // Initialize
        this.initializeElements();
        this.checkAuthState();
        this.attachEventListeners();
    }
    
    async checkAuthState() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            this.handleSignIn(user);
        } else {
            this.showAuthModal();
        }
    }
    
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
    }
    
    async handleSendMessage() {
        // Save to Supabase before sending to Dialogflow
        // Then send to Dialogflow
        // Then save bot response to Supabase
    }
    
    async loadChatHistory() {
        // Fetch last 10 chats from Supabase
        // Display in sidebar
    }
    
    // ... rest of methods
}
```

### Step 4: Deploy to Supabase (Option 1: Vercel)

Supabase doesn't host frontend directly, but works great with Vercel:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts**:
   - Link to existing project or create new
   - Select the `client` folder as root
   - Deploy!

### Step 5: Deploy to Supabase (Option 2: Netlify)

1. **Create `netlify.toml`** in project root:
   ```toml
   [build]
     publish = "client"
     
   [[redirects]]
     from = "/api/*"
     to = "http://your-backend-url.com/:splat"
     status = 200
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Step 6: Deploy Backend (Option 1: Railway)

1. **Install Railway CLI**:
   ```bash
   npm install -g railway-cli
   ```

2. **Login and Init**:
   ```bash
   railway login
   railway init
   ```

3. **Add Environment Variables** in Railway dashboard:
   ```
   SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
   SUPABASE_ANON_KEY=your-key
   PROJECT_ID=iimachatbot
   LOCATION=us-central1
   AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
   GOOGLE_APPLICATION_CREDENTIALS=./iimachatbot-542362f8fdae.json
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

### Step 7: Deploy Backend (Option 2: Render)

1. **Go to** [render.com](https://render.com)

2. **New Web Service**

3. **Connect your GitHub repo** (push code to GitHub first)

4. **Configure**:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Add Environment Variables** (same as above)

6. **Deploy**

---

## 🔄 Complete Workflow

### User Flow:
1. User visits site
2. Sees sign-in modal
3. Clicks "Sign in with Google"
4. Authenticates via Google OAuth
5. Redirected back to chatbot
6. Can see chat history sidebar (last 10 chats)
7. Can start new conversations
8. All messages saved to Supabase
9. Can switch between previous chats
10. Can sign out

### Technical Flow:
```
User Input → Frontend
    ↓
Save to Supabase (user message)
    ↓
Send to Dialogflow CX API
    ↓
Get Bot Response
    ↓
Save to Supabase (bot message)
    ↓
Display to User
```

---

## 📝 Environment Variables Needed

### Backend (`.env`):
```env
# Supabase
SUPABASE_URL=https://lruhvniqyrdngltarfmq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Cloud
PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
GOOGLE_APPLICATION_CREDENTIALS=./iimachatbot-542362f8fdae.json

# Server
PORT=3000
NODE_ENV=production
LANGUAGE_CODE=en
SESSION_TTL=3600
```

### Frontend (embedded in code):
```javascript
const SUPABASE_URL = 'https://lruhvniqyrdngltarfmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 🧪 Testing Locally

1. **Run the database setup SQL** in Supabase

2. **Start your server**:
   ```bash
   npm start
   ```

3. **Open** `http://localhost:3000`

4. **Test**:
   - Sign in with Google
   - Send messages
   - Check if they appear in Supabase database
   - Check chat history in sidebar

---

## 🔍 Verify Database

After sending messages, check in Supabase:

1. Go to **Table Editor**

2. Check `messages` table:
   - Should have your messages
   - Both user and bot messages

3. Check `chat_sessions` table:
   - Should have your active session

4. Check `user_profiles` table:
   - Should have your Google profile info

---

## 🎯 API Endpoints Available

### Chat History:
```
POST   /api/chat/sessions              - Create new session
GET    /api/chat/sessions              - Get last 10 sessions
GET    /api/chat/sessions/:id/messages - Get messages for session
POST   /api/chat/messages              - Save a message
PUT    /api/chat/sessions/:id          - Update session title
DELETE /api/chat/sessions/:id          - Delete session
GET    /api/chat/profile               - Get user profile
```

### Dialogflow:
```
POST   /api/dialogflow/message         - Send message to bot
POST   /api/dialogflow/reset           - Reset session
GET    /api/dialogflow/session         - Get session info
```

---

## 🚨 Common Issues & Fixes

### Issue: Google Sign-In Not Working
**Fix**: Make sure redirect URI is added in Google Cloud Console

### Issue: Database Permissions Error
**Fix**: Run the SQL setup script again to ensure RLS policies are set

### Issue: Messages Not Saving
**Fix**: Check that user is authenticated and session exists

### Issue: Can't See Chat History
**Fix**: Ensure the RPC function `get_recent_chat_sessions` was created

---

## 📊 Database Structure

```
user_profiles
├── id (UUID, primary key)
├── email (TEXT)
├── full_name (TEXT)
├── avatar_url (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

chat_sessions
├── id (UUID, primary key)
├── user_id (UUID, foreign key)
├── title (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── is_active (BOOLEAN)

messages
├── id (UUID, primary key)
├── session_id (UUID, foreign key)
├── user_id (UUID, foreign key)
├── message_text (TEXT)
├── sender_type (TEXT: 'user' or 'bot')
├── intent_detected (TEXT)
├── confidence (DECIMAL)
└── created_at (TIMESTAMP)
```

---

## ✅ Checklist

- [ ] Database schema created in Supabase
- [ ] Google OAuth configured in Supabase
- [ ] Google OAuth credentials added to Google Cloud
- [ ] Environment variables set
- [ ] Frontend app.js updated with auth logic
- [ ] Tested locally
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate (automatic with Vercel/Netlify)

---

## 🎉 What You Get

✅ **Google Authentication** - Secure sign-in
✅ **Chat History** - Last 10 conversations saved
✅ **User Profiles** - Personalized experience
✅ **Data Persistence** - Never lose your chats
✅ **Responsive UI** - Works on all devices
✅ **Secure** - Row Level Security enabled
✅ **Scalable** - Supabase handles growth
✅ **Fast** - Optimized queries and indexes

---

## 📞 Next Steps

1. **Run database setup SQL** in Supabase
2. **Configure Google OAuth**
3. **Complete the app.js** authentication logic
4. **Test locally**
5. **Deploy backend** (Railway/Render)
6. **Deploy frontend** (Vercel/Netlify)
7. **Enjoy your authenticated chatbot!**

---

**Need Help?** Check the Supabase docs:
- [Authentication](https://supabase.com/docs/guides/auth)
- [Database](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

*Your Supabase project is ready to go! Just follow the steps above.* 🚀
