// @ts-nocheck
import type { Editor, Component } from 'grapesjs';

/**
 * Chat Components for GrapesJS Editor
 *
 * This file defines a complete Intercom-style chat widget system that integrates
 * with the existing Fastify chat API using Server-Sent Events (SSE).
 *
 * Components include:
 * - Chat Widget Container (main chat system)
 * - Chat Bubble (floating trigger button)
 * - Chat Window (conversation interface)
 * - Chat Message (individual message display)
 * - Chat Input (message input with send button)
 * - Chat Status (online/offline indicators)
 *
 * API Integration:
 * - Uses existing /api/chat/start, /api/chat/message, /api/chat/subscribe endpoints
 * - SSE connection for real-time messaging
 * - Automatic session management and reconnection
 */

// Global declarations for chat-related data
declare global {
  interface Window {
    __CHAT_CONFIG__?: {
      sessionId?: string;
      businessHours?: {
        start: string;
        end: string;
        timezone: string;
        days: number[];
      };
    };
  }
}

// Simple hash function for generating numeric IDs from strings
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Auto-detect environment and generate customer ID
const getChatConfig = () => {
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('dev') ||
    window.location.port === '8081'
  );

  // Generate customer ID (session-based)
  let customerId: string;
  if (typeof sessionStorage !== 'undefined') {
    customerId = sessionStorage.getItem('chat_customer_id') || '';
    if (!customerId) {
      customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_customer_id', customerId);
    }
  } else {
    customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  return {
    apiUrl: isDev ? 'http://localhost:8081' : 'https://api.spotlessbinco.com',
    customerId,
    environment: isDev ? 'development' : 'production'
  };
};

/** Chat component type constants */
const CHAT_COMPONENT_TYPES = {
  WIDGET_CONTAINER: 'chat-widget-container',
  CHAT_BUBBLE: 'chat-bubble',
  CHAT_WINDOW: 'chat-window',
  CHAT_MESSAGE: 'chat-message',
  CHAT_INPUT: 'chat-input',
  CHAT_STATUS: 'chat-status',
  PRECHAT_FORM: 'prechat-form'
} as const;

/** Chat status constants */
const CHAT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  CONNECTING: 'connecting'
} as const;

/** Default chat configuration */
const CHAT_DEFAULTS = {
  position: 'bottom-right',
  primaryColor: '#10b981',
  secondaryColor: '#6b7280',
  welcomeMessage: 'Hi there! How can we help you today?',
  awayMessage: 'We\'re currently away. Please leave a message and we\'ll get back to you.',
  offlineMessage: 'Chat is currently unavailable. Please try again later.',
  businessHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'America/New_York',
    days: [1, 2, 3, 4, 5] // Monday - Friday
  }
} as const;

/** Position classes for chat widget */
const POSITION_CLASSES = {
  'bottom-right': 'fixed bottom-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'top-right': 'fixed top-4 right-4',
  'top-left': 'fixed top-4 left-4'
} as const;

/** Interface for chat message data */
interface ChatMessage {
  id: string;
  content: string;
  sender: 'customer' | 'manager';
  timestamp: Date;
  senderName?: string;
}

/** Interface for chat session data */
interface ChatSession {
  id: string;
  customerId: string;
  status: 'active' | 'closed';
  createdAt: Date;
  lastMessageAt?: Date;
}

/** SSE connection manager for chat */
class ChatSSEManager {
  private eventSource: EventSource | null = null;
  private subscribers: Array<(event: ChatMessage) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private sessionId: string | null = null;

  constructor(private apiUrl: string = '') {}

