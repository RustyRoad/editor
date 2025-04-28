import webinarCheckout1 from "./webinar-checkout-1";
import embeddedCheckout from "./embedded-checkout";
import serviceSignup from "./service-signup";
// Import the updated service validation component function
import serviceValidation from "./service-validation"; // Ensure this file contains the updated code with integrated billing
import { loadStripe } from '@stripe/stripe-js';
import pricingTable from "./pricing-table"; // Import the new pricing table component

// Helper function defined within the main export scope
const formatPrice = (amount, currency) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    // Return a default or error string if amount is not a valid number
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD', // Default to USD if not provided
  }).format(numAmount);
};

// Register components with GrapesJS
const components = (editor, opts = {}) => {
  const domc = editor.DomComponents; // Use DomComponents API

  // Register webinar-checkout-1 component
  // (Assuming webinarCheckout1 is a function returning HTML/JS string)
  domc.addType('webinar-checkout-1', {
    model: {
      defaults: {
        component: webinarCheckout1, // Check if this function exists and returns HTML
        stylable: true,
        // Add necessary traits if this component needs configuration
      }
    }
  });

  // --- Full Embedded Checkout Component Definition (Restored) ---
  domc.addType('Embedded Checkout', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'embedded-checkout' ? { type: 'Embedded Checkout' } : null,
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'embedded-checkout', class:'embedded-checkout-wrapper' }, // Added wrapper class
        content: 'Select a product for embedded checkout...', // Initial placeholder
        droppable: false,
        stylable: [], // Define stylable properties if needed
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct', // Model attribute name
            options: [], // Will be populated dynamically
            changeProp: 1 // Trigger model change on selection
          }
        ],
        // Model properties to store data
        stripeKey: null, // Fetched Stripe public key
        products: [], // Fetched list of products
        selectedProduct: '', // ID of the selected product
        title: 'Embedded Checkout' // Name in GrapesJS UI
      },
      // Model initialization
      init() {
        // Listen for changes that require action or re-render
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        // Re-render if Stripe key or product list changes after initial load
        this.listenTo(this, 'change:stripeKey change:products', () => this.trigger('rerender'));

        // Fetch necessary data
        this.fetchStripeKey();
        this.fetchProducts();
      },
      // Handle product selection change
      handleProductChange() {
        console.log('[Embedded Model] Product selection changed:', this.get('selectedProduct'));
        this.trigger('rerender'); // Re-render the view
      },
      // Fetch Stripe public key
      fetchStripeKey() {
        // Avoid redundant fetches
        if (this.get('stripeKey')) return;
        fetch('http://192.168.50.14/api/stripe/key') // Ensure this endpoint is correct
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
      // Fetch product list
      fetchProducts() {
        // Avoid redundant fetches
        if (this.get('products')?.length > 0) return;
        fetch('http://192.168.50.14/api/product/all') // Ensure this endpoint is correct
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text().then(text => text ? JSON.parse(text) : []); // Handle empty response
        })
        .then(data => {
            // Map fetched data to the expected format
            const products = (data || []).map(product => ({
              id: product.id || `prod_${Date.now()}_${Math.random()}`, // Ensure unique ID
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0, // Ensure non-negative number
              description: product.description || '',
              currency: product.currency || 'usd', // Default currency
              images: product.images || [] // Include images if needed
            }));
            this.set('products', products);
            console.log('[Embedded Model] Products fetched:', products.length);
            this.updateProductTraitOptions(); // Update the dropdown
          }).catch(error => {
            console.error('[Embedded Model] Error fetching products:', error);
            this.set('products', []);
            this.updateProductTraitOptions(); // Update dropdown even on error
          });
      },
      // Update the 'Select Product' trait options
      updateProductTraitOptions() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
          const options = products.map(product => ({
            id: product.id.toString(),
            name: `${product.title} (${formatPrice(product.price, product.currency)})`,
            value: product.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Product...', value: '' }); // Add default option
          trait.set('options', options);
          console.log('[Embedded Model] Product trait options updated.');
        } else {
           console.warn('[Embedded Model] Could not find selectedProduct trait.');
        }
      },
       // Override toJSON if needed for saving specific state
       toJSON(opts = {}) {
         const obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
         obj.selectedProduct = this.get('selectedProduct');
         return obj;
       },
    },
    // Component View definition
    view: {
      init() {
        // Re-render the view whenever relevant model properties change
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      // Main rendering logic
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        componentRootEl.innerHTML = ''; // Clear previous content

        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);

        let htmlContent;
        // Generate HTML based on the current state
        if (!selectedProductId) {
          htmlContent = '<div class="p-4 text-center text-gray-500">Please select a product from the settings panel.</div>';
        } else if (!selectedProduct) {
          htmlContent = '<div class="p-4 text-center text-red-600">Error: Selected product data not found. Please re-select.</div>';
        } else {
          // Call the imported template function for the embedded checkout UI
          htmlContent = embeddedCheckout(selectedProduct); // Pass selected product data
        }
        componentRootEl.innerHTML = htmlContent; // Set the generated HTML

        // --- Initialize Stripe Embedded Checkout ---
        // Only proceed if we have a key and a selected product
        if (!stripeKey || !selectedProduct) {
          console.log('[Embedded View] Skipping Stripe init (missing key or product).');
          return;
        }

        // Use an async IIFE to handle Stripe loading and initialization
        (async () => {
          try {
            // Ensure Stripe.js is loaded
            if (typeof Stripe === 'undefined') {
                await loadStripe(stripeKey); // Load Stripe.js if not already loaded
                if (typeof Stripe === 'undefined') throw new Error("Stripe.js failed to load.");
            }
            const stripeInstance = Stripe(stripeKey); // Initialize Stripe with the key

            // Initialize the embedded checkout session
            const checkout = await stripeInstance.initEmbeddedCheckout({
              // Fetch the client secret from the backend
              fetchClientSecret: async () => {
                try {
                    const res = await fetch('http://192.168.50.14/api/stripe/create-checkout-session', { // Ensure endpoint is correct
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      // Send product ID and amount (or let backend derive amount from ID)
                      body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                    });
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({})); // Try parsing error
                        throw new Error(errorData.error || `Failed to create checkout session (Status: ${res.status})`);
                    }
                    const { clientSecret } = await res.json();
                    if (!clientSecret) throw new Error("Client secret missing from response.");
                    return clientSecret;
                } catch (fetchErr) {
                    console.error('[Embedded View] Error fetching client secret:', fetchErr);
                    // Display error to user within the component
                    const errorContainer = componentRootEl.querySelector('#error-message'); // Ensure this exists in embeddedCheckout template
                    if (errorContainer) errorContainer.textContent = `Error initializing payment: ${fetchErr.message}`;
                    throw fetchErr; // Re-throw to stop checkout mounting
                }
              }
            }); // End initEmbeddedCheckout

            // Mount the checkout form into the designated container
            const container = componentRootEl.querySelector('#embedded-checkout-container'); // Ensure this ID exists in the template
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
            // Display error message within the component
            const errorMessageContainer = componentRootEl.querySelector('#error-message'); // Ensure this ID exists
            if (errorMessageContainer) errorMessageContainer.textContent = `Payment Error: ${error.message}`;
          }
        })(); // End async IIFE
      }, // End onRender
      onRemove() {
        console.log('[Embedded View] Component removed.');
        // Add any necessary cleanup here
      }
    } // End view
  }); // End addType 'Embedded Checkout'

  // --- Full Service Signup Component Definition (Restored) ---
  // NOTE: This uses the older embedded checkout logic from the original file.
  domc.addType('Service Signup', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'service-signup' ? { type: 'Service Signup' } : null,
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'service-signup', class:'service-signup-wrapper' }, // Added wrapper class
        content: 'Select a service...', // Initial placeholder
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Service', // Changed label for clarity
            name: 'selectedProduct', // Keep name consistent if API endpoint expects 'product'
            options: [],
            changeProp: 1
          }
        ],
        stripeKey: null, // Fetched Stripe key
        products: [], // Fetched list of services/products
        selectedProduct: '', // ID of the selected service/product
        title: 'Service Signup' // Name in GrapesJS UI
      },
      // Model initialization
      init() {
        // Listen for changes
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey change:products', () => this.trigger('rerender'));

        // Fetch data
        this.fetchStripeKey();
        this.fetchProducts(); // Renamed method for consistency, fetches services
      },
      // Handle selection change
      handleProductChange() {
        console.log('[Service Signup Model] Product/Service selection changed:', this.get('selectedProduct'));
        this.trigger('rerender');
      },
      // Fetch Stripe key (same as Embedded Checkout)
      fetchStripeKey() {
        if (this.get('stripeKey')) return;
        fetch('http://192.168.50.14/api/stripe/key')
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
      // Fetch services (using the specific endpoint from original code)
      fetchProducts() { // Method name kept for consistency with listeners
        if (this.get('products')?.length > 0) return;
        fetch('http://192.168.50.14/api/product/all') // Endpoint from original code
          .then(response => {
             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
             return response.text().then(text => text ? JSON.parse(text) : []);
          })
          .then(data => {
            // Map data (assuming structure is similar to products)
            const products = (data || []).map(product => ({
              id: product.id || `prod_${Date.now()}_${Math.random()}`,
              title: product.name || 'Untitled Service', // Use 'Service' in title
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              currency: product.currency || 'usd',
              images: product.images || []
            }));
            this.set('products', products); // Store fetched data
            console.log('[Service Signup Model] Services fetched:', products.length);
            this.updateTraits(); // Update the dropdown
          }).catch(error => {
            console.error('[Service Signup Model] Error fetching services:', error);
            this.set('products', []);
            this.updateTraits();
          });
      },
      // Update trait options (similar to Embedded Checkout)
      updateTraits() {
        const products = this.get('products') || []; // 'products' holds the services
        const trait = this.getTrait('selectedProduct');
        if (trait) {
          const options = products.map(product => ({
            id: product.id.toString(),
            name: `${product.title} (${formatPrice(product.price, product.currency)})`,
            value: product.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Service...', value: '' });
          trait.set('options', options);
          console.log('[Service Signup Model] Service trait options updated.');
        } else {
           console.warn('[Service Signup Model] Could not find selectedProduct trait.');
        }
      },
      // Override toJSON if needed
      toJSON(opts = {}) {
        const obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
        obj.selectedProduct = this.get('selectedProduct');
        // Include other state if necessary, e.g., form values if captured
        // obj.formValues = this.get('formValues'); // Example if form state was saved
        return obj;
      }
    },
    // View definition for Service Signup
    view: {
      init() {
        // Listen for changes requiring re-render
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      // Main rendering logic
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        componentRootEl.innerHTML = ''; // Clear previous content

        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || []; // This holds services
        const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);

        let htmlContent;
        // Generate HTML based on state
        if (!selectedProductId) {
          htmlContent = '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>';
        } else if (!selectedProduct) {
          htmlContent = '<div class="p-4 text-center text-red-600">Error: Selected service data not found. Please re-select.</div>';
        } else {
          // Call the imported serviceSignup template function
          htmlContent = serviceSignup(selectedProduct); // Pass selected service data
        }
        componentRootEl.innerHTML = htmlContent; // Set generated HTML

        // --- Initialize Address Validation and Stripe Embedded Checkout (from original code) ---
        if (!stripeKey || !selectedProduct) {
            console.log('[Service Signup View] Skipping JS init (missing key or product).');
            return; // Don't proceed if key or service is missing
        }

        // Find elements within the newly rendered component
        const address1Input = componentRootEl.querySelector('#address1');
        const cityInput = componentRootEl.querySelector('#city');
        const stateInput = componentRootEl.querySelector('#state');
        const zip5Input = componentRootEl.querySelector('#zip5');
        const checkBtn = componentRootEl.querySelector('#check-availability');
        const feedbackDiv = componentRootEl.querySelector('#address-feedback');
        const submitBtn = componentRootEl.querySelector('#submit-button'); // Stripe submit button
        const errorMsgDiv = componentRootEl.querySelector('#error-message'); // General error display

        // Helper functions scoped to this view instance
        const setFeedback = (msg, color) => {
          if (feedbackDiv) {
            feedbackDiv.textContent = msg;
            feedbackDiv.style.color = color;
          }
        };

        const setSubmitEnabled = (enabled) => {
          // This targets the Stripe submit button inside the embedded checkout
          // We might not directly control its enabled state easily here,
          // but we control the address validation button state.
          // The original code enabled the main form submit based on address validation.
          if (submitBtn) { // Check if the main submit button exists in the template
             if (enabled) {
                submitBtn.removeAttribute('disabled');
                submitBtn.classList.remove('opacity-50');
             } else {
                submitBtn.setAttribute('disabled', 'disabled');
                submitBtn.classList.add('opacity-50');
             }
          }
        };

        // Initial state: disable submit until address is validated
        setSubmitEnabled(false);

        // Address validation logic (async function)
        const checkAvailability = async () => {
            // Ensure all required elements exist
            if (!address1Input || !cityInput || !stateInput || !zip5Input || !checkBtn) {
                setFeedback('Internal error: Address fields missing.', '#b91c1c');
                return;
            }
            const address1 = address1Input.value.trim();
            const city = cityInput.value.trim();
            const state = stateInput.value.trim();
            const zip5 = zip5Input.value.trim();

            setFeedback('⏳ Checking...', '#2563eb');
            setSubmitEnabled(false); // Disable submit during check
            checkBtn.disabled = true; // Disable check button during check

            if (!address1 || !city || !state || !zip5) {
                setFeedback('Please complete all address fields.', '#b91c1c');
                checkBtn.disabled = false; // Re-enable check button
                return;
            }

            try {
                // Call the geocode/availability endpoint
                const resp = await fetch('http://192.168.50.14/api/geocode', { // Or /api/check-availability
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: { address1, address2: null, city, state, zip5, zip4: null },
                    zone_id: 1 // Include zone ID if required by API
                })
                });

                if (!resp.ok) {
                    let errorMsg = 'API error during address check.';
                    try { const errData = await resp.json(); errorMsg = errData.error || errorMsg; } catch (e) {}
                    throw new Error(errorMsg);
                }
                const data = await resp.json();

                // Handle response
                if (data.inside_zone || data.in_service_area) {
                    setFeedback('✅ Address is in service area.', '#16a34a');
                    setSubmitEnabled(true); // Enable the main form submit button
                } else if (data.invalid_address || data.invalid_zip) {
                    setFeedback('❌ Address appears invalid. Please check.', '#b91c1c');
                } else if (data.outside_zone || (data.hasOwnProperty('in_service_area') && !data.in_service_area)) {
                    setFeedback('❌ Address is outside the service area.', '#b91c1c');
                } else {
                    setFeedback('❌ Could not validate address eligibility.', '#b91c1c');
                }
            } catch (e) {
                console.error("[Service Signup View] Address Check Error:", e);
                if (e.message.includes('Failed to fetch') || e.message.includes('timeout')) {
                setFeedback('⚠️ Connection error. Please check network.', '#b91c1c');
                } else {
                setFeedback(`⚠️ Error verifying address: ${e.message}`, '#b91c1c');
                }
            } finally {
                // Re-enable check button unless successfully validated
                if (!this._addressValidated) { // Use an instance flag if needed
                   if(checkBtn) checkBtn.disabled = false;
                }
            }
        }; // End checkAvailability function

        // Function to clear feedback and reset submit state on input change
        const clearFeedback = () => {
          setFeedback('', '');
          setSubmitEnabled(false); // Disable submit when address changes
          // Maybe disable check button until all fields have values?
          if(checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
        };

        // Attach event listeners if elements exist
        if (checkBtn) checkBtn.addEventListener('click', checkAvailability);
        if (address1Input) address1Input.addEventListener('input', clearFeedback);
        if (cityInput) cityInput.addEventListener('input', clearFeedback);
        if (stateInput) stateInput.addEventListener('input', clearFeedback);
        if (zip5Input) zip5Input.addEventListener('input', clearFeedback);

        // Store listeners for cleanup if needed (using an instance property)
        this._serviceSignupListeners = { checkAvailability, clearFeedback };

        // --- Initialize Stripe Embedded Checkout (from original code) ---
        (async () => {
          try {
            if (typeof Stripe === 'undefined') {
                await loadStripe(stripeKey);
                if (typeof Stripe === 'undefined') throw new Error("Stripe.js failed to load.");
            }
            const stripeInstance = Stripe(stripeKey);

            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                try {
                    const res = await fetch('http://192.168.50.14/api/stripe/create-checkout-session', { // Ensure endpoint is correct
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
                } catch(fetchErr) {
                     console.error('[Service Signup View] Error fetching client secret:', fetchErr);
                     if(errorMsgDiv) errorMsgDiv.textContent = `Payment init error: ${fetchErr.message}`;
                     throw fetchErr;
                }
              }
            });

            const container = componentRootEl.querySelector('#payment-element'); // ** Original used #payment-element ** Check serviceSignup template
            if (container) {
              checkout.mount(container);
              console.log('[Service Signup View] Stripe Embedded Checkout mounted.');
            } else {
              console.error('[Service Signup View] Mount container #payment-element not found.');
              if(errorMsgDiv) errorMsgDiv.textContent = 'Error: Payment form container not found.';
            }
          } catch (error) {
            console.error('[Service Signup View] Stripe initialization error:', error);
            if(errorMsgDiv) errorMsgDiv.textContent = `Payment Error: ${error.message}`;
          }
        })(); // End async IIFE for Stripe init
      }, // End onRender

      // Cleanup listeners on removal
      onRemove() {
         console.log('[Service Signup View] Component removed.');
         // Remove listeners added in onRender if elements still exist
         const checkBtn = this.el.querySelector('#check-availability');
         const address1Input = this.el.querySelector('#address1');
         // ... find other inputs ...
         if (checkBtn && this._serviceSignupListeners?.checkAvailability) {
             checkBtn.removeEventListener('click', this._serviceSignupListeners.checkAvailability);
         }
         if (address1Input && this._serviceSignupListeners?.clearFeedback) {
             address1Input.removeEventListener('input', this._serviceSignupListeners.clearFeedback);
             // ... remove listeners from other inputs ...
         }
         this._serviceSignupListeners = null; // Clear stored listeners
      }
    } // End view
  }); // End addType 'Service Signup'


  // --- Updated Service Validation Component ---
  domc.addType('Service Validation', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'service-validation' ? { type: 'Service Validation' } : null,
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'service-validation', class: 'service-validation-wrapper' },
        // Set initial content placeholder
        content: '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Service',
            name: 'selectedService',
            options: [ { id: '', name: 'Select a Service...' } ],
            changeProp: 1
          },
           // Add other traits if needed (like success URL)
          // {
          //   type: 'text',
          //   label: 'Success Page URL',
          //   name: 'successPage', // Example trait
          //   placeholder: '/payment-confirmation',
          //   changeProp: 1
          // }
        ],
        // Model state
        stripeKey: null,
        services: [],
        selectedService: '', // Holds the ID
        script: function() {
          // This script will NOT be executed by default in the exported HTML
          // It's primarily for logic within the editor's context if needed
          // All essential runtime logic should be IN the serviceValidation template's script
          console.log('Service Validation component script executed in editor context.');
        },
        title: 'Service Validation & Billing' // Component name in the editor UI
      },

      init() {
        this.fetchStripeKey();
        this.fetchServices();
        // Listen for changes to the selected service trait
        this.listenTo(this, 'change:selectedService', this.handleServiceChange);
        // Also listen for changes in fetched data that might require re-rendering content
        // Note: We only re-render content on service change now.
        // this.listenTo(this, 'change:stripeKey change:services', this.handleServiceChange); // Re-evaluate if needed
      },

      // *** UPDATED: Handle service change and update model content ***
      handleServiceChange() {
        const selectedServiceId = this.get('selectedService');
        const services = this.get('services') || [];
        const stripeKey = this.get('stripeKey');
        console.log('[Service Validation Model] Service selection changed:', selectedServiceId);

        let newContent = '';
        if (!selectedServiceId) {
          newContent = '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>';
        } else {
          const selectedServiceData = services.find(s => s.id?.toString() === selectedServiceId);
          if (!selectedServiceData) {
            newContent = '<div class="p-4 text-center text-red-600">Error: Selected service data not found. Please try re-selecting.</div>';
          } else if (!stripeKey) {
            newContent = '<div class="p-4 text-center text-orange-600">Warning: Stripe key not available. Payment processing may fail.</div>';
            // Optionally, still render the form but show a warning
             const serviceDataWithKey = { ...selectedServiceData, stripeKey: stripeKey };
             newContent = serviceValidation(serviceDataWithKey); // Render form anyway
          } else {
            // Generate the full HTML including the script using the template function
            const serviceDataWithKey = { ...selectedServiceData, stripeKey: stripeKey };
            newContent = serviceValidation(serviceDataWithKey);
          }
        }

        // *** IMPORTANT: Set the generated HTML to the 'content' attribute ***
        // This ensures the content saved by GrapesJS includes the script tag.
        this.set('content', newContent);

        // Trigger a view update (optional, as changing 'content' might already do it)
        // this.trigger('rerender'); // Usually not needed if 'content' change triggers view update
      },

      fetchStripeKey() {
        // Avoid redundant fetch
        if (this.get('stripeKey')) return;
        // Use the correct endpoint from your setup
        fetch('http://192.168.50.14/settings/stripe-api-key')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            if (data && data.stripe_api_key) {
              this.set('stripeKey', data.stripe_api_key);
              console.log('[Service Validation Model] Stripe key fetched.');
              // If a service was already selected, regenerate content with the key
              if (this.get('selectedService')) {
                  this.handleServiceChange();
              }
            } else {
              console.warn('[Service Validation Model] Stripe key not found in response.');
              this.set('stripeKey', null);
               if (this.get('selectedService')) {
                  this.handleServiceChange(); // Regenerate content (will show warning)
              }
            }
          }).catch(err => {
            console.error('[Service Validation Model] Error fetching Stripe key:', err);
            this.set('stripeKey', null);
             if (this.get('selectedService')) {
                  this.handleServiceChange(); // Regenerate content (will show warning)
              }
          });
      },

      fetchServices() {
         // Avoid redundant fetch
        if (this.get('services')?.length > 0) return;
        console.log('[Service Validation Model] Fetching services...');
         // Use the correct endpoint from your setup
        fetch('http://192.168.50.14/api/product/all')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text().then(text => text ? JSON.parse(text) : []);
          })
          .then(data => {
            const services = (data || []).map(service => ({
              id: service.id || `service_${Date.now()}_${Math.random()}`,
              title: service.name || 'Untitled Service',
              price: service.price || 0,
              description: service.description || '',
              currency: service.currency || 'usd',
              images: service.images || []
              // Add any other fields needed by serviceValidation template
            }));
            this.set('services', services);
            console.log('[Service Validation Model] Services fetched:', services.length);
            this.updateServiceTraitOptions();
             // If a service was previously selected but data wasn't ready, update content now
            if (this.get('selectedService') && !this.get('content').includes('service-validation-container')) {
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
          const options = services.map(service => ({
            id: service.id.toString(),
            name: `${service.title} (${formatPrice(service.price, service.currency)})`,
            value: service.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Service...', value: '' });
          trait.set('options', options);
          console.log('[Service Validation Model] Service trait options updated.');
        } else {
           console.warn('[Service Validation Model] Could not find selectedService trait to update.');
        }
      },

       // *** UPDATED: Ensure 'content' is saved ***
       toJSON(opts = {}) {
         // Start with the default serialization
         const obj = domc.getType('default').model.prototype.toJSON.call(this, opts);

         // Ensure essential properties are included
         obj.selectedService = this.get('selectedService');
         // We don't typically save services/stripeKey in the final output,
         // but ensure the 'content' reflects the latest state.
         // The 'content' attribute is usually handled by the default toJSON,
         // as we are setting it directly in handleServiceChange.
         // If 'content' is missing or incorrect, explicitly set it here:
         // obj.content = this.get('content');

         console.log('[Service Validation Model] toJSON called, content length:', obj.content?.length);
         return obj;
       },
    },
    view: {
      init() {
        // Listen only to 'change:content' or specific model props that affect the view directly
        // 'rerender' might be redundant if 'change:content' is handled
        this.listenTo(this.model, 'change:content', this.render);
      },

      // *** UPDATED: Render directly from model's 'content' ***
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;

        // Set the innerHTML directly from the model's content attribute
        // This content should already include the <script> tag generated by serviceValidation
        componentRootEl.innerHTML = model.get('content');

        // No need to call serviceValidation() here anymore
        // No need to manually run scripts here - they should run when the component is rendered in the editor's iframe
        console.log('[Service Validation View] Rendered content from model.');
      },

      onRemove() {
        console.log('[Service Validation View] Component removed.');
        // Add cleanup if necessary
      }
    }
  }); // End addType 'Service Validation'

  // Register pricing-table component
  // Call the pricingTable component registration function
  pricingTable(editor);
}; // End of main components registration function

// Expose serviceValidation globally for use by other components (like pricing table)
window.initServiceValidation = serviceValidation;


export { formatPrice }; // Export helper if needed elsewhere
export default components; // Export the main registration function
