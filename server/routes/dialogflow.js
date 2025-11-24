const express = require('express');
const router = express.Router();
const dialogflowService = require('../services/dialogflow');

/**
 * POST /api/dialogflow/message
 * Send a message to the chatbot
 */
router.post('/message', async (req, res, next) => {
  try {
    const { message, userId } = req.body;
    console.log('\n📨 [Route] POST /api/dialogflow/message');
    console.log('📨 [Route] Message:', message);
    console.log('📨 [Route] User ID:', userId);

    // Validate input
    if (!message || typeof message !== 'string') {
      console.warn('⚠️ [Route] Invalid message format');
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    if (message.trim().length === 0) {
      console.warn('⚠️ [Route] Empty message');
      return res.status(400).json({
        error: 'Message cannot be empty'
      });
    }

    // Use provided userId or generate a default one based on IP
    const effectiveUserId = userId || `user-${req.ip.replace(/[:.]/g, '-')}`;
    console.log('📨 [Route] Effective User ID:', effectiveUserId);

    // Get response from Dialogflow
    console.log('📨 [Route] Calling dialogflowService.detectIntent...');
    const response = await dialogflowService.detectIntent(message, effectiveUserId);
    console.log('✅ [Route] Got response:', response);

    res.json(response);

  } catch (error) {
    console.error('❌ [Route] Error in /message:', error.message);
    console.error('❌ [Route] Error stack:', error.stack);
    next(error);
  }
});

/**
 * POST /api/dialogflow/reset
 * Reset the conversation session
 */
router.post('/reset', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const effectiveUserId = userId || `user-${req.ip.replace(/[:.]/g, '-')}`;

    const result = dialogflowService.resetSession(effectiveUserId);
    res.json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dialogflow/session
 * Get current session information
 */
router.get('/session', (req, res, next) => {
  try {
    const userId = req.query.userId || `user-${req.ip.replace(/[:.]/g, '-')}`;
    const sessionInfo = dialogflowService.getSessionInfo(userId);
    res.json(sessionInfo);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
