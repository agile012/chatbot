import supabase from './supabase-client.js';

class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentSessionId = null;
        this.messages = [];
        this.isTyping = false;
        this.userId = this.generateUserId();
        this.useDatabase = false; // Will be enabled after successful auth
        this.isCreatingSession = false; // Prevent multiple simultaneous session creations
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkAuthState();
    }

    generateUserId() {
        let userId = localStorage.getItem('chatUserId');
        if (!userId) {
            userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatUserId', userId);
        }
        return userId;
    }

    initializeElements() {
        // Main chat elements
        this.messagesContainer = document.getElementById('messages');
        this.welcomeSection = document.getElementById('welcomeSection');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.chatForm = document.getElementById('chatForm');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.toast = document.getElementById('toast');
        
        // Auth elements
        this.authModal = document.getElementById('authModal');
        this.signInBtn = document.getElementById('signInBtn');
        this.signOutBtn = document.getElementById('signOutBtn');
        
        // User profile elements
        this.userProfile = document.getElementById('userProfile');
        this.userName = document.getElementById('userName');
        this.userAvatar = document.getElementById('userAvatar');
        
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.chatHistoryList = document.getElementById('chatHistoryList');
        this.mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    }

    attachEventListeners() {
        // Form submission
        if (this.chatForm) {
            this.chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSendMessage();
            });
        }

        // New chat button
        if (this.newChatBtn) {
            this.newChatBtn.addEventListener('click', () => this.startNewChat());
        }

        // Auth buttons
        if (this.signInBtn) {
            this.signInBtn.addEventListener('click', () => this.signInWithGoogle());
        }
        if (this.signOutBtn) {
            this.signOutBtn.addEventListener('click', () => this.signOut());
        }
        
        // Sidebar sign-in button
        const sidebarSignInBtn = document.getElementById('sidebarSignInBtn');
        if (sidebarSignInBtn) {
            sidebarSignInBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // User profile menu toggle
        const userProfileBtn = document.getElementById('userProfileBtn');
        const profileMenu = document.getElementById('profileMenu');
        if (userProfileBtn && profileMenu) {
            userProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.classList.toggle('show');
                
                // Position the menu above the button
                if (profileMenu.classList.contains('show')) {
                    const btnRect = userProfileBtn.getBoundingClientRect();
                    const menuWidth = 200;
                    let leftPos = btnRect.left + (btnRect.width - menuWidth) / 2;
                    
                    // Ensure menu doesn't go off-screen
                    if (leftPos < 10) {
                        leftPos = 10;
                    } else if (leftPos + menuWidth > window.innerWidth - 10) {
                        leftPos = window.innerWidth - menuWidth - 10;
                    }
                    
                    profileMenu.style.bottom = window.innerHeight - btnRect.top + 8 + 'px';
                    profileMenu.style.left = leftPos + 'px';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                    profileMenu.classList.remove('show');
                }
            });
            
            // Close menu when an item is clicked
            profileMenu.addEventListener('click', (e) => {
                if (e.target.closest('button')) {
                    profileMenu.classList.remove('show');
                }
            });
        }

        // Header sign in button
        const signInBtnHeader = document.getElementById('signInBtnHeader');
        if (signInBtnHeader) {
            signInBtnHeader.addEventListener('click', () => this.showAuthModal());
        }

        // Sidebar toggles
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.mobileSidebarToggle) {
            this.mobileSidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                if (this.messageInput) {
                    this.messageInput.value = message;
                    this.handleSendMessage();
                }
            });
        });

        // Enter key to send (Shift+Enter for new line)
        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            // Auto-resize textarea
            this.messageInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }
    }

    async checkAuthState() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                await this.handleSignIn(user);
            } else {
                // Show Sign In buttons for unauthenticated users
                const signInBtnHeader = document.getElementById('signInBtnHeader');
                if (signInBtnHeader) {
                    signInBtnHeader.style.display = 'flex';
                }
                
                const sidebarSignInBtn = document.getElementById('sidebarSignInBtn');
                if (sidebarSignInBtn) {
                    sidebarSignInBtn.classList.add('show');
                }
            }

            // Listen for auth state changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await this.handleSignIn(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.handleSignOut();
                }
            });

        } catch (error) {
            console.log('Auth not available, using guest mode');
            // Show Sign In buttons even if Supabase is unavailable
            const signInBtnHeader = document.getElementById('signInBtnHeader');
            if (signInBtnHeader) {
                signInBtnHeader.style.display = 'flex';
            }
            
            const sidebarSignInBtn = document.getElementById('sidebarSignInBtn');
            if (sidebarSignInBtn) {
                sidebarSignInBtn.classList.add('show');
            }
        }
    }

    async signInWithGoogle() {
        try {
            // Explicit production domain redirect for reverse proxy scenarios
            let redirectTo = window.location.origin;
            
            if (window.location.hostname.includes('chatbot.iima.ac.in') || window.location.hostname.includes('iima.ac.in')) {
                redirectTo = `${window.location.protocol}//${window.location.host}`;
                console.log('📍 Production domain detected, redirect URL:', redirectTo);
            }
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo
                }
            });

            if (error) throw error;

        } catch (error) {
            console.error('Sign in error:', error);
            this.showToast('Sign in not configured yet', 'error');
        }
    }

    async signOut() {
        try {
            await supabase.auth.signOut();
            this.handleSignOut();
            this.showToast('Signed out successfully', 'success');

        } catch (error) {
            console.error('Sign out error:', error);
            this.showToast('Failed to sign out', 'error');
        }
    }

    async handleSignIn(user) {
        this.currentUser = user;
        this.useDatabase = true;
        
        // Hide auth modal
        this.hideAuthModal();
        
        // Update UI with user info
        if (this.userName) {
            this.userName.textContent = user.user_metadata?.full_name || user.email;
        }
        if (this.userAvatar) {
            this.userAvatar.src = user.user_metadata?.avatar_url || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=003d82&color=fff`;
        }
        
        // Show user profile in header
        if (this.userProfile) {
            this.userProfile.classList.add('visible');
        }
        
        // Hide sidebar sign-in button
        const sidebarSignInBtn = document.getElementById('sidebarSignInBtn');
        if (sidebarSignInBtn) {
            sidebarSignInBtn.classList.remove('show');
        }
        
        // Hide header sign-in button
        const signInBtnHeader = document.getElementById('signInBtnHeader');
        if (signInBtnHeader) {
            signInBtnHeader.style.display = 'none';
        }
        
        // Show sidebar
        if (this.sidebar) {
            this.sidebar.style.display = 'flex';
            // Remove 'open' class on desktop
            this.sidebar.classList.remove('open');
        }
        
        // Load chat history
        try {
            await this.loadChatHistory();
            // Don't create a new session here - wait for first message
        } catch (error) {
            console.log('Database not set up yet:', error);
            this.showToast('Database not configured. Using guest mode.', 'info');
            this.useDatabase = false;
        }
        
        this.showToast('Welcome back!', 'success');
    }

    handleSignOut() {
        this.currentUser = null;
        this.currentSessionId = null;
        this.messages = [];
        this.useDatabase = false;
        
        // Clear UI
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'flex';
        }
        
        // Hide user profile in sidebar
        if (this.userProfile) {
            this.userProfile.classList.remove('visible');
        }
        
        // Show sidebar sign-in button
        const sidebarSignInBtn = document.getElementById('sidebarSignInBtn');
        if (sidebarSignInBtn) {
            sidebarSignInBtn.classList.add('show');
        }
        
        // Show header sign-in button
        const signInBtnHeader = document.getElementById('signInBtnHeader');
        if (signInBtnHeader) {
            signInBtnHeader.style.display = 'flex';
        }
        
        // Keep sidebar visible but show sign-in prompt
        if (this.sidebar) {
            this.sidebar.style.display = 'flex';
        }
        if (this.chatHistoryList) {
            this.chatHistoryList.innerHTML = '<div class="empty-history">Sign in to see your chat history</div>';
        }
    }

    showAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'flex';
        }
    }

    hideAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
        }
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('open');
        }
    }

    async loadChatHistory() {
        if (!this.useDatabase || !this.currentUser) return;

        try {
            const userId = this.currentUser.id;
            
            const response = await fetch(`/api/chat/sessions?userId=${userId}`);

            if (!response.ok) throw new Error('Failed to load chat history');

            const sessions = await response.json();
            this.renderChatHistory(sessions);

        } catch (error) {
            console.error('Error loading chat history:', error);
            // Don't show error to user, just disable database
            this.useDatabase = false;
        }
    }

    renderChatHistory(sessions) {
        if (!this.chatHistoryList) return;

        this.chatHistoryList.innerHTML = '';

        // Ensure sessions is an array
        if (!Array.isArray(sessions)) {
            this.chatHistoryList.innerHTML = '<div class="empty-history">No previous chats</div>';
            return;
        }

        if (sessions.length === 0) {
            this.chatHistoryList.innerHTML = '<div class="empty-history">No previous chats</div>';
            return;
        }

        sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            if (session.id === this.currentSessionId) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="chat-title">${session.title || 'New Chat'}</div>
                <div class="chat-time">${this.formatDate(session.created_at)}</div>
                <button class="delete-chat-btn" data-session-id="${session.id}">×</button>
            `;

            // Add click listener for delete button
            const deleteBtn = item.querySelector('.delete-chat-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteSession(session.id);
                });
            }

            // Add click listener for loading session
            item.addEventListener('click', () => this.loadSession(session.id));
            this.chatHistoryList.appendChild(item);
        });
    }

    async loadSession(sessionId) {
        if (!this.useDatabase) return;

        try {
            const userId = this.currentUser.id;
            const response = await fetch(`/api/chat/sessions/${sessionId}/messages?userId=${userId}`);

            if (!response.ok) throw new Error('Failed to load session');

            const messages = await response.json();
            
            // Clear current messages
            if (this.messagesContainer) {
                this.messagesContainer.innerHTML = '';
            }
            if (this.welcomeSection) {
                this.welcomeSection.style.display = 'none';
            }
            this.messages = [];
            
            // Load messages
            messages.forEach(msg => {
                this.addMessage(msg.message_text, msg.sender_type, false);
            });

            this.currentSessionId = sessionId;
            await this.loadChatHistory();

        } catch (error) {
            console.error('Error loading session:', error);
            this.showToast('Failed to load conversation', 'error');
        }
    }

    async deleteSession(sessionId, event) {
        if (event) event.stopPropagation();
        const confirmed = await this.showConfirmDialog('Delete Conversation?', 'Are you sure you want to delete this conversation? This action cannot be undone.');
        if (!confirmed) return;

        try {
            const userId = this.currentUser.id;
            const response = await fetch(`/api/chat/sessions/${sessionId}?userId=${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete session');

            if (sessionId === this.currentSessionId) {
                await this.startNewChat();
            }

            await this.loadChatHistory();
            this.showToast('Conversation deleted', 'success');

        } catch (error) {
            console.error('Error deleting session:', error);
            this.showToast('Failed to delete conversation', 'error');
        }
    }

    async createNewSession() {
        if (!this.useDatabase || !this.currentUser) return;
        if (this.isCreatingSession) return; // Prevent duplicate session creation
        
        this.isCreatingSession = true;

        try {
            const response = await fetch('/api/chat/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    title: 'New Chat'
                })
            });

            if (!response.ok) throw new Error('Failed to create session');

            const sessionData = await response.json();
            this.currentSessionId = sessionData.session?.id || sessionData.id;
            
            await this.loadChatHistory();

        } catch (error) {
            console.error('Error creating session:', error);
            this.useDatabase = false;
        } finally {
            this.isCreatingSession = false;
        }
    }

    async startNewChat() {
        const confirmed = await this.showConfirmDialog('Start New Conversation?', 'This will clear the current chat and start a fresh conversation.');
        if (!confirmed) return;

        try {
            // Reset Dialogflow session
            await fetch('/api/dialogflow/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser?.id || this.userId
                })
            });

            // Clear UI
            this.messages = [];
            if (this.messagesContainer) {
                this.messagesContainer.innerHTML = '';
            }
            if (this.welcomeSection) {
                this.welcomeSection.style.display = 'flex';
            }
            this.hideTypingIndicator();
            
            // Create new session if using database
            if (this.useDatabase && this.currentUser) {
                await this.createNewSession();
            }
            
            this.showToast('New conversation started', 'success');

        } catch (error) {
            console.error('Error starting new chat:', error);
            this.showToast('Failed to start new chat', 'error');
        }
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Create a new session on first message if needed
        if (this.useDatabase && this.currentUser && !this.currentSessionId) {
            try {
                await this.createNewSession();
            } catch (error) {
                console.error('Failed to create session:', error);
                this.useDatabase = false;
            }
        }

        // Hide welcome section on first message
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'none';
        }

        // Add user message to UI
        this.addMessage(message, 'user');
        
        // Save to database if enabled
        if (this.useDatabase && this.currentUser && this.currentSessionId) {
            try {
                await this.saveMessage(message, 'user');
            } catch (error) {
                console.log('Failed to save message:', error);
            }
        }
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeTextarea();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to Dialogflow
            const response = await fetch('/api/dialogflow/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    userId: this.currentUser?.id || this.userId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add bot response to UI
            if (data.messages && data.messages.length > 0) {
                for (const msg of data.messages) {
                    if (msg.type === 'text') {
                        this.addMessage(msg.text, 'bot');
                        
                        // Save to database if enabled
                        if (this.useDatabase && this.currentUser && this.currentSessionId) {
                            try {
                                await this.saveMessage(msg.text, 'bot', data.intent, data.confidence);
                            } catch (error) {
                                console.log('Failed to save bot message:', error);
                            }
                        }
                    }
                }
                
                // Update session title if first message
                if (this.useDatabase && this.messages.filter(m => m.sender === 'user').length === 1) {
                    await this.updateSessionTitle(message);
                }
            } else {
                const defaultMsg = 'I received your message, but I\'m not sure how to respond. Could you please rephrase?';
                this.addMessage(defaultMsg, 'bot');
            }

        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
            this.showToast('Failed to send message', 'error');
        }
    }

    async saveMessage(messageText, senderType, intentDetected = null, confidence = null) {
        if (!this.useDatabase || !this.currentUser || !this.currentSessionId) return;

        try {
            await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSessionId,
                    userId: this.currentUser.id,
                    messageText: messageText,
                    senderType: senderType,
                    intentDetected: intentDetected,
                    confidence: confidence
                })
            });
        } catch (error) {
            console.log('Failed to save message to database:', error);
        }
    }

    async updateSessionTitle(firstMessage) {
        if (!this.useDatabase || !this.currentSessionId) return;

        try {
            const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
            
            await fetch(`/api/chat/sessions/${this.currentSessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    userId: this.currentUser.id,
                    title 
                })
            });

            await this.loadChatHistory();
        } catch (error) {
            console.log('Failed to update session title:', error);
        }
    }

    addMessage(text, sender, shouldSave = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'user') {
            if (this.currentUser && this.userAvatar) {
                const img = document.createElement('img');
                img.src = this.userAvatar.src;
                img.alt = 'User';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                avatar.appendChild(img);
            } else {
                avatar.textContent = 'You';
            }
        } else {
            avatar.textContent = '🤖';
        }
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        content.appendChild(messageText);
        content.appendChild(time);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(messageDiv);
        }
        this.scrollToBottom();
        
        // Store message in memory
        if (shouldSave) {
            this.messages.push({
                text,
                sender,
                timestamp: Date.now()
            });
        }
    }

    autoResizeTextarea() {
        if (this.messageInput) {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        }
    }

    showTypingIndicator() {
        this.isTyping = true;
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'flex';
        }
        if (this.sendBtn) {
            this.sendBtn.disabled = true;
        }
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
        }
        if (this.sendBtn) {
            this.sendBtn.disabled = false;
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
    }

    showToast(message, type = 'info') {
        if (this.toast) {
            this.toast.textContent = message;
            this.toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                this.toast.classList.remove('show');
            }, 3000);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Less than 24 hours
        if (diff < 86400000) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Less than 7 days
        if (diff < 604800000) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
        
        // Older
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirmDialogOverlay');
            const dialog = document.getElementById('confirmDialog');
            const titleElem = document.getElementById('confirmTitle');
            const messageElem = document.getElementById('confirmMessage');
            const cancelBtn = document.getElementById('confirmCancel');
            const confirmBtn = document.getElementById('confirmConfirm');

            if (!overlay || !titleElem || !messageElem || !cancelBtn || !confirmBtn) {
                // Fallback to native confirm if elements not found
                resolve(confirm(`${title}\n\n${message}`));
                return;
            }

            titleElem.textContent = title;
            messageElem.textContent = message;

            const handleCancel = () => {
                overlay.classList.remove('show');
                cleanup();
                resolve(false);
            };

            const handleConfirm = () => {
                overlay.classList.remove('show');
                cleanup();
                resolve(true);
            };

            const handleOverlayClick = (e) => {
                // Close if clicking outside the dialog
                if (e.target === overlay) {
                    handleCancel();
                }
            };

            const cleanup = () => {
                cancelBtn.removeEventListener('click', handleCancel);
                confirmBtn.removeEventListener('click', handleConfirm);
                overlay.removeEventListener('click', handleOverlayClick);
                document.removeEventListener('keydown', handleEscape);
            };

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                }
            };

            cancelBtn.addEventListener('click', handleCancel);
            confirmBtn.addEventListener('click', handleConfirm);
            overlay.addEventListener('click', handleOverlayClick);
            document.addEventListener('keydown', handleEscape);

            overlay.classList.add('show');
            confirmBtn.focus();
        });
    }
}

// Initialize the chat app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
