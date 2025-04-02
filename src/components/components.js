import components from ".";
import webinarCheckout1 from "./webinar-checkout-1";

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType('Checkout 2 Step', {
    isComponent: el => {
      if (el.tagName === 'text' && el.getAttribute('data-gjs-type') === 'webinar-checkout-2') {
        return { type: 'webinar-checkout-2' };
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'webinar-checkout-2' },
        content: 'Select this component and click the gear icon to select a product.',
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct',
            options: [],
            changeProp: 1
          }
        ],
        title: 'Webinar Checkout 1'
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.updateContent);
        this.fetchStripeKey();
        this.fetchProducts();
      },
      fetchStripeKey() {
        // get the access token from local storage
        const token = localStorage.getItem("access_token");

        fetch('/api/stripe/key',
          {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token,
            },
          }
        )
          .then(response => response.json())
          .then(data => {
            this.set('stripeKey', data.public_key);
          });
      },
      fetchProducts() {

        // log the stripe key
        console.log(this.get('stripeKey'));


        fetch('/api/products')
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch products');
            return response.json();
          })
          .then(data => {
            if (!Array.isArray(data)) {
              console.error('Invalid products data format:', data);
              throw new Error('Invalid products data format');
            }

            const products = data.map(product => ({
              id: product.id || 0,
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              images: product.images || []
            }));
            
            console.log('Fetched products:', products);
            this.set('products', products);
            this.updateTraits();
          }).catch(error => {
            console.error('Product fetch error:', error);
          });
      },
      updateTraits() {
        const products = this.get('products');
        const trait = this.getTrait('selectedProduct');
        trait.set('options', products.map(product => ({
          id: product.id,
          name: product.title,
          value: product.id
        })));
      },
      async updateContent() {
        const stripeKey = this.get('stripeKey');


        const selectedProductId = this.get('selectedProduct');
        const products = this.get('products') || [];
        if (!products.length) {
          return this.components('<div class="text-red-600">No products available</div>');
        }

        const selectedProduct = products.find(product => product.id.toString() === selectedProductId);
        if (!selectedProduct) {
          return this.components('<div class="text-red-600">Selected product not found</div>');
        }
 
          // Call the checkout component function (which now stores data globally)
         const content = await webinarCheckout1(selectedProduct, stripeKey);

         // Set the HTML content for the GrapesJS component
         this.components(content);

         // --- Mount Stripe Element and add listeners after DOM update ---
         // Use setTimeout to ensure GrapesJS has updated the DOM
         setTimeout(() => {
           const componentRootEl = this.getEl(); // Get the root DOM element of this GrapesJS component
           if (!componentRootEl) {
             console.error('[Components] Could not find component root element.');
             return;
           }

           const uniqueKey = `stripeCheckout_${selectedProduct.id || 'fallback'}`; // Use a fallback if ID is missing initially
           const stripeData = window[uniqueKey];

           if (!stripeData) {
             console.error(`[Components] Stripe data not found on window for key: ${uniqueKey}`);
             return;
           }

           console.log(`[Components] Retrieved data for key ${uniqueKey}:`, stripeData);
           const {
             stripeInstance,
             paymentElementInstance,
             elementsInstance, // Retrieve elements instance
             productPrice,
             productId
           } = stripeData;

           const paymentElementContainer = componentRootEl.querySelector('#payment-element');
           if (paymentElementContainer) {
             console.log('[Components] Found #payment-element container. Mounting Stripe Element...');
             paymentElementInstance.mount(paymentElementContainer);
             console.log('[Components] Stripe Element mount attempted.');
           } else {
             console.error("[Components] Error: #payment-element container not found within component!");
           }

    const form = componentRootEl.querySelector('#payment-form');
           const submitButton = componentRootEl.querySelector('#submit-button');
           const errorMessage = componentRootEl.querySelector('#error-message');

           if (form && submitButton && errorMessage) {
             console.log('[Components] Found form elements. Adding submit listener.');
             form.addEventListener('submit', async (e) => {
               e.preventDefault();
               submitButton.disabled = true;
               errorMessage.textContent = '';

               if (productPrice <= 0) {
                 console.log("Processing free order...");
                 errorMessage.textContent = 'Processing your free order...';
                 window.location.href = window.location.origin + '/order-confirmation?product_id=' + productId + '&free=true';
               } else {
                 // Fetch client secret ONLY on submit for paid products
                 try {
                   console.log('[Components] Submitting paid order. Fetching client secret...');
                   const res = await fetch('/api/create-payment-intent', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ productId: productId, amount: productPrice }) // Use stored productId and price
                   });
                   const { clientSecret, error: backendError } = await res.json();

                   if (backendError || !clientSecret) {
                     throw new Error(backendError || 'Failed to create Payment Intent on submit.');
                   }
                   console.log('[Components] Client secret fetched successfully. Confirming payment...');

                   const { error } = await stripeInstance.confirmPayment({
                     elements: elementsInstance, // Use the stored elements instance
                     clientSecret: clientSecret, // Use the fetched client secret
                     confirmParams: {
                       return_url: window.location.origin + '/order-confirmation?product_id=' + productId,
                       receipt_email: componentRootEl.querySelector('#email-address').value, // Query within component
                     },
                   });
                   if (error) throw error;
                   errorMessage.textContent = 'Processing payment...';
                 } catch (error) {
                   console.error("[Components] Payment processing error:", error);
                   errorMessage.textContent = error.message || 'An unexpected error occurred during payment.';
                   submitButton.disabled = false;
                 }
               }
             });
           } else {
             console.error("[Components] Error: Form, submit button, or error message element not found for listener setup!");
           }

           // Clean up global variable
           delete window[uniqueKey];
           console.log(`[Components] Cleaned up global key: ${uniqueKey}`);

         }, 100); // Small delay to allow DOM rendering
      }
    }
  });
};