# Live Server Deployment Guide

## Problem Identified
When deployed on a live server, the application showed only basic HTML without CSS/JS. This was due to:
1. **CORS restrictions** — hardcoded to `http://localhost:3000` only
2. **CSP (Content Security Policy)** — too restrictive, blocking static assets
3. **Relative paths** — CSS/JS links may break if served from non-root paths

## Solution Applied

### 1. Updated CORS Configuration (`server/index.js`)
- **Before**: Only allowed `http://localhost:3000` in production
- **After**: Reads `ALLOWED_ORIGIN` from `.env` for production; allows all origins in development

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGIN || 'https://your-domain.com')
    : true, // Allow all origins in development
  credentials: true
}));
```

### 2. Relaxed CSP Headers (`server/index.js`)
- Added `'unsafe-inline'` to `scriptSrc` and `scriptSrcElem` (needed for module scripts)
- Added `blob:` support for worker threads
- Made `defaultSrc` less restrictive

### 3. Added `.env` Configuration Variable
```env
ALLOWED_ORIGIN=http://localhost:3000
```

## For Live Server Deployment

### Step 1: On Your Live Server
Update the `.env` file with your actual domain:

```bash
# If deploying to example.com:
export NODE_ENV=production
export ALLOWED_ORIGIN=https://example.com

# OR add to .env file:
# NODE_ENV=production
# ALLOWED_ORIGIN=https://example.com
```

### Step 2: Verify Static Files Are Served
The server automatically serves the `client/` folder. Test locally first:

```bash
# From local machine
curl -I http://localhost:3000/styles.css
# Expected: HTTP/1.1 200 OK with Content-Type: text/css

curl -I http://localhost:3000/app-with-db.js
# Expected: HTTP/1.1 200 OK with Content-Type: application/javascript
```

### Step 3: On Live Server, Open DevTools in Browser
If the UI still doesn't load:

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Check Network tab** — filter by CSS/JS
   - Look for `styles.css` and `app-with-db.js`
   - Confirm status is `200` (not `404`, `403`, or `5xx`)
   - Confirm `Content-Type` is correct
3. **Check Console tab** — look for errors like:
   - `Refused to load` (CSP or CORS block)
   - `GET /styles.css 404` (file not found)
   - `MIME type error` (wrong content-type)

### Step 4: Reverse Proxy Configuration (if applicable)
If your live server uses NGINX/Apache as a reverse proxy:

**NGINX example** — ensure proxy passes through static files:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # Important: allow static files to be served directly
    proxy_buffering off;
}
```

**Apache example** — ensure it doesn't rewrite asset paths:
```apache
ProxyPreserveHost On
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

### Step 5: Troubleshoot Specific Issues

#### Issue: CSS loads but JavaScript doesn't
- **Cause**: CSP `script-src` is blocking the module
- **Fix**: Ensure `app-with-db.js` is served with `Content-Type: application/javascript` (not `text/plain`)
- **Test**: 
  ```bash
  curl -I https://your-live-server/app-with-db.js | grep Content-Type
  ```

#### Issue: Fonts not loading
- **Cause**: Google Fonts CDN blocked or CORS issue
- **Check DevTools** → Network → look for `fonts.googleapis.com` requests
- **Status should be**: 200 or 304 (cached)

#### Issue: Google OAuth or Supabase fails
- **Cause**: ALLOWED_ORIGIN doesn't match actual domain
- **Fix**: 
  ```env
  # If accessed via https://example.com
  ALLOWED_ORIGIN=https://example.com
  ```
- Check `.env` is loaded: `echo $ALLOWED_ORIGIN`

### Step 6: Test Full Flow
1. Open `https://your-live-server` in browser
2. Confirm dark theme loads (CSS working)
3. Click "Sign In" button (JS working)
4. Complete Google OAuth
5. Send a test message to Dialogflow

## Performance Tips

### Enable Caching (for static assets)
Add to `server/index.js` if you want aggressive caching:
```javascript
app.use(express.static(path.join(__dirname, '../client'), {
  maxAge: '1h', // Cache CSS/JS for 1 hour
  etag: false
}));
```

### Compress Assets
The server already uses `compression()` middleware (gzip).

### Use a CDN
For production, consider hosting `styles.css` and `app-with-db.js` on a CDN. Update `index.html`:
```html
<link rel="stylesheet" href="https://cdn.example.com/styles.css">
<script type="module" src="https://cdn.example.com/app-with-db.js"></script>
```

## Environment Variables Checklist

| Variable | Local | Production | Purpose |
|----------|-------|------------|---------|
| `NODE_ENV` | `development` | `production` | Controls CSP/CORS strictness |
| `PORT` | `3000` | `3000` (or your port) | Server port |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | `https://your-domain.com` | CORS whitelist |
| `SUPABASE_URL` | (from .env) | (must be same) | Database connection |
| `SUPABASE_ANON_KEY` | (from .env) | (must be same) | Supabase auth |
| `AGENT_ID` | (from .env) | (must be same) | Dialogflow CX agent |

## Quick Deploy Script

Save this as `deploy.sh` and run it on your live server:

```bash
#!/bin/bash
set -e

echo "📦 Pulling latest code..."
git pull origin main

echo "📥 Installing dependencies..."
npm install

echo "🔧 Setting environment..."
# Edit these for your server:
export NODE_ENV=production
export ALLOWED_ORIGIN=https://your-domain.com

echo "🚀 Starting server..."
npm start
```

Then run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Rollback
If something breaks:
```bash
# Stop the server
pkill -f "node server"

# Revert changes
git revert HEAD

# Restart
npm start
```

---

**Questions?** Check DevTools console/network tab first — that's where 99% of deployment issues show up!
