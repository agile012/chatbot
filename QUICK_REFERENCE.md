# 🎯 Quick Reference Card

**IIM Ahmedabad Chatbot - Supabase Integration**

---

## 🚀 Quick Start (3 Steps)

```bash
# 1. Run database setup in Supabase SQL Editor
# Copy contents from: database-setup.sql

# 2. Configure Google OAuth
# Supabase Dashboard → Authentication → Providers → Google

# 3. Start the app
npm start
# Visit: http://localhost:3000
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `database-setup.sql` | Database schema to run in Supabase |
| `SETUP_CHECKLIST.md` | Step-by-step setup guide |
| `SUPABASE_DEPLOYMENT_GUIDE.md` | Full deployment instructions |
| `ENV_REFERENCE.md` | All environment variables explained |
| `client/app.js` | Frontend logic with auth |
| `server/routes/chat.js` | Chat history API |
| `server/services/chatHistory.js` | Database operations |

---

## 🔧 What's New

### ✅ Completed
- ✅ Google Authentication (Supabase Auth)
- ✅ Chat History (Last 10 chats)
- ✅ User Profiles (Auto-created from Google)
- ✅ Message Persistence (All saved to database)
- ✅ Sidebar Navigation
- ✅ Session Management
- ✅ Navy Blue IIMA Branding

### 📝 To Do
- [ ] Run `database-setup.sql` in Supabase
- [ ] Configure Google OAuth in Supabase
- [ ] Test locally
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel/Netlify)

---

## 🗄️ Database Tables

```
user_profiles     → Google account info
chat_sessions     → Conversation sessions  
messages          → Individual messages
```

**Security:** Row Level Security (RLS) enabled ✅

---

## 🔌 API Endpoints

### Dialogflow
```
POST /api/dialogflow/message    Send message
POST /api/dialogflow/reset      New conversation
```

### Chat History
```
GET  /api/chat/sessions         Get last 10 chats
POST /api/chat/sessions         Create new session
GET  /api/chat/sessions/:id/messages  Load conversation
POST /api/chat/messages         Save message
PUT  /api/chat/sessions/:id     Update title
DELETE /api/chat/sessions/:id   Delete chat
```

---

## 🎨 UI Components

```
✅ Auth Modal       - Google sign-in
✅ Sidebar          - Chat history (last 10)
✅ User Profile     - Avatar + dropdown
✅ Chat Interface   - Messages + input
✅ Toast Messages   - Notifications
```

---

## 🔐 Authentication Flow

```
1. User visits site
2. Auth modal appears
3. Click "Sign in with Google"
4. Google OAuth flow
5. Redirected back to chat
6. Profile auto-created in Supabase
7. Chat history loads
8. Ready to chat!
```

---

## 💾 Data Flow

```
User Message
    ↓
Save to Supabase (user message)
    ↓
Send to Dialogflow CX
    ↓
Bot Response
    ↓
Save to Supabase (bot message)
    ↓
Display to User
```

---

## 🎯 Priority Tasks

### 1. Database Setup (5 min)
```
1. Open Supabase Dashboard
2. SQL Editor
3. Paste database-setup.sql
4. Run
```

### 2. Google OAuth (10 min)
```
1. Google Cloud Console → OAuth Credentials
2. Add redirect: https://lruhvniqyrdngltarfmq.supabase.co/auth/v1/callback
3. Copy Client ID + Secret
4. Supabase → Authentication → Google
5. Paste credentials
6. Save
```

### 3. Test (5 min)
```
1. npm start
2. http://localhost:3000
3. Sign in with Google
4. Send messages
5. Check Supabase Table Editor
```

---

## 📊 Project Stats

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript (ES6 modules)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Google OAuth (Supabase Auth)
- **AI:** Dialogflow CX
- **LOC:** ~1500 lines
- **Files Created:** 15+

---

## 🐛 Quick Fixes

**Can't sign in?**
→ Check Google OAuth redirect URI

**Messages not saving?**
→ Verify database schema was run

**Chat history not loading?**
→ Check if user is authenticated

**Backend not responding?**
→ Verify environment variables

---

## 📞 Need Help?

1. Check `SETUP_CHECKLIST.md` for step-by-step guide
2. Read `SUPABASE_DEPLOYMENT_GUIDE.md` for deployment
3. See `ENV_REFERENCE.md` for environment variables
4. Review code comments in `app.js` and `chat.js`

---

## 🚀 Deployment Quick Guide

### Backend (Railway)
```bash
railway login
railway init
railway up
```

### Frontend (Vercel)
```bash
cd client
vercel --prod
```

Then update API URLs in `app.js` to point to deployed backend.

---

## ✅ Testing Checklist

- [ ] Sign in with Google works
- [ ] Messages appear in chat
- [ ] Messages saved to Supabase
- [ ] Chat history loads in sidebar
- [ ] Can switch between chats
- [ ] Can delete chats
- [ ] Can start new chat
- [ ] Sign out works
- [ ] Sign back in shows history

---

## 🎉 Features Delivered

| Feature | Status |
|---------|--------|
| Chat Interface | ✅ Done |
| Dialogflow Integration | ✅ Done |
| Google Authentication | ✅ Done |
| Chat History (Last 10) | ✅ Done |
| Message Persistence | ✅ Done |
| User Profiles | ✅ Done |
| Sidebar Navigation | ✅ Done |
| IIMA Branding | ✅ Done |
| Responsive Design | ✅ Done |
| Security (RLS) | ✅ Done |

---

## 📈 Next Steps

**Immediate (Required):**
1. Run database schema in Supabase ⏰
2. Configure Google OAuth ⏰
3. Test authentication flow ⏰

**Soon (Nice to Have):**
- Deploy to production
- Custom domain setup
- Monitoring & analytics
- User feedback system

**Future (Enhancements):**
- Multi-language support
- Voice input
- File attachments
- Advanced analytics

---

## 🔑 Important URLs

**Supabase Project:**
https://supabase.com/dashboard/project/lruhvniqyrdngltarfmq

**Google Cloud Console:**
https://console.cloud.google.com/

**Dialogflow CX:**
https://dialogflow.cloud.google.com/

**Local Development:**
http://localhost:3000

---

## 💡 Pro Tips

1. **Test locally first** before deploying
2. **Check Supabase Table Editor** to verify data
3. **Use browser DevTools** to debug auth issues
4. **Keep environment variables secure**
5. **Document any custom changes**

---

## 📦 Package Dependencies

```json
{
  "@google-cloud/dialogflow-cx": "^4.5.0",
  "@supabase/supabase-js": "^2.39.0",
  "express": "^4.18.2",
  "dotenv": "^16.3.1",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "compression": "^1.7.4"
}
```

---

## 🎨 Color Palette (IIMA)

```css
Primary:   #003d82  (Navy Blue)
Dark:      #002855
Light:     #0056b3
Accent:    #0077cc
```

---

**Last Updated:** December 2024  
**Version:** 2.0.0 (Supabase Integration)  
**Status:** Ready for Setup ✨

---

*Happy Chatting! 🤖💬*
