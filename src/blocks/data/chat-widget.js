export default {
  content: {
    type: 'chat-widget-container',
    components: [
      {
        type: 'chat-bubble',
        attributes: {
          'data-gjs-type': 'chat-bubble',
          'class': 'chat-bubble',
          'style': 'background: #3b82f6; color: white;'
        },
        components: [
          {
            type: 'text',
            content: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
          }
        ]
      },
      {
        type: 'chat-window',
        attributes: {
          'data-gjs-type': 'chat-window',
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
                    type: 'chat-status',
                    attributes: {
                      'data-gjs-type': 'chat-status',
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
                    ]
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
            type: 'chat-input',
            attributes: {
              'data-gjs-type': 'chat-input',
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
            ]
          }
        ]
      }
    ],
    attributes: {
      'data-gjs-type': 'chat-widget-container',
      'class': 'chat-widget-container',
      'data-chat-position': 'bottom-right'
    },
    styles: {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999
    }
  },
  category: 'Chat Components',
  label: 'Chat Widget',
  attributes: {
    class: 'fa fa-comments',
    title: 'Add a complete Intercom-style chat widget with SSE integration'
  }
};