  connect(sessionId: string, customerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.sessionId = sessionId;

      const url = `${this.apiUrl}/api/chat/subscribe?session_id=${sessionId}&customer_id=${customerId}&client_id=grapesjs-${Date.now()}`;
      
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[Chat SSE] Connection established');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('[Chat SSE] Failed to parse message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[Chat SSE] Connection error:', error);
        this.handleReconnect();
        reject(error);
      };
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(callback: (event: ChatMessage) => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(event: ChatMessage) {
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[Chat SSE] Subscriber callback error:', error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.sessionId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`[Chat SSE] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        // Reconnection logic would need customerId - this is simplified
        // In real implementation, we'd store the customerId
      }, delay);
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Global SSE manager instance
const chatSSEManager = new ChatSSEManager();

/**
 * Main Chat Widget Container Component
 */
const createChatWidgetContainer = (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType(CHAT_COMPONENT_TYPES.WIDGET_CONTAINER, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === CHAT_COMPONENT_TYPES.WIDGET_CONTAINER,
    
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': CHAT_COMPONENT_TYPES.WIDGET_CONTAINER,
          'class': 'chat-widget-container',
          'data-chat-position': 'bottom-right'
        },
        components: [
          { type: CHAT_COMPONENT_TYPES.CHAT_BUBBLE },
          { type: CHAT_COMPONENT_TYPES.CHAT_WINDOW }
        ],
        
        traits: [
          {
            type: 'select',
            label: 'Position',
            name: 'position',
            options: [
              { id: 'bottom-right', name: 'Bottom Right' },
              { id: 'bottom-left', name: 'Bottom Left' },
              { id: 'top-right', name: 'Top Right' },
              { id: 'top-left', name: 'Top Left' }
            ],
            changeProp: true
          },
          {
            type: 'color',
            label: 'Primary Color',
            name: 'primaryColor',
            changeProp: true
          },
          {
            type: 'color',
            label: 'Secondary Color',
            name: 'secondaryColor',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Welcome Message',
            name: 'welcomeMessage',
            changeProp: true
          }
        ],
        
        position: 'bottom-right',
        primaryColor: CHAT_DEFAULTS.primaryColor,
        secondaryColor: CHAT_DEFAULTS.secondaryColor,
        welcomeMessage: CHAT_DEFAULTS.welcomeMessage,
        apiUrl: '',
        customerId: ''
      },

      init(this: Component) {
        (this as any).on('change:position change:primaryColor change:secondaryColor change:welcomeMessage', 
          () => (this as any).updateStyles());
        
        setTimeout(() => {
          (this as any).updateStyles();
        }, 0);
      },

      updateStyles(this: Component) {
        const position = (this as any).get('position') || 'bottom-right';
        const primaryColor = (this as any).get('primaryColor') || CHAT_DEFAULTS.primaryColor;
        const secondaryColor = (this as any).get('secondaryColor') || CHAT_DEFAULTS.secondaryColor;
        
        this.addAttributes({
          'data-chat-position': position,
          'data-primary-color': primaryColor,
          'data-secondary-color': secondaryColor
        });

        // Update position class
        const positionClass = POSITION_CLASSES[position as keyof typeof POSITION_CLASSES];
        this.addClass(positionClass.split(' '));
      }
    },

    view: {
      onRender(this: { el: HTMLElement; model: Component }) {
        // Initialize chat functionality when rendered
        const el = this.el;
        const model = this.model;
        
        // Add chat widget styles
        addChatStyles();
        
        // Initialize chat functionality
        setTimeout(() => {
          initializeChat(el, model);
        }, 100);
      }
    }
  });
};

