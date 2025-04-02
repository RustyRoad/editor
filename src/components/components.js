import webinarCheckout1 from "./webinar-checkout-1";
// Assuming loadStripe is needed within the script property now
import { loadStripe } from '@stripe/stripe-js';

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType('Checkout 2 Step', {
    // isComponent remains the same
    isComponent: el => {
      // Example: Check for a specific attribute or class
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'webinar-checkout-2') {
        return { type: 'Checkout 2 Step' }; // Match the type name
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'webinar-checkout-2' }, // Keep attribute for identification
        content: 'Select this component and click the gear icon to select a product.',
        // Keep traits for product selection
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct',
            options: [], // Will be populated by fetchProducts
            changeProp: 1
          }
        ],
        // Add properties to store script data temporarily if needed, though script context might suffice
        // checkoutScriptData: null, // Example if needed, but prefer script context
        // Add 'script' property from GrapesJS API
        script: function() {
          // 'this' here refers to the component view instance
          // 'this.model' refers to the component model instance
          const componentRootEl = this.el;
          const model = this.model;

          // Get necessary data from the model
          const stripeKey = model.get('stripeKey');
          const selectedProductId = model.get('selectedProduct');
          const products = model.get('products') || [];
          const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

          // Debounce or ensure this runs only once after rendering if needed
          // Use a flag on the element itself
          if (!componentRootEl || componentRootEl.dataset.stripeScriptInitialized || !stripeKey || !selectedProduct) {
            if (!stripeKey) console.log('[Checkout Script] Stripe key not available yet.');
            if (!selectedProduct) console.log('[Checkout Script] Product not selected or found yet.');
            return; // Exit if already run, or required data is missing
          }
          componentRootEl.dataset.stripeScriptInitialized = 'true';
          console.log('[Checkout Script] Initializing for Product ID:', selectedProductId);

          // All Stripe logic goes here, executed in the browser context
          (async () => {
            try {
              const stripe = await loadStripe(stripeKey);
              if (!stripe) {
                console.error("[Checkout Script] Stripe.js failed to load.");
                componentRootEl.innerHTML = '<div>Error loading payment gateway.</div>'; // Update component content on error
                return;
              }

              const appearance = { theme: 'stripe', variables: { colorPrimary: '#6366f1' } };
              let elementsOptions = {};
              const productPrice = selectedProduct.price; // Get price from selected product
              const productId = selectedProduct.id;

              if (productPrice > 0) {
                elementsOptions = { mode: 'payment', currency: (selectedProduct.currency || 'usd').toLowerCase(), amount: Math.round(productPrice * 100), appearance };
              } else {
                elementsOptions = { mode: 'setup', currency: (selectedProduct.currency || 'usd').toLowerCase(), appearance };
              }
              console.log("[Checkout Script] Initializing Stripe Elements with options:", elementsOptions);

              const elements = stripe.elements(elementsOptions);
              const paymentElement = elements.create('payment');

              const paymentElementContainer = componentRootEl.querySelector('#payment-element');
              if (paymentElementContainer) {
                console.log('[Checkout Script] Mounting Payment Element...');
                paymentElement.mount(paymentElementContainer);
                console.log('[Checkout Script] Payment Element mount attempted.');
              } else {
                console.error("[Checkout Script] Error: #payment-element container not found!");
              }

              // Setup form submission
              const form = componentRootEl.querySelector('#payment-form');
              const submitButton = componentRootEl.querySelector('#submit-button');
              const errorMessage = componentRootEl.querySelector('#error-message');

              if (form && submitButton && errorMessage) {
                 console.log('[Checkout Script] Adding submit listener.');
                 // Remove previous listener if script runs multiple times (though flag should prevent)
                 // form.removeEventListener('submit', handleSubmit); // Need named function or store handler
                 const handleSubmit = async (e) => {
                    e.preventDefault();
                    submitButton.disabled = true;
                    errorMessage.textContent = '';

                    if (productPrice <= 0) {
                      console.log("[Checkout Script] Processing free order...");
                      errorMessage.textContent = 'Processing your free order...';
                      window.location.href = window.location.origin + '/order-confirmation?product_id=' + productId + '&free=true';
                    } else {
                      try {
                        console.log('[Checkout Script] Submitting paid order. Fetching client secret...');
                        const res = await fetch('/api/create-payment-intent', { // Relative path
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ productId: productId, amount: productPrice })
                        });
                        // Check for network errors first
                        if (!res.ok) {
                           throw new Error(`API Error: ${res.status} ${res.statusText}`);
                        }
                        const { clientSecret, error: backendError } = await res.json();

                        if (backendError || !clientSecret) {
                          throw new Error(backendError || 'Failed to create Payment Intent on submit.');
                        }
                        console.log('[Checkout Script] Client secret fetched. Confirming payment...');

                        const { error } = await stripe.confirmPayment({
                          elements: elements,
                          clientSecret: clientSecret,
                          confirmParams: {
                            return_url: window.location.origin + '/order-confirmation?product_id=' + productId,
                            receipt_email: componentRootEl.querySelector('#email-address').value,
                          },
                        });
                        if (error) throw error;
                        errorMessage.textContent = 'Processing payment...'; // Redirect should happen
                      } catch (error) {
                        console.error("[Checkout Script] Payment processing error:", error);
                        errorMessage.textContent = error.message || 'An unexpected error occurred.';
                        submitButton.disabled = false;
                      }
                    }
                 };
                 // Store handler reference if needed for removal later
                 // componentRootEl.stripeSubmitHandler = handleSubmit;
                 form.addEventListener('submit', handleSubmit);
              } else {
                 console.error("[Checkout Script] Error: Form elements not found for listener setup!");
              }

            } catch (error) {
              console.error("[Checkout Script] General Stripe setup error:", error);
              if(componentRootEl) componentRootEl.innerHTML = '<div>Error initializing payment form.</div>';
            }
          })(); // Immediately invoke the async function
        },
        title: 'Webinar Checkout 1' // Keep title if needed
      },
      // init, fetchStripeKey, fetchProducts, updateTraits remain largely the same
      init() {
        this.listenTo(this, 'change:selectedProduct', this.updateContent);
        // Add listener to re-run script when component content changes (e.g., after updateContent)
        this.listenTo(this, 'change:components', this.runScript);
        this.fetchStripeKey();
        this.fetchProducts();
      },
      // Added helper to trigger script execution, called by change:components listener
      runScript() {
        // GrapesJS might automatically call the script function on component changes.
        // If not, this explicitly calls it. Check GrapesJS docs for best practice.
        // This might cause multiple executions if not handled carefully by the script itself (using the data-stripe-script-executed flag).
        if (typeof this.view.script === 'function') {
           console.log("[Components Model] Triggering script execution due to component change.");
           // Reset execution flag before running script again
           if(this.view.el) this.view.el.removeAttribute('data-stripe-script-executed');
           this.view.script();
        }
      },
      fetchStripeKey() {
        const token = localStorage.getItem("access_token");
        fetch('/api/stripe/key', { /* ... headers ... */ })
          .then(response => response.json())
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
              console.log('[Components Model] Stripe key fetched.');
              // Potentially trigger updateContent if product already selected
              if (this.get('selectedProduct')) this.updateContent();
            } else {
               console.error('[Components Model] Failed to fetch valid Stripe key.');
            }
          }).catch(err => console.error('[Components Model] Error fetching Stripe key:', err));
      },
      fetchProducts() {
        console.log('[Components Model] Fetching products...');
        fetch('/api/products')
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch products');
            return response.json();
          })
          .then(data => {
            if (!Array.isArray(data)) {
              console.error('[Components Model] Invalid products data format:', data);
              throw new Error('Invalid products data format');
            }
            const products = data.map(product => ({
              id: product.id || 0,
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              images: product.images || []
            }));
            console.log('[Components Model] Fetched products:', products);
            this.set('products', products);
            this.updateTraits();
            // Potentially trigger updateContent if product already selected
            if (this.get('selectedProduct')) this.updateContent();
          }).catch(error => {
            console.error('[Components Model] Product fetch error:', error);
          });
      },
      updateTraits() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) { // Check if trait exists
            trait.set('options', products.map(product => ({
              id: product.id, // Use id for internal value
              name: product.title, // Use name for display
              value: product.id.toString() // Ensure value is string if needed by select trait
            })));
             // Force trait update if necessary, check GrapesJS docs
             this.em.trigger('component:toggled'); // Example way to force UI refresh
        } else {
             console.error("[Components Model] 'selectedProduct' trait not found.");
        }
      },
      // updateContent now only generates HTML and triggers the script execution via change:components listener
      async updateContent() {
        const stripeKey = this.get('stripeKey');
        const selectedProductId = this.get('selectedProduct');
        const products = this.get('products') || [];

        if (!stripeKey) {
           console.warn("[Components Model] updateContent called before Stripe key fetched.");
           // Optionally show a message or wait
           return;
        }
        if (!selectedProductId) {
           this.components('Please select a product from the settings panel.');
           return;
        }
        if (!products.length) {
          return this.components('<div class="text-red-600">No products available</div>');
        }

        const selectedProduct = products.find(product => product.id.toString() === selectedProductId);
        if (!selectedProduct) {
          return this.components('<div class="text-red-600">Selected product not found</div>');
        }

        // Call the simplified template function (now synchronous)
        // Pass only product data needed for the template
        const htmlContent = webinarCheckout1(selectedProduct);

        // Set the HTML content - this triggers 'change:components' which calls runScript -> script()
        console.log("[Components Model] Setting HTML content, expecting script to run.");
        // Reset execution flag before setting components to allow script to run again
        if(this.view && this.view.el) this.view.el.removeAttribute('data-stripe-script-executed');
        this.components(htmlContent);
      }
    }
    // View is implicitly handled by GrapesJS, including calling the 'script' function
  });
};