# IIM Ahmedabad Student Support Chatbot

A modern, professional chatbot interface for IIM Ahmedabad students powered by Google Dialogflow CX. This application provides an intuitive conversational interface to help students get information about courses, admissions, campus facilities, and more.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![Dialogflow CX](https://img.shields.io/badge/Dialogflow-CX-orange.svg)

## 🌟 Features

- **Modern Chat Interface**: Beautiful, responsive UI with IIM Ahmedabad branding
- **Real-time Conversations**: Powered by Google Dialogflow CX for intelligent responses
- **Session Management**: Maintains conversation context across multiple messages
- **Quick Actions**: Pre-defined questions for common queries
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Typing Indicators**: Visual feedback when the bot is processing responses
- **Error Handling**: Graceful error handling with user-friendly messages
- **Security**: Built with security best practices using Helmet.js
- **Performance**: Optimized with compression and efficient resource loading

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Google Cloud Project** with Dialogflow CX API enabled
- **Google Service Account Key** (JSON file)

## 🚀 Quick Start

### 1. Clone or Navigate to the Project

```bash
cd /Users/yogeshdeokar/Projects/GAIM-CP
```

### 2. Environment Setup

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Google Cloud Configuration
PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc

# Google Service Account Key File Path
GOOGLE_APPLICATION_CREDENTIALS=./iimachatbot-542362f8fdae.json

# Server Configuration
PORT=3000
NODE_ENV=development

# Language Configuration
LANGUAGE_CODE=en

# Session Configuration
SESSION_TTL=3600
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Verify Google Credentials

Make sure your Google service account key file (`iimachatbot-542362f8fdae.json`) is in the root directory. This file should have the following permissions:

- Dialogflow API Client
- Dialogflow CX Session/Agent access

### 5. Start the Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
GAIM-CP/
├── server/
│   ├── index.js                 # Express server setup
│   ├── routes/
│   │   └── dialogflow.js        # API routes for chatbot
│   └── services/
│       └── dialogflow.js        # Dialogflow CX integration
├── client/
│   ├── index.html              # Main HTML file
│   ├── styles.css              # Styling
│   └── app.js                  # Frontend JavaScript
├── .env                        # Environment variables (create this)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
├── README.md                   # This file
└── iimachatbot-542362f8fdae.json  # Google credentials (keep secure!)
```

## 🔧 API Endpoints

### POST `/api/dialogflow/message`
Send a message to the chatbot.

**Request Body:**
```json
{
  "message": "What programs does IIM Ahmedabad offer?",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "type": "text",
      "text": "IIM Ahmedabad offers various programs including..."
    }
  ],
  "intentDetected": "programs_inquiry",
  "confidence": 0.95,
  "currentPage": "Programs Page",
  "sessionId": "session-uuid"
}
```

### POST `/api/dialogflow/reset`
Reset the conversation session.

**Request Body:**
```json
{
  "userId": "optional-user-id"
}
```

### GET `/api/dialogflow/session`
Get current session information.

**Query Parameters:**
- `userId` (optional): User identifier

### GET `/api/health`
Health check endpoint.

## 🎨 Customization

### Updating Branding

**Colors** - Edit `client/styles.css`:
```css
:root {
    --primary-color: #c41e3a;      /* Main brand color */
    --primary-dark: #a01729;       /* Darker shade */
    --primary-light: #e85d75;      /* Lighter shade */
    /* ... other variables */
}
```

**Logo** - Update `client/index.html`:
```html
<div class="logo-text">IIM-A</div>
```

### Adding Quick Actions

Edit the quick buttons in `client/index.html`:
```html
<button class="quick-btn" data-message="Your question here">
    📚 Button Label
</button>
```

## 🔒 Security Considerations

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Never commit `*.json` credential files** to version control
3. **Use environment variables** for all sensitive data
4. **Enable CORS** properly for production domains
5. **Use HTTPS** in production
6. **Implement rate limiting** for production deployments
7. **Regular security updates** - Keep dependencies updated

## 🚢 Deployment

### Deploy to Google Cloud Run

1. **Install Google Cloud SDK:**
```bash
gcloud init
```

2. **Build and deploy:**
```bash
# Set project
gcloud config set project iimachatbot

# Deploy to Cloud Run
gcloud run deploy iim-chatbot \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=iimachatbot,LOCATION=us-central1,AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
```

### Deploy to Heroku

1. **Install Heroku CLI**
2. **Create app:**
```bash
heroku create iim-ahmedabad-chatbot
```

3. **Set environment variables:**
```bash
heroku config:set PROJECT_ID=iimachatbot
heroku config:set LOCATION=us-central1
heroku config:set AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
```

4. **Deploy:**
```bash
git push heroku main
```

### Deploy to Vercel/Netlify

For serverless deployment, you'll need to adapt the Express routes to serverless functions.

## 🐛 Troubleshooting

### Issue: "Failed to authenticate"
**Solution:** 
- Verify your `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Ensure the service account has proper permissions
- Check if the JSON key file is valid

### Issue: "Agent not found"
**Solution:**
- Verify `AGENT_ID` in `.env` matches your Dialogflow CX agent
- Check `PROJECT_ID` and `LOCATION` are correct
- Ensure the agent is deployed

### Issue: "Port already in use"
**Solution:**
- Change `PORT` in `.env` to a different port
- Or kill the process using the port:
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: "No response from bot"
**Solution:**
- Check Dialogflow CX console for agent issues
- Verify intents are properly configured
- Check server logs for errors

## 📊 Monitoring and Logs

### Development Logs
The application logs important information to the console:
- Server startup information
- API request/response details
- Error messages and stack traces

### Production Monitoring
Consider implementing:
- **Google Cloud Logging** for centralized logs
- **Error tracking** with Sentry or similar
- **Performance monitoring** with New Relic or Datadog
- **Uptime monitoring** with Pingdom or UptimeRobot

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Dialogflow CX** - Conversational AI platform
- **IIM Ahmedabad** - Institution branding and requirements
- **Express.js** - Web framework
- **Node.js** - Runtime environment

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [Dialogflow CX Documentation](https://cloud.google.com/dialogflow/cx/docs)
3. Contact the development team

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
npm update
```

### Security Audit
```bash
npm audit
npm audit fix
```

## 📈 Performance Tips

1. **Enable caching** for static assets
2. **Use a CDN** for better global performance
3. **Implement Redis** for session storage in production
4. **Enable gzip compression** (already included)
5. **Optimize images** and assets
6. **Monitor API response times**

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Rich media responses (images, cards)
- [ ] User authentication
- [ ] Chat history persistence
- [ ] Analytics dashboard
- [ ] Mobile app versions
- [ ] Integration with IIM systems

---

**Built with ❤️ for IIM Ahmedabad Students**

*Last Updated: November 2025*
