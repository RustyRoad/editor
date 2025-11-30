export default {
  content: {
    type: 'chat-window',
    attributes: {
      'data-gjs-type': 'chat-window',
      'class': 'chat-window',
      'style': 'position: absolute; bottom: 80px; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); display: none; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb; right: 0;'
    },
    components: [
      {
        tagName: 'div',
        attributes: { 
          class: 'chat-header',
          style: 'padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; background: #f9fafb;'
        },
        components: [
          {
            tagName: 'div',
            components: [
              {
                tagName: 'h3',
                attributes: { 
                  class: 'chat-title',
                  style: 'font-weight: 600; font-size: 16px; margin: 0;'
                },
                content: 'Customer Support'
              },
              {
                type: 'chat-status',
                attributes: {
                  'data-gjs-type': 'chat-status',
                  'class': 'chat-status',
                  style: 'display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280;'
                },
                components: [
                  {
                    tagName: 'div',
                    attributes: { 
                      class: 'status-dot online',
                      style: 'width: 8px; height: 8px; border-radius: 50%; background: #10b981;'
                    }
                  },
                  {
                    tagName: 'span',
                    attributes: { 
                      class: 'status-text',
                      style: 'font-size: 12px;'
                    },
                    content: 'Online'
                  }
                ]
              }
            ]
          },
          {
            tagName: 'button',
            attributes: { 
              class: 'chat-close',
              style: 'background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; color: #6b7280; border-radius: 4px; transition: background 0.2s;'
            },
            content: '×'
          }
        ]
      },
      {
        tagName: 'div',
        attributes: { 
          class: 'chat-welcome',
          style: 'padding: 16px; text-align: center; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;'
        },
        content: 'Hi there! How can we help you today?'
      },
      {
        tagName: 'div',
        attributes: { 
          class: 'chat-messages',
          style: 'flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;'
        },
        components: []
      },
      {
        type: 'chat-input',
        attributes: {
          'data-gjs-type': 'chat-input',
          'class': 'chat-input-container',
          style: 'padding: 16px; border-top: 1px solid #e5e7eb; background: #f9fafb;'
        },
        components: [
          {
            tagName: 'form',
            attributes: { 
              class: 'chat-input-form',
              style: 'display: flex; gap: 8px;'
            },
            components: [
              {
                tagName: 'textarea',
                attributes: {
                  class: 'chat-input',
                  placeholder: 'Type your message...',
                  rows: 1,
                  style: 'flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 24px; outline: none; font-size: 14px; resize: none; max-height: 100px;'
                }
              },
              {
                tagName: 'button',
                attributes: {
                  type: 'submit',
                  class: 'chat-send-btn',
                  style: 'width: 40px; height: 40px; border-radius: 50%; border: none; background: #3b82f6; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;'
                },
                components: [
                  {
                    type: 'text',
                    content: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
                    attributes: {
                      style: 'color: white;'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  category: 'Chat Components',
  label: 'Chat Window',
  attributes: {
    class: 'fa fa-window-maximize',
    title: 'Add a chat conversation window with message history and input'
  }
};