// Helper functions moved outside the view object
function addChatStyles() {
  const styleId = 'chat-widget-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .chat-widget-container {
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .chat-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      position: relative;
    }
    
    .chat-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    .chat-bubble.has-notifications::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }
    
    .chat-window {
      position: absolute;
      bottom: 80px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    
    .chat-window.open {
      display: flex;
    }
    
    .chat-window.bottom-right {
      right: 0;
    }
    
    .chat-window.bottom-left {
      left: 0;
    }
    
    .chat-window.top-right {
      bottom: auto;
      top: 80px;
      right: 0;
    }
    
    .chat-window.top-left {
      bottom: auto;
      top: 80px;
      left: 0;
    }
    
    .chat-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f9fafb;
    }
    
    .chat-title {
      font-weight: 600;
      font-size: 16px;
      margin: 0;
    }
    
    .chat-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #6b7280;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .status-dot.online { background: #10b981; }
    .status-dot.away { background: #f59e0b; }
    .status-dot.offline { background: #6b7280; }
    .status-dot.connecting { background: #3b82f6; animation: pulse 2s infinite; }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .chat-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      color: #6b7280;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .chat-close:hover {
      background: #e5e7eb;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .chat-message {
      max-width: 80%;
      word-wrap: break-word;
    }
    
    .chat-message.customer {
      align-self: flex-end;
    }
    
    .chat-message.manager {
      align-self: flex-start;
    }
    
    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      margin-bottom: 4px;
    }
    
    .chat-message.customer .message-bubble {
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .chat-message.manager .message-bubble {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    
    .message-time {
      font-size: 11px;
      color: #9ca3af;
      text-align: right;
    }
    
    .chat-message.manager .message-time {
      text-align: left;
    }
    
    .chat-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    
    .chat-input-form {
      display: flex;
      gap: 8px;
    }
    
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
      resize: none;
      max-height: 100px;
    }
    
    .chat-input:focus {
      border-color: #3b82f6;
    }
    
    .chat-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #3b82f6;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .chat-send-btn:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .chat-send-btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }
    
    .chat-welcome {
      padding: 16px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      color: #6b7280;
      font-size: 14px;
      font-style: italic;
    }
    
    .typing-dots {
      display: flex;
      gap: 2px;
    }
    
    .typing-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite;
    }
    
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }
    
    @media (max-width: 640px) {
      .chat-window {
        width: calc(100vw - 32px);
        height: 60vh;
        right: -8px;
        left: -8px;
      }
    }
  `;
  document.head.appendChild(style);
}

function initializeChat(el: HTMLElement, model: Component) {
  const bubble = el.querySelector('[data-gjs-type="chat-bubble"]');
  const window = el.querySelector('[data-gjs-type="chat-window"]') as HTMLElement;
  
  if (!bubble || !window) return;

  // Toggle chat window
  bubble.addEventListener('click', () => {
    window.classList.toggle('open');
    if (window.classList.contains('open')) {
      startChatSession(model);
    }
  });

  // Close button
  const closeBtn = window.querySelector('.chat-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.classList.remove('open');
    });
  }

  // Initialize chat input
  initializeChatInput(window, model);
}

async function startChatSession(model: Component) {
  try {
    const config = getChatConfig();
    const welcomeMessage = (model as any).get('welcomeMessage') || CHAT_DEFAULTS.welcomeMessage;

    // Start chat session
    const response = await fetch(`${config.apiUrl}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: config.customerId,
        customer_name: 'Website Visitor',
        initial_message: welcomeMessage
      })
    });

    if (!response.ok) {
      throw new Error('Failed to start chat session');
    }

    const chatData = await response.json();
    const sessionId = chatData.chat_id;

    // Store session ID
    if (typeof window !== 'undefined') {
      window.__CHAT_CONFIG__ = {
        ...window.__CHAT_CONFIG__,
        sessionId
      };
    }

    // Connect to SSE
    await chatSSEManager.connect(sessionId, config.customerId);
    
    // Subscribe to messages
    chatSSEManager.subscribe((event) => {
      handleChatEvent(event, model);
    });

    console.log('[Chat] Session started:', sessionId, 'Environment:', config.environment);
  } catch (error) {
    console.error('[Chat] Failed to start session:', error);
  }
}

function handleChatEvent(event: any, model: Component) {
  const window = model.view?.el?.querySelector('[data-gjs-type="chat-window"]') as HTMLElement;
  if (!window) return;

  const messagesContainer = window.querySelector('.chat-messages') as HTMLElement;
  if (!messagesContainer) return;

  switch (event.event) {
    case 'chat_history':
      // Load message history
      event.data.messages?.forEach((msg: any) => {
        addMessage(messagesContainer, msg);
      });
      break;
    
    case 'message_received':
    case 'message_sent':
      // Add new message
      addMessage(messagesContainer, event.data);
      break;
    
    case 'chat_status_update':
      // Update status
      updateChatStatus(window, event.data);
      break;
  }
}

function addMessage(container: HTMLElement, messageData: any) {
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${messageData.sender_user_id ? 'customer' : 'manager'}`;
  
  const bubbleEl = document.createElement('div');
  bubbleEl.className = 'message-bubble';
  bubbleEl.textContent = messageData.content;
  
  const timeEl = document.createElement('div');
  timeEl.className = 'message-time';
  timeEl.textContent = new Date(messageData.sent_at).toLocaleTimeString();
  
  messageEl.appendChild(bubbleEl);
  messageEl.appendChild(timeEl);
  container.appendChild(messageEl);
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function updateChatStatus(window: HTMLElement, statusData: any) {
  const statusEl = window.querySelector('.chat-status');
  if (!statusEl) return;

  const statusDot = statusEl.querySelector('.status-dot');
  const statusText = statusEl.querySelector('.status-text');
  
  if (statusDot && statusText) {
    // Determine status based on data
    const status = statusData.status || 'online';
    statusDot.className = `status-dot ${status}`;
    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function initializeChatInput(window: HTMLElement, model: Component) {
  const form = window.querySelector('.chat-input-form');
  const input = window.querySelector('.chat-input') as HTMLTextAreaElement;
  const sendBtn = window.querySelector('.chat-send-btn');
  
  if (!form || !input || !sendBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = input.value.trim();
    if (!message) return;

    const config = getChatConfig();
    const sessionId = (globalThis as any).__CHAT_CONFIG__?.sessionId;

    if (!config.apiUrl || !sessionId) {
      console.warn('[Chat] Missing API configuration');
      return;
    }

    // Disable send button
    sendBtn.setAttribute('disabled', 'disabled');
    input.value = '';

    try {
      const response = await fetch(`${config.apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: parseInt(sessionId),
          sender_user_id: simpleHash(config.customerId), // Simple hash for demo
          content: message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Message will be received via SSE and displayed
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
      input.value = message; // Restore message on error
    } finally {
      sendBtn.removeAttribute('disabled');
      input.focus();
    }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });
}

