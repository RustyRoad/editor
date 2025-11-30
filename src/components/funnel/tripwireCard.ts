import type { Editor, Component } from 'grapesjs';
import { COMPONENT_TYPES, offerStore, OFFER_TYPE_BADGE_BASE, OFFER_TYPE_BADGE_COLORS, TRIPWIRE_DEFAULTS, NormalizedOffer, getOfferTypePresentation, formatCurrency, Trait } from '../funnel-components';

export function addTripwireCardComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // ========== OFFER CARD COMPONENTS ==========
  // Tripwire offer card component
  domc.addType(COMPONENT_TYPES.TRIPWIRE_CARD, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.TRIPWIRE_CARD,
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': COMPONENT_TYPES.TRIPWIRE_CARD,
          'class': 'offer-card bg-white border-2 border-green-500 rounded-lg p-4 sm:p-6 text-center shadow-lg max-w-sm sm:max-w-md mx-auto',
          'data-offer-token': ''
        },
        content: `
          <div class="mb-2 flex justify-center">
            <span class="${OFFER_TYPE_BADGE_BASE} ${OFFER_TYPE_BADGE_COLORS['standard']}" data-offer-field="type-badge" data-offer-type="standard">Standard Offer</span>
          </div>
          <div class="mb-3 sm:mb-4" data-offer-field="badge">
            <span class="bg-red-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold">LIMITED TIME</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" data-offer-field="title">${TRIPWIRE_DEFAULTS.title}</h2>
          <div class="price-display mb-3 sm:mb-4" data-offer-field="price-section">
            <span class="text-4xl sm:text-5xl font-bold text-green-600" data-offer-field="price-value">${TRIPWIRE_DEFAULTS.price}</span>
            <span class="text-base sm:text-lg text-gray-500 block" data-offer-field="price-subtitle">One-time service</span>
          </div>
          <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2" data-offer-field="description">${TRIPWIRE_DEFAULTS.description}</p>
          <div class="mb-3 sm:mb-4">
            <div data-gjs-type="${COMPONENT_TYPES.CHECKOUT_FORM}" data-offer-field="checkout"></div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed" data-offer-field="bullets">✓ No recurring charges<br class="sm:hidden"> ✓ Professional service<br class="sm:hidden"> ✓ Satisfaction guaranteed</p>
        `,
        traits: [
          {
            type: 'select',
            label: 'Linked Offer',
            name: 'offerToken',
            options: offerStore.getTraitOptions(),
            changeProp: true
          },
          {
            type: 'text',
            label: 'Offer Title',
            name: 'offerTitle',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Price',
            name: 'price',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Description',
            name: 'description',
            changeProp: true
          }
        ] as Trait[],
        offerToken: '',
        offerTitle: TRIPWIRE_DEFAULTS.title,
        price: TRIPWIRE_DEFAULTS.price,
        description: TRIPWIRE_DEFAULTS.description
      },

      init(this: Component) {
        const unsubscribe = offerStore.subscribe((offers, meta) => {
          (this as any).updateOfferTraitOptions(offers, meta.loaded);
        });
        (this as any).__offerUnsubscribe = unsubscribe;

        (this as any).listenTo(this, 'change:offerTitle', (this as any).updateOfferTitle.bind(this));
        (this as any).listenTo(this, 'change:price', (this as any).updateOfferPrice.bind(this));
        (this as any).listenTo(this, 'change:description', (this as any).updateOfferDescription.bind(this));
        (this as any).listenTo(this, 'change:offerToken', (this as any).applyOfferSelection.bind(this));

        (this as any).on('remove', (this as any).cleanupOffersSubscription.bind(this));
        (this as any).on('destroy', (this as any).cleanupOffersSubscription.bind(this));

        (this as any).updateOfferTraitOptions(offerStore.getOffers(), offerStore.isLoaded());
        (this as any).updateOfferTitle();
        (this as any).updateOfferPrice();
        (this as any).updateOfferDescription();
        (this as any).updateOfferTypeBadge();
        (this as any).applyOfferSelection();
      },

      cleanupOffersSubscription(this: Component) {
        const unsub = (this as any).__offerUnsubscribe;
        if (typeof unsub === 'function') {
          unsub();
          (this as any).__offerUnsubscribe = undefined;
        }
      },

      updateOfferTraitOptions(this: Component, offers: NormalizedOffer[], loaded: boolean) {
        const trait = (this as any).getTrait('offerToken');
        if (!trait) return;

        trait.set('options', offerStore.getTraitOptions());
        if (trait.view && typeof (trait.view as any).render === 'function') {
          (trait.view as any).render();
        }

        if (!(this as any).get('offerToken') && offers.length === 1) {
          (this as any).set('offerToken', offers[0].token);
        }

        if (loaded && offers.length === 0) {
          (this as any).addAttributes({ 'data-offer-token': '' });
        }

        (this as any).applyOfferSelection();
      },

      updateOfferTitle(this: Component) {
        const title = ((this as any).get('offerTitle') || TRIPWIRE_DEFAULTS.title).toString();
        const nodes = (this as any).find('[data-offer-field="title"]');
        if (nodes.length) {
          nodes[0].set('content', title);
        }
      },

      updateOfferPrice(this: Component) {
        const price = ((this as any).get('price') || TRIPWIRE_DEFAULTS.price).toString();
        const nodes = (this as any).find('[data-offer-field="price-value"]');
        if (nodes.length) {
          nodes[0].set('content', price);
        }
      },

      updateOfferDescription(this: Component) {
        const description = ((this as any).get('description') || TRIPWIRE_DEFAULTS.description).toString();
        const nodes = (this as any).find('[data-offer-field="description"]');
        if (nodes.length) {
          nodes[0].set('content', description);
        }
      },

      updateOfferTypeBadge(this: Component, rawType?: string | null) {
        const { normalized, label, className } = getOfferTypePresentation(rawType);
        const badge = (this as any).find('[data-offer-field="type-badge"]')[0];
        if (badge) {
          badge.set('content', label);
          badge.addAttributes?.({
            class: className,
            'data-offer-type': normalized,
          });
        }
      },

      applyOfferSelection(this: Component) {
        const token = ((this as any).get('offerToken') || '').toString();
        (this as any).addAttributes({ 'data-offer-token': token });

        const checkoutComponent = (this as any).find(`[data-gjs-type="${COMPONENT_TYPES.CHECKOUT_FORM}"]`)[0];
        if (checkoutComponent) {
          const offerInput = (checkoutComponent as any)
            .components()
            .find((child: Component) => (child as any).getAttributes().name === 'offer');
          if (offerInput) {
            (offerInput as any).addAttributes({ value: token });
          }
        }

        const offerInfo = offerStore.findByToken(token);
        if (!offerInfo) {
          (this as any).updateOfferTypeBadge();
          return;
        }

        const rawType = offerInfo.offerType || 'standard';
        (this as any).addAttributes({ 'data-offer-token': token, 'data-offer-type': rawType });
        if (checkoutComponent) {
          (checkoutComponent as any).addAttributes?.({ 'data-offer-token': token, 'data-offer-type': rawType });
        }

        (this as any).updateOfferTypeBadge(rawType);

        const currentTitle = ((this as any).get('offerTitle') || '').trim();
        if (!currentTitle || currentTitle === TRIPWIRE_DEFAULTS.title) {
          (this as any).set('offerTitle', offerInfo.label);
        }

        if (typeof offerInfo.priceCents === 'number') {
          const formatted = formatCurrency(offerInfo.priceCents, offerInfo.currency);
          const currentPrice = ((this as any).get('price') || '').trim();
          if (!currentPrice || currentPrice === TRIPWIRE_DEFAULTS.price) {
            (this as any).set('price', formatted);
          }
        }

        const currentDescription = ((this as any).get('description') || '').trim();
        const normalizedType = rawType.toLowerCase();
        if (normalizedType.includes('rollover') && typeof offerInfo.creditsPerCycle === 'number') {
          const creditLineParts = [`Includes +${offerInfo.creditsPerCycle} credit${offerInfo.creditsPerCycle === 1 ? '' : 's'} each billing cycle`];
          if (offerInfo.rolloverCap !== undefined) {
            creditLineParts.push(
              offerInfo.rolloverCap === null
                ? 'rollover is unlimited'
                : `rollover cap ${offerInfo.rolloverCap}`
            );
          }
          const creditDescription = `${creditLineParts.join(' · ')}.`;
          if (!currentDescription || currentDescription === TRIPWIRE_DEFAULTS.description) {
            (this as any).set('description', creditDescription);
          }
        } else if (offerInfo.description) {
          if (!currentDescription || currentDescription === TRIPWIRE_DEFAULTS.description) {
            (this as any).set('description', offerInfo.description);
          }
        }
      }
    }
  });
}