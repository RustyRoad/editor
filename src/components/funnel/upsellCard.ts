import type { Editor, Component } from 'grapesjs';
import { COMPONENT_TYPES, offerStore, OFFER_TYPE_BADGE_BASE, OFFER_TYPE_BADGE_COLORS, NormalizedOffer, getOfferTypePresentation, formatCurrency, Trait } from '../funnel-components';

// We rely on GrapesJS's native onRender lifecycle hook instead of
// manual polling. DOM-related initialization runs in `onRender` and
// a simple `isRendered` flag is used to gate DOM updates.

// Helper to safely find and update DOM nodes
class DOMUpdater {
  private component: Component;
  private pendingUpdates: Map<string, { type: 'content' | 'style' | 'attrs', data: any }> = new Map();
  private retryTimeout?: number;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 50;

  constructor(component: Component) {
    this.component = component;
  }

  updateNode(selector: string, content: string): void {
    const nodes = (this.component as any).find(selector);
    if (nodes.length > 0) {
      console.log(`✅ Updating node ${selector}:`, content);
      nodes[0].set('content', content);
    } else {
      console.log(`⚠️ Node not found yet: ${selector}, scheduling retry`);
      this.pendingUpdates.set(selector, { type: 'content', data: content });
      this.scheduleRetry();
    }
  }

  updateNodeStyle(selector: string, styles: Record<string, string>): void {
    const nodes = (this.component as any).find(selector);
    if (nodes.length > 0) {
      nodes[0].addStyle(styles);
    } else {
      this.pendingUpdates.set(selector, { type: 'style', data: styles });
      this.scheduleRetry();
    }
  }

  updateNodeAttributes(selector: string, attrs: Record<string, string>): void {
    const nodes = (this.component as any).find(selector);
    if (nodes.length > 0) {
      const currentAttrs = nodes[0].getAttributes?.() || {};
      nodes[0].addAttributes?.({ ...currentAttrs, ...attrs });
    } else {
      this.pendingUpdates.set(selector, { type: 'attrs', data: attrs });
      this.scheduleRetry();
    }
  }

  getNode(selector: string): any {
    const nodes = (this.component as any).find(selector);
    return nodes.length > 0 ? nodes[0] : null;
  }

  private scheduleRetry(): void {
    if (this.retryTimeout) return;
    
    this.retryTimeout = window.setTimeout(() => {
      this.retryPendingUpdates();
    }, 100);
  }

  private retryPendingUpdates(): void {
    this.retryTimeout = undefined;
    
    if (this.pendingUpdates.size === 0) return;

    console.log(`🔄 Retrying ${this.pendingUpdates.size} pending DOM updates`);
    const updates = Array.from(this.pendingUpdates.entries());
    
    for (const [selector, update] of updates) {
      const nodes = (this.component as any).find(selector);
      if (nodes.length > 0) {
        console.log(`✅ Retry successful for ${selector}`);
        if (update.type === 'content') {
          nodes[0].set('content', update.data);
        } else if (update.type === 'style') {
          nodes[0].addStyle(update.data);
        } else if (update.type === 'attrs') {
          const currentAttrs = nodes[0].getAttributes?.() || {};
          nodes[0].addAttributes?.({ ...currentAttrs, ...update.data });
        }
        this.pendingUpdates.delete(selector);
      }
    }

    // If still have pending updates, schedule another retry
    if (this.pendingUpdates.size > 0) {
      console.log(`⏳ Still ${this.pendingUpdates.size} pending, retrying in 200ms`);
      this.retryTimeout = window.setTimeout(() => {
        this.retryPendingUpdates();
      }, 200);
    } else {
      console.log('✅ All pending DOM updates completed');
    }
  }

  cleanup(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }
    this.pendingUpdates.clear();
  }
}

