require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dialogflowRoutes = require('./routes/dialogflow');
const chatRoutes = require('./routes/chat');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGIN || 'https://your-domain.com')
    : true, // Allow all origins in development
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error('Error:', err.stack);
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
