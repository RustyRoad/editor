// @ts-nocheck

import webinarCheckout1 from "./webinar-checkout-1";
import embeddedCheckout from "./embedded-checkout";
import serviceSignup from "./service-signup";
import serviceValidation from "./service-validation";
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeElements, StripeConstructor } from '@stripe/stripe-js';

declare global {
  interface Window {
    initServiceValidation: (data: unknown) => void;
  }
}

declare global {
  interface Window {
    initServiceValidation: (data: unknown) => void;
  }
}
import pricingTable from "./pricing-table";
import locationToAddress from "./LocationToAddressGrapes";

import { formatPrice } from "./utils";
import { Editor } from "grapesjs";
import {  ServiceData } from "./modal-ui";

// Register components with GrapesJS
const components = (editor: Editor, opts = {}) => {
  const domc = editor.DomComponents;

  // Register webinar-checkout-1 component
  domc.addType('webinar-checkout-1', {
    model: {
      defaults: {
        component: webinarCheckout1,
        stylable: true,
      }
    }
  });

  // Register Embedded Checkout component
  // IMPORTANT: Component type name must match data-gjs-type attribute value exactly
  domc.addType('embedded-checkout', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'embedded-checkout' ? { type: 'embedded-checkout' } : false,
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'embedded-checkout', class: 'embedded-checkout-wrapper' },
        content: 'Select a product for embedded checkout...',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct',
            options: [],
            changeProp: true
          }
        ],
        stripeKey: null,
        products: [],
        selectedProduct: '',
        title: 'Embedded Checkout'
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey change:products', () => this.trigger('rerender'));
        this.fetchStripeKey();
        this.fetchProducts();
      },
      handleProductChange() {
        console.log('[Embedded Model] Product selection changed:', this.get('selectedProduct'));
        this.trigger('rerender');
      },
      fetchStripeKey() {
        if (this.get('stripeKey')) return;
        fetch('/api/stripe/key')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
              console.log('[Embedded Model] Stripe key fetched.');
            } else {
              console.warn('[Embedded Model] Stripe public key not found in response.');
              this.set('stripeKey', null);
            }
          }).catch(err => {
            console.error('[Embedded Model] Error fetching Stripe key:', err);
            this.set('stripeKey', null);
          });
      },
      fetchProducts() {
        if (this.get('products')?.length > 0) return;
        fetch('/api/product/all')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text().then(text => text ? JSON.parse(text) : []);
          })
          .then(data => {
            const products = (data || []).map((product: ServiceData) => ({
              id: product.id || `prod_${Date.now()}_${Math.random()}`,
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              currency: product.currency || 'usd',
              images: product.images || []
            }));
            this.set('products', products);
            console.log('[Embedded Model] Products fetched:', products.length);
            this.updateProductTraitOptions();
          }).catch(error => {
            console.error('[Embedded Model] Error fetching products:', error);
            this.set('products', []);
            this.updateProductTraitOptions();
          });
      },
      updateProductTraitOptions() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
          const options = products.map((product: ServiceData) => ({
            id: product.id.toString(),
            name: `${product.name} (${formatPrice(product.price, product.currency)})`,
            value: product.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Product...', value: '' });
          trait.set('options', options);
          console.log('[Embedded Model] Product trait options updated.');
        } else {
          console.warn('[Embedded Model] Could not find selectedProduct trait.');
        }
      },
      toJSON(opts = {}) {
        const obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
        obj.selectedProduct = this.get('selectedProduct');
        return obj;
      },
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el as HTMLElement;
        componentRootEl.innerHTML = '';

        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find((p: ServiceData) => p.id?.toString() === selectedProductId);

        let htmlContent;
        if (!selectedProductId) {
          htmlContent = '<div class="p-4 text-center text-gray-500">Please select a product from the settings panel.</div>';
        } else if (!selectedProduct) {
          htmlContent = '<div class="p-4 text-center text-red-600">Error: Selected product data not found. Please re-select.</div>';
        } else {
          htmlContent = embeddedCheckout(selectedProduct);
        }
        componentRootEl.innerHTML = htmlContent;

        if (!stripeKey || !selectedProduct) {
          console.log('[Embedded View] Skipping Stripe init (missing key or product).');
          return;
        }

        (async () => {
          try {
            const stripe = await loadStripe(stripeKey);
            if (!stripe) throw new Error("Stripe.js failed to load.");
            const stripeInstance = stripe;

            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                try {
                  const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                  });
                  if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to create checkout session (Status: ${res.status})`);
                  }
                  const { clientSecret } = await res.json();
                  if (!clientSecret) throw new Error("Client secret missing from response.");
                  return clientSecret;
                } catch (fetchErr) {
                  console.error('[Embedded View] Error fetching client secret:', fetchErr);
                  const errorContainer = componentRootEl.querySelector('#error-message');
                  if (errorContainer) errorContainer.textContent = `Error initializing payment: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`;
                  throw fetchErr;
                }
              }
            });

            const container = componentRootEl.querySelector('#embedded-checkout-container') as HTMLElement | null;
            if (container) {
              checkout.mount(container);
              console.log('[Embedded View] Stripe Embedded Checkout mounted.');
            } else {
              console.error('[Embedded View] Mount container #embedded-checkout-container not found.');
              const errorContainer = componentRootEl.querySelector('#error-message');
              if (errorContainer) errorContainer.textContent = 'Error: Payment form container not found.';
            }
          } catch (error) {
            console.error('[Embedded View] Stripe initialization error:', error);
            const errorMessageContainer = componentRootEl.querySelector('#error-message');
            if (errorMessageContainer) errorMessageContainer.textContent = `Payment Error: ${error instanceof Error ? error.message : String(error)}`;
          }
        })();
      },
      onRemove() {
        console.log('[Embedded View] Component removed.');
      }
    }
  });

  // Register Service Signup component
  // IMPORTANT: Component type name must match data-gjs-type attribute value exactly
  domc.addType('service-signup', {
    isComponent: el => {
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'service-signup') {
        return { type: 'service-signup' };
      }
      return false;
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'service-signup', class: 'service-signup-wrapper' },
        content: 'Select a service...',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Service',
            name: 'selectedProduct',
            options: [],
            changeProp: true
          }
        ],
        stripeKey: null,
        products: [],
        selectedProduct: '',
        title: 'Service Signup',
        _pendingOfferId: null as string | null,
        _pendingStripeProductId: null as string | null
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey change:products', () => this.trigger('rerender'));
        this.fetchStripeKey();
        this.fetchProducts();
        // Auto-select offer from URL if present
        this.autoSelectFromUrl();
      },
      autoSelectFromUrl() {
        // Check for offer_id in URL, window context, or component attribute
        const urlParams = new URLSearchParams(window.location.search);
        const offerIdFromUrl = urlParams.get('offer_id');
        const offerIdFromWindow = (window as any).__OFFER_ID__;
        // Also check the data-offer-id attribute on the component element
        const attrs = this.get('attributes') || {};
        const offerIdFromAttr = attrs['data-offer-id'];
        const offerId = offerIdFromUrl || (offerIdFromWindow ? String(offerIdFromWindow) : null) || (offerIdFromAttr && offerIdFromAttr !== '__OFFER_ID__' ? offerIdFromAttr : null);
        
        if (offerId && !this.get('selectedProduct')) {
          console.log('[Service Signup Model] Found offer_id, fetching offer details:', offerId);
          // Fetch the offer to get its stripe_product_id
          fetch(`/api/admin/offers/${offerId}`)
            .then(response => response.ok ? response.json() : null)
            .then(offerData => {
              if (offerData?.stripe_product_id) {
                console.log('[Service Signup Model] Offer has stripe_product_id:', offerData.stripe_product_id);
                // Store the stripe_product_id for matching after products load
                this.set('_pendingStripeProductId', offerData.stripe_product_id);
                this.set('_pendingOfferId', offerId);
                // Try to match now if products are loaded
                this.checkPendingOfferSelection();
              } else {
                console.warn('[Service Signup Model] Offer not found or no stripe_product_id:', offerId);
                // Fallback to direct ID matching
                this.set('_pendingOfferId', offerId);
                this.checkPendingOfferSelection();
              }
            })
            .catch(err => {
              console.warn('[Service Signup Model] Error fetching offer:', err);
              // Fallback to direct ID matching
              this.set('_pendingOfferId', offerId);
              this.checkPendingOfferSelection();
            });
        }
      },
      handleProductChange() {
        console.log('[Service Signup Model] Product/Service selection changed:', this.get('selectedProduct'));
        this.trigger('rerender');
      },
      fetchStripeKey() {
        if (this.get('stripeKey')) return;
        fetch('/api/stripe/key')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
              console.log('[Service Signup Model] Stripe key fetched.');
            } else {
              console.warn('[Service Signup Model] Stripe public key not found.');
              this.set('stripeKey', null);
            }
          }).catch(err => {
            console.error('[Service Signup Model] Error fetching Stripe key:', err);
            this.set('stripeKey', null);
          });
      },
      fetchProducts() {
        if (this.get('products')?.length > 0) return;
        fetch('/api/product/all')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text().then(text => text ? JSON.parse(text) : []);
          })
          .then(data => {
            const products = (data || []).map((product: ServiceData) => {
              const id = product.id ? product.id.toString() : `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const title = product.name || 'Untitled Service';
              const price = typeof product.price === 'number' ? Math.max(0, product.price) : 0;
              const description = product.description || '';
              const currency = product.currency || 'usd';
              const images = Array.isArray(product.images) ? product.images : [];
              // Include stripe_product_id for offer matching
              const stripe_product_id = product.stripe_product_id || null;

              if (!product.id || !product.name || typeof product.price !== 'number') {
                console.warn('[Service Signup Model] Incomplete product data:', product);
              }

              return { id, title, name: title, price, description, currency, images, stripe_product_id };
            }).filter((p: ServiceData) => p.id && (p.name || p.title));
            this.set('products', products);
            console.log('[Service Signup Model] Services fetched:', products.length);
            this.updateTraits();
            // Check for pending offer ID to auto-select
            this.checkPendingOfferSelection();
          }).catch(error => {
            console.error('[Service Signup Model] Error fetching services:', error);
            this.set('products', []);
            this.updateTraits();
          });
      },
      checkPendingOfferSelection() {
        const pendingOfferId = this.get('_pendingOfferId');
        const pendingStripeProductId = this.get('_pendingStripeProductId');
        
        if (!this.get('selectedProduct') && (pendingOfferId || pendingStripeProductId)) {
          const products = this.get('products') || [];
          if (products.length === 0) {
            console.log('[Service Signup Model] Products not loaded yet, waiting...');
            return;
          }
          
          let matchingProduct = null;
          
          // First try to match by stripe_product_id (most reliable)
          if (pendingStripeProductId) {
            matchingProduct = products.find((p: ServiceData) => 
              p.stripe_product_id === pendingStripeProductId
            );
            if (matchingProduct) {
              console.log('[Service Signup Model] Matched by stripe_product_id:', pendingStripeProductId);
            }
          }
          
          // Fallback to direct ID match
          if (!matchingProduct && pendingOfferId) {
            matchingProduct = products.find((p: ServiceData) => p.id?.toString() === pendingOfferId);
            if (matchingProduct) {
              console.log('[Service Signup Model] Matched by direct ID:', pendingOfferId);
            }
          }
          
          if (matchingProduct) {
            console.log('[Service Signup Model] Auto-selecting product:', matchingProduct.name || matchingProduct.title, 'id:', matchingProduct.id);
            this.set('selectedProduct', matchingProduct.id.toString());
            this.set('_pendingOfferId', null);
            this.set('_pendingStripeProductId', null);
          } else {
            console.warn('[Service Signup Model] No matching product found. Pending offer ID:', pendingOfferId, 'Stripe Product ID:', pendingStripeProductId);
          }
        }
      },
      updateTraits() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
          const options = products.map((product: ServiceData) => ({
            id: product.id.toString(),
            name: `${product.name} (${formatPrice(product.price, product.currency)})`,
            value: product.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Service...', value: '' });
          trait.set('options', options);
          console.log('[Service Signup Model] Service trait options updated.');
        } else {
          console.warn('[Service Signup Model] Could not find selectedProduct trait.');
        }
      },
      toJSON(opts = {}) {
        const obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
        obj.selectedProduct = this.get('selectedProduct');
        return obj;
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        componentRootEl.innerHTML = '';

        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find((p: ServiceData) => p.id?.toString() === selectedProductId);

        let htmlContent;
        // Defensive: Only call serviceSignup if selectedProduct is a valid object
        if (!selectedProductId || !selectedProduct || typeof selectedProduct !== 'object') {
          htmlContent = '<div class="text-center text-gray-500 p-4">Please select a service from the settings panel.</div>';
        } else {
          htmlContent = serviceSignup(selectedProduct);
        }
        componentRootEl.innerHTML = htmlContent;

        if (!stripeKey || !selectedProduct) {
          console.log('[Service Signup View] Skipping JS init (missing key or product).');
          return;
        }

        const address1Input = componentRootEl.querySelector('#address1') as HTMLInputElement;
        const cityInput = componentRootEl.querySelector('#city') as HTMLInputElement;
        const stateInput = componentRootEl.querySelector('#state') as HTMLInputElement;
        const zip5Input = componentRootEl.querySelector('#zip5') as HTMLInputElement;
        const checkBtn = componentRootEl.querySelector('#check-availability') as HTMLButtonElement;
        const feedbackDiv = componentRootEl.querySelector('#address-feedback') as HTMLDivElement;
        const submitBtn = componentRootEl.querySelector('#submit-button') as HTMLButtonElement;
        const errorMsgDiv = componentRootEl.querySelector('#error-message') as HTMLDivElement;

        const setFeedback = (msg: string, color: string) => {
          if (feedbackDiv) {
            feedbackDiv.textContent = msg;
            feedbackDiv.style.color = color;
          }
        };

        const setSubmitEnabled = (enabled: boolean) => {
          if (submitBtn) {
            if (enabled) {
              submitBtn.removeAttribute('disabled');
              submitBtn.classList.remove('opacity-50');
            } else {
              submitBtn.setAttribute('disabled', 'disabled');
              submitBtn.classList.add('opacity-50');
            }
          }
        };

        setSubmitEnabled(false);

        const checkAvailability = async () => {
          if (!address1Input || !cityInput || !stateInput || !zip5Input || !checkBtn) {
            setFeedback('Internal error: Address fields missing.', '#b91c1c');
            return;
          }
          const address1 = address1Input.value.trim();
          const city = cityInput.value.trim();
          const state = stateInput.value.trim();
          const zip5 = zip5Input.value.trim();

          setFeedback('⏳ Checking...', '#2563eb');
          setSubmitEnabled(false);
          checkBtn.disabled = true;

          if (!address1 || !city || !state || !zip5) {
            setFeedback('Please complete all address fields.', '#b91c1c');
            checkBtn.disabled = false;
            return;
          }

          try {
            const resp = await fetch('/api/geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address: { address1, address2: null, city, state, zip5, zip4: null },
                zone_id: 1
              })
            });

            if (!resp.ok) {
              let errorMsg = 'API error during address check.';
              try { const errData = await resp.json(); errorMsg = errData.error || errorMsg; } catch (e) { }
              throw new Error(errorMsg);
            }
            const data = await resp.json();

            if (data.inside_zone || data.in_service_area) {
              setFeedback('✅ Address is in service area.', '#16a34a');
              setSubmitEnabled(true);
            } else if (data.invalid_address || data.invalid_zip) {
              setFeedback('❌ Address appears invalid. Please check.', '#b91c1c');
            } else if (data.outside_zone || (data.hasOwnProperty('in_service_area') && !data.in_service_area)) {
              setFeedback('❌ Address is outside the service area.', '#b91c1c');
            } else {
              setFeedback('❌ Could not validate address eligibility.', '#b91c1c');
            }
          } catch (e) {
            console.error("[Service Signup View] Address Check Error:", e);
            if (e instanceof Error && (e.message.includes('Failed to fetch') || e.message.includes('timeout'))) {
              setFeedback('⚠️ Connection error. Please check network.', '#b91c1c');
            } else {
              setFeedback(`⚠️ Error verifying address: ${e instanceof Error ? e.message : String(e)}`, '#b91c1c');
            }
          } finally {
            if (!this._addressValidated) {
              if (checkBtn) checkBtn.disabled = false;
            }
          }
        };

        const clearFeedback = () => {
          setFeedback('', '');
          setSubmitEnabled(false);
          if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
        };

        if (checkBtn) checkBtn.addEventListener('click', checkAvailability);
        if (address1Input) address1Input.addEventListener('input', clearFeedback);
        if (cityInput) cityInput.addEventListener('input', clearFeedback);
        if (stateInput) stateInput.addEventListener('input', clearFeedback);
        if (zip5Input) zip5Input.addEventListener('input', clearFeedback);

        this._serviceSignupListeners = { checkAvailability, clearFeedback };

        (async () => {
          try {
            const stripe = await loadStripe(stripeKey);
            if (!stripe) throw new Error("Stripe.js failed to load.");
            const stripeInstance = stripe;

            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                try {
                  const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                  });
                  if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to create checkout session (Status: ${res.status})`);
                  }
                  const { clientSecret } = await res.json();
                  if (!clientSecret) throw new Error("Client secret missing from response.");
                  return clientSecret;
                } catch (fetchErr) {
                  console.error('[Service Signup View] Error fetching client secret:', fetchErr);
                  if (errorMsgDiv) errorMsgDiv.textContent = `Payment init error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`;
                  throw fetchErr;
                }
              }
            });

            const container = componentRootEl.querySelector('#payment-element') as HTMLElement | null;
            if (container) {
              checkout.mount(container);
              console.log('[Service Signup View] Stripe Embedded Checkout mounted.');
            } else {
              console.error('[Service Signup View] Mount container #payment-element not found.');
              if (errorMsgDiv) errorMsgDiv.textContent = 'Error: Payment form container not found.';
            }
          } catch (error) {
            console.error('[Service Signup View] Stripe initialization error:', error);
            if (errorMsgDiv) errorMsgDiv.textContent = `Payment Error: ${error instanceof Error ? error.message : String(error)}`;
          }
        })();
      },
      onRemove() {
        console.log('[Service Signup View] Component removed.');
        const checkBtn = this.el.querySelector('#check-availability');
        const address1Input = this.el.querySelector('#address1');
        if (checkBtn && this._serviceSignupListeners?.checkAvailability) {
          checkBtn.removeEventListener('click', this._serviceSignupListeners.checkAvailability);
        }
        if (address1Input && this._serviceSignupListeners?.clearFeedback) {
          address1Input.removeEventListener('input', this._serviceSignupListeners.clearFeedback);
        }
        this._serviceSignupListeners = null;
      }
    }
  });

  // Register service validation component
  domc.addType('service-validation', {
    extend: 'component',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'service-validation', class: 'service-validation-wrapper' },
        content: '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Service',
            name: 'selectedService',
            options: [{ id: '', name: 'Select a Service...' }],
            changeProp: true
          }
        ],
        stripeKey: null,
        services: [] as ServiceData[],
        selectedService: '',
        script() {
          // Ensure serviceData is correctly typed if possible, or handle transformation.
          // For the script tag, this.get('serviceData') likely refers to the selected service.
          const currentSelectedId = this.get('selectedService');
          const servicesArray = this.get('services') as ServiceData[] || [];
          const serviceData = servicesArray.find(s => s.id === currentSelectedId);

          if (serviceData && typeof window.initServiceValidation === 'function') {
            // serviceData here should already be ServiceData due to changes in fetchServices
            window.initServiceValidation(serviceData);
          } else if (typeof window.initServiceValidation === 'function') {
            // Fallback or if serviceData is not found/ready
            window.initServiceValidation({}); // Let initServiceValidation handle empty/invalid
          }
        },
        title: 'Service Validation & Billing'
      },
      _pendingServiceId: null as string | null,
      init() {
        this.fetchStripeKey();
        this.fetchServices();
        this.listenTo(this, 'change:selectedService', this.handleServiceChange);
        // Auto-select service from URL if available
        this.autoSelectFromUrl();
      },
      autoSelectFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const offerIdFromUrl = urlParams.get('offer_id');
        const offerIdFromWindow = (window as any).__OFFER_ID__;
        const offerId = offerIdFromUrl || offerIdFromWindow;
        
        if (offerId && !this.get('selectedService')) {
          console.log('[Service Validation Model] Found offer_id from URL/window:', offerId);
          // Store pending service ID - will be selected after services are fetched
          this._pendingServiceId = offerId;
          // If services are already loaded, select now
          const services = this.get('services') as ServiceData[] || [];
          if (services.length > 0) {
            this.checkPendingServiceSelection();
          }
        }
      },
      checkPendingServiceSelection() {
        if (!this._pendingServiceId) return;
        
        const services = this.get('services') as ServiceData[] || [];
        const matchingService = services.find(
          (s: ServiceData) => s.id?.toString() === this._pendingServiceId
        );
        
        if (matchingService) {
          console.log('[Service Validation Model] Auto-selecting service:', matchingService.name, 'id:', matchingService.id);
          this.set('selectedService', matchingService.id.toString());
          this._pendingServiceId = null;
        } else {
          console.warn('[Service Validation Model] Service not found for offer_id:', this._pendingServiceId);
        }
      },
      handleServiceChange() {
        const selectedServiceId = this.get('selectedService');
        const services = this.get('services') as ServiceData[] || [];
        const stripeKey = this.get('stripeKey');
        console.log('[Service Validation Model] Service selection changed:', selectedServiceId);

        let newContent = '';
        if (!selectedServiceId) {
          newContent = '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>';
        } else {
          const selectedServiceData = services.find((s: ServiceData) => s.id?.toString() === selectedServiceId);
          if (!selectedServiceData) {
            newContent = '<div class="p-4 text-center text-red-600">Error: Selected service data not found. Please try re-selecting.</div>';
          } else {
            // selectedServiceData is now ServiceData, which serviceValidation expects
            const serviceDataWithKey = { ...selectedServiceData, stripeKey: stripeKey };
            const validationResult = serviceValidation(serviceDataWithKey);
            if (validationResult) {
              newContent = validationResult;
            } else {
              // Fallback content if serviceValidation returns undefined/null (though it should return string or error)
              newContent = '<div class="p-4 text-center text-red-600">Error generating service view.</div>';
            }
          }
        }
        this.set('content', newContent);
      },
      fetchStripeKey() {
        if (this.get('stripeKey')) return;
        fetch('/settings/stripe-api-key')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            if (data && data.stripe_api_key) {
              this.set('stripeKey', data.stripe_api_key);
              console.log('[Service Validation Model] Stripe key fetched.');
              if (this.get('selectedService')) {
                this.handleServiceChange();
              }
            } else {
              console.warn('[Service Validation Model] Stripe key not found in response.');
              this.set('stripeKey', null);
              if (this.get('selectedService')) {
                this.handleServiceChange();
              }
            }
          }).catch(err => {
            console.error('[Service Validation Model] Error fetching Stripe key:', err);
            this.set('stripeKey', null);
            if (this.get('selectedService')) {
              this.handleServiceChange();
            }
          });
      },
      fetchServices() {
        if (this.get('services')?.length > 0) return;
        console.log('[Service Validation Model] Fetching services...');
        fetch('/api/product/all')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text().then(text => text ? JSON.parse(text) : []);
          })
          .then(data => {
            const services = (data || []).map((service: ServiceData): ServiceData => ({
              id: service.id || `service_${Date.now()}_${Math.random()}`,
              name: service.name || 'Untitled Service', // Map name to title
              price: service.price || 0,
              description: service.description || '',
              currency: service.currency || 'usd',
              images: service.images || [],
              stripe_product_id: service.stripe_product_id // Ensure all fields from ServiceData are covered
            }));
            this.set('services', services);
            console.log('[Service Validation Model] Services fetched:', services.length);
            this.updateServiceTraitOptions();
            // Check for pending service selection from URL
            this.checkPendingServiceSelection();
            const content = this.get('content') || '';
            if (this.get('selectedService') && !content.includes('service-validation-container')) {
              this.handleServiceChange();
            }
          }).catch(error => {
            console.error('[Service Validation Model] Error fetching services:', error);
            this.set('services', []);
            this.updateServiceTraitOptions();
          });
      },
      updateServiceTraitOptions() {
        const services = this.get('services') || [];
        const trait = this.getTrait('selectedService');
        if (trait) {
          const options = services.map((service: ServiceData) => ({ // service is now ServiceData
            id: service.id.toString(),
            // Use service.title as it's now ServiceData
            name: `${service.name} (${formatPrice(service.price, service.currency)})`,
            value: service.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Service...', value: '' });
          trait.set('options', options);
          console.log('[Service Validation Model] Service trait options updated.');
        } else {
          console.warn('[Service Validation Model] Could not find selectedService trait to update.');
        }
      },
      toJSON(opts = {}) {
        const obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
        obj.selectedService = this.get('selectedService');
        console.log('[Service Validation Model] toJSON called, content length:', obj.content?.length);
        return obj;
      },
    },
    view: {
      events() {
        return {
          'change:selectedService': 'updateScript'
        };
      },
      init() {
        this.listenTo(this.model, 'change:content', this.render);
      },
      updateScript() {
        const serviceData = this.model.get('serviceData');
        if (serviceData) {
          this.model.trigger('change:script');
        }
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        const content = model.get('content') || '';
        componentRootEl.innerHTML = content;
        console.log('[Service Validation View] Rendered content from model.');
      },
      onRemove() {
        console.log('[Service Validation View] Component removed.');
      }
    }
  });

  // Register pricing-table component
  pricingTable(editor);

  // Register location-to-address component
  locationToAddress(editor);

  // Register custom image component with srcset support
  // Register custom image component
  domc.addType('image', {
    isComponent: el => el.tagName === 'IMG',
    model: {
      defaults: {
        tagName: 'img',
        attributes: {
          src: '',
          alt: '',
          class: 'gjs-image'
        },
        traits: [
          'src',
          'alt',
          'title'
        ]
      }
    }
  });
};

// Expose serviceValidation globally for use by other components (like pricing table)
window.initServiceValidation = (data: unknown) => {
  if (typeof data === 'object' && data !== null) {
    const transformedData: Partial<ServiceData> = {};

    // Copy common properties, checking types
    if ('id' in data && typeof (data as any).id === 'string') {
      transformedData.id = (data as any).id;
    }
    if ('price' in data && typeof (data as any).price === 'number') {
      transformedData.price = (data as any).price;
    }
    if ('description' in data && typeof (data as any).description === 'string') {
      transformedData.description = (data as any).description;
    }
    if ('images' in data && Array.isArray((data as any).images)) {
      transformedData.images = (data as any).images;
    }
    if ('currency' in data && typeof (data as any).currency === 'string') {
      transformedData.currency = (data as any).currency;
    }
    if ('stripe_product_id' in data && typeof (data as any).stripe_product_id === 'string') {
      transformedData.stripe_product_id = (data as any).stripe_product_id;
    }

    // Handle the title/name discrepancy
    if ('title' in data && typeof (data as any).title === 'string') {
      transformedData.name = (data as any).title;
    } else if ('name' in data && typeof (data as any).name === 'string') {
      // If 'title' is missing but 'name' (from ModalUiServiceData) exists, use 'name' as 'title'
      transformedData.name = (data as any).name;
    }
    
    // The serviceValidation function (imported from ./service-validation)
    // has its own internal checks for id, price, name.
    serviceValidation(transformedData as ServiceData);

  } else {
    console.error("initServiceValidation: Data is not a valid object or is null.", data);
    // Call serviceValidation with an empty object to trigger its internal error handling.
    serviceValidation({} as ServiceData);
  }
};

export { formatPrice };
export default components;
