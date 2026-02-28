import { STATUS_MESSAGE_STYLE, ERROR_MESSAGE_STYLE } from './ui-constants';

export function getOrCreateById(id: string, createFn: () => HTMLElement, parent: HTMLElement | null): HTMLElement {
  let element = document.getElementById(id);
  if (!element) {
    element = createFn();
    if (!element.id && id) element.id = id;
    if (parent) parent.appendChild(element);
    else { console.warn(`No parent for "${id}". Appending to body.`); document.body.appendChild(element); }
  } else {
    if (parent && element.parentElement !== parent) parent.appendChild(element);
    else if (!parent && element.parentElement !== document.body) document.body.appendChild(element);
  }
  return element;
}

export function getOrCreateBySelector(selector: string, parent: HTMLElement, createFn: () => HTMLElement): Element {
  let element = parent.querySelector(selector);
  if (!element) { element = createFn(); parent.appendChild(element); }
  return element;
}

export function showFeedbackMessage(container: HTMLElement | null, textContent: string, messageType: 'error' | 'status', autoClearDelay = 0): void {
  if (!container) { console.warn("No container provided."); return; }
  container.innerHTML = '';
  const messageElement = document.createElement('div');
  messageElement.textContent = textContent;
  messageElement.style.cssText = messageType === 'error' ? ERROR_MESSAGE_STYLE : STATUS_MESSAGE_STYLE;
  container.appendChild(messageElement);
  if (autoClearDelay > 0) setTimeout(() => { if (container.contains(messageElement)) container.removeChild(messageElement); }, autoClearDelay);
}