export function addUpsellCardComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  domc.addType(COMPONENT_TYPES.UPSELL_CARD, {
    isComponent: el => {
      if (el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.UPSELL_CARD) {
        return { type: COMPONENT_TYPES.UPSELL_CARD };
      }
      
      const hasOfferToken = el.hasAttribute?.('data-offer-token');
      const hasGradient = el.classList?.contains('bg-gradient-to-br') && 
                         el.classList?.contains('from-orange-50');
      if (hasOfferToken && hasGradient) {
        return { type: COMPONENT_TYPES.UPSELL_CARD };
      }
      return false;
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': COMPONENT_TYPES.UPSELL_CARD,
          'class': 'upsell-card bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-xl p-6 sm:p-8 border-2 border-orange-200 max-w-2xl mx-auto',
          'data-offer-token': ''
        },
        // Make the component droppable so users can drag Tera variables inside
        droppable: true,
        // Allow specific component types (including text, Tera variables, etc.)
        components: [
          {
            tagName: 'div',
            attributes: { 
              class: 'upsell-editor-preview',
              'data-role': 'upsell-preview' 
            },
            components: [
              {
                tagName: 'div',
                attributes: { class: 'border-4 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-8 text-center' },
                components: [
                  {
                    tagName: 'div',
                    attributes: { class: 'mb-4' },
                    components: [{
                      tagName: 'span',
                      attributes: { class: 'inline-block bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold' },
                      content: '🎨 UPSELL CARD PREVIEW'
                    }]
                  },
                  {
                    tagName: 'div',
                    attributes: { class: 'space-y-4' },
                    components: [
                      {
                        tagName: 'div',
                        attributes: { class: 'text-sm text-gray-600' },
                        components: [
                          { type: 'text', content: '<strong>Theme:</strong> ' },
                          { tagName: 'span', attributes: { 'data-offer-field': 'theme-display' }, content: 'Urgency' }
                        ]
                      },
                      {
                        tagName: 'div',
                        attributes: { class: 'text-sm text-gray-600' },
                        components: [
                          { type: 'text', content: '<strong>Offer:</strong> ' },
                          { tagName: 'span', attributes: { 'data-offer-field': 'offer-display' }, content: 'Select an offer' }
                        ]
                      },
                      {
                        tagName: 'div',
                        attributes: { class: 'bg-white rounded p-4 text-left text-sm space-y-2' },
                        components: [
                          { type: 'text', content: '<p><strong>💡 This component renders server-side with:</strong></p>' },
                          { 
                            type: 'text', 
                            content: `<ul class="list-disc pl-5 space-y-1 text-xs">
                              <li>Selected theme variant (urgency/value/minimal/social)</li>
                              <li>Dynamic offer data from database</li>
                              <li>Any Tera variables you add below</li>
                              <li>Customizable text from traits panel →</li>
                            </ul>` 
                          }
                        ]
                      },
                      {
                        tagName: 'div',
                        attributes: { 
                          class: 'editable-content border-2 border-blue-300 rounded p-4 bg-white min-h-[100px]',
                          'data-role': 'custom-content',
                          'data-gjs-droppable': 'true'
                        },
                        droppable: true,
                        components: [{
                          type: 'text',
                          content: '<p class="text-sm text-gray-500 italic">👆 Drag Tera variables here to add personalization!<br>Examples: Customer name, offer price, product details</p>'
                        }]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        traits: [
          {
            type: 'select',
            label: 'Offer',
            name: 'offerToken',
            changeProp: true,
            options: []
          },
          {
            type: 'select',
            label: 'Theme',
            name: 'theme',
            changeProp: true,
            options: [
              { id: 'urgency', value: 'urgency', name: 'Urgency (Red/Green - Scarcity)' },
              { id: 'value', value: 'value', name: 'Value (Blue - Benefits)' },
              { id: 'minimal', value: 'minimal', name: 'Minimal (Black/White - Premium)' },
              { id: 'social', value: 'social', name: 'Social (Purple - Social Proof)' }
            ]
          },
          {
            type: 'text',
            label: 'Badge Text',
            name: 'badgeText',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Headline',
            name: 'headline',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Subheading',
            name: 'subheading',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Original Price',
            name: 'originalPrice',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Savings Text',
            name: 'savingsText',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Included Title',
            name: 'includedTitle',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Primary Button Text',
            name: 'primaryButtonText',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Decline Button Text',
            name: 'secondaryButtonText',
            changeProp: true
          }
        ] as Trait[],
        theme: 'urgency',
        offerToken: '',
        badgeText: 'Limited Time Offer',
        headline: 'Wait! One More Thing...',
        subheading: 'Before you go, we have an exclusive offer just for you!',
        originalPrice: 'Regular price: $149',
        savingsText: 'You save!',
        includedTitle: "What's included:",
        primaryButtonText: 'Yes, Add This Deal!',
        secondaryButtonText: 'No Thanks, Continue'
      },

      init(this: Component) {
        console.log('🎬 UPSELL CARD INIT');

        // Initialize helpers
        (this as any).__domUpdater = new DOMUpdater(this);
        (this as any).displayInitialized = false;

        // Subscribe to offer store updates
        const unsubscribe = offerStore.subscribe((offers, meta) => {
          console.log('📡 Offer store update:', offers.length, 'offers, loaded:', meta.loaded);
          (this as any).handleOfferStoreUpdate(offers, meta.loaded);
        });
        (this as any).offerStoreUnsubscribe = unsubscribe;

        // Setup change listeners for editable fields
        (this as any).setupChangeListeners();

        // Listen for offer token changes – no longer check for isRendered, apply immediately
        (this as any).listenTo(this, 'change:offerToken', () => {
          (this as any).applyOfferSelection();
        });

        // Setup cleanup handlers
        (this as any).on('remove', () => {
          (this as any).cleanup();
        });
        (this as any).on('destroy', () => {
          (this as any).cleanup();
        });

        // Initialize offer token from URL or attributes
        (this as any).initializeOfferToken();

        // Update trait options with current offers
        (this as any).updateOfferTraitOptions(offerStore.getOffers(), offerStore.isLoaded());

        // Failsafe: If offers were already loaded when component is created,
        // trigger the display logic immediately.
        if (offerStore.isLoaded()) {
          console.log('✅ Offers already loaded on init, initializing display.');
          (this as any).initializeDisplay();
        }
      },

      cleanup(this: Component) {
        // Unsubscribe from offer store
        if ((this as any).offerStoreUnsubscribe) {
          (this as any).offerStoreUnsubscribe();
          (this as any).offerStoreUnsubscribe = undefined;
        }

        // Cleanup DOM updater timers
        if ((this as any).__domUpdater) {
          (this as any).__domUpdater.cleanup();
        }
      },

      setupChangeListeners(this: Component) {
        const editableFields = [
          'theme', 'badgeText', 'headline', 'subheading', 'originalPrice', 'savingsText',
          'includedTitle', 'primaryButtonText', 'secondaryButtonText'
        ];

        editableFields.forEach(field => {
          (this as any).listenTo(this, `change:${field}`, () => {
            const methodName = `update${field.charAt(0).toUpperCase() + field.slice(1)}`;
            if (typeof (this as any)[methodName] === 'function') {
              (this as any)[methodName]();
            }
          });
        });
      },

      initializeOfferToken(this: Component) {
        let tokenToSet = '';

        // Priority 1: Check URL params
        if (typeof window !== 'undefined' && window.location) {
          const urlParams = new URLSearchParams(window.location.search);
          const offerId = urlParams.get('offer_id');
          if (offerId) {
            console.log('🔗 Found offer_id in URL:', offerId);
            tokenToSet = offerId;
          }
        }

        // Priority 2: Check existing attributes
        if (!tokenToSet) {
          const attrs = (this as any).getAttributes();
          const existingToken = attrs['data-offer-token'];
          if (existingToken) {
            console.log('🔍 Found existing token:', existingToken);
            tokenToSet = existingToken;
          }
        }

        // Set token if found and not already set
        if (tokenToSet && !(this as any).get('offerToken')) {
          console.log('✅ Setting offerToken:', tokenToSet);
          (this as any).set('offerToken', tokenToSet);
        }
      },

      handleOfferStoreUpdate(this: Component, offers: NormalizedOffer[], loaded: boolean) {
        console.log('🔄 handleOfferStoreUpdate - offers:', offers.length, 'loaded:', loaded);
        (this as any).updateOfferTraitOptions(offers, loaded);
        
        // **FIX**: Once offers are loaded, initialize the display.
        // This is the main trigger for rendering data.
        if (loaded && !(this as any).displayInitialized) {
          (this as any).initializeDisplay();
        }
      },

      updateOfferTraitOptions(this: Component, offers: NormalizedOffer[], loaded: boolean) {
        const trait = (this as any).getTrait('offerToken');
        if (!trait) return;

        trait.set('options', offerStore.getTraitOptions());
        if (trait.view && typeof (trait.view as any).render === 'function') {
          (trait.view as any).render();
        }

        const currentToken = (this as any).get('offerToken');

        // Auto-select first offer if none selected
        if (!currentToken && offers.length === 1) {
          console.log('✅ Auto-selecting first offer:', offers[0].token);
          (this as any).set('offerToken', offers[0].token);
        }

        if (loaded && offers.length === 0) {
          (this as any).addAttributes({ 'data-offer-token': '' });
        }
      },

      initializeDisplay(this: Component) {
        // Prevent multiple initializations
        if ((this as any).displayInitialized) return;

        console.log('🎨 Initializing display');
        (this as any).displayInitialized = true;
        
        // Apply offer data first
        (this as any).applyOfferSelection();
        
        // Then update all editable fields
        (this as any).updateTheme();
        (this as any).updateBadgeText();
        (this as any).updateHeadline();
        (this as any).updateSubheading();
        (this as any).updateOriginalPrice();
        (this as any).updateSavingsText();
        (this as any).updateIncludedTitle();
        (this as any).updatePrimaryButton();
        (this as any).updateSecondaryButton();
        
        console.log('✅ Display initialized');
      },

      // Editable field updaters - these store values as component properties
      // that are sent to backend for server-side rendering
      updateTheme(this: Component) {
        const theme = ((this as any).get('theme') || 'urgency').toString();
        (this as any).addAttributes({ 'data-theme': theme });
        
        // Update preview display
        const themeLabels: Record<string, string> = {
          urgency: 'Urgency (Red/Green - Scarcity)',
          value: 'Value (Blue - Benefits)',
          minimal: 'Minimal (Black/White - Premium)',
          social: 'Social (Purple - Social Proof)'
        };
        const domUpdater = (this as any).__domUpdater as DOMUpdater;
        domUpdater.updateNode('[data-offer-field="theme-display"]', themeLabels[theme] || theme);
      },

      updateBadgeText(this: Component) {
        // Stored as prop, applied server-side
      },

      updateHeadline(this: Component) {
        // Stored as prop, applied server-side
      },

      updateSubheading(this: Component) {
        // Stored as prop, applied server-side
      },

      updateOriginalPrice(this: Component) {
        // Stored as prop, applied server-side
      },

      updateSavingsText(this: Component) {
        // Stored as prop, applied server-side
      },

      updateIncludedTitle(this: Component) {
        // Stored as prop, applied server-side
      },

      updatePrimaryButton(this: Component) {
        // Stored as prop, applied server-side
      },

      updateSecondaryButton(this: Component) {
        // Stored as prop, applied server-side
      },

      // Offer-driven updates
      applyOfferSelection(this: Component) {
        const token = ((this as any).get('offerToken') || '').toString();
        console.log('🎯 Applying offer selection, token:', token);
        
        (this as any).addAttributes({ 'data-offer-token': token });

        // Update button attributes
        const domUpdater = (this as any).__domUpdater as DOMUpdater;
        domUpdater.updateNodeAttributes('[data-offer-field="primary-button"]', {
          'data-offer': token
        });

        // Debug: log all available offers
        const allOffers = offerStore.getOffers();
        console.log('📋 Available offers in store:', allOffers.map(o => ({ 
          token: o.token, 
          label: o.label,
          priceCents: o.priceCents 
        })));

        let offerInfo = offerStore.findByToken(token);
        console.log('🔍 Lookup result for token', token, ':', offerInfo ? 'FOUND' : 'NOT FOUND');
        
        // If not found by token, try to find an offer where the token ends with this number
        // This handles cases where URL has offer_id=4 but token is something like "offer_4"
        if (!offerInfo && token) {
          console.log('🔄 Trying alternate token matching for:', token);
          offerInfo = allOffers.find(o => 
            o.token === token || 
            o.token.endsWith(`_${token}`) ||
            o.token.includes(token)
          );
          if (offerInfo) {
            console.log('✅ Found via alternate match:', offerInfo.token);
          }
        }
        
        if (!offerInfo) {
          console.log('⚠️ No offer found for token', token, ', using placeholders');
          console.log('💡 Available tokens:', allOffers.map(o => o.token).join(', '));
          (this as any).applyPlaceholderOffer();
          return;
        }

        console.log('✅ Applying offer data:', offerInfo.label, '- Price:', offerInfo.priceCents);
        (this as any).applyOfferData(offerInfo);
      },

      applyPlaceholderOffer(this: Component) {
        const domUpdater = (this as any).__domUpdater as DOMUpdater;
        domUpdater.updateNode('[data-offer-field="offer-display"]', 'No offer selected');
      },

      applyOfferData(this: Component, offer: NormalizedOffer) {
        const rawType = offer.offerType || 'standard';
        
        // Update component attributes for backend rendering
        (this as any).addAttributes({
          'data-offer-token': offer.token,
          'data-offer-type': rawType
        });

        // Update preview display
        const domUpdater = (this as any).__domUpdater as DOMUpdater;
        const priceDisplay = typeof offer.priceCents === 'number' 
          ? formatCurrency(offer.priceCents, offer.currency)
          : '$0.00';
        
        domUpdater.updateNode(
          '[data-offer-field="offer-display"]', 
          `${offer.label} - ${priceDisplay}`
        );
      },

      /**
       * Override toHTML to output only the placeholder div when saving.
       * This allows the backend regex to find and replace the component with
       * the server-rendered Tera macro.
       */
      toHTML(this: Component): string {
        const attrs = (this as any).getAttributes();
        const token = attrs['data-offer-token'] || '';
        const offerType = attrs['data-offer-type'] || 'standard';
        const theme = (this as any).get('theme') || 'urgency';
        
        // Extract custom content from the editable area
        let customContent = '';
        const editableArea = (this as any).find('[data-role="custom-content"]')[0];
        if (editableArea) {
          const children = editableArea.components();
          if (children && children.length > 0) {
            // Get HTML of all child components except the placeholder text
            customContent = children
              .filter((child: Component) => {
                const content = child.toHTML?.() || '';
                // Skip the placeholder paragraph
                return !content.includes('👆 Drag Tera variables');
              })
              .map((child: Component) => child.toHTML?.() || '')
              .join('\n');
          }
        }
        
        // Return placeholder with custom content inside
        // Backend will read data-theme and custom content
        return `<div class="upsell-card-container" data-offer-token="${token}" data-offer-type="${offerType}" data-theme="${theme}">${customContent}</div>`;
      }
    }
  });
}