/**
 * Chat Bubble Component
 */
const createChatBubble = (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType(CHAT_COMPONENT_TYPES.CHAT_BUBBLE, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === CHAT_COMPONENT_TYPES.CHAT_BUBBLE,
    
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': CHAT_COMPONENT_TYPES.CHAT_BUBBLE,
          'class': 'chat-bubble',
          'style': 'background: #3b82f6; color: white;'
        },
        components: [
          {
            type: 'text',
            content: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
          }
        ],
        
        traits: [
          {
            type: 'text',
            label: 'Icon SVG',
            name: 'iconSvg',
            changeProp: true
          },
          {
            type: 'checkbox',
            label: 'Show Notifications',
            name: 'showNotifications',
            changeProp: true
          }
        ],
        
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        showNotifications: true
      },

      init(this: Component) {
        this.on('change:iconSvg', () => (this as any).updateIcon());
        this.on('change:showNotifications', () => (this as any).updateNotifications());
        
        setTimeout(() => {
          (this as any).updateIcon();
          (this as any).updateNotifications();
        }, 0);
      },

      updateIcon(this: Component) {
        const iconSvg = this.get('iconSvg') || '';
        const iconComponent = this.components().at(0);
        if (iconComponent) {
          iconComponent.set('content', iconSvg);
        }
      },

      updateNotifications(this: Component) {
        const showNotifications = this.get('showNotifications');
        if (showNotifications) {
          this.addClass('has-notifications');
        } else {
          this.removeClass('has-notifications');
        }
      }
    }
  });
};

/**
 * Chat Window Component
 */
const createChatWindow = (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType(CHAT_COMPONENT_TYPES.CHAT_WINDOW, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === CHAT_COMPONENT_TYPES.CHAT_WINDOW,
    
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': CHAT_COMPONENT_TYPES.CHAT_WINDOW,
          'class': 'chat-window'
        },
        components: [
          {
            tagName: 'div',
            attributes: { class: 'chat-header' },
            components: [
              {
                tagName: 'div',
                components: [
                  {
                    tagName: 'h3',
                    attributes: { class: 'chat-title' },
                    content: 'Customer Support'
                  },
                  {
                    type: CHAT_COMPONENT_TYPES.CHAT_STATUS
                  }
                ]
              },
              {
                tagName: 'button',
                attributes: { class: 'chat-close' },
                content: '×'
              }
            ]
          },
          {
            tagName: 'div',
            attributes: { class: 'chat-welcome' },
            content: 'Hi there! How can we help you today?'
          },
          {
            tagName: 'div',
            attributes: { class: 'chat-messages' },
            components: []
          },
          {
            type: CHAT_COMPONENT_TYPES.CHAT_INPUT
          }
        ],
        
        traits: [
          {
            type: 'text',
            label: 'Title',
            name: 'title',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Welcome Message',
            name: 'welcomeMessage',
            changeProp: true
          }
        ],
        
        title: 'Customer Support',
        welcomeMessage: 'Hi there! How can we help you today?'
      },

      init(this: Component) {
        this.on('change:title', () => (this as any).updateTitle());
        this.on('change:welcomeMessage', () => (this as any).updateWelcomeMessage());
        
        setTimeout(() => {
          (this as any).updateTitle();
          (this as any).updateWelcomeMessage();
        }, 0);
      },

      updateTitle(this: Component) {
        const title = this.get('title') || 'Customer Support';
        const titleComponent = this.find('.chat-title')[0];
        if (titleComponent) {
          titleComponent.set('content', title);
        }
      },

      updateWelcomeMessage(this: Component) {
        const welcomeMessage = this.get('welcomeMessage') || 'Hi there! How can we help you today?';
        const welcomeComponent = this.find('.chat-welcome')[0];
        if (welcomeComponent) {
          welcomeComponent.set('content', welcomeMessage);
        }
      }
    }
  });
};

/**
 * Chat Status Component
 */
