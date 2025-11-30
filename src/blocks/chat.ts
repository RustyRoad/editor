import chatWidgetBlock from './data/chat-widget';
import chatBubbleBlock from './data/chat-bubble';
import chatWindowBlock from './data/chat-window';

/**
 * Load chat-related blocks into the GrapesJS editor
 */
export default function loadChatBlocks(editor: any, options: any = {}): void {
  const bm = editor.BlockManager;

  // Register chat widget block
  if (chatWidgetBlock) {
    bm.add('chat-widget', chatWidgetBlock);
  }

  // Register chat bubble block
  if (chatBubbleBlock) {
    bm.add('chat-bubble', chatBubbleBlock);
  }

  // Register chat window block
  if (chatWindowBlock) {
    bm.add('chat-window', chatWindowBlock);
  }

  console.log('[Chat Blocks] Loaded chat blocks into editor');
}
