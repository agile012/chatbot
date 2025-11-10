#!/bin/bash

# IIM Ahmedabad Chatbot - Setup Script
# This script helps you set up the chatbot quickly

echo "🎓 IIM Ahmedabad Chatbot Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit the .env file with your Google Cloud credentials"
    echo "   Required fields:"
    echo "   - PROJECT_ID"
    echo "   - LOCATION"
    echo "   - AGENT_ID"
    echo "   - GOOGLE_APPLICATION_CREDENTIALS"
    echo ""
fi

# Check if credentials file exists
if [ ! -f iimachatbot-542362f8fdae.json ]; then
    echo "⚠️  Google credentials file not found!"
    echo "   Please ensure 'iimachatbot-542362f8fdae.json' is in the project root"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 To start the server, run:"
    echo "   npm start"
    echo ""
    echo "📖 For more information, see README.md"
    echo ""
    echo "🌐 The chatbot will be available at: http://localhost:3000"
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
