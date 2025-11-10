const supabase = require('../config/supabase');

class ChatHistoryService {
  /**
   * Create a new chat session
   */
  async createSession(userId, title = 'New Conversation') {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: userId,
            title: title,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Save a message to the database
   */
  async saveMessage(sessionId, userId, messageText, senderType, intentDetected = null, confidence = null) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            session_id: sessionId,
            user_id: userId,
            message_text: messageText,
            sender_type: senderType,
            intent_detected: intentDetected,
            confidence: confidence
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return { success: true, message: data };
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  /**
   * Get last 10 chat sessions for a user
   */
  async getRecentSessions(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_recent_chat_sessions', { p_user_id: userId });

      if (error) throw error;
      return { success: true, sessions: data };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }
  }

  /**
   * Get all messages for a specific session
   */
  async getSessionMessages(sessionId, userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, messages: data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  /**
   * Update session title
   */
  async updateSessionTitle(sessionId, userId, title) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ title: title })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('Error updating session title:', error);
      throw new Error(`Failed to update session title: ${error.message}`);
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId, userId) {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, message: 'Session deleted successfully' };
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, profile: null };
    }
  }
}

module.exports = new ChatHistoryService();
