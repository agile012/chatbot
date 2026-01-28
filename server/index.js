require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dialogflowRoutes = require('./routes/dialogflow');
const chatRoutes = require('./routes/chat');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - important for OAuth redirect URLs when behind reverse proxy
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "blob:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "https://*.googleusercontent.com", "https://ui-avatars.com"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://accounts.google.com",
        "https://apis.google.com",
        "blob:"
      ],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://lruhvniqyrdngltarfmq.supabase.co",
        "wss://lruhvniqyrdngltarfmq.supabase.co",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://accounts.google.com",
        "https://*.googleapis.com"
      ],
      frameSrc: ["https://accounts.google.com"],
      workerSrc: ["'self'", "blob:"]
    }
  }
}));

// CORS configuration - strict allowlist (fixes Misconfigured CORS vulnerability)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://chatbot.iima.ac.in'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production' && 
        (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Cookie security middleware (fixes HttpOnly, Secure, SameSite vulnerabilities - CWE-16, CWE-614)
app.use((req, res, next) => {
  // Override res.cookie to ALWAYS enforce secure cookie attributes
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options = {}) {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureOptions = {
      ...options,
      httpOnly: true,         // ALWAYS set HttpOnly - prevents XSS cookie theft
      secure: isProduction,   // Secure flag in production - cookies only over HTTPS
      sameSite: 'Strict',     // Strict SameSite - prevents CSRF attacks
      path: options.path || '/'
    };
    // Add expiry if not set (default 7 days for session cookies)
    if (!secureOptions.expires && !secureOptions.maxAge) {
      secureOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    return originalCookie(name, value, secureOptions);
  };
  
  // Also set security headers for any cookies set by Set-Cookie header directly
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      const isProduction = process.env.NODE_ENV === 'production';
      // Ensure all Set-Cookie headers have security attributes
      if (Array.isArray(value)) {
        value = value.map(cookie => ensureCookieSecurity(cookie, isProduction));
      } else if (typeof value === 'string') {
        value = ensureCookieSecurity(value, isProduction);
      }
    }
    return originalSetHeader(name, value);
  };
  
  next();
});

// Helper function to ensure cookie security attributes
function ensureCookieSecurity(cookieStr, isProduction) {
  if (typeof cookieStr !== 'string') return cookieStr;
  
  let cookie = cookieStr;
  
  // Add HttpOnly if not present
  if (!/;\s*HttpOnly/i.test(cookie)) {
    cookie += '; HttpOnly';
  }
  
  // Add Secure if in production and not present
  if (isProduction && !/;\s*Secure/i.test(cookie)) {
    cookie += '; Secure';
  }
  
  // Add SameSite=Strict if no SameSite attribute present
  if (!/;\s*SameSite/i.test(cookie)) {
    cookie += '; SameSite=Strict';
  }
  
  return cookie;
}

// Body parsing middleware with size limits to mitigate large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Compression middleware
app.use(compression());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api/dialogflow', dialogflowRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.stack);
  } else {
    console.error('Error:', err.message);
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IIM Ahmedabad Chatbot Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 Dialogflow Agent ID: ${process.env.AGENT_ID}`);
  console.log(`📍 Location: ${process.env.LOCATION}`);
});

module.exports = app;
