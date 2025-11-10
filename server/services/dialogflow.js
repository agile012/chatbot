const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const { v4: uuidv4 } = require('uuid');

class DialogflowService {
  constructor() {
    // Initialize Dialogflow CX client with regional endpoint
    this.client = new SessionsClient({
      apiEndpoint: `${process.env.LOCATION}-dialogflow.googleapis.com`,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    this.projectId = process.env.PROJECT_ID;
    this.location = process.env.LOCATION;
    this.agentId = process.env.AGENT_ID;
    this.languageCode = process.env.LANGUAGE_CODE || 'en';
    
    // Session storage (in production, use Redis or similar)
    this.sessions = new Map();
  }

  /**
   * Get or create a session ID for a user
   */
  getSessionId(userId) {
    if (!this.sessions.has(userId)) {
      const sessionId = uuidv4();
      this.sessions.set(userId, {
        sessionId,
        createdAt: Date.now()
      });
      
      // Clean up old sessions after 1 hour
      setTimeout(() => {
        this.sessions.delete(userId);
      }, 3600000);
    }
    
    return this.sessions.get(userId).sessionId;
  }

  /**
   * Build session path for Dialogflow CX
   */
  getSessionPath(sessionId) {
    return this.client.projectLocationAgentSessionPath(
      this.projectId,
      this.location,
      this.agentId,
      sessionId
    );
  }

  /**
   * Send text message to Dialogflow CX and get response
   */
  async detectIntent(text, userId = 'default-user') {
    try {
      const sessionId = this.getSessionId(userId);
      const sessionPath = this.getSessionPath(sessionId);

      // Construct the request
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: text,
          },
          languageCode: this.languageCode,
        },
      };

      // Send request to Dialogflow CX
      const [response] = await this.client.detectIntent(request);
      
      // Extract response messages
      const messages = [];
      if (response.queryResult.responseMessages) {
        for (const message of response.queryResult.responseMessages) {
          if (message.text) {
            messages.push({
              type: 'text',
              text: message.text.text.join(' ')
            });
          } else if (message.payload) {
            messages.push({
              type: 'payload',
              payload: message.payload
            });
          }
        }
      }

      return {
        success: true,
        messages,
        intentDetected: response.queryResult.intent?.displayName || 'No intent matched',
        confidence: response.queryResult.intentDetectionConfidence || 0,
        currentPage: response.queryResult.currentPage?.displayName || 'Unknown',
        sessionId
      };

    } catch (error) {
      console.error('Error detecting intent:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  /**
   * Reset session for a user
   */
  resetSession(userId) {
    this.sessions.delete(userId);
    return { success: true, message: 'Session reset successfully' };
  }

  /**
   * Get session info
   */
  getSessionInfo(userId) {
    const session = this.sessions.get(userId);
    if (session) {
      return {
        sessionId: session.sessionId,
        createdAt: new Date(session.createdAt).toISOString(),
        active: true
      };
    }
    return { active: false };
  }
}

module.exports = new DialogflowService();
