import { formatPrice } from './components'; // Assuming formatPrice is available
import initServiceValidation from './service-validation';

// Stringify the validation function for injection into the script
const validationFnString = initServiceValidation.toString();

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  // Define the nested pricing card component type
  domc.addType('pricing-card', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-card',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'pricing-card', class: 'pricing-table-card bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col' },
        // Define the basic structure with IDs, content will be populated by updateComponents
        components: [
          {
            tagName: 'h3',
            attributes: { id: 'card-title', class: 'text-xl font-bold text-gray-900 dark:text-white mb-4' },
          },
          {
            tagName: 'div', // Container for description/features
            attributes: { id: 'card-description-features', class: 'description-features-container flex-grow' },
          },
          {
            tagName: 'div', // Container for price and button
            attributes: { id: 'card-price-button', class: 'mt-auto' },
          }
        ],
        droppable: false, // Inner components are droppable within the card
        stylable: true, // Allow all Tailwind classes
        traits: [
          // Traits for editing card content
          {
            type: 'text',
            label: 'Title',
            name: 'cardTitle',
            changeProp: 1
          },
          {
            type: 'textarea',
            label: 'Description',
            name: 'cardDescription',
            changeProp: 1
          },
          {
            type: 'textarea',
            label: 'Features (one per line)',
            name: 'cardFeatures',
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Price',
            name: 'cardPrice',
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Button Text',
            name: 'buttonText',
            changeProp: 1
          },
          // Trait to store the associated service ID
          {
            type: 'hidden',
            name: 'serviceId',
            changeProp: 1
          }
        ],
        // Custom properties to store data
        cardTitle: 'Product Title',
        cardDescription: 'Product Description',
        cardFeatures: 'Feature 1\nFeature 2\nFeature 3',
        cardPrice: '$0.00',
        buttonText: 'Select Plan',
        serviceId: ''
      },

      init() {
        // Update components when traits change
        this.listenTo(this, 'change:cardTitle change:cardDescription change:cardFeatures change:cardPrice change:buttonText', this.updateComponents);
        // Defer updateComponents call slightly to ensure initial data is set
        // Use a small timeout or wait for a relevant event if available
        setTimeout(() => this.updateComponents(), 0); // Defer to the next tick
      },

      updateComponents() {
        const title = this.get('cardTitle');
        const description = this.get('cardDescription');
        const features = this.get('cardFeatures')?.split('\n').map(f => f.trim()).filter(f => f) || [];
        const price = this.get('cardPrice');
        const buttonText = this.get('buttonText');

        console.log('[Pricing Card] updateComponents called');
        console.log('[Pricing Card] Data:', { title, description, features, price, buttonText });

        // Update the inner components based on trait values
        // Find the main inner containers by ID
        // Get components by their defined position in the defaults array (more reliable than filtering)
        const titleComp = this.components().at(0);
        const descFeatContainer = this.components().at(1);
        const priceButtonContainer = this.components().at(2);

        console.log('[Pricing Card] Containers found:', { titleComp: !!titleComp, descFeatContainer: !!descFeatContainer, priceButtonContainer: !!priceButtonContainer });


        // Ensure components exist and have required properties
        if (titleComp && titleComp.get) {
          titleComp.set('content', title);
        }

        if (descFeatContainer && descFeatContainer.get && descFeatContainer.empty && descFeatContainer.append) {
          // Clear existing content in the description/features container
          descFeatContainer.empty();

          if (features.length > 0) {
            // Add features list
            descFeatContainer.append({
              tagName: 'ul',
              attributes: { class: 'text-gray-600 dark:text-gray-300 mb-4 flex-grow list-disc list-inside' },
              components: features.map(feature => ({ tagName: 'li', content: feature }))
            });
          } else {
            // Add description paragraph
            descFeatContainer.append({
              tagName: 'p',
              attributes: { class: 'text-gray-600 dark:text-gray-300 mb-4 flex-grow' },
              content: description
            });
          }
        }

        if (priceButtonContainer && priceButtonContainer.get && priceButtonContainer.empty && priceButtonContainer.append) {
          // Clear existing content in the price/button container
          priceButtonContainer.empty();

          // Add price paragraph and button
          priceButtonContainer.append([
            {
              tagName: 'p',
              attributes: { class: 'text-2xl font-semibold text-gray-900 dark:text-white mb-4' },
              content: price // Use the 'price' variable
            },
            {
              tagName: 'button',
              attributes: { class: 'pricing-table-button gjs-pricing-buy-button w-full rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 text-white font-medium transition-colors duration-300' },
              content: buttonText
            }
          ]);

          // Update data-service attribute on the newly added button
          const buttonComp = priceButtonContainer.components().filter(comp => comp.get('tagName') === 'button')[0];
          if (buttonComp) {
            const serviceId = this.get('serviceId');
            const serviceData = { // Construct a basic service data object from model properties
              id: serviceId,
              title: this.get('cardTitle'),
              description: this.get('cardDescription'),
              price: parseFloat(this.get('cardPrice')?.replace(/[^0-9.-]+/g, "")) || 0, // Attempt to parse price
              // Add other relevant properties if stored on the model
            };
            buttonComp.addAttributes({ 'data-service': JSON.stringify(serviceData) });
          }
        }
      },
    },
    view: {
      // The view logic for the pricing card component itself
      // GrapesJS handles rendering based on the model's 'components' and 'content'
    }
  });


  domc.addType('pricing-table', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-table',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'pricing-table', class: 'pricing-table-container' },
        // Initial content is just a placeholder, actual content is built with nested components
        content: '<div class="text-center text-gray-500 p-4">Loading pricing table...</div>',
        droppable: false, // The grid container inside will be droppable
        stylable: true, // Allow all Tailwind classes on the main container
        traits: [
          // Grid layout traits
          {
            type: 'select',
            label: 'Grid Columns',
            name: 'gridCols',
            options: [
              { id: 'grid-cols-1', name: '1 Column', value: 'grid-cols-1' },
              { id: 'grid-cols-2', name: '2 Columns', value: 'grid-cols-2' },
              { id: 'grid-cols-3', name: '3 Columns', value: 'grid-cols-3' },
              { id: 'grid-cols-4', name: '4 Columns', value: 'grid-cols-4' }
            ],
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Grid Gap',
            name: 'gridGap',
            options: [
              { id: 'gap-2', name: 'Small', value: 'gap-2' },
              { id: 'gap-4', name: 'Medium', value: 'gap-4' },
              { id: 'gap-6', name: 'Large', value: 'gap-6' },
              { id: 'gap-8', name: 'Extra Large', value: 'gap-8' }
            ],
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Product 1',
            name: 'product1',
            options: [], // Will be populated dynamically
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Features for Product 1',
            name: 'features1',
            placeholder: 'Feature 1, Feature 2, Feature 3',
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Product 2',
            name: 'product2',
            options: [], // Will be populated dynamically
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Features for Product 2',
            name: 'features2',
            placeholder: 'Feature 1, Feature 2, Feature 3',
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Product 3',
            name: 'product3',
            options: [], // Will be populated dynamically
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Features for Product 3',
            name: 'features3',
            placeholder: 'Feature 1, Feature 2, Feature 3',
            changeProp: 1
          }
        ],
        services: [], // To store fetched services
        product1: '', // To store ID of first selected product
        product2: '', // To store ID of second selected product
        product3: '', // To store ID of third selected product
        features1: '', // Features for product 1
        features2: '', // Features for product 2
        features3: '', // Features for product 3
        title: 'Pricing Table',
        // The script property will now hold the client-side script string.
        // This script will be included by GrapesJS in the exported HTML.
        script: `
          (function() {
            const container = document.querySelector('.pricing-table-container');
            if (!container) return console.error('Pricing table container not found');

            function showServiceModal(serviceData) {
              // Create modal container
              const modal = document.createElement('div');
              modal.style.cssText = \`
                position:fixed; top:0; left:0; width:100%; height:100%;
                background:rgba(0,0,0,0.5); display:flex; justify-content:center;
                align-items:center; z-index:1000;
              \`;

              // Basic validation - check for required fields
              if (!serviceData?.id || typeof serviceData.price !== 'number' || !serviceData.title) {
                modal.innerHTML = '<div style="background:white;padding:2rem;color:red">Invalid service data - missing required fields</div>';
                document.body.appendChild(modal);
                return;
              }

              // Simple price formatting function
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
              const formattedPrice = formatPrice(serviceData.price, serviceData.currency || 'usd');
              const buttonText = serviceData.price > 0 ? \`Pay \${formattedPrice} & Schedule\` : 'Complete Setup';
              const imageUrl = serviceData.imageUrl || 'https://spotlessbinco.com/assets/bin-icon.png';

              modal.innerHTML = \`
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
                <div class="service-validation-container p-4 md:p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg" style="font-family: 'Poppins', sans-serif;">
                  <button onclick="this.closest('div[style^=\"position:fixed\"]').remove()"
                    style="position:absolute;top:20px;right:20px;background:none;border:none;font-size:24px;cursor:pointer">
                    ×
                  </button>

                  <div class="mb-6 pb-4 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-gray-800 mb-3">Order Summary</h2>
                    <div class="flex items-start space-x-4">
                      <img src="\${imageUrl}" alt="Service icon" class="h-16 w-16 flex-none rounded-md object-cover border border-gray-200" onerror="this.style.display='none'">
                      <div class="flex-auto space-y-1">
                        <h3 class="text-gray-900 font-semibold">\${serviceData.title}</h3>
                        <p class="text-sm text-gray-600">\${serviceData.description || 'Service details not available.'}</p>
                      </div>
                      <p class="flex-none text-lg font-medium text-gray-900">\${formattedPrice}</p>
                    </div>
                    <dl class="mt-4 space-y-1 text-sm font-medium text-gray-600">
                      <div class="flex items-center justify-between pt-2 text-gray-900">
                        <dt class="text-base font-semibold">Total</dt>
                        <dd class="text-base font-semibold">\${formattedPrice}</dd>
                      </div>
                    </dl>
                  </div>

                  <div id="address-validation-section">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">1. Check Service Availability</h3>
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label for="address1" class="block text-sm font-medium text-gray-700">Street Address</label>
                        <input type="text" id="address1" name="address1" required autocomplete="address-line1"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                          <input type="text" id="city" name="city" required autocomplete="address-level2"
                                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                          <label for="state" class="block text-sm font-medium text-gray-700">State</label>
                          <input type="text" id="state" name="state" required autocomplete="address-level1"
                                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                          <label for="zip5" class="block text-sm font-medium text-gray-700">ZIP Code</label>
                          <input type="text" id="zip5" name="zip5" required autocomplete="postal-code"
                                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                      </div>
                    </div>

                    <button type="button" id="check-availability"
                            class="mt-6 px-5 py-3 rounded-md bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto">
                      Check Availability
                    </button>
                    <div id="address-feedback" class="mt-3 text-sm font-medium"></div>
                  </div>
                </div>
              \`;

              // Add JavaScript logic from service-validation.js
              const address1Input = modal.querySelector('#address1');
              const cityInput = modal.querySelector('#city');
              const stateInput = modal.querySelector('#state');
              const zip5Input = modal.querySelector('#zip5');
              const checkBtn = modal.querySelector('#check-availability');
              const addressFeedbackDiv = modal.querySelector('#address-feedback');

              function setAddressFeedback(msg, type = 'info') {
                if (!addressFeedbackDiv) return;
                addressFeedbackDiv.textContent = msg;
                addressFeedbackDiv.className = 'mt-3 text-sm font-medium';
                switch (type) {
                  case 'success': addressFeedbackDiv.classList.add('text-green-600'); break;
                  case 'error': addressFeedbackDiv.classList.add('text-red-600'); break;
                  case 'loading': addressFeedbackDiv.classList.add('text-blue-600'); break;
                  default: addressFeedbackDiv.classList.add('text-gray-600');
                }
              }

              let stripe;
              let elements;
              let paymentElement;

              
              const fetchStripeKey = async () => {
                    if (serviceData && serviceData.stripeKey) {
                        return serviceData.stripeKey;
                    }
                    try {
                        const response = await fetch('/settings/stripe-api-key');
                        if (!response.ok) throw new Error('Failed to fetch Stripe key');
                        const data = await response.json();
                        return data?.stripe_api_key || null;
                    }
                    catch (err) {
                        console.error('Error fetching Stripe key:', err);
                        return null;
                    }
                };


              async function initializeStripe() {
                try {
                  // Load Stripe.js if not already loaded
                  if (typeof Stripe === 'undefined') {
                    await new Promise((resolve) => {
                      const script = document.createElement('script');
                      script.src = 'https://js.stripe.com/v3/';
                      script.onload = resolve;
                      document.head.appendChild(script);
                    });
                  }

                  // Get Stripe publishable key
                  const publishableKey = await fetchStripeKey();
                  
                  stripe = Stripe(publishableKey);
                  elements = stripe.elements({
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        colorBackground: '#ffffff',
                        colorText: '#30313d',
                        fontFamily: 'Poppins, system-ui, sans-serif'
                      }
                    }
                  });

                  return true;
                } catch (err) {
                  console.error('Stripe initialization failed:', err);
                  setAddressFeedback('Payment processing unavailable', 'error');
                  return false;
                }
              }

              async function handleCheckAvailability() {
                const address = {
                  address1: address1Input.value.trim(),
                  city: cityInput.value.trim(),
                  state: stateInput.value.trim(),
                  zip5: zip5Input.value.trim()
                };

                setAddressFeedback('Checking availability...', 'loading');
                checkBtn.disabled = true;

                try {
                  const resp = await fetch('/api/geocode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                  });

                  if (!resp.ok) throw new Error('Address validation failed');
                  
                  const data = await resp.json();
                  if (data.inside_zone) {
                    setAddressFeedback('Service available at this address!', 'success');
                    
                    // Add payment form
                    const paymentForm = document.createElement('form');
                    paymentForm.id = 'payment-form';
                    paymentForm.className = 'mt-8 pt-6 border-t border-gray-200';
                    paymentForm.innerHTML =
                      '<h3 class="text-lg font-medium text-gray-900">2. Billing Information</h3>' +
                      '<div class="mt-4">' +
                        '<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>' +
                        '<input type="email" id="email" name="email" required ' +
                               'class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">' +
                      '</div>' +
                      '<div class="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50" id="payment-element-container">' +
                        '<div id="payment-element"></div>' +
                        '<div id="payment-message" class="hidden mt-2 text-sm text-red-600"></div>' +
                      '</div>' +
                      '<button type="submit" id="submit-button" ' +
                              'class="mt-6 w-full rounded-md bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700">' +
                        buttonText +
                      '</button>';
                    
                    modal.querySelector('.service-validation-container').appendChild(paymentForm);
                    
                    // Initialize Stripe
                    // Hide step 1 and show step 2
                    const addressSection = modal.querySelector('#address-validation-section');
                    if (addressSection) {
                      addressSection.classList.add('opacity-50', 'pointer-events-none');
                    }

                    if (await initializeStripe()) {
                      paymentElement = elements.create('payment');
                      paymentElement.mount('#payment-element');
                      
                      // Handle form submission
                      paymentForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const submitBtn = paymentForm.querySelector('#submit-button');
                        submitBtn.disabled = true;
                        
                        const { error } = await stripe.confirmPayment({
                          elements,
                          confirmParams: {
                            return_url: window.location.origin + '/thank-you',
                            receipt_email: paymentForm.querySelector('#email').value,
                            payment_method_data: {
                              billing_details: {
                                email: paymentForm.querySelector('#email').value
                              }
                            }
                          }
                        });
                        
                        if (error) {
                          paymentForm.querySelector('#payment-message').textContent = error.message;
                          paymentForm.querySelector('#payment-message').classList.remove('hidden');
                          submitBtn.disabled = false;
                        }
                      });
                    }
                    
                  } else if (data.error) {
                    setAddressFeedback(data.error.message || 'Error validating address', 'error');
                  } else {
                    setAddressFeedback('Service not available at this address', 'error');
                  }
                } catch (err) {
                  setAddressFeedback('Error checking availability', 'error');
                  console.error('Availability check error:', err);
                } finally {
                  checkBtn.disabled = false;
                }
              }

              checkBtn.addEventListener('click', handleCheckAvailability);

              document.body.appendChild(modal);
            }

            // Attach click handlers
            container.querySelectorAll('.gjs-pricing-buy-button').forEach(button => {
              button.addEventListener('click', (e) => {
                try {
                  const serviceData = JSON.parse(e.target.getAttribute('data-service'));
                  showServiceModal(serviceData);
                } catch (err) {
                  console.error('Error showing service modal:', err);
                  alert('Error processing selection. Please try again.');
                }
              });
            });
          })();
        `,
      },

      init() {
        this.fetchServices();
        // Listen for changes to services, selectedProducts, featuresList, and fetchError to re-render content
        this.listenTo(this, 'change:services change:product1 change:product2 change:product3 change:features1 change:features2 change:features3 change:fetchError change:gridCols change:gridGap', this.renderContent);
      },

      fetchServices() {
        if (this.get('services')?.length > 0) return; // Avoid redundant fetches

        fetch('/api/product/all') // Use the existing endpoint
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            const services = (data || []).map(service => ({
              id: service.id,
              title: service.name || 'Untitled Service',
              price: Number(service.price) || 0,
              currency: service.currency || 'usd',
              description: service.description || '',
              priceId: service.priceId || null, // Assuming priceId is returned by the backend
              // Add any other fields needed for display or validation
            }));
            this.set('services', services);
            console.log('[Pricing Table Model] Services fetched:', services);
            console.log('[Pricing Table Model] First service:', services[0]);
            this.updateProductTraitOptions(); // Update the select trait options
            this.renderContent(); // Re-render content after fetching services
          })
          .catch(error => {
            console.error('[Pricing Table Model] Error fetching services:', error);
            this.set('services', []); // Set to empty array on error
            this.set('fetchError', true); // Indicate fetch error
            this.renderContent(); // Render error message
          });
      },

      // Method to update the options for all product selector traits
      updateProductTraitOptions() {
        const services = this.get('services') || [];
        const options = services.map(service => ({
          id: service.id.toString(),
          name: service.title, // Display service title in the dropdown
          value: service.id.toString()
        }));
        options.unshift({ id: '', name: 'Select a product...', value: '' }); // Add empty option

        // Update each product selector trait
        ['product1', 'product2', 'product3'].forEach(traitName => {
          const trait = this.getTrait(traitName);
          if (trait) {
            const currentValue = this.get(traitName);
            // Keep current selection if it still exists in options
            if (currentValue && !options.some(opt => opt.value === currentValue)) {
              this.set(traitName, '');
            }
            trait.set('options', options);
          } else {
            console.warn(`[Pricing Table Model] Could not find ${traitName} trait.`);
          }
        });
        console.log('[Pricing Table Model] Product traits updated.');
        console.log('[Pricing Table Model] Current product selections:', {
          product1: this.get('product1'),
          product2: this.get('product2'),
          product3: this.get('product3')
        });
      },

      // Method to render content based on state using nested components
      renderContent() {
        const services = this.get('services') || [];
        const fetchError = this.get('fetchError');

        // Clear existing components except the main container if it exists
        const existingContainer = this.components().filter(comp => comp.get('attributes')['data-gjs-type'] === 'pricing-table-container')[0];
        if (existingContainer) {
          existingContainer.empty(); // Clear inner components
        } else {
          this.empty(); // Clear all components if container doesn't exist (shouldn't happen with this structure)
        }


        if (fetchError) {
          this.append('<div class="text-center text-red-600 p-4">Error loading pricing data.</div>');
        } else {
          // Filter services based on selectedProducts trait
          const selectedProductIds = [
            this.get('product1'),
            this.get('product2'),
            this.get('product3')
          ].filter(id => id); // Filter out empty values
          const displayedServices = services.filter(service => selectedProductIds.includes(service.id?.toString()));

          if (displayedServices.length === 0 && selectedProductIds.length > 0) {
            this.append('<div class="text-center text-orange-600 p-4">Selected services not found. Please re-select.</div>');
          } else if (displayedServices.length === 0 && selectedProductIds.length === 0 && services.length > 0) {
            this.append('<div class="text-center text-gray-500 p-4">Please select services from the settings panel.</div>');
          }
          else if (displayedServices.length === 0 && selectedProductIds.length === 0 && services.length === 0) {
            this.append('<div class="text-center text-gray-500 p-4">No services available.</div>');
          }
          else {
            // Create or get the grid container
            let gridContainer = this.components().filter(comp => comp.get('attributes').class?.includes('pricing-table-grid'))[0];
            if (!gridContainer) {
              const gridCols = this.get('gridCols') || 'grid-cols-3';
              const gridGap = this.get('gridGap') || 'gap-6';
              gridContainer = this.components().add({
                tagName: 'div',
                attributes: { class: `pricing-table-grid grid ${gridCols} ${gridGap} p-4` },
                droppable: '.pricing-table-card', // Only allow pricing-card components inside
                components: [] // Start with empty components
              }, { at: 0 }); // Add as the first component
            } else {
              // Update grid classes if container already exists
              const gridCols = this.get('gridCols') || 'grid-cols-3';
              const gridGap = this.get('gridGap') || 'gap-6';
              const currentClasses = gridContainer.get('attributes').class.split(' ');
              const newClasses = currentClasses.filter(cls => !cls.startsWith('grid-cols-') && !cls.startsWith('gap-'));
              newClasses.push(gridCols);
              newClasses.push(gridGap);
              gridContainer.set('attributes', { ...gridContainer.get('attributes'), class: newClasses.join(' ') });
              gridContainer.empty(); // Clear existing cards to re-add based on selection
            }


            // Get features for each product
            const productFeatures = {
              product1: this.get('features1')?.split(',').map(f => f.trim()).filter(f => f) || [],
              product2: this.get('features2')?.split(',').map(f => f.trim()).filter(f => f) || [],
              product3: this.get('features3')?.split(',').map(f => f.trim()).filter(f => f) || []
            };

            // Add pricing-card components for each selected service
            console.log('[Pricing Table Model] Displaying services:', displayedServices);
            displayedServices.forEach((service, index) => {
              const productId = ['product1', 'product2', 'product3'][index];
              const features = productFeatures[productId];

              // Add a pricing-card component
              gridContainer.append({
                type: 'pricing-card', // Use the nested component type
                // Pass data to the pricing-card model
                cardTitle: service.title,
                cardDescription: service.description,
                cardFeatures: features.join('\n'), // Pass features as newline-separated string
                cardPrice: formatPrice(service.price, service.currency),
                buttonText: 'Select Plan', // Or customize if needed
                serviceId: service.id?.toString(), // Pass service ID
                // The inner components of the pricing card are now defined in the pricing-card type defaults
                // We don't need to define them here unless we want to override the defaults.
                // The pricing-card's updateComponents method will handle setting the content based on traits.
                // We need to ensure the data-service attribute is set on the button within the pricing-card.
                // This should be handled by the pricing-card's updateComponents or toHTML method.
                // Let's add a toHTML method to the pricing-card to set the data-service attribute.
              });
            });

            // The content attribute is no longer used to hold the full HTML structure.
            // The structure is defined by the nested components.
            // We can remove the line setting the content attribute.
            // this.set('content', pricingHtml); // Remove this line
          }
        }
      }
    },

    view: {
      onRender() {
        // The script is now included via the model's 'script' property
        // and the component's inner structure is defined by nested components.
        // No need to manually render content or execute script here.
        console.log('[Pricing Table View] Rendered with nested components.');
      }
    }
  });


};