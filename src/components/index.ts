import componentsRegister from './components';
import initChatComponents, { CHAT_COMPONENT_TYPES, CHAT_STATUS, chatSSEManager } from './chat-components';
import initFunnelComponents from './initFunnelComponents';

export { formatPrice } from './components';
export { initChatComponents, CHAT_COMPONENT_TYPES, CHAT_STATUS, chatSSEManager, initFunnelComponents };

const registerAllComponents = (editor: any, opts: any = {}) => {
  try {
    componentsRegister(editor, opts);
  } catch (err) {
    console.error('[Components] Failed to load components:', err);
  }
};

export default registerAllComponents;
