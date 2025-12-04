// Simple working version without Supabase database
class ChatApp {
    constructor() {
        this.messages = [];
        this.userId = this.generateUserId();
        this.isTyping = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.hideAuthModal(); // Start without auth for now
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
        this.messagesContainer = document.getElementById('messages');
        this.welcomeSection = document.getElementById('welcomeSection');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.chatForm = document.getElementById('chatForm');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.toast = document.getElementById('toast');
        this.authModal = document.getElementById('authModal');
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

    hideAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
        }
        if (this.chatForm) {
            this.chatForm.style.display = 'flex';
        }
    }

    autoResizeTextarea() {
        if (this.messageInput) {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        }
    }

    async handleSendMessage() {
        const message = this.messageInput?.value.trim();
        
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
            // Send message to backend
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
        if (!this.messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'You' : '🤖';
        
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
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({
            text,
            sender,
            timestamp: Date.now()
        });
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

    async startNewChat() {
        if (confirm('Are you sure you want to start a new conversation? This will clear the current chat.')) {
            try {
                // Reset session on backend
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
                console.error('Error resetting chat:', error);
                this.showToast('Failed to reset chat', 'error');
            }
        }
    }

    showToast(message, type = 'info') {
        if (!this.toast) return;
        
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the chat app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
