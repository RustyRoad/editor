import componentsRegister from './components';
import initChatComponents, { CHAT_COMPONENT_TYPES, CHAT_STATUS, chatSSEManager } from './chat-components';
import initFunnelComponents from './initFunnelComponents';
export { formatPrice } from './components';
export { initChatComponents, CHAT_COMPONENT_TYPES, CHAT_STATUS, chatSSEManager, initFunnelComponents };
var registerAllComponents = function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    try {
        componentsRegister(editor, opts);
    }
    catch (err) {
        console.error('[Components] Failed to load components:', err);
    }
};
export default registerAllComponents;
