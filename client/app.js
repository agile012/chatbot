import supabase from './supabase-client.js';

class ChatApp {
    constructor() {
        this.currentUser = null;
        this.messages = [];
        this.isTyping = false;
        this.userId = this.generateUserId();
        
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
        this.inputArea = document.getElementById('inputArea');
        
        // Auth elements
        this.authModal = document.getElementById('authModal');
        this.signInBtn = document.getElementById('signInBtn');
        this.signOutBtn = document.getElementById('signOutBtn');
        
        // User profile elements
        this.userProfile = document.getElementById('userProfile');
        this.userName = document.getElementById('userName');
        this.userAvatar = document.getElementById('userAvatar');
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
                this.handleSignIn(user);
            } else {
                this.showAuthModal();
            }

            // Listen for auth state changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    this.handleSignIn(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.handleSignOut();
                }
            });

        } catch (error) {
            console.error('Auth check error:', error);
            this.showAuthModal();
        }
    }

    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account'
                    }
                }
            });

            if (error) throw error;

        } catch (error) {
            console.error('Sign in error:', error);
            this.showToast('Failed to sign in. Please try again.', 'error');
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            this.handleSignOut();
            this.showToast('Signed out successfully', 'success');

        } catch (error) {
            console.error('Sign out error:', error);
            this.showToast('Failed to sign out', 'error');
        }
    }

    handleSignIn(user) {
        // Validate email domain - only @iima.ac.in allowed
        const email = user.email || '';
        if (!email.endsWith('@iima.ac.in')) {
            supabase.auth.signOut();
            this.handleSignOut();
            this.showToast('Please use your official IIMA email (@iima.ac.in)', 'error');
            return;
        }
        
        this.currentUser = user;
        
        // Hide auth modal
        this.hideAuthModal();
        
        // Show input area
        if (this.inputArea) {
            this.inputArea.style.display = 'flex';
        }
        
        // Hide welcome section
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'none';
        }
        
        // Update UI with user info
        if (this.userName) {
            this.userName.textContent = user.user_metadata?.full_name || user.email;
        }
        if (this.userAvatar) {
            this.userAvatar.src = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=003d82&color=fff`;
        }
        if (this.userProfile) {
            this.userProfile.style.display = 'flex';
        }
        
        this.showToast('Welcome back!', 'success');
    }

    handleSignOut() {
        this.currentUser = null;
        this.messages = [];
        
        // Hide input area
        if (this.inputArea) {
            this.inputArea.style.display = 'none';
        }
        
        // Clear UI
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'flex';
        }
        if (this.userProfile) {
            this.userProfile.style.display = 'none';
        }
        
        // Show auth modal
        this.showAuthModal();
    }

    showAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'flex';
        }
        if (this.chatForm) {
            this.chatForm.style.display = 'none';
        }
    }

    hideAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
        }
        if (this.chatForm) {
            this.chatForm.style.display = 'flex';
        }
    }

    async startNewChat() {
        if (!confirm('Start a new conversation? This will clear the current chat.')) return;
        
        try {
            // Reset Dialogflow session
            await fetch('/api/dialogflow/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId
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
            
            this.showToast('New conversation started', 'success');

        } catch (error) {
            console.error('Error starting new chat:', error);
            this.showToast('Failed to start new chat', 'error');
        }
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Hide welcome section on first message
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'none';
        }

        // Add user message to UI
        this.addMessage(message, 'user');
        
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
                    userId: this.userId
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
                data.messages.forEach(msg => {
                    if (msg.type === 'text') {
                        this.addMessage(msg.text, 'bot');
                    }
                });
            } else {
                this.addMessage('I received your message, but I\'m not sure how to respond. Could you please rephrase?', 'bot');
            }

        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
            this.showToast('Failed to send message. Please check your connection.', 'error');
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'user' && this.userAvatar && this.userAvatar.src) {
            const img = document.createElement('img');
            img.src = this.userAvatar.src;
            img.alt = 'User';
            avatar.appendChild(img);
        } else if (sender === 'user') {
            avatar.textContent = 'You';
        } else {
            avatar.textContent = '🤖';
        }
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';

        // Render Markdown -> HTML, sanitize with DOMPurify if available
        try {
            let html = text;
            if (typeof marked !== 'undefined') {
                html = typeof marked.parse === 'function' ? marked.parse(text) : marked(text);
            } else {
                html = text.replace(/\n/g, '<br>');
            }

            if (typeof DOMPurify !== 'undefined') {
                html = DOMPurify.sanitize(html, {ALLOWED_ATTR: ['href', 'target', 'rel']});
            }

            messageText.innerHTML = html;

            // Ensure external links open safely
            const anchors = messageText.querySelectorAll('a');
            anchors.forEach(a => {
                if (!a.target) a.target = '_blank';
                a.rel = a.rel ? a.rel + ' noopener noreferrer' : 'noopener noreferrer';
            });

        } catch (e) {
            messageText.textContent = text;
        }
        
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
        this.messages.push({
            text,
            sender,
            timestamp: Date.now()
        });
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
}

// Initialize the chat app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
