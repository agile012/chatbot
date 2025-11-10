const express = require('express');
const router = express.Router();
const chatHistoryService = require('../services/chatHistory');

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
router.post('/sessions', async (req, res, next) => {
  try {
    const { userId, title } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID is required'
      });
    }

    const result = await chatHistoryService.createSession(userId, title);
    res.json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chat/sessions
 * Get last 10 chat sessions for a user
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID is required'
      });
    }

    const result = await chatHistoryService.getRecentSessions(userId);
    // Return just the sessions array, not the wrapper object
    res.json(result.sessions || []);

  } catch (error) {
    // If database fails, return empty array
    console.error('Error fetching sessions:', error);
    res.json([]);
  }
});

/**
 * GET /api/chat/sessions/:sessionId/messages
 * Get all messages for a session
 */
router.get('/sessions/:sessionId/messages', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID is required'
      });
    }

    const result = await chatHistoryService.getSessionMessages(sessionId, userId);
    // Return just the messages array, not the wrapper object
    res.json(result.messages || []);

  } catch (error) {
    // If database fails, return empty array
    console.error('Error fetching messages:', error);
    res.json([]);
  }
});

/**
 * POST /api/chat/messages
 * Save a message to the database
 */
router.post('/messages', async (req, res, next) => {
  try {
    const { sessionId, userId, messageText, senderType, intentDetected, confidence } = req.body;

    if (!sessionId || !userId || !messageText || !senderType) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const result = await chatHistoryService.saveMessage(
      sessionId,
      userId,
      messageText,
      senderType,
      intentDetected,
      confidence
    );

    // Return just the message, not the wrapper object
    res.json(result.message || { success: true });

  } catch (error) {
    // If database fails, still return success to not break chat
    console.error('Error saving message:', error);
    res.json({ success: true });
  }
});

/**
 * PUT /api/chat/sessions/:sessionId
 * Update session title
 */
router.put('/sessions/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userId, title } = req.body;

    if (!userId || !title) {
      return res.status(400).json({
        error: 'User ID and title are required'
      });
    }

    const result = await chatHistoryService.updateSessionTitle(sessionId, userId, title);
    res.json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/chat/sessions/:sessionId
 * Delete a chat session
 */
router.delete('/sessions/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID is required'
      });
    }

    const result = await chatHistoryService.deleteSession(sessionId, userId);
    res.json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chat/profile
 * Get user profile
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID is required'
      });
    }

    const result = await chatHistoryService.getUserProfile(userId);
    res.json(result);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
