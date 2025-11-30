import type { Editor } from 'grapesjs';
import { COMPONENT_TYPES, Trait } from '../funnel-components';

export function addDynamicCtaButtonComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // Dynamic CTA Button uses ctx.call_to_action and posts to choose-offer when configured
  domc.addType(COMPONENT_TYPES.DYNAMIC_CTA_BUTTON, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.DYNAMIC_CTA_BUTTON,
    model: {
      defaults: {
        tagName: 'form',
        attributes: { 'data-gjs-type': COMPONENT_TYPES.DYNAMIC_CTA_BUTTON, method: 'POST', action: '/funnel/choose-offer', target: '_top', class: 'inline-block' },
        components: [
          { tagName: 'input', attributes: { type: 'hidden', name: 'offer', value: 'tripwire' } },
          { tagName: 'input', attributes: { type: 'hidden', name: 'tok', value: '' } },
          { tagName: 'input', attributes: { type: 'hidden', name: 'service_id', value: '' } },
          { tagName: 'button', attributes: { type: 'submit', class: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-4 py-3 sm:px-6 rounded-lg transition-colors duration-200 touch-manipulation' }, content: '{{ ctx.call_to_action }}' },
        ],
        traits: [
          {
            type: 'select', label: 'Offer', name: 'offerType', options: [
              { id: 'tripwire', name: 'Tripwire' }, { id: 'monthly', name: 'Monthly' }, { id: 'anchor', name: 'Anchor' }
            ], changeProp: true
          },
          { type: 'text', label: 'Service ID', name: 'serviceId', changeProp: true },
          { type: 'text', label: 'Fallback Text', name: 'fallbackText', changeProp: true },
        ] as Trait[],
        offerType: 'tripwire',
        serviceId: '',
        fallbackText: 'Get Started',
      },
      init(this: any) {
        (this as any).listenTo(this, 'change:offerType change:serviceId change:fallbackText', (this as any).syncFields.bind(this));
        setTimeout(() => (this as any).syncFields(), 0);
      },
      syncFields(this: any) {
        const offer = (this as any).get('offerType') || 'tripwire';
        const sid = (this as any).get('serviceId') || '';
        const fb = (this as any).get('fallbackText') || 'Get Started';
        const offerInput = (this as any).components().find((c: any) => (c as any).getAttributes().name === 'offer');
        const tokInput = (this as any).components().find((c: any) => (c as any).getAttributes().name === 'tok');
        const sidInput = (this as any).components().find((c: any) => (c as any).getAttributes().name === 'service_id');
        const btn = (this as any).components().find((c: any) => (c as any).getAttributes().type === 'submit');

        offerInput && (offerInput as any).addAttributes({ value: offer });
        sidInput && (sidInput as any).addAttributes({ value: sid });
        // Best-effort token from window during preview; server ensures fallback
        if (tokInput && (window as any).__FUNNEL_CONTEXT__) {
          (tokInput as any).addAttributes({ value: (window as any).__FUNNEL_CONTEXT__.sessionToken || '' });
        }
        btn && (btn as any).set('content', `{{ ctx.call_to_action | default(value="${fb}", boolean=true) }}`);
        // tracking attributes
        (this as any).addAttributes({ 'data-offer': offer, 'data-service-id': sid });
      }
    }
  });
}