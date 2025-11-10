# Database Features Architecture

## Current Setup (Simple Mode) 🟢

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Client)                    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │           index.html (UI)                  │    │
│  │  - Header with New Chat button             │    │
│  │  - Auth buttons (hidden, CSS ready)        │    │
│  │  - Chat interface (working)                │    │
│  │  - Sidebar (hidden)                        │    │
│  └────────────────────────────────────────────┘    │
│                      │                              │
│                      ↓                              │
│  ┌────────────────────────────────────────────┐    │
│  │      app-simple.js (ACTIVE)                │    │
│  │  ✅ Send/receive messages                  │    │
│  │  ✅ Dialogflow integration                 │    │
│  │  ❌ No authentication                      │    │
│  │  ❌ No database                            │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│              Node.js Server (port 3000)              │
│  ┌────────────────────────────────────────────┐    │
│  │     /api/dialogflow/message                │    │
│  │  ✅ Working perfectly                      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │     /api/chat/* (7 endpoints)              │    │
│  │  💤 Ready but unused                       │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │  Dialogflow CX Agent     │
        │  ✅ Responding perfectly │
        └──────────────────────────┘
```

---

## After Enabling Database (Full Mode) 🚀

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser (Client)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 index.html (UI)                      │      │
│  │  - Header with Sign In button (visible) ───────┐    │      │
│  │  - User profile + Sign Out (after auth)        │    │      │
│  │  - Sidebar with chat history (visible)         │    │      │
│  │  - Auth modal (beautiful, shows on click)      │    │      │
│  └──────────────────────────────────────────────────────┘      │
│                         │                        │              │
│                         ↓                        │              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         app-with-db.js (ACTIVE)              │      │      │
│  │  ✅ Send/receive messages                    │      │      │
│  │  ✅ Dialogflow integration                   │      │      │
│  │  ✅ Google authentication                    │      │      │
│  │  ✅ Save chats to database                   │      │      │
│  │  ✅ Load last 10 conversations               │      │      │
│  │  ✅ Click to open previous chats             │      │      │
│  └──────────────────────────────────────────────────────┘      │
│                         │                        │              │
│                         │                        │              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │       supabase-client.js (imported)          │      │      │
│  │  - Initializes Supabase connection  ←────────┘      │      │
│  │  - Handles auth state                               │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                         │                        │
                         ↓                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Node.js Server (port 3000)                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │       /api/dialogflow/message                        │      │
│  │  ✅ Send messages to Dialogflow                      │      │
│  │  ✅ Get bot responses                                │      │
│  └──────────────────────────────────────────────────────┘      │
│                         │                                        │
│  ┌──────────────────────────────────────────────────────┐      │
│  │       /api/chat/* (7 endpoints) - NOW ACTIVE         │      │
│  │  ✅ POST /sessions - Create new chat                 │      │
│  │  ✅ GET  /sessions - Get last 10 chats               │      │
│  │  ✅ GET  /sessions/:id/messages - Load chat          │      │
│  │  ✅ PUT  /sessions/:id - Update chat title           │      │
│  │  ✅ DELETE /sessions/:id - Delete chat               │      │
│  │  ✅ POST /messages - Save message                    │      │
│  │  ✅ Verifies JWT token from Supabase                 │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ↓                    ↓                    ↓
┌────────────────┐   ┌────────────────────┐   ┌──────────────┐
│  Dialogflow CX │   │  Supabase Auth     │   │  Supabase DB │
│  Agent         │   │  - Google OAuth    │   │  Tables:     │
│  ✅ Responses  │   │  - JWT tokens      │   │  - users     │
└────────────────┘   │  - Session mgmt    │   │  - sessions  │
                     └────────────────────┘   │  - messages  │
                                              └──────────────┘
```

---

## Data Flow Example (After Database Enabled)

### Scenario: User sends "Tell me about IIMA programs"

```
1. USER TYPES MESSAGE
   ↓
2. app-with-db.js
   - Adds message to UI immediately
   - Sends to backend: POST /api/dialogflow/message
   - Also saves: POST /api/chat/messages (with session_id)
   ↓
3. SERVER
   - Forwards to Dialogflow CX Agent
   - Gets response from Dialogflow
   - Returns to client
   ↓
4. app-with-db.js
   - Displays bot response in UI
   - Saves bot response: POST /api/chat/messages
   - Updates session title if first message
   ↓
5. SUPABASE DATABASE
   - messages table: 2 new rows (user + bot)
   - chat_sessions: title updated
   - Sidebar automatically refreshes
```

---

## File Relationships

```
ACTIVE NOW (Simple Mode):
  index.html ──loads──> app-simple.js ──calls──> /api/dialogflow/*
  
AFTER SWITCH (Full Mode):
  index.html ──loads──> app-with-db.js ──imports──> supabase-client.js
                             │                             │
                             ├──calls──> /api/dialogflow/* │
                             ├──calls──> /api/chat/*       │
                             └──────────────────────────────┘
                                   Both use Supabase
```

---

## Database Schema (After Running database-setup.sql)

```
┌─────────────────────────────────┐
│      user_profiles              │
│  - id (UUID, linked to auth)    │
│  - email                        │
│  - full_name                    │
│  - avatar_url                   │
│  - created_at                   │
└─────────────────────────────────┘
              │
              │ one-to-many
              ↓
┌─────────────────────────────────┐
│      chat_sessions              │
│  - id (UUID)                    │
│  - user_id ───┐                 │
│  - title      │                 │
│  - created_at │                 │
│  - updated_at │                 │
└───────────────┼─────────────────┘
                │
                │ one-to-many
                ↓
┌─────────────────────────────────┐
│         messages                │
│  - id (UUID)                    │
│  - session_id                   │
│  - user_id                      │
│  - message_text                 │
│  - sender_type (user/bot)       │
│  - intent_detected              │
│  - confidence                   │
│  - created_at                   │
└─────────────────────────────────┘

+ RLS Policies (Row Level Security)
  - Users can only see their own data
  - Enforced at database level
```

---

## What Changes When You Switch

### In Browser:
- ❌ Remove: `<script src="app-simple.js"></script>`
- ✅ Add: `<script type="module" src="app-with-db.js"></script>`

### What Happens:
1. **Supabase loads** → Checks if user signed in
2. **If signed in** → Show user profile, load chat history
3. **If not signed in** → Show "Sign In" button
4. **User can still use as guest** → Everything works normally
5. **After sign in** → All messages auto-saved, history appears

### User Experience:
```
BEFORE:
  Open page → Start chatting → Works perfectly
  Close tab → Messages lost
  Reopen → Start fresh

AFTER:
  Open page → See "Sign In" button → Can ignore and chat as guest
  OR click "Sign In" → Google OAuth → Profile appears
  Chat messages → Auto-saved to database
  Close tab → Messages preserved
  Reopen → See "Chat History" → Click to resume old conversations
  Last 10 chats always available
```

---

## Safety & Rollback

### If Database Breaks:
1. Open `index.html`
2. Change ONE line:
   ```html
   <script type="module" src="app-with-db.js"></script>
   <!-- Change back to: -->
   <script src="app-simple.js"></script>
   ```
3. Refresh browser
4. **Instantly back to working state** ✅

### Guest Mode Fallback:
Even with database enabled, if:
- Supabase not configured
- Auth fails
- Database unavailable

The app automatically falls back to guest mode (works like simple version).

---

## Summary

**Current State**: Rock-solid simple chatbot ✅
**Next Step**: Enable database features (optional, safe)
**Fallback**: One line change to revert
**Risk**: Minimal - guest mode always works
**Benefit**: Save conversations, chat history, multi-device sync

Ready when you are! 🚀
