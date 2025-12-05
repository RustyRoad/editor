import type { Editor, Component } from 'grapesjs';
import { COMPONENT_TYPES, INPUT_NAMES, FLOW_MODES, Trait, API_ENDPOINTS } from '../funnel-components';

export function addCheckoutFormComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // Advanced funnel checkout form component
  domc.addType(COMPONENT_TYPES.CHECKOUT_FORM, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.CHECKOUT_FORM,
    model: {
      defaults: {
        tagName: 'form',
        attributes: {
          'data-gjs-type': COMPONENT_TYPES.CHECKOUT_FORM,
          'class': 'funnel-checkout-form w-full',
          'method': 'POST',
          'action': '/funnel/choose-offer',
          'target': '_top'
        },
        components: [
          {
            tagName: 'input',
            attributes: {
              type: 'hidden',
              name: INPUT_NAMES.OFFER,
              value: 'tripwire'
            }
          },
          {
            tagName: 'input',
            attributes: {
              type: 'hidden',
              name: INPUT_NAMES.TOKEN,
              value: ''
            }
          },
          {
            tagName: 'input',
            attributes: {
              type: 'hidden',
              name: INPUT_NAMES.ADDRESS_ID,
              value: ''
            }
          },
          {
            tagName: 'input',
            attributes: {
              type: 'hidden',
              name: INPUT_NAMES.SERVICE_ID,
              value: '1'
            }
          },
          // Optional visible email field (can be toggled via trait)
          {
            tagName: 'input',
            attributes: {
              type: 'email',
              name: INPUT_NAMES.EMAIL,
              placeholder: 'Email address',
              class: 'gjs-funnel-email hidden w-full mb-3 px-3 py-3 sm:px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-sm'
            }
          },
          // Optional bin selector (can be toggled via trait)
          {
            tagName: 'div',
            attributes: {
              class: 'gjs-funnel-bins hidden w-full mb-3'
            },
            components: [
              {
                tagName: 'label',
                content: 'Number of Bins',
                attributes: { class: 'block text-sm font-medium text-gray-700 mb-1' }
              },
              {
                tagName: 'select',
                attributes: {
                  name: 'number_of_bins',
                  class: 'w-full px-3 py-3 sm:px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-sm'
                },
                components: [
                  { tagName: 'option', attributes: { value: '1' }, content: '1 Bin' },
                  { tagName: 'option', attributes: { value: '2' }, content: '2 Bins' },
                  { tagName: 'option', attributes: { value: '3' }, content: '3 Bins' },
                  { tagName: 'option', attributes: { value: '4' }, content: '4 Bins' }
                ]
              }
            ]
          },
          {
            tagName: 'button',
            attributes: {
              type: 'submit',
              class: 'funnel-checkout-btn bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-6 sm:px-8 rounded-lg text-lg sm:text-xl transition-colors duration-200 w-full shadow-lg transform active:scale-95 sm:hover:scale-105 touch-manipulation'
            },
            content: 'Get Started - Only $29!'
          }
        ],
        traits: [
          {
            type: 'select',
            label: 'Offer Type',
            name: 'offerType',
            options: [
              { id: 'tripwire', name: 'Tripwire ($29)' },
              { id: 'monthly', name: 'Monthly Service' },
              { id: 'anchor', name: 'Anchor Offer ($149)' },
              { id: 'rescue', name: 'Rescue Offer ($33.75)' },
              { id: 'downsell', name: 'Downsell ($69.99)' }
            ],
            changeProp: true
          },
          {
            type: 'select',
            label: 'Flow Mode',
            name: 'flowMode',
            options: [
              { id: FLOW_MODES.REDIRECT, name: 'Direct POST (server redirect)' },
              { id: FLOW_MODES.VALIDATE_THEN_CHECKOUT, name: 'Validate Address then Checkout' },
            ],
            changeProp: true
          },
          {
            type: 'text',
            label: 'Button Text',
            name: 'buttonText',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Service ID',
            name: 'serviceId',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Session Token',
            name: 'sessionToken',
            changeProp: true
          },
          {
            type: 'checkbox',
            label: 'Show Email Field',
            name: 'showEmail',
            changeProp: true
          },
          {
            type: 'checkbox',
            label: 'Show Bin Selector',
            name: 'showBinSelector',
            changeProp: true
          },
          {
            type: 'number',
            label: 'Default Bins',
            name: 'defaultBins',
            min: 1,
            max: 10,
            changeProp: true
          }
        ] as Trait[],
        offerType: 'tripwire',
        buttonText: 'Get Started - Only $29!',
        serviceId: '1',
        sessionToken: '',
        flowMode: FLOW_MODES.VALIDATE_THEN_CHECKOUT,
        showEmail: false,
        showBinSelector: false,
        defaultBins: 1
      },

      init() {
        const update = () => this.updateComponents();
        this.listenTo(this, 'change:offerType change:buttonText change:serviceId change:sessionToken change:showEmail change:showBinSelector change:defaultBins', update);
        setTimeout(update, 0);
      },

      /** Efficiently update child components based on trait changes */
      updateComponents() {
        const offerType = (this as any).get('offerType');
        const buttonText = (this as any).get('buttonText');
        const serviceId = (this as any).get('serviceId');
        const sessionToken = (this as any).get('sessionToken');
        const showEmail = !!(this as any).get('showEmail');
        const showBinSelector = !!(this as any).get('showBinSelector');
        const defaultBins = (this as any).get('defaultBins');

        (this as any).components().each((component: Component) => {
          const attrs = (component as any).getAttributes?.() || {};

          if (attrs.name === INPUT_NAMES.OFFER) {
            (component as any).addAttributes({ value: offerType });
          } else if (attrs.name === INPUT_NAMES.TOKEN) {
            (component as any).addAttributes({ value: sessionToken });
          } else if (attrs.name === INPUT_NAMES.SERVICE_ID) {
            (component as any).addAttributes({ value: serviceId });
          } else if (attrs.name === INPUT_NAMES.EMAIL) {
            const currentClass = attrs.class || '';
            if (showEmail) {
              (component as any).addAttributes({ class: currentClass.replace('hidden', '').trim() });
            } else {
              (component as any).addAttributes({ class: `${currentClass} hidden`.trim() });
            }
          } else if (attrs.class && attrs.class.includes('gjs-funnel-bins')) {
            const currentClass = attrs.class || '';
            if (showBinSelector) {
              (component as any).addAttributes({ class: currentClass.replace('hidden', '').trim() });
              // Update default value of the select inside
              const select = (component as any).find('select')[0];
              if (select) {
                select.addAttributes({ value: defaultBins });
                // Also update the selected option
                const options = select.components();
                options.each((opt: Component) => {
                  const optAttrs = (opt as any).getAttributes();
                  if (optAttrs.value == defaultBins) {
                    (opt as any).addAttributes({ selected: 'selected' });
                  } else {
                    (opt as any).removeAttributes('selected');
                  }
                });
              }
            } else {
              (component as any).addAttributes({ class: `${currentClass} hidden`.trim() });
            }
          } else if (attrs.type === 'submit') {
            (component as any).set('content', buttonText);
          }
        });
      }
    },

    // Handle form submission based on flow mode
    view: {
      onRender(this: { el: Element; model: Component; }) {
        try {
          const form = this.el as HTMLFormElement;
          if (!form) return;

          const model = this.model;
          const flowMode = (model as any).get('flowMode');

          if (flowMode === FLOW_MODES.VALIDATE_THEN_CHECKOUT) {
            form.addEventListener('submit', async (e: SubmitEvent) => {
              e.preventDefault();
              await (this as any).handleValidatedCheckout(form);
            });
          }
          // For REDIRECT mode, let the form submit naturally
        } catch (e) {
          console.error('Error setting up funnel checkout form:', e);
        }
      },

      async handleValidatedCheckout(this: { model: Component; }, form: HTMLFormElement): Promise<void> {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Processing...';
        }

        try {
          // First validate the address/service
          const response = await fetch('/api/service/validate-address', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            // If validation passes, proceed with checkout
            const checkoutResponse = await fetch(API_ENDPOINTS.INITIATE_CHECKOUT, {
              method: 'POST',
              body: formData
            });

            if (checkoutResponse.ok) {
              const data = await checkoutResponse.json();
              if (data.url) {
                window.location.href = data.url;
              }
            } else {
              throw new Error('Checkout failed');
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Address validation failed');
          }
        } catch (error) {
          console.error('Checkout error:', error);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = ((this as any).model.get && (this as any).model.get('buttonText')) || 'Get Started';
          }
          // Show error to user
          alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        }
      }
    }
  });
}