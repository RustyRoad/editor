import type { Editor, Component } from 'grapesjs';
import { COMPONENT_TYPES, Trait } from '../funnel-components';

const DEFAULT_SEAMLESS_OFFER = '{"type":"tripwire","service_id":"1","price":29.99}';

export function addContinueToPaymentButtonComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // Seamless checkout trigger button component
  domc.addType(COMPONENT_TYPES.CONTINUE_TO_PAYMENT_BUTTON, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.CONTINUE_TO_PAYMENT_BUTTON ||
      el.classList?.contains('seamless-checkout-btn'),
    model: {
      defaults: {
        tagName: 'button',
        attributes: {
          'data-gjs-type': COMPONENT_TYPES.CONTINUE_TO_PAYMENT_BUTTON,
          type: 'button',
          class: 'seamless-checkout-btn w-full py-4 px-8 rounded-lg text-xl font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4',
          'data-offer': DEFAULT_SEAMLESS_OFFER,
          style: 'min-height: 60px;',
        },
        content: 'Start Checkout',
        traits: [
          {
            type: 'text',
            label: 'Button Text',
            name: 'buttonText',
            changeProp: true,
          },
          {
            type: 'select',
            label: 'Button Style',
            name: 'buttonStyle',
            options: [
              { id: 'primary', name: 'Primary (Green)' },
              { id: 'urgent', name: 'Urgent (Red)' },
              { id: 'premium', name: 'Premium (Purple)' },
            ],
            changeProp: true,
          },
          {
            type: 'text',
            label: 'Offer Data (JSON)',
            name: 'offerData',
            changeProp: true,
          },
        ] as Trait[],
        buttonText: 'Start Checkout',
        buttonStyle: 'primary',
        offerData: DEFAULT_SEAMLESS_OFFER,
      },
      init(this: Component) {
        (this as any).on('change:buttonText', (this as any).updateButtonText.bind(this));
        (this as any).on('change:buttonStyle', (this as any).updateButtonStyle.bind(this));
        (this as any).on('change:offerData', (this as any).updateOfferData.bind(this));
        (this as any).updateButtonText();
        (this as any).updateButtonStyle();
        (this as any).updateOfferData();
      },
      updateButtonText(this: Component) {
        const text = ((this as any).get('buttonText') || 'Start Checkout').toString();
        (this as any).set('content', text);
        const viewEl = (this as any).view?.el as HTMLElement | undefined;
        if (viewEl) {
          viewEl.textContent = text;
        }
      },
      updateButtonStyle(this: Component) {
        const style = ((this as any).get('buttonStyle') || 'primary').toString();
        const baseClasses = 'seamless-checkout-btn w-full py-4 px-8 rounded-lg text-xl font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4';
        let styleClasses = '';
        let ringColor = '';
        switch (style) {
          case 'urgent':
            styleClasses = 'bg-red-600 hover:bg-red-700';
            ringColor = 'focus:ring-red-300';
            break;
          case 'premium':
            styleClasses = 'bg-purple-600 hover:bg-purple-700';
            ringColor = 'focus:ring-purple-300';
            break;
          default:
            styleClasses = 'bg-green-600 hover:bg-green-700';
            ringColor = 'focus:ring-green-300';
        }

        (this as any).addAttributes({
          class: `${baseClasses} ${styleClasses} ${ringColor}`.trim(),
        });
      },
      updateOfferData(this: Component) {
        const offerData = (this as any).get('offerData');
        let normalized = DEFAULT_SEAMLESS_OFFER;
        if (typeof offerData === 'string' && offerData.trim()) {
          normalized = offerData.trim();
        } else if (offerData && typeof offerData === 'object') {
          try {
            normalized = JSON.stringify(offerData);
          } catch {
            normalized = DEFAULT_SEAMLESS_OFFER;
          }
        }

        (this as any).addAttributes({ 'data-offer': normalized });
      },
    },
    view: {
      onRender(this: { el: HTMLElement; }) {
        const el = this.el as HTMLElement | undefined;
        if (el && !el.getAttribute('type')) {
          el.setAttribute('type', 'button');
        }
      },
    },
  });
}