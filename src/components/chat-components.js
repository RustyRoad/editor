var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Simple hash function for generating numeric IDs from strings
var simpleHash = function (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};
// Auto-detect environment and generate customer ID
var getChatConfig = function () {
    var isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' ||
        window.location.hostname.includes('dev') ||
        window.location.port === '8081');
    // Generate customer ID (session-based)
    var customerId;
    if (typeof sessionStorage !== 'undefined') {
        customerId = sessionStorage.getItem('chat_customer_id') || '';
        if (!customerId) {
            customerId = "customer_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
            sessionStorage.setItem('chat_customer_id', customerId);
        }
    }
    else {
        customerId = "customer_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    }
    return {
        apiUrl: isDev ? 'http://localhost:8081' : 'https://api.spotlessbinco.com',
        customerId: customerId,
        environment: isDev ? 'development' : 'production'
    };
};
/** Chat component type constants */
var CHAT_COMPONENT_TYPES = {
    WIDGET_CONTAINER: 'chat-widget-container',
    CHAT_BUBBLE: 'chat-bubble',
    CHAT_WINDOW: 'chat-window',
    CHAT_MESSAGE: 'chat-message',
    CHAT_INPUT: 'chat-input',
    CHAT_STATUS: 'chat-status',
    PRECHAT_FORM: 'prechat-form'
};
/** Chat status constants */
var CHAT_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
    CONNECTING: 'connecting'
};
/** Default chat configuration */
var CHAT_DEFAULTS = {
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
};
/** Position classes for chat widget */
var POSITION_CLASSES = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4'
};
/** SSE connection manager for chat */
var ChatSSEManager = /** @class */ (function () {
    function ChatSSEManager(apiUrl) {
        if (apiUrl === void 0) { apiUrl = ''; }
        this.apiUrl = apiUrl;
        this.eventSource = null;
        this.subscribers = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.sessionId = null;
    }
    ChatSSEManager.prototype.connect = function (sessionId, customerId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.disconnect();
            _this.sessionId = sessionId;
            var url = "".concat(_this.apiUrl, "/api/chat/subscribe?session_id=").concat(sessionId, "&customer_id=").concat(customerId, "&client_id=grapesjs-").concat(Date.now());
            _this.eventSource = new EventSource(url);
            _this.eventSource.onopen = function () {
                console.log('[Chat SSE] Connection established');
                _this.reconnectAttempts = 0;
                resolve();
            };
            _this.eventSource.onmessage = function (event) {
                try {
                    var data = JSON.parse(event.data);
                    _this.notifySubscribers(data);
                }
                catch (error) {
                    console.error('[Chat SSE] Failed to parse message:', error);
                }
            };
            _this.eventSource.onerror = function (error) {
                console.error('[Chat SSE] Connection error:', error);
                _this.handleReconnect();
                reject(error);
            };
        });
    };
    ChatSSEManager.prototype.disconnect = function () {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    };
    ChatSSEManager.prototype.subscribe = function (callback) {
        var _this = this;
        this.subscribers.push(callback);
        return function () {
            var index = _this.subscribers.indexOf(callback);
            if (index > -1) {
                _this.subscribers.splice(index, 1);
            }
        };
    };
    ChatSSEManager.prototype.notifySubscribers = function (event) {
        this.subscribers.forEach(function (callback) {
            try {
                callback(event);
            }
            catch (error) {
                console.error('[Chat SSE] Subscriber callback error:', error);
            }
        });
    };
    ChatSSEManager.prototype.handleReconnect = function () {
        var _this = this;
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.sessionId) {
            this.reconnectAttempts++;
            var delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            setTimeout(function () {
                console.log("[Chat SSE] Reconnection attempt ".concat(_this.reconnectAttempts, "/").concat(_this.maxReconnectAttempts));
                // Reconnection logic would need customerId - this is simplified
                // In real implementation, we'd store the customerId
            }, delay);
        }
    };
    ChatSSEManager.prototype.isConnected = function () {
        var _a;
        return ((_a = this.eventSource) === null || _a === void 0 ? void 0 : _a.readyState) === EventSource.OPEN;
    };
    return ChatSSEManager;
}());
// Global SSE manager instance
var chatSSEManager = new ChatSSEManager();
/**
 * Main Chat Widget Container Component
 */
