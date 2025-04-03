import webinarCheckout1 from "./webinar-checkout-1";
import embeddedCheckout from "./embedded-checkout";
import { loadStripe } from '@stripe/stripe-js';

// Helper function defined within the main export scope
const formatPrice = (amount, currency) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(numAmount);
};

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;
  const componentType = 'Checkout 2 Step';

  domc.addType(componentType, {
    isComponent: el => {
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'webinar-checkout-1') {
        return { type: componentType };
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'webinar-checkout-2' },
        content: 'Select a product...', // Initial placeholder
        droppable: false,
        // Define properties that trigger re-render/script execution when changed
        // We'll listen to these changes in the view
        stylable: [], // Add relevant style props if needed
        // Remove script property, logic moves to view
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct', // Trait name stores the ID
            options: [],
            changeProp: 1 // Trigger model change on trait selection
          }
        ],
        // Internal model properties (not traits)
        stripeKey: null,
        products: [],
        title: 'Webinar Checkout 1' // Keep title if needed
      },
      init() {
        // Listen for product selection change to update content via view's render
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        // Listen for stripeKey change
        this.listenTo(this, 'change:stripeKey', this.handleDataChange);
        // Listen for products change
         this.listenTo(this, 'change:products', this.handleDataChange);

        this.fetchStripeKey();
        this.fetchProducts();
      },
      // Triggered when selectedProduct trait changes
      handleProductChange() {
         console.log('[Model] Product selection changed:', this.get('selectedProduct'));
         // No need to call updateContent directly, view's onRender will handle it
         // Force a re-render if GrapesJS doesn't do it automatically on trait change
         this.trigger('rerender'); // Custom event, or use built-in if available
      },
       // Triggered when stripeKey or products change
      handleDataChange() {
         console.log('[Model] Stripe key or products updated.');
         // Force a re-render if a product is already selected
         if (this.get('selectedProduct')) {
            this.trigger('rerender');
         }
      },
      fetchStripeKey() {
        console.log('[Components Model] Fetching Stripe key...');
      //  let token = "";
        // Use user's preferred localhost URL
        // ex response {"public_key":"pk_test_fQMbieMo9lIO0XOD3Os9VXE8"}
        fetch('/api/stripe/key', {
             method: 'GET',
             headers: {
               "Content-Type": "application/json",
              // "Authorization": "Bearer " + token,
         
              }
              
            })
          .then(response => response.json())
          .then(data => {
            console.log('[Components Model] Stripe key response:', data);
            if (data && data.public_key) {
              console.log('[Components Model] Stripe key fetched.');
              this.set('stripeKey', data.public_key); // Triggers change:stripeKey
            } else {
               console.error('[Components Model] Failed to fetch valid Stripe key data:', data);
               this.set('stripeKey', null);
            }
          }).catch(err => {
              console.error('[Components Model] Error fetching Stripe key:', err);
              this.set('stripeKey', null);
          });
      },
      fetchProducts() {
        console.log('[Components Model] Fetching products...');
         // Use user's preferred localhost URL
        fetch('/api/products')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
             return response.text().then(text => text ? JSON.parse(text) : []);
          })
          .then(data => {
            if (!Array.isArray(data)) {
              console.error('[Components Model] Invalid products data format:', data);
              throw new Error('Invalid products data format');
            }
            const products = data.map(product => ({
              id: product.id || Date.now() + Math.random(),
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              images: product.images || [],
              currency: product.currency
            }));
            console.log('[Components Model] Fetched products:', products);
            this.set('products', products); // Triggers change:products
            this.updateTraits();
          }).catch(error => {
            console.error('[Components Model] Product fetch error:', error);
             this.set('products', []);
             this.updateTraits(); // Update traits even on error (to show empty list)
          });
      },
      updateTraits() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
            const currentVal = this.get('selectedProduct');
            const options = products.map(product => ({
              id: product.id.toString(),
              name: `${product.title} (${formatPrice(product.price, product.currency)})`,
              value: product.id.toString()
            }));
            options.unshift({ id: '', name: 'Select a Product...', value: '' });
            trait.set('options', options);
            // GrapesJS should handle setting the value based on the model attribute
            // if (!products.some(p => p.id.toString() === currentVal)) {
            //      trait.set('value', ''); // Let GrapesJS handle default/current value
            // }
        } else {
             console.error("[Components Model] 'selectedProduct' trait not found.");
        }
      },
      // Removed updateContent - logic moved to view.onRender
    }, // End model

    view: {
      // Listen to model changes that require re-rendering or script execution
      init() {
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },

      onRender() {
        console.log('[View] onRender triggered.');
        const model = this.model;
        const componentRootEl = this.el;

        // --- Get data ---
        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);

        // --- Generate HTML ---
        let htmlContent;
        if (!selectedProductId) {
          htmlContent = 'Please select a product from the settings panel.';
        } else if (!selectedProduct) {
          htmlContent = '<div class="text-red-600">Selected product data not found. Please re-select.</div>';
        } else {
          htmlContent = webinarCheckout1(selectedProduct); // Call template function
        }
        // Set inner HTML - this should happen before trying to mount Stripe
        componentRootEl.innerHTML = htmlContent;

        // --- Check prerequisites for Stripe ---
        const initFlag = `stripeRendered_${selectedProductId || 'none'}`;
        if (componentRootEl.dataset[initFlag]) {
           console.log(`[View] Stripe already rendered for product ${selectedProductId}.`);
           return; // Already initialized for this product in this view instance
        }
         if (!stripeKey || !selectedProduct) {
           console.log('[View] Skipping Stripe initialization: Missing key or product.');
           return; // Not ready for Stripe yet
         }

        // Mark as initialized for this product render cycle
         Object.keys(componentRootEl.dataset).forEach(key => {
             if (key.startsWith('stripeRendered_')) delete componentRootEl.dataset[key];
         });
        componentRootEl.dataset[initFlag] = 'true';
        console.log('[View] Initializing Stripe in onRender for Product ID:', selectedProductId);

        // --- Helper to display errors ---
        const displayError = (message) => {
          const errorMessageDiv = componentRootEl.querySelector('#error-message');
          if (errorMessageDiv) errorMessageDiv.textContent = message;
          const submitButton = componentRootEl.querySelector('#submit-button');
          if(submitButton) submitButton.disabled = false;
        };

        // --- Stripe Initialization and Mounting (Async IIFE) ---
        (async () => {
          let stripeInstance, elementsInstance, paymentElementInstance; // Keep scope local
          try {
            console.log('[View onRender] Loading Stripe...');
            stripeInstance = await loadStripe(stripeKey);
            if (!stripeInstance) throw new Error("Stripe.js failed to load.");
            console.log('[View onRender] Stripe loaded.');

            const appearance = { theme: 'stripe', variables: { colorPrimary: '#6366f1' } };
            let elementsOptions = {};
            const productPrice = selectedProduct.price;
            const productId = selectedProduct.id;

            if (productPrice > 0) {
              elementsOptions = { mode: 'payment', currency: (selectedProduct.currency || 'usd').toLowerCase(), amount: Math.round(productPrice * 100), appearance };
            } else {
              elementsOptions = { mode: 'setup', currency: (selectedProduct.currency || 'usd').toLowerCase(), appearance };
            }
            console.log("[View onRender] Initializing Stripe Elements:", elementsOptions);

            elementsInstance = stripeInstance.elements(elementsOptions);
            paymentElementInstance = elementsInstance.create('payment');
            console.log("[View onRender] Payment Element created.");

            const paymentElementContainer = componentRootEl.querySelector('#payment-element');
            if (paymentElementContainer) {
              paymentElementContainer.innerHTML = ''; // Clear previous just in case
              console.log('[View onRender] Mounting Payment Element...');
              paymentElementInstance.mount(paymentElementContainer);
              console.log('[View onRender] Payment Element mount attempted.');
            } else {
               console.error("[View onRender] Error: #payment-element container not found!");
               displayError("Payment form container missing.");
            }

            // --- Setup Form Submission ---
            const form = componentRootEl.querySelector('#payment-form');
            const submitButton = componentRootEl.querySelector('#submit-button');

            if (form && submitButton) {
               console.log('[View onRender] Adding submit listener.');
               const errorMessageDiv = componentRootEl.querySelector('#error-message');

               // Remove previous listener if exists (using stored handler on element)
               if (componentRootEl.stripeSubmitHandler) {
                  form.removeEventListener('submit', componentRootEl.stripeSubmitHandler);
               }

               const handleSubmit = async (e) => {
                  e.preventDefault();
                  submitButton.disabled = true;
                  if(errorMessageDiv) errorMessageDiv.textContent = '';

                  if (productPrice <= 0) {
                    console.log("[View onRender] Processing free order...");
                    if(errorMessageDiv) errorMessageDiv.textContent = 'Processing your free order...';
                    setTimeout(() => window.location.href = window.location.origin + '/order-confirmation?product_id=' + productId + '&free=true', 500);
                  } else {
                    let clientSecret;
                    try {
                      console.log('[View onRender] Submitting paid order. Fetching client secret...');
                      // Use user's preferred localhost URL
                      const res = await fetch('/api/create-payment-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: productId, amount: productPrice })
                      });
                      if (!res.ok) {
                         let errorMsg = `API Error: ${res.status} ${res.statusText}`;
                         try { const errBody = await res.json(); errorMsg = errBody.error || errorMsg; } catch (_) {}
                         throw new Error(errorMsg);
                      }
                      const { clientSecret: fetchedSecret, error: backendError } = await res.json();

                      if (backendError || !fetchedSecret) {
                        throw new Error(backendError || 'Failed to create Payment Intent on submit.');
                      }
                      clientSecret = fetchedSecret;
                      console.log('[View onRender] Client secret fetched. Confirming payment...');

                      const emailInput = componentRootEl.querySelector('#email-address');
                      const email = emailInput ? emailInput.value : '';

                      const { error } = await stripeInstance.confirmPayment({
                        elements: elementsInstance,
                        clientSecret: clientSecret,
                        confirmParams: {
                          return_url: window.location.origin + '/order-confirmation?product_id=' + productId,
                          receipt_email: email,
                        },
                      });
                      if (error) throw error;
                      if(errorMessageDiv) errorMessageDiv.textContent = 'Processing payment...';
                    } catch (error) {
                      console.error("[View onRender] Payment processing error:", error);
                      displayError(error.message || 'An unexpected error occurred.');
                    }
                  }
               };
               componentRootEl.stripeSubmitHandler = handleSubmit; // Store handler reference
               form.addEventListener('submit', handleSubmit);
            } else {
               console.error("[View onRender] Error: Form or submit button not found!");
               displayError("Checkout form elements missing.");
            }

          } catch (error) {
            console.error("[View onRender] General Stripe setup error:", error);
            displayError(`Error initializing payment form: ${error.message}`);
            delete componentRootEl.dataset[initFlag]; // Allow retry on error
          }
        })(); // Immediately invoke the async function
      } // End onRender
    } // End view
  }); // End addType

  // Add Embedded Checkout component type
  domc.addType('Embedded Checkout', {
    isComponent: el => {
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'embedded-checkout') {
        return { type: 'Embedded Checkout' };
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'embedded-checkout' },
        content: 'Select a product for embedded checkout...',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct',
            options: [],
            changeProp: 1
          }
        ],
        stripeKey: null,
        products: [],
        title: 'Embedded Checkout'
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey', this.handleDataChange);
        this.listenTo(this, 'change:products', this.handleDataChange);

        this.fetchStripeKey();
        this.fetchProducts();
      },
      handleProductChange() {
        console.log('[Embedded Model] Product selection changed:', this.get('selectedProduct'));
        this.trigger('rerender');
      },
      handleDataChange() {
        console.log('[Embedded Model] Stripe key or products updated.');
        if (this.get('selectedProduct')) {
          this.trigger('rerender');
        }
      },
      fetchStripeKey() {
        fetch('/api/stripe/key')
          .then(response => response.json())
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
            } else {
              this.set('stripeKey', null);
            }
          }).catch(err => {
            this.set('stripeKey', null);
          });
      },
      fetchProducts() {
        fetch('/api/products')
          .then(response => response.text().then(text => text ? JSON.parse(text) : []))
          .then(data => {
            const products = data.map(product => ({
              id: product.id || Date.now() + Math.random(),
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              currency: product.currency
            }));
            this.set('products', products);
            this.updateTraits();
          }).catch(error => {
            this.set('products', []);
            this.updateTraits();
          });
      },
      updateTraits() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
            const options = products.map(product => ({
              id: product.id.toString(),
              name: `${product.title} (${formatPrice(product.price, product.currency)})`,
              value: product.id.toString()
            }));
            options.unshift({ id: '', name: 'Select a Product...', value: '' });
            trait.set('options', options);
        }
      },
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);

        let htmlContent;
        if (!selectedProductId) {
          htmlContent = 'Please select a product from the settings panel.';
        } else if (!selectedProduct) {
          htmlContent = '&lt;div class="text-red-600"&gt;Selected product data not found. Please re-select.&lt;/div&gt;';
        } else {
          htmlContent = embeddedCheckout(selectedProduct);
        }
        componentRootEl.innerHTML = htmlContent;

        if (!stripeKey || !selectedProduct) return;

        (async () => {
          try {
            const stripeInstance = await loadStripe(stripeKey);
            if (!stripeInstance) throw new Error("Stripe.js failed to load.");

            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                const res = await fetch('/api/create-checkout-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                });
                const { clientSecret } = await res.json();
                return clientSecret;
              }
            });

            const container = componentRootEl.querySelector('#embedded-checkout-container');
            if (container) {
              checkout.mount(container);
            }
          } catch (error) {
            const errorMessage = componentRootEl.querySelector('#error-message');
            if (errorMessage) errorMessage.textContent = error.message;
          }
        })();
      }
    }
  });
}; // End export