const createChatStatus = (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType(CHAT_COMPONENT_TYPES.CHAT_STATUS, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === CHAT_COMPONENT_TYPES.CHAT_STATUS,
    
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': CHAT_COMPONENT_TYPES.CHAT_STATUS,
          'class': 'chat-status'
        },
        components: [
          {
            tagName: 'div',
            attributes: { class: 'status-dot online' }
          },
          {
            tagName: 'span',
            attributes: { class: 'status-text' },
            content: 'Online'
          }
        ],
        
        traits: [
          {
            type: 'select',
            label: 'Status',
            name: 'status',
            options: [
              { id: 'online', name: 'Online' },
              { id: 'away', name: 'Away' },
              { id: 'offline', name: 'Offline' },
              { id: 'connecting', name: 'Connecting' }
            ],
            changeProp: true
          }
        ],
        
        status: 'online'
      },

      init(this: Component) {
        this.on('change:status', () => (this as any).updateStatus());
        setTimeout(() => (this as any).updateStatus(), 0);
      },

      updateStatus(this: Component) {
        const status = this.get('status') || 'online';
        const statusDot = this.find('.status-dot')[0];
        const statusText = this.find('.status-text')[0];
        
        if (statusDot) {
          statusDot.set('attributes', { class: `status-dot ${status}` });
        }
        
        if (statusText) {
          statusText.set('content', status.charAt(0).toUpperCase() + status.slice(1));
        }
      }
    }
  });
};

/**
 * Chat Input Component
 */
const createChatInput = (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType(CHAT_COMPONENT_TYPES.CHAT_INPUT, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === CHAT_COMPONENT_TYPES.CHAT_INPUT,
    
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': CHAT_COMPONENT_TYPES.CHAT_INPUT,
          'class': 'chat-input-container'
        },
        components: [
          {
            tagName: 'form',
            attributes: { class: 'chat-input-form' },
            components: [
              {
                tagName: 'textarea',
                attributes: {
                  class: 'chat-input',
                  placeholder: 'Type your message...',
                  rows: 1
                }
              },
              {
                tagName: 'button',
                attributes: {
                  type: 'submit',
                  class: 'chat-send-btn'
                },
                components: [
                  {
                    type: 'text',
                    content: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'
                  }
                ]
              }
            ]
          }
        ],
        
        traits: [
          {
            type: 'text',
            label: 'Placeholder',
            name: 'placeholder',
            changeProp: true
          }
        ],
        
        placeholder: 'Type your message...'
      },

      init(this: Component) {
        this.on('change:placeholder', () => (this as any).updatePlaceholder());
        setTimeout(() => (this as any).updatePlaceholder(), 0);
      },

      updatePlaceholder(this: Component) {
        const placeholder = this.get('placeholder') || 'Type your message...';
        const textarea = this.find('.chat-input')[0];
        if (textarea) {
          textarea.addAttributes({ placeholder });
        }
      }
    }
  });
};

/**
 * Main export function to initialize all chat components
 */
export default function initChatComponents(editor: Editor): void {
  // Create all chat component types
  createChatWidgetContainer(editor);
  createChatBubble(editor);
  createChatWindow(editor);
  createChatStatus(editor);
  createChatInput(editor);

  // Add chat components to block manager
  const bm = editor.BlockManager;

  // Main chat widget
  bm.add('chat-widget', {
    label: 'Chat Widget',
    category: 'Chat Components',
    content: { type: CHAT_COMPONENT_TYPES.WIDGET_CONTAINER },
    attributes: { 
      class: 'fa fa-comments',
      title: 'Add a complete chat widget system'
    }
  });

  // Individual chat components
  bm.add('chat-bubble', {
    label: 'Chat Bubble',
    category: 'Chat Components',
    content: { type: CHAT_COMPONENT_TYPES.CHAT_BUBBLE },
    attributes: { 
      class: 'fa fa-comment',
      title: 'Add a floating chat bubble'
    }
  });

  bm.add('chat-window', {
    label: 'Chat Window',
    category: 'Chat Components',
    content: { type: CHAT_COMPONENT_TYPES.CHAT_WINDOW },
    attributes: { 
      class: 'fa fa-window-maximize',
      title: 'Add a chat conversation window'
    }
  });

  // Add some global styles for the editor
  editor.addStyle(`
    .gjs-frame [data-gjs-type="chat-widget-container"] {
      position: relative !important;
      transform: scale(0.8);
      transform-origin: bottom right;
    }
    
    .gjs-frame [data-gjs-type="chat-bubble"] {
      cursor: pointer;
    }
    
    .gjs-frame [data-gjs-type="chat-window"] {
      display: flex !important;
    }
  `);

  console.log('[Chat Components] Initialized');
}

// Export types for external use
export { CHAT_COMPONENT_TYPES, CHAT_STATUS, chatSSEManager };
