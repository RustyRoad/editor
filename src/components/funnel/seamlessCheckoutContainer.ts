import type { Editor, Component } from 'grapesjs';
import { COMPONENT_TYPES, Trait, offerStore, formatCurrency, NormalizedOffer } from '../funnel-components';

export function addSeamlessCheckoutContainerComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // Seamless Checkout Container - main component that handles the two-step flow
  domc.addType(COMPONENT_TYPES.SEAMLESS_CHECKOUT_CONTAINER, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.SEAMLESS_CHECKOUT_CONTAINER,
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': COMPONENT_TYPES.SEAMLESS_CHECKOUT_CONTAINER,
        },
        // NOTE: Runtime behavior (steps, payment, analytics) is provided by
        // the Tera partial `components/seamless-checkout-script.html.tera`.
        // The wrapper template `grapes_dynamic.html.tera` auto-includes that
        // partial whenever the saved HTML contains the class
        // `seamless-checkout-container`. Avoid embedding duplicate script
        // logic directly here.
        // This content will be saved to the database and must use proper Tera syntax
        // The import statement is added automatically by decode_tera_entities if missing
        content: `{{ sc::seamless_checkout(checkout_id="main", service_name="Bin Cleaning Service", service_price="29.99", service_type="tripwire") }}`,

        // This script property tells GrapesJS to treat the 'content' as the entire component,
        // effectively replacing the wrapper div and preventing nested containers.
        script: function () {
          // This function being present tells GrapesJS to treat the 'content' as the entire component,
          // effectively replacing the wrapper div.
        },

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
            label: 'Checkout ID',
            name: 'checkoutId',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Service Name',
            name: 'serviceName',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Service Price',
            name: 'servicePrice',
            changeProp: true
          },
          {
            type: 'select',
            label: 'Service Type',
            name: 'serviceType',
            options: [
              { id: 'tripwire', name: 'Tripwire' },
              { id: 'monthly', name: 'Monthly' },
              { id: 'anchor', name: 'Anchor' },
              { id: 'rescue', name: 'Rescue' }
            ],
            changeProp: true
          }
        ] as Trait[],
        offerToken: '',
        checkoutId: 'main',
        serviceName: 'Bin Cleaning Service',
        servicePrice: '29.99',
        serviceType: 'tripwire'
      },
      init(this: Component) {
        // Subscribe to offer store updates
        const unsubscribe = offerStore.subscribe((offers, meta) => {
          (this as any).updateOfferTraitOptions(offers, meta.loaded);
        });
        (this as any).__offerUnsubscribe = unsubscribe;

        // On first load from HTML, initialize props from attributes if present
        try {
          const attrs = (this as any).getAttributes?.() || {} as any;
          const cid = attrs['data-checkout-id'];
          const sname = attrs['data-service-name'];
          const sprice = attrs['data-service-price'];
          const stype = attrs['data-service-type'];
          const otoken = attrs['data-offer-token'];
          if (cid) (this as any).set('checkoutId', cid);
          if (sname) (this as any).set('serviceName', sname);
          if (sprice) (this as any).set('servicePrice', String(sprice));
          if (stype) (this as any).set('serviceType', stype);
          if (otoken) (this as any).set('offerToken', otoken);
        } catch { /* ignore */ }

        (this as any).listenTo(this, 'change:checkoutId change:serviceName change:servicePrice change:serviceType', (this as any).syncAttrs.bind(this));
        (this as any).listenTo(this, 'change:offerToken', (this as any).applyOfferSelection.bind(this));
        
        // Cleanup on remove
        (this as any).on('remove', (this as any).cleanupOffersSubscription.bind(this));
        (this as any).on('destroy', (this as any).cleanupOffersSubscription.bind(this));

        // Initialize with current offer store state
        (this as any).updateOfferTraitOptions(offerStore.getOffers(), offerStore.isLoaded());
        
        // Auto-select from page context (window.__OFFER_ID__ or URL param)
        (this as any).autoSelectFromPageContext();
        
        setTimeout(() => {
          (this as any).syncAttrs();
          (this as any).applyOfferSelection();
        }, 0);
      },

      autoSelectFromPageContext(this: Component) {
        // Check if offer is already selected
        if ((this as any).get('offerToken')) return;

        // Check for offer_id in URL or window context
        const urlParams = new URLSearchParams(window.location.search);
        const offerIdFromUrl = urlParams.get('offer_id');
        const offerIdFromWindow = (window as any).__OFFER_ID__;
        const offerId = offerIdFromUrl || (offerIdFromWindow ? String(offerIdFromWindow) : null);

        if (!offerId) return;

        // Find matching offer by ID and set its token
        const offers = offerStore.getOffers();
        console.log('[Seamless Checkout] Auto-selecting from page context, offer_id:', offerId);
        
        // Use oRPC endpoint to get offer with enriched price data from Stripe
        fetch(`/orpc/offers/getWithPrice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ offerId: parseInt(offerId, 10) })
        })
          .then(response => response.ok ? response.json() : null)
          .then(offerData => {
            if (offerData?.link_token) {
              console.log('[Seamless Checkout] Found offer with token:', offerData.link_token, 'price:', offerData.unit_amount_cents);
              
              // Ensure this offer is in the store with price data FIRST
              const existingOffer = offers.find(o => o.token === offerData.link_token);
              if (!existingOffer || typeof existingOffer.priceCents !== 'number') {
                console.log('[Seamless Checkout] Adding/updating offer in store with price:', offerData.unit_amount_cents);
                const normalized = {
                  token: offerData.link_token,
                  label: offerData.name,
                  description: offerData.description,
                  priceCents: offerData.unit_amount_cents,
                  currency: offerData.currency,
                  offerType: offerData.offer_type,
                };
                // Replace or add the offer
                const updatedOffers = existingOffer 
                  ? offers.map(o => o.token === offerData.link_token ? normalized : o)
                  : [...offers, normalized];
                offerStore.setOffers(updatedOffers);
              }
              
              // THEN set the token to trigger applyOfferSelection
              (this as any).set('offerToken', offerData.link_token);
            } else if (offerData?.name) {
              // Fallback: try to find by name in the store
              const match = offers.find(o => o.label === offerData.name);
              if (match) {
                console.log('[Seamless Checkout] Found offer by name match:', match.token);
                (this as any).set('offerToken', match.token);
              }
            }
          })
          .catch(err => console.warn('[Seamless Checkout] Failed to fetch offer details:', err));
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

        // Auto-select if only one offer
        if (!(this as any).get('offerToken') && offers.length === 1) {
          (this as any).set('offerToken', offers[0].token);
        }

        // Re-apply selection in case offer data changed
        (this as any).applyOfferSelection();
      },

      applyOfferSelection(this: Component) {
        const token = ((this as any).get('offerToken') || '').toString();
        
        // Update data attribute
        const attrs = (this as any).getAttributes?.() || {} as any;
        attrs['data-offer-token'] = token;
        (this as any).setAttributes?.(attrs);

        if (!token) return;

        const offerInfo = offerStore.findByToken(token);
        if (!offerInfo) {
          console.log('[Seamless Checkout] Offer not found in store for token:', token);
          return;
        }

        console.log('[Seamless Checkout] Applying offer:', offerInfo.label, 'priceCents:', offerInfo.priceCents);

        // Always update service name from offer when an offer is linked
        (this as any).set('serviceName', offerInfo.label);

        // Always update price from offer when an offer is linked
        if (typeof offerInfo.priceCents === 'number') {
          const numericPrice = (offerInfo.priceCents / 100).toFixed(2);
          console.log('[Seamless Checkout] Setting price to:', numericPrice);
          (this as any).set('servicePrice', numericPrice);
        }

        // Update service type from offer type
        if (offerInfo.offerType) {
          const normalizedType = offerInfo.offerType.toLowerCase();
          if (normalizedType.includes('tripwire')) {
            (this as any).set('serviceType', 'tripwire');
          } else if (normalizedType.includes('monthly') || normalizedType.includes('subscription')) {
            (this as any).set('serviceType', 'monthly');
          } else if (normalizedType.includes('anchor')) {
            (this as any).set('serviceType', 'anchor');
          } else if (normalizedType.includes('rescue') || normalizedType.includes('downsell')) {
            (this as any).set('serviceType', 'rescue');
          }
        }

        // Sync attributes after applying offer
        (this as any).syncAttrs();
      },

      syncAttrs(this: Component) {
        const attrs = (this as any).getAttributes?.() || {} as any;
        attrs['data-checkout-id'] = (this as any).get('checkoutId') || 'main';
        attrs['data-service-name'] = (this as any).get('serviceName') || 'Bin Cleaning Service';
        attrs['data-service-price'] = String((this as any).get('servicePrice') ?? '29.99');
        attrs['data-service-type'] = (this as any).get('serviceType') || 'tripwire';
        attrs['data-offer-token'] = (this as any).get('offerToken') || '';
        (this as any).setAttributes?.(attrs);
        
        // Trigger view re-render when traits change
        (this as any).view?.render?.();
      }
    },

    view: {
      async onRender(this: { el: HTMLElement; model: Component; }) {
        const m = this.model as any;
        const checkoutId = m.get('checkoutId') || 'main';
        const serviceName = m.get('serviceName') || 'Bin Cleaning Service';
        const servicePrice = m.get('servicePrice') || '29.99';
        const serviceType = m.get('serviceType') || 'tripwire';
        
        // Fetch server-rendered HTML
        const qs = new URLSearchParams({
          checkout_id: String(checkoutId),
          service_name: String(serviceName),
          service_price: String(servicePrice),
          service_type: String(serviceType)
        });
        
        const fallback = () => {
          this.el.innerHTML = `
            <div style="padding:20px;border:1px dashed #9ca3af;border-radius:8px;text-align:center;color:#4b5563">
              <div style="font-weight:600;margin-bottom:8px">Seamless Checkout</div>
              <div style="font-size:14px;color:#6b7280">${serviceName} - $${servicePrice}</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:6px">(Renders fully on page preview)</div>
            </div>`;
        };
        
        try {
          const resp = await fetch(`/funnel/partials/seamless-checkout?${qs}`);
          if (!resp.ok) {
            console.warn('Seamless checkout preview fetch failed', resp.status);
            fallback();
            return;
          }
          const html = await resp.text();
          if (!html || !html.trim()) {
            fallback();
            return;
          }
          this.el.innerHTML = html;
        } catch (e) {
          console.warn('Seamless checkout preview error', e);
          fallback();
        }
      }
    }
  });
}
