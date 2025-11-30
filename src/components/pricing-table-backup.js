import { formatPrice as globalFormatPrice } from './components'; // Assuming formatPrice is available globally or bundled
import initServiceValidation from './service-validation';
import { showServiceModal } from './service-modal'; // Import the modal function
import addPricingCardType from './pricing-card'; // Import the pricing-card component definition


export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  // Add the pricing-card component type
  addPricingCardType(editor, opts);

  // --- pricing-table component definition ---
  domc.addType('pricing-table', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-table',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'pricing-table', class: 'pricing-table-wrapper p-4' },
        components: [
          { tagName: 'div', attributes: { 'data-gjs-type': 'pricing-table-grid-container', class: 'pricing-table-grid flex flex-wrap justify-center gap-6' }, components: [], droppable: '[data-gjs-type=pricing-card]' },
        ],
        droppable: false,
        stylable: true,
        traits: [
          { type: 'select', label: 'Grid Gap', name: 'gridGap', options: [{ id: 'gap-2', name: 'Small', value: 'gap-2' }, { id: 'gap-4', name: 'Medium', value: 'gap-4' }, { id: 'gap-6', name: 'Large', value: 'gap-6' }, { id: 'gap-8', name: 'Extra Large', value: 'gap-8' }], changeProp: 1, default: 'gap-6' },
          { type: 'select', label: 'Product 1', name: 'product1', options: [], changeProp: 1 },
          { type: 'textarea', label: 'Features for Product 1', name: 'features1', placeholder: 'Feature 1\nFeature 2\nFeature 3', changeProp: 1 },
          { type: 'select', label: 'Product 2', name: 'product2', options: [], changeProp: 1 },
          { type: 'textarea', label: 'Features for Product 2', name: 'features2', placeholder: 'Feature 1\nFeature 2\nFeature 3', changeProp: 1 },
          { type: 'select', label: 'Product 3', name: 'product3', options: [], changeProp: 1 },
          { type: 'textarea', label: 'Features for Product 3', name: 'features3', placeholder: 'Feature 1\nFeature 2\nFeature 3', changeProp: 1 },
          { type: 'select', label: 'Alternative Product', name: 'product4', options: [], changeProp: 1 },
          { type: 'text', label: 'Alternative Message', name: 'smallOptionMessage', placeholder: 'Need a different option?', changeProp: 1 }
        ],
        services: [],
        product1: '', product2: '', product3: '', product4: '',
        features1: '', features2: '', features3: '',
        smallOptionMessage: 'Need a different option?',
        gridGap: 'gap-6',
        fetchError: false,
        // *** UPDATED SCRIPT PROPERTY with user-provided code ***
        script: `
                (function() {
                  // Use a more specific selector if possible, or ensure only one element matches.
                  // 'this' inside the script function refers to the component's root DOM element.
                  const container = this; // Use 'this' directly as the container for event delegation
                  let currentModal = null; // Track the currently open modal
      
                  if (!container) {
                    console.error('Pricing table container (component root) not found. Script cannot run.');
                    return;
                  }
                  console.log('Pricing table script initialized for container:', container);
      
      
                  function showServiceModal(serviceData) {
                    // Close any existing modal first
                    if (currentModal) {
                        handleModalClose();
                        setTimeout(() => showServiceModal(serviceData), 350); // Re-open after close animation
                        return;
                    }
      
                    console.log("Showing modal for service:", serviceData);
      
                    // Create modal container
                    const modal = document.createElement('div');
                    currentModal = modal; // Track the new modal
      
                    modal.style.cssText = \`
                      position:fixed; top:0; left:0; width:100%; height:100%;
                      background:rgba(0,0,0,0.6); display:flex; justify-content:center;
                      align-items:flex-start; z-index:1050; /* High z-index */
                      opacity:0; transition: opacity 0.3s ease; overflow-y:auto;
                      padding: 40px 20px; /* Padding for scroll */
                    \`;
      
                    // Basic validation - check for required fields
                    if (!serviceData?.id || typeof serviceData.price !== 'number' || !serviceData.name) {
                      console.error('Invalid service data passed to modal:', serviceData);
                      modal.innerHTML = '<div style="background:white; padding:2rem; color:red; border-radius: 8px; max-width: 400px; margin-top: 40px;">Invalid service data  pricing table - missing required fields (ID, Price, Title). <button onclick="this.parentNode.parentNode.remove(); document.body.style.overflow=\\'\\';">Close</button></div>';
                      document.body.appendChild(modal);
                      document.body.style.overflow = 'hidden';
                       // Trigger reflow before adding opacity class
                      modal.offsetHeight;
                      modal.style.opacity = '1';
                      // Add click outside to close for error modal too
                       modal.addEventListener('click', function(e) {
                           if (e.target === modal) {
                               modal.remove();
                               document.body.style.overflow = '';
                               currentModal = null;
                           }
                       });
                      return; // Stop execution
                    }
      
                    // Helper function defined within the main export scope
                    const formatPrice = (amount, currency) => {
                      const numAmount = Number(amount);
                      if (isNaN(numAmount)) {
                        // Return a default or error string if amount is not a valid number
                        return 'N/A';
                      }
                       try {
                          return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency || 'USD', // Default to USD if not provided
                          }).format(numAmount);
                      } catch (e) {
                           console.warn(\`Modal formatPrice error: \${e.message}\`);
                          const currencySymbol = (currency || 'usd').toLowerCase() === 'usd' ? '$' : ((currency || 'USD').toUpperCase() + ' ');
                          return \`\${currencySymbol}\${numAmount.toFixed(2)}\`;
                      }
                    };
                    const formattedPrice = formatPrice(serviceData.price, serviceData.currency || 'usd');
                    const buttonText = serviceData.price > 0 ? \`Pay \${formattedPrice} & Schedule\` : 'Complete Setup';
                    const imageUrl = serviceData.imageUrl || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Icon'; // Placeholder icon
      
                    // --- Modal HTML ---
                    // Ensure Tailwind is loaded on the page.
                    modal.innerHTML = \`
                      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
                       <style>
                            /* Basic scrollbar styling for modal content */
                            .modal-content-area::-webkit-scrollbar { width: 8px; }
                            .modal-content-area::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                            .modal-content-area::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
                            .modal-content-area::-webkit-scrollbar-thumb:hover { background: #555; }
                       </style>
                      <div class="modal-content-area relative p-6 md:p-8 max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700" style="font-family: 'Poppins', sans-serif; margin-top: 20px; max-height: calc(100vh - 80px); overflow-y: auto;" onclick="event.stopPropagation();">
                        <button id="modal-close-button" style="right: 0;" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xl text-gray-600 dark:text-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close">&times;</button>
      
                        <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">Order Summary</h2>
                          <div class="flex items-start gap-4">
                            <img src="\${imageUrl}" alt="Service icon" class="h-16 w-16 flex-none rounded-lg object-cover border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" onerror="this.src='https://placehold.co/64x64/e2e8f0/94a3b8?text=Icon'; this.onerror=null;">
                            <div class="flex-auto space-y-1">
                              <h3 class="text-gray-900 dark:text-gray-100 font-semibold text-lg leading-tight">\${serviceData.name}</h3>
                              <p class="text-sm text-gray-600 dark:text-gray-400">\${serviceData.description || 'Service details not available.'}</p>
                            </div>
                            <p class="flex-none text-lg font-semibold text-gray-900 dark:text-gray-100">\${formattedPrice}</p>
                          </div>
                          <dl id="order-summary-list" class="mt-3 space-y-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            </dl>
                          <div id="next-service-day-display" class="mt-3 text-sm font-medium text-green-600 dark:text-green-400"></div>
                        </div>
      
                        <div id="address-validation-section">
                          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">1.4 Check Service Availability</h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Please enter your address to confirm service availability.</p>
                          <div class="grid grid-cols-1 gap-4">
                            <div>
                              <label for="address1" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                              <input type="text" id="address1" name="address1" required autocomplete="address-line1" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                <input type="text" id="city" name="city" required autocomplete="address-level2" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                              </div>
                              <div>
                                <label for="state" class="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                <input type="text" id="state" name="state" required autocomplete="address-level1" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                              </div>
                              <div>
                                <label for="zip5" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
                                <input type="text" id="zip5" name="zip5" required autocomplete="postal-code" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                              </div>
                            </div>
                             <div>
                                <label for="trash-day" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Trash Day</label>
                                <select id="trash-day" name="trash-day" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                  <option value="">Select a day</option>
                                  <option value="Monday">Monday</option>
                                  <option value="Tuesday">Tuesday</option>
                                  <option value="Wednesday">Wednesday</option>
                                  <option value="Thursday">Thursday</option>
                                  <option value="Friday">Friday</option>
                                  <option value="Saturday">Saturday</option>
                                </select>
                              </div>
                            <div>
                              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                              <input type="email" id="email" name="email" required autocomplete="email" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            </div>
                            <div class="flex items-center">
                                  <input type="checkbox" id="subscribe_to_marketing" name="subscribe_to_marketing" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked>
                                  <label for="subscribe_to_marketing" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Subscribe to marketing emails</label>
                            </div>
                          </div>
                          <button type="button" id="check-availability" class="mt-6 px-5 py-3 rounded-md bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto">Check Availability</button>
                          <div id="address-feedback" class="mt-3 text-sm font-medium"></div>
                        </div>
      
                        <div id="payment-section" class="hidden mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                           <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">2. Billing Information</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                               <div>
                                   <label for="first-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                   <input type="text" id="first-name" name="first-name" required autocomplete="given-name" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                               </div>
                               <div>
                                   <label for="last-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                   <input type="text" id="last-name" name="last-name" required autocomplete="family-name" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                               </div>
                           </div>
                           <form id="payment-form">
                               <div id="payment-element" class="mb-4"></div>                         <button id="submit-button" class="w-full rounded-md bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 disabled:opacity-50">Submit Payment</button>
                               <div id="payment-message" class="hidden mt-2 text-sm text-red-600 dark:text-red-400"></div>
                           </form>
                         </div>
      
                      </div>
                    \`;
      
                    // Append modal to body and fade in
                    document.body.appendChild(modal);
                    document.body.style.overflow = 'hidden'; // Prevent body scrolling
                    // Trigger reflow before adding opacity class
                    modal.offsetHeight;
                    modal.style.opacity = '1';
      
                    // --- Attach Modal Event Listeners ---
                    const closeButton = modal.querySelector('#modal-close-button');
                    if (closeButton) {
                        closeButton.addEventListener('click', handleModalClose);
                    }
                    // Close when clicking background overlay
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            handleModalClose();
                        }
                    });
      
                    // --- Service Validation Logic ---
                    const address1Input = modal.querySelector('#address1');
                    const cityInput = modal.querySelector('#city');
                    const stateInput = modal.querySelector('#state');
                    const zip5Input = modal.querySelector('#zip5');
                    const checkBtn = modal.querySelector('#check-availability');
                    const addressFeedbackDiv = modal.querySelector('#address-feedback');
                    const emailInput = modal.querySelector('#email');
                    const subscribeToMarketing = modal.querySelector('#subscribe_to_marketing');
                    const trashDaySelect = modal.querySelector('#trash-day'); // Added selector for trash day
      
      
                    function setAddressFeedback(msg, type = 'info') {
                      if (!addressFeedbackDiv) return;
                      addressFeedbackDiv.textContent = msg;
                      addressFeedbackDiv.className = 'mt-3 text-sm font-medium'; // Reset classes
                      switch (type) {
                        case 'success': addressFeedbackDiv.classList.add('text-green-600', 'dark:text-green-400'); break;
                        case 'error': addressFeedbackDiv.classList.add('text-red-600', 'dark:text-red-400'); break;
                        case 'loading': addressFeedbackDiv.classList.add('text-blue-600', 'dark:text-blue-400'); break;
                        default: addressFeedbackDiv.classList.add('text-gray-600', 'dark:text-gray-300');
                      }
                    }
      
                    let stripe;
                    let elements;
                    let paymentElement;
                    let clientSecret; // Store client secret
      
                    const fetchStripeKey = async () => {
                        // Prefer key from serviceData if provided (e.g., different keys per service)
                        if (serviceData && serviceData.stripeKey) {
                            return serviceData.stripeKey;
                        }
                        // Otherwise fetch default key
                        try {
                            const response = await fetch('/settings/stripe-api-key'); // Ensure this endpoint exists and returns JSON { stripe_api_key: "pk_..." }
                            if (!response.ok) throw new Error(\`Failed to fetch Stripe key (\${response.status})\`);
                            const data = await response.json();
                            if (!data?.stripe_api_key) throw new Error('Stripe key not found in response');
                            return data.stripe_api_key;
                        } catch (err) {
                            console.error('Error fetching Stripe key:', err);
                            setAddressFeedback(\`Error fetching payment settings: \${err.message}\`, 'error');
                            return null;
                        }
                    };
      
                    // Initialize Stripe.js and Elements
                    async function initializeStripeElements() {
                        try {
                            // Load Stripe.js if not already loaded
                            if (typeof Stripe === 'undefined') {
                                setAddressFeedback('Loading payment library...', 'loading');
                                await new Promise((resolve, reject) => {
                                    const script = document.createElement('script');
                                    script.src = 'https://js.stripe.com/v3/';
                                    script.async = true;
                                    script.onload = resolve;
                                    script.onerror = reject;
                                    document.head.appendChild(script);
                                });
                                 setAddressFeedback('Payment library loaded.', 'info');
                            }
      
                            const publishableKey = await fetchStripeKey();
                            if (!publishableKey) return false; // Error handled in fetchStripeKey
      
                            stripe = Stripe(publishableKey);
      
                            // --- Create Payment Intent / Checkout Session ---
                            // This MUST happen after address validation passes.
                            // Moved the fetch call here.
                            setAddressFeedback('Initializing payment...', 'loading');
                            const sessionResponse = await fetch('/api/stripe/checkout-sessions', { // Ensure this endpoint is correct
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    product_id: String(serviceData.id), // Ensure ID is string
                                    quantity: 1,
                                    // Pass validated address details if needed by backend
                                    address_line1: address1Input.value.trim(),
                                    address_city: cityInput.value.trim(),
                                    address_state: stateInput.value.trim(),
                                    address_zip: zip5Input.value.trim(),
                                    email: emailInput.value.trim(), // Pass email for receipt/customer creation
                                    // Pass first/last name if collected in payment section
                                    first_name: modal.querySelector('#first-name')?.value || '',
                                    last_name: modal.querySelector('#last-name')?.value || '',
                                    trash_day: trashDaySelect.value // Pass trash day if needed
                                })
                            });
      
                            if (!sessionResponse.ok) {
                                let errorMsg = \`Failed to initialize payment (\${sessionResponse.status})\`;
                                try { const errorData = await sessionResponse.json(); errorMsg = errorData.message || errorMsg; }
                                catch (parseError) { console.error('Error parsing payment init error response:', parseError); }
                                throw new Error(errorMsg);
                            }
      
                            const responseData = await sessionResponse.json();
                            console.log('Stripe init response:', responseData);
      
                            // --- Check Response and Get Client Secret ---
                            // Adapt based on whether you use Payment Intents or Checkout Sessions
                            // Example for Payment Intent:
                            clientSecret = responseData.client_secret; // Assuming backend returns { client_secret: "pi_..." }
                            if (!clientSecret) {
                                 throw new Error('Missing client_secret from payment initialization response.');
                            }
      
                             // --- Update Order Summary with Tax/Total from Backend ---
                             const taxAmount = responseData.tax_amount ?? 0; // Adjust key based on your API response
                             const subtotal = responseData.subtotal ?? 0; // Adjust key
                             const amountTotal = responseData.total ?? responseData.amount_total ?? 0; // Adjust key
                             const currency = serviceData.currency || 'USD';
      
                             const formatOrderPrice = (amount) => {
                                 const numAmount = Number(amount) / 100; // Assuming amount is in cents
                                 if (isNaN(numAmount)) return 'N/A';
                                 return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(numAmount);
                             };
      
                             const orderSummaryList = modal.querySelector('#order-summary-list');
                             if (orderSummaryList) {
                                 orderSummaryList.innerHTML = \`
                                   \${subtotal > 0 ? \`
                                     <div class="flex items-center justify-between pt-1">
                                       <dt>Subtotal</dt>
                                       <dd>\${formatOrderPrice(subtotal)}</dd>
                                     </div>\` : ''}
                                   <div class="flex items-center justify-between pt-1">
                                     <dt>Tax</dt>
                                     <dd>\${formatOrderPrice(taxAmount)}</dd>
                                   </div>
                                   <div class="flex items-center justify-between pt-1 font-semibold text-gray-900 dark:text-gray-100">
                                     <dt>Total</dt>
                                     <dd>\${formatOrderPrice(amountTotal)}</dd>
                                   </div>
                                 \`;
                             }
      
      
                            // --- Initialize Stripe Elements ---
                            elements = stripe.elements({
                                clientSecret: clientSecret,
                                appearance: {
                                    theme: 'stripe', // or 'night', 'flat', 'none'
                                    variables: { colorPrimary: '#2563eb', /* ... other theme vars */ }
                                }
                            });
      
                            // Create and mount the Payment Element
                            paymentElement = elements.create('payment');
                            paymentElement.mount('#payment-element'); // Mount in the payment section
                            setAddressFeedback('Please enter payment details.', 'info'); // Update feedback
      
                            // --- Show Payment Section ---
                            const addressSection = modal.querySelector('#address-validation-section');
                            const paymentSection = modal.querySelector('#payment-section');
                            if(addressSection) addressSection.style.display = 'none'; // Hide address form
                            if(paymentSection) paymentSection.classList.remove('hidden'); // Show payment form
      
                            return true; // Indicate success
      
                        } catch (err) {
                            console.error('Stripe initialization failed:', err);
                            setAddressFeedback(\`Payment setup failed: \${err.message}\`, 'error');
                            // Optionally re-enable check availability button or provide retry mechanism
                            const checkBtn = modal.querySelector('#check-availability');
                            if(checkBtn) checkBtn.disabled = false;
                            return false; // Indicate failure
                        }
                    } // End initializeStripeElements
      
                    // Handle Payment Form Submission
                    async function handlePaymentSubmit(event) {
                        event.preventDefault();
                        if (!stripe || !elements || !clientSecret) {
                            console.error('Stripe not initialized for payment submission.');
                            setPaymentMessage('Payment system error. Please refresh and try again.');
                            return;
                        }
      
                        const submitBtn = modal.querySelector('#submit-button');
                        const paymentMsgDiv = modal.querySelector('#payment-message');
      
                        submitBtn.disabled = true;
                        setPaymentMessage('Processing payment...', 'loading');
      
                        // Collect billing details if needed (some might be optional depending on Stripe settings)
                        const billingDetails = {
                             name: \`\${modal.querySelector('#first-name')?.value || ''} \${modal.querySelector('#last-name')?.value || ''}\`.trim(),
                             email: emailInput.value.trim(), // Use email from address section
                             // Address details can also be passed if needed and not collected by Payment Element
                             // address: {
                             //    line1: address1Input.value.trim(),
                             //    city: cityInput.value.trim(),
                             //    state: stateInput.value.trim(),
                             //    postal_code: zip5Input.value.trim(),
                             //    country: 'US', // Assuming US
                             // }
                        };
      
      
                        const { error } = await stripe.confirmPayment({
                            elements,
                            confirmParams: {
                                return_url: window.location.origin + '/thank-you', // Your success page URL
                                receipt_email: emailInput.value.trim(),
                                payment_method_data: {
                                     billing_details: billingDetails
                                },
                            },
                            // Uncomment if you need to handle immediate success/failure without redirect
                            // redirect: 'if_required'
                        });
      
                        if (error) {
                            // This point will only be reached if there is an immediate error when confirming the payment.
                            // Otherwise, your customer will be redirected to your return_url.
                            // If you are handling server-side confirmation, error messages will be displayed automatically.
                            console.error('Stripe confirmPayment error:', error);
                            setPaymentMessage(error.message || 'An unexpected error occurred.', 'error');
                            submitBtn.disabled = false; // Re-enable button on error
                        } else {
                             // Payment submitted successfully (or requires further action like 3DS)
                             // If redirect: 'if_required' was used, check paymentIntent status here.
                             setPaymentMessage('Payment successful! Redirecting...', 'success');
                             // Redirect is handled by Stripe by default unless redirect: 'if_required' is used.
                        }
                    } // End handlePaymentSubmit
      
                    function setPaymentMessage(msg, type = 'info') {
                        const paymentMsgDiv = modal.querySelector('#payment-message');
                        if (!paymentMsgDiv) return;
                        paymentMsgDiv.textContent = msg;
                        paymentMsgDiv.className = 'mt-2 text-sm'; // Reset classes
                        switch (type) {
                            case 'success': paymentMsgDiv.classList.add('text-green-600', 'dark:text-green-400'); break;
                            case 'error': paymentMsgDiv.classList.add('text-red-600', 'dark:text-red-400'); break;
                            case 'loading': paymentMsgDiv.classList.add('text-blue-600', 'dark:text-blue-400'); break;
                            default: paymentMsgDiv.classList.add('text-gray-600', 'dark:text-gray-300');
                        }
                        paymentMsgDiv.classList.remove('hidden');
                    }
      
      
                    // --- Attach Event Listener for Address Check ---
                    if (checkBtn && addressFeedbackDiv) {
                        checkBtn.addEventListener('click', async () => {
                            // Basic frontend validation
                            if (!address1Input.value.trim() || !cityInput.value.trim() || !stateInput.value.trim() || !zip5Input.value.trim() || !emailInput.value.trim() || !trashDaySelect.value) {
                                setAddressFeedback('Please fill in all address fields, email, and preferred trash day.', 'error');
                                return;
                            }
                             if (!/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
                                 setAddressFeedback('Please enter a valid email address.', 'error');
                                 return;
                             }
      
      
                            const address = {
                                line1: address1Input.value.trim(),
                                line2: null, // Add line2 input if needed
                                city: cityInput.value.trim(),
                                state: stateInput.value.trim(),
                                postal_code: zip5Input.value.trim(),
                                country: "US" // Assuming US
                            };
                            const trashDay = trashDaySelect.value;
      
                            setAddressFeedback('Checking availability...', 'loading');
                            checkBtn.disabled = true;
      
                            try {
                                // --- Call your Geocode/Validation API ---
                                const resp = await fetch('/api/geocode', { // Ensure this endpoint exists
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        address,
                                        email: emailInput.value.trim(),
                                        trash_day: trashDay,
                                        subscribe_to_marketing: subscribeToMarketing.checked,
                                        // Optionally pass serviceId if validation depends on it
                                        // service_id: serviceData.id
                                    })
                                });
      
                                if (!resp.ok) {
                                     let errorMsg = \`Address validation failed (\${resp.status})\`;
                                     try { const errorData = await resp.json(); errorMsg = errorData.message || errorMsg; }
                                     catch(e){ console.error("Could not parse error response from /api/geocode"); }
                                     throw new Error(errorMsg);
                                }
      
                                const data = await resp.json();
                                console.log('Geocode response:', data);
      
                                // --- Handle Validation Response ---
                                if (!data.inside_zone) {
                                    setAddressFeedback('Sorry, service is not currently available at this address.', 'error');
                                    checkBtn.disabled = false; // Re-enable button
                                    return;
                                }
                                 if (!data.valid_trash_day) { // Check if trash day is valid for the zone/address
                                     setAddressFeedback(\`Trash day (\${trashDay}) is not valid for this service area. Please check collection schedule or contact support.\`, 'error');
                                     checkBtn.disabled = false; // Re-enable button
                                     return;
                                 }
      
                                // --- Success: Proceed to Payment Setup ---
                                setAddressFeedback(\`Service available! \${data.next_service_day ? 'Next estimated service day: ' + data.next_service_day : ''}\`, 'success');
                                const nextServiceDayDisplay = modal.querySelector('#next-service-day-display');
                                if (nextServiceDayDisplay && data.next_service_day) {
                                    nextServiceDayDisplay.textContent = 'Next available service day: ' + data.next_service_day;
                                }
      
                                // Initialize Stripe and show payment form
                                const stripeInitialized = await initializeStripeElements();
      
                                if (stripeInitialized) {
                                    // Attach payment form submit listener AFTER Stripe Elements are ready
                                    const paymentForm = modal.querySelector('#payment-form');
                                    if (paymentForm) {
                                        paymentForm.addEventListener('submit', handlePaymentSubmit);
                                    } else {
                                        console.error("Payment form not found after Stripe init!");
                                        setAddressFeedback('Error displaying payment form.', 'error');
                                    }
                                } else {
                                     // Error handled within initializeStripeElements
                                     checkBtn.disabled = false; // Re-enable check button if Stripe fails
                                }
      
                            } catch (err) {
                                console.error('Availability check error:', err);
                                setAddressFeedback(\`Error checking availability: \${err.message}\`, 'error');
                                checkBtn.disabled = false; // Re-enable button on error
                            }
                            // 'finally' block removed as button re-enabling is handled in error cases
      
                        }); // End checkBtn listener
                    } else {
                        console.error("Could not find address check button or feedback div in modal.");
                    }
      
                  } // End of showServiceModal
      
      
                  // Function to close the modal (defined outside showServiceModal to be accessible)
                   function handleModalClose() {
                       if (currentModal) {
                           console.log('Closing modal');
                           currentModal.style.opacity = '0'; // Start fade out
                           setTimeout(() => {
                               if (currentModal && currentModal.parentNode) {
                                   currentModal.remove(); // Remove from DOM after fade
                               }
                               currentModal = null; // Clear tracker
                               document.body.style.overflow = ''; // Restore body scroll
                           }, 300); // Match CSS transition duration
                       }
                   }
      
      
                  // --- Attach Main Event Listener using Delegation ---
                  // Use a unique flag for this specific component instance
                  const listenerAttachedFlag = \`_pricingTableListenerAttached_\${container.id || Math.random().toString(36).substring(2)}\`;
      
                  if (!container[listenerAttachedFlag]) {
                       console.log("Attaching pricing table listener to:", container);
                       container.addEventListener('click', function (e) {
                           const buyButton = e.target.closest('.gjs-pricing-buy-button');
                           // Ultimate robust containment check
                           if (buyButton) {
                               let isContained = false;
      
                               // Check if container is a proper DOM element with contains()
                               if (container instanceof Element && typeof container.contains === 'function') {
                                   isContained = container.contains(buyButton);
                               }
                               // Fallback to document position comparison
                               else if (container?.nodeType === Node.ELEMENT_NODE) {
                                   isContained = !!(container.compareDocumentPosition(buyButton) & Node.DOCUMENT_POSITION_CONTAINED_BY);
                               }
                               // Final fallback to parent check
                               else {
                                   isContained = container?.parentNode?.contains?.(buyButton) || false;
                               }
      
                               if (isContained) {
                                   console.log("Buy button clicked:", buyButton);
                                   const serviceDataStr = buyButton.getAttribute('data-service');
                                   if (serviceDataStr) {
                                       try {
                                           const serviceData = JSON.parse(serviceDataStr);
                                           showServiceModal(serviceData); // Call the modal function
                                       } catch (err) {
                                           console.error('Error parsing service data or showing modal:', err);
                                           alert('Error processing selection. Invalid data format.');
                                       }
                                   } else {
                                       console.warn('Button clicked but missing data-service attribute:', buyButton);
                                       alert('Error: Service information missing.');
                                   }
                               } else {
                                   console.warn('Click event not contained within the pricing table:', container);
                               }
                           } else {
                               console.warn('Click event not on a buy button:', e.target);
                           }
                       }, { passive: true, capture: true }); // Use passive event listener for performance
                        container[listenerAttachedFlag] = true; // Mark listener as attached for this instance
                        console.log(\`Listener attached with flag: \${listenerAttachedFlag}\`);
                    } else {
                        console.log("Listener already attached for:", container);
                    }
                  // --- End of Event Listener Attachment ---
                })(); // Immediately invoke the outer function
              `, // End of script property
      }, // End of defaults

      init() {
        this.fetchServices();
        this.listenTo(this, 'change:product1 change:product2 change:product3 change:product4 change:features1 change:features2 change:features3 change:smallOptionMessage change:gridGap change:fetchError change:services', this.renderContent);
        this.listenTo(this, 'change:services change:product1 change:product2 change:product3 change:product4', this.updateProductTraitOptions);
      },

      fetchServices() {
        if (this.get('services')?.length > 0 && !opts.refetchOnLoad) {
          this.updateProductTraitOptions();
          this.renderContent();
          return;
        }
        console.log('[Pricing Table] Fetching services...');
        fetch('/api/product/all')
          .then(response => { if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); return response.json(); })
          .then(data => {
            console.log('[Pricing Table] Services received:', data);
            const services = (data || []).map(service => ({ id: service.id, title: service.name || 'Untitled Service', price: Number(service.price) || 0, currency: service.currency || 'usd', description: service.description || '', priceId: service.priceId || null }));
            this.set('services', services, { silent: true });
            this.set('fetchError', false, { silent: true });
            this.updateProductTraitOptions();
            this.renderContent();
          })
          .catch(error => {
            console.error('[Pricing Table Model] Error fetching services:', error);
            this.set('services', [], { silent: true });
            this.set('fetchError', true, { silent: true });
            this.updateProductTraitOptions();
            this.renderContent();
          });
      },

      updateProductTraitOptions() {
        const services = this.get('services') || [];
        const allProductKeys = ['product1', 'product2', 'product3', 'product4'];
        const selectedIds = allProductKeys.map(key => this.get(key)?.toString()).filter(id => id);
        const defaultOption = [{ id: '', name: 'Select a product...', value: '' }];
        allProductKeys.forEach(currentTraitName => {
          const trait = this.getTrait(currentTraitName);
          if (!trait) { console.warn(`[Pricing Table Model] Could not find trait: ${currentTraitName}`); return; }
          const currentValue = this.get(currentTraitName)?.toString();
          const availableOptions = services
            .filter(service => { const serviceIdStr = service.id.toString(); return (serviceIdStr === currentValue) || !selectedIds.includes(serviceIdStr); })
            .map(service => ({ id: service.id.toString(), name: service.title, value: service.id.toString() }));
          const finalOptions = defaultOption.concat(availableOptions);
          trait.set('options', finalOptions);
        });
      },

      renderContent() {
        const services = this.get('services') || [];
        const fetchError = this.get('fetchError');
        const gridGap = this.get('gridGap') || 'gap-6';
        let gridContainer = this.components().find(comp => comp.getAttributes()['data-gjs-type'] === 'pricing-table-grid-container');

        if (!gridContainer) {
          console.error("[Pricing Table] Grid container not found! Recreating."); this.empty();
          gridContainer = this.append({ tagName: 'div', attributes: { 'data-gjs-type': 'pricing-table-grid-container', class: `pricing-table-grid flex flex-wrap justify-center ${gridGap}` }, components: [], droppable: '[data-gjs-type=pricing-card]' })[0];
        }

        gridContainer.empty();
        const siblings = this.components().models.slice();
        for (let i = siblings.length - 1; i >= 0; i--) {
          const sibling = siblings[i];
          if (sibling !== gridContainer && sibling.cid !== gridContainer.cid) {
            sibling.remove();
          }
        }
        gridContainer.setClass(`pricing-table-grid flex flex-wrap justify-center ${gridGap}`);

        if (fetchError) { this.append('<div data-gjs-type="error-message" class="text-center text-red-600 p-4">Error loading pricing data. Please check the API endpoint or network connection.</div>'); return; }
        if (services.length === 0 && !fetchError) { this.append('<div data-gjs-type="info-message" class="text-center text-gray-500 p-4">No pricing plans available. Configure products or check the data source.</div>'); return; }

        const productKeys = ['product1', 'product2', 'product3'];
        const featureKeys = ['features1', 'features2', 'features3']; productKeys.forEach((productKey, index) => {
          const productId = this.get(productKey)?.toString();
          const service = services.find(s => s.id?.toString() === productId);
          const features = this.get(featureKeys[index]) || '';
          // Use the globalFormatPrice imported at the top
          const displayPrice = service ? globalFormatPrice(service.price, service.currency) : '$ -';

          // Create complete service data object
          const serviceData = service ? {
            id: service.id,
            name: service.title,
            description: service.description,
            price: Number(service.price) || 0,
            currency: service.currency || 'usd'
          } : null;

          gridContainer.append({
            type: 'pricing-card',
            cardTitle: service?.title || 'Select Product',
            cardDescription: service?.description || 'Select a product using the traits panel.',
            cardFeatures: features,
            cardPrice: displayPrice,
            buttonText: service ? 'Select Plan' : 'Unavailable',
            serviceId: service?.id?.toString() || '',
            serviceData: serviceData // Pass full service data
          });
        });

        const smallOptionId = this.get('product4')?.toString();
        const smallOptionService = services.find(s => s.id?.toString() === smallOptionId);
        if (smallOptionService) {
          const smallOptionMessage = this.get('smallOptionMessage') || '';
          const smallOptionButtonText = 'Select Option';
          const numericPrice = Number(smallOptionService.price) || 0;
          const serviceData = { id: smallOptionService.id, title: smallOptionService.title, description: smallOptionService.description, price: numericPrice, currency: smallOptionService.currency || 'usd' };
          // Use the globalFormatPrice imported at the top
          const displayPrice = globalFormatPrice(smallOptionService.price, smallOptionService.currency);
          this.append({ tagName: 'div', attributes: { 'data-gjs-type': 'pricing-table-alternative', class: 'pricing-table-small-option flex flex-col items-center mt-6 text-center' }, components: [{ tagName: 'span', attributes: { class: 'text-gray-700 dark:text-gray-300 mb-2 text-base' }, content: smallOptionMessage }, { tagName: 'button', attributes: { class: 'gjs-pricing-buy-button px-5 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 font-medium', 'data-service': JSON.stringify(serviceData) }, content: `${smallOptionButtonText} (${displayPrice})` }] });
        } else if (smallOptionId) {
          this.append({ tagName: 'div', attributes: { 'data-gjs-type': 'pricing-table-alternative-error', class: 'pricing-table-small-option flex flex-col items-center mt-6 text-center' }, components: [{ tagName: 'span', attributes: { class: 'text-yellow-600 dark:text-yellow-400 mb-2 text-base' }, content: 'The selected alternative product is no longer available.' }] });
        }
      } // End renderContent
    }, // End model
    view: {
      onRender({ el }) {
        // --- Attach Main Event Listener using Delegation ---
        const listenerAttachedFlag = `_pricingTableListenerAttached_${el.id || Math.random().toString(36).substring(2)}`;

        if (!el[listenerAttachedFlag]) {
          console.log("Attaching pricing table listener to:", el);

          el.addEventListener('click', function (e) {
            const buyButton = e.target.closest('.gjs-pricing-buy-button');

            if (buyButton && el.contains(buyButton)) {
              console.log("Buy button clicked:", buyButton);
              const serviceDataStr = buyButton.getAttribute('data-service');
              if (serviceDataStr) {
                try {
                  const serviceData = JSON.parse(serviceDataStr);
                  // Call the module-scoped modal function directly
                  showServiceModal(serviceData);
                } catch (err) {
                  console.error('Error parsing service data or showing modal:', err);
                  alert('Error processing selection. Invalid data format.');
                }
              } else {
                console.warn('Button clicked but missing data-service attribute:', buyButton);
                alert('Error: Service information missing.');
              }
            }
          });

          el[listenerAttachedFlag] = true;
          console.log(`Listener attached with flag: ${listenerAttachedFlag} to element:`, el);
        }
      }
    } // End view
  }); // End addType('pricing-table')
}; // End export default