var createChatWidgetContainer = function (editor) {
    var domc = editor.DomComponents;
    domc.addType(CHAT_COMPONENT_TYPES.WIDGET_CONTAINER, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === CHAT_COMPONENT_TYPES.WIDGET_CONTAINER; },
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
            init: function () {
                var _this = this;
                this.on('change:position change:primaryColor change:secondaryColor change:welcomeMessage', function () { return _this.updateStyles(); });
                setTimeout(function () {
                    _this.updateStyles();
                }, 0);
            },
            updateStyles: function () {
                var position = this.get('position') || 'bottom-right';
                var primaryColor = this.get('primaryColor') || CHAT_DEFAULTS.primaryColor;
                var secondaryColor = this.get('secondaryColor') || CHAT_DEFAULTS.secondaryColor;
                this.addAttributes({
                    'data-chat-position': position,
                    'data-primary-color': primaryColor,
                    'data-secondary-color': secondaryColor
                });
                // Update position class
                var positionClass = POSITION_CLASSES[position];
                this.addClass(positionClass.split(' '));
            }
        },
        view: {
            onRender: function () {
                // Initialize chat functionality when rendered
                var el = this.el;
                var model = this.model;
                // Add chat widget styles
                addChatStyles();
                // Initialize chat functionality
                setTimeout(function () {
                    initializeChat(el, model);
                }, 100);
            }
        }
    });
};
// Helper functions moved outside the view object
function addChatStyles() {
    var styleId = 'chat-widget-styles';
    if (document.getElementById(styleId))
        return;
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = "\n    .chat-widget-container {\n      z-index: 9999;\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    }\n    \n    .chat-bubble {\n      width: 60px;\n      height: 60px;\n      border-radius: 50%;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      cursor: pointer;\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n      transition: all 0.3s ease;\n      position: relative;\n    }\n    \n    .chat-bubble:hover {\n      transform: scale(1.1);\n      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);\n    }\n    \n    .chat-bubble.has-notifications::after {\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      width: 12px;\n      height: 12px;\n      background: #ef4444;\n      border-radius: 50%;\n      border: 2px solid white;\n    }\n    \n    .chat-window {\n      position: absolute;\n      bottom: 80px;\n      width: 350px;\n      height: 500px;\n      background: white;\n      border-radius: 12px;\n      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);\n      display: none;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid #e5e7eb;\n    }\n    \n    .chat-window.open {\n      display: flex;\n    }\n    \n    .chat-window.bottom-right {\n      right: 0;\n    }\n    \n    .chat-window.bottom-left {\n      left: 0;\n    }\n    \n    .chat-window.top-right {\n      bottom: auto;\n      top: 80px;\n      right: 0;\n    }\n    \n    .chat-window.top-left {\n      bottom: auto;\n      top: 80px;\n      left: 0;\n    }\n    \n    .chat-header {\n      padding: 16px;\n      border-bottom: 1px solid #e5e7eb;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      background: #f9fafb;\n    }\n    \n    .chat-title {\n      font-weight: 600;\n      font-size: 16px;\n      margin: 0;\n    }\n    \n    .chat-status {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      font-size: 12px;\n      color: #6b7280;\n    }\n    \n    .status-dot {\n      width: 8px;\n      height: 8px;\n      border-radius: 50%;\n    }\n    \n    .status-dot.online { background: #10b981; }\n    .status-dot.away { background: #f59e0b; }\n    .status-dot.offline { background: #6b7280; }\n    .status-dot.connecting { background: #3b82f6; animation: pulse 2s infinite; }\n    \n    @keyframes pulse {\n      0%, 100% { opacity: 1; }\n      50% { opacity: 0.5; }\n    }\n    \n    .chat-close {\n      background: none;\n      border: none;\n      font-size: 20px;\n      cursor: pointer;\n      padding: 4px;\n      color: #6b7280;\n      border-radius: 4px;\n      transition: background 0.2s;\n    }\n    \n    .chat-close:hover {\n      background: #e5e7eb;\n    }\n    \n    .chat-messages {\n      flex: 1;\n      overflow-y: auto;\n      padding: 16px;\n      display: flex;\n      flex-direction: column;\n      gap: 12px;\n    }\n    \n    .chat-message {\n      max-width: 80%;\n      word-wrap: break-word;\n    }\n    \n    .chat-message.customer {\n      align-self: flex-end;\n    }\n    \n    .chat-message.manager {\n      align-self: flex-start;\n    }\n    \n    .message-bubble {\n      padding: 12px 16px;\n      border-radius: 18px;\n      margin-bottom: 4px;\n    }\n    \n    .chat-message.customer .message-bubble {\n      background: #3b82f6;\n      color: white;\n      border-bottom-right-radius: 4px;\n    }\n    \n    .chat-message.manager .message-bubble {\n      background: #f3f4f6;\n      color: #1f2937;\n      border-bottom-left-radius: 4px;\n    }\n    \n    .message-time {\n      font-size: 11px;\n      color: #9ca3af;\n      text-align: right;\n    }\n    \n    .chat-message.manager .message-time {\n      text-align: left;\n    }\n    \n    .chat-input-container {\n      padding: 16px;\n      border-top: 1px solid #e5e7eb;\n      background: #f9fafb;\n    }\n    \n    .chat-input-form {\n      display: flex;\n      gap: 8px;\n    }\n    \n    .chat-input {\n      flex: 1;\n      padding: 12px 16px;\n      border: 1px solid #d1d5db;\n      border-radius: 24px;\n      outline: none;\n      font-size: 14px;\n      resize: none;\n      max-height: 100px;\n    }\n    \n    .chat-input:focus {\n      border-color: #3b82f6;\n    }\n    \n    .chat-send-btn {\n      width: 40px;\n      height: 40px;\n      border-radius: 50%;\n      border: none;\n      background: #3b82f6;\n      color: white;\n      cursor: pointer;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: background 0.2s;\n    }\n    \n    .chat-send-btn:hover:not(:disabled) {\n      background: #2563eb;\n    }\n    \n    .chat-send-btn:disabled {\n      background: #d1d5db;\n      cursor: not-allowed;\n    }\n    \n    .chat-welcome {\n      padding: 16px;\n      text-align: center;\n      color: #6b7280;\n      font-size: 14px;\n      border-bottom: 1px solid #e5e7eb;\n    }\n    \n    .typing-indicator {\n      display: flex;\n      align-items: center;\n      gap: 4px;\n      padding: 12px 16px;\n      color: #6b7280;\n      font-size: 14px;\n      font-style: italic;\n    }\n    \n    .typing-dots {\n      display: flex;\n      gap: 2px;\n    }\n    \n    .typing-dot {\n      width: 4px;\n      height: 4px;\n      border-radius: 50%;\n      background: #9ca3af;\n      animation: typing 1.4s infinite;\n    }\n    \n    .typing-dot:nth-child(2) { animation-delay: 0.2s; }\n    .typing-dot:nth-child(3) { animation-delay: 0.4s; }\n    \n    @keyframes typing {\n      0%, 60%, 100% { transform: translateY(0); }\n      30% { transform: translateY(-10px); }\n    }\n    \n    @media (max-width: 640px) {\n      .chat-window {\n        width: calc(100vw - 32px);\n        height: 60vh;\n        right: -8px;\n        left: -8px;\n      }\n    }\n  ";
    document.head.appendChild(style);
}
function initializeChat(el, model) {
    var bubble = el.querySelector('[data-gjs-type="chat-bubble"]');
    var window = el.querySelector('[data-gjs-type="chat-window"]');
    if (!bubble || !window)
        return;
    // Toggle chat window
    bubble.addEventListener('click', function () {
        window.classList.toggle('open');
        if (window.classList.contains('open')) {
            startChatSession(model);
        }
    });
    // Close button
    var closeBtn = window.querySelector('.chat-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            window.classList.remove('open');
        });
    }
    // Initialize chat input
    initializeChatInput(window, model);
}
function startChatSession(model) {
    return __awaiter(this, void 0, void 0, function () {
        var config, welcomeMessage, response, chatData, sessionId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    config = getChatConfig();
                    welcomeMessage = model.get('welcomeMessage') || CHAT_DEFAULTS.welcomeMessage;
                    return [4 /*yield*/, fetch("".concat(config.apiUrl, "/api/chat/start"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                customer_id: config.customerId,
                                customer_name: 'Website Visitor',
                                initial_message: welcomeMessage
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to start chat session');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    chatData = _a.sent();
                    sessionId = chatData.chat_id;
                    // Store session ID
                    if (typeof window !== 'undefined') {
                        window.__CHAT_CONFIG__ = __assign(__assign({}, window.__CHAT_CONFIG__), { sessionId: sessionId });
                    }
                    // Connect to SSE
                    return [4 /*yield*/, chatSSEManager.connect(sessionId, config.customerId)];
                case 3:
                    // Connect to SSE
                    _a.sent();
                    // Subscribe to messages
                    chatSSEManager.subscribe(function (event) {
                        handleChatEvent(event, model);
                    });
                    console.log('[Chat] Session started:', sessionId, 'Environment:', config.environment);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('[Chat] Failed to start session:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handleChatEvent(event, model) {
    var _a, _b, _c;
    var window = (_b = (_a = model.view) === null || _a === void 0 ? void 0 : _a.el) === null || _b === void 0 ? void 0 : _b.querySelector('[data-gjs-type="chat-window"]');
    if (!window)
        return;
    var messagesContainer = window.querySelector('.chat-messages');
    if (!messagesContainer)
        return;
    switch (event.event) {
        case 'chat_history':
            // Load message history
            (_c = event.data.messages) === null || _c === void 0 ? void 0 : _c.forEach(function (msg) {
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
function addMessage(container, messageData) {
    var messageEl = document.createElement('div');
    messageEl.className = "chat-message ".concat(messageData.sender_user_id ? 'customer' : 'manager');
    var bubbleEl = document.createElement('div');
    bubbleEl.className = 'message-bubble';
    bubbleEl.textContent = messageData.content;
    var timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = new Date(messageData.sent_at).toLocaleTimeString();
    messageEl.appendChild(bubbleEl);
    messageEl.appendChild(timeEl);
    container.appendChild(messageEl);
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}
function updateChatStatus(window, statusData) {
    var statusEl = window.querySelector('.chat-status');
    if (!statusEl)
        return;
    var statusDot = statusEl.querySelector('.status-dot');
    var statusText = statusEl.querySelector('.status-text');
    if (statusDot && statusText) {
        // Determine status based on data
        var status_1 = statusData.status || 'online';
        statusDot.className = "status-dot ".concat(status_1);
        statusText.textContent = status_1.charAt(0).toUpperCase() + status_1.slice(1);
    }
}
function initializeChatInput(window, model) {
    var _this = this;
    var form = window.querySelector('.chat-input-form');
    var input = window.querySelector('.chat-input');
    var sendBtn = window.querySelector('.chat-send-btn');
    if (!form || !input || !sendBtn)
        return;
    form.addEventListener('submit', function (e) { return __awaiter(_this, void 0, void 0, function () {
        var message, config, sessionId, response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    message = input.value.trim();
                    if (!message)
                        return [2 /*return*/];
                    config = getChatConfig();
                    sessionId = (_a = globalThis.__CHAT_CONFIG__) === null || _a === void 0 ? void 0 : _a.sessionId;
                    if (!config.apiUrl || !sessionId) {
                        console.warn('[Chat] Missing API configuration');
                        return [2 /*return*/];
                    }
                    // Disable send button
                    sendBtn.setAttribute('disabled', 'disabled');
                    input.value = '';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("".concat(config.apiUrl, "/api/chat/message"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                thread_id: parseInt(sessionId),
                                sender_user_id: simpleHash(config.customerId), // Simple hash for demo
                                content: message
                            })
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _b.sent();
                    console.error('[Chat] Failed to send message:', error_2);
                    input.value = message; // Restore message on error
                    return [3 /*break*/, 5];
                case 4:
                    sendBtn.removeAttribute('disabled');
                    input.focus();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Auto-resize textarea
    input.addEventListener('input', function () {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
}
/**
 * Chat Bubble Component
 */
var createChatBubble = function (editor) {
    var domc = editor.DomComponents;
    domc.addType(CHAT_COMPONENT_TYPES.CHAT_BUBBLE, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === CHAT_COMPONENT_TYPES.CHAT_BUBBLE; },
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
            init: function () {
                var _this = this;
                this.on('change:iconSvg', function () { return _this.updateIcon(); });
                this.on('change:showNotifications', function () { return _this.updateNotifications(); });
                setTimeout(function () {
                    _this.updateIcon();
                    _this.updateNotifications();
                }, 0);
            },
            updateIcon: function () {
                var iconSvg = this.get('iconSvg') || '';
                var iconComponent = this.components().at(0);
                if (iconComponent) {
                    iconComponent.set('content', iconSvg);
                }
            },
            updateNotifications: function () {
                var showNotifications = this.get('showNotifications');
                if (showNotifications) {
                    this.addClass('has-notifications');
                }
                else {
                    this.removeClass('has-notifications');
                }
            }
        }
    });
};
/**
 * Chat Window Component
 */
var createChatWindow = function (editor) {
    var domc = editor.DomComponents;
    domc.addType(CHAT_COMPONENT_TYPES.CHAT_WINDOW, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === CHAT_COMPONENT_TYPES.CHAT_WINDOW; },
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
            init: function () {
                var _this = this;
                this.on('change:title', function () { return _this.updateTitle(); });
                this.on('change:welcomeMessage', function () { return _this.updateWelcomeMessage(); });
                setTimeout(function () {
                    _this.updateTitle();
                    _this.updateWelcomeMessage();
                }, 0);
            },
            updateTitle: function () {
                var title = this.get('title') || 'Customer Support';
                var titleComponent = this.find('.chat-title')[0];
                if (titleComponent) {
                    titleComponent.set('content', title);
                }
            },
            updateWelcomeMessage: function () {
                var welcomeMessage = this.get('welcomeMessage') || 'Hi there! How can we help you today?';
                var welcomeComponent = this.find('.chat-welcome')[0];
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
var createChatStatus = function (editor) {
    var domc = editor.DomComponents;
    domc.addType(CHAT_COMPONENT_TYPES.CHAT_STATUS, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === CHAT_COMPONENT_TYPES.CHAT_STATUS; },
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
            init: function () {
                var _this = this;
                this.on('change:status', function () { return _this.updateStatus(); });
                setTimeout(function () { return _this.updateStatus(); }, 0);
            },
            updateStatus: function () {
                var status = this.get('status') || 'online';
                var statusDot = this.find('.status-dot')[0];
                var statusText = this.find('.status-text')[0];
                if (statusDot) {
                    statusDot.set('attributes', { class: "status-dot ".concat(status) });
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
var createChatInput = function (editor) {
    var domc = editor.DomComponents;
    domc.addType(CHAT_COMPONENT_TYPES.CHAT_INPUT, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === CHAT_COMPONENT_TYPES.CHAT_INPUT; },
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
            init: function () {
                var _this = this;
                this.on('change:placeholder', function () { return _this.updatePlaceholder(); });
                setTimeout(function () { return _this.updatePlaceholder(); }, 0);
            },
            updatePlaceholder: function () {
                var placeholder = this.get('placeholder') || 'Type your message...';
                var textarea = this.find('.chat-input')[0];
                if (textarea) {
                    textarea.addAttributes({ placeholder: placeholder });
                }
            }
        }
    });
};
/**
 * Main export function to initialize all chat components
 */
export default function initChatComponents(editor) {
    // Create all chat component types
    createChatWidgetContainer(editor);
    createChatBubble(editor);
    createChatWindow(editor);
    createChatStatus(editor);
    createChatInput(editor);
    // Add chat components to block manager
    var bm = editor.BlockManager;
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
    editor.addStyle("\n    .gjs-frame [data-gjs-type=\"chat-widget-container\"] {\n      position: relative !important;\n      transform: scale(0.8);\n      transform-origin: bottom right;\n    }\n    \n    .gjs-frame [data-gjs-type=\"chat-bubble\"] {\n      cursor: pointer;\n    }\n    \n    .gjs-frame [data-gjs-type=\"chat-window\"] {\n      display: flex !important;\n    }\n  ");
    console.log('[Chat Components] Initialized');
}
// Export types for external use
export { CHAT_COMPONENT_TYPES, CHAT_STATUS, chatSSEManager };
