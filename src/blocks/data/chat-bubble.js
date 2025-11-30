export default {
  content: {
    type: 'chat-bubble',
    attributes: {
      'data-gjs-type': 'chat-bubble',
      'class': 'chat-bubble',
      'style': 'background: #3b82f6; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: all 0.3s ease; position: relative;'
    },
    components: [
      {
        type: 'text',
        content: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        attributes: {
          style: 'color: white;'
        }
      }
    ],
    styles: {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999
    }
  },
  category: 'Chat Components',
  label: 'Chat Bubble',
  attributes: {
    class: 'fa fa-comment',
    title: 'Add a floating chat bubble trigger button'
  }
};
