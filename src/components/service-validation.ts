import { ServiceData } from "./modal-ui";
import AddressValidation from "./service-validation/AddressValidation";
import OrderSummary from "./service-validation/OrderSummary";
import PaymentForm from "./service-validation/PaymentForm";
import { validateServiceData } from "./service-validation/validationLogic";


export default (service: ServiceData) => {
  if (!service) return console.error('Service data is required for validation modal');
  const validationError = validateServiceData(service);
  if (validationError) return validationError;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: service.currency || 'USD',
  }).format(service.price);

  const buttonText = service.price > 0 ? `Pay ${formattedPrice} & Schedule` : 'Complete Setup';

  return `
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
    <div class="service-validation-container p-4 md:p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg" style="font-family: 'Poppins', sans-serif;">
      ${OrderSummary(service, formattedPrice)}
      ${AddressValidation()}
      ${PaymentForm(buttonText)}
    </div>

    <script src="https://js.stripe.com/v3/"></script>
    <script type="text/javascript" data-gjs-type="service-validation-script">
      // The JavaScript logic remains here for now
      window.initServiceValidation = function (serviceData) {
                            const MODAL_REOPEN_DELAY = 350; // Animation delay for modal reopening
                            const REDIRECT_DELAY = 1500; // Delay before redirecting to checkout
                            
                            // Close any existing modal first
                    if (currentModal) {
                        handleModalClose();
                        setTimeout(() => showServiceModal(serviceData), MODAL_REOPEN_DELAY);
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
                      modal.innerHTML = '<div style="background:white; padding:2rem; color:red; border-radius: 8px; max-width: 400px; margin-top: 40px;">Invalid service data service validation - missing required fields (ID, Price, Title). <button id="error-close-btn">Close</button></div>';
                      document.body.appendChild(modal);
                      document.body.style.overflow = 'hidden';
                       // Trigger reflow before adding opacity class
                      modal.offsetHeight;
                      modal.style.opacity = '1';
                      
                      // Add event listener for close button
                      const errorCloseBtn = modal.querySelector('#error-close-btn');
                      if (errorCloseBtn) {
                          errorCloseBtn.addEventListener('click', () => {
                              modal.remove();
                              document.body.style.overflow = '';
                              currentModal = null;
                          });
                      }
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
                          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">1.2 Check Service Availability</h3>
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
                          <button type="button" id="check-availability" class="mt-6 px-5 py-3 rounded-md bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto">Check Availability 2</button>
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

                            // Check if geocode data is already in local storage
                            try {
                                const geocodeData = localStorage.getItem('geocode-data');
                                if (geocodeData) {
                                    console.log('Geocode data found in local storage: service validation', geocodeData);
                                    window.lastValidatedAddressForModal = JSON.parse(geocodeData); // Store for later use
                                } else {
                                    console.log('No geocode data found in local storage.');
                                }
                            } catch (err) {
                                console.error('Error retrieving geocode data from local storage:', err);
                            }

                            // --- Create Payment Intent / Checkout Session ---
                            // This MUST happen after address validation passes.
                            // Moved the fetch call here.
                            setAddressFeedback('Initializing payment...', 'loading');
                            const sessionResponse = await fetch('/api/stripe/checkout-sessions', { // Ensure this endpoint is correct
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  product_id: String(serviceData.id), // Ensure ID is string
                                  first_name: modal.querySelector('#first-name')?.value || '',
                                  last_name: modal.querySelector('#last-name')?.value || '',
                                  email: localStorage.getItem('geocode-data') ? JSON.parse(localStorage.getItem('geocode-data')).email : '',
                                    address_id: Number(window.lastValidatedAddressForModal.address_id), // Convert to number
                                    trash_day: window.lastValidatedAddressForModal.trash_day,
                                    additional_bins: window.additionalBins,
                                    location: window.lastValidatedAddressForModal.location
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
                            
                            // Track initiate checkout event
                            if (window.trackEvent) {
                                window.trackEvent('initiate_checkout', {
                                    value: responseData?.amount_total || serviceData.price,
                                    currency: serviceData.currency || 'USD',
                                    step: 1,
                                    checkout_option: 'standard',
                                    items: [{
                                        item_id: String(serviceData.id),
                                        name: serviceData.name || 'Service',
                                        price: serviceData.price,
                                        quantity: 1
                                    }]
                                });
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
                             
                             // Track booking completion
                             if (window.trackEvent) {
                                 const bookingId = clientSecret.split('_secret')[0];
                                 window.trackEvent('booking_completed', {
                                     booking_id: bookingId,
                                     service_type: serviceData.service_type || 'bin_cleaning',
                                     date: new Date().toISOString(),
                                     value: serviceData.price,
                                     currency: serviceData.currency || 'USD',
                                     items: [{
                                         item_id: serviceData.id,
                                         name: serviceData.name,
                                         price: serviceData.price,
                                         quantity: 1
                                     }]
                                 });
                             }
                             
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
                                setAddressFeedback('Please fill in all address fields, email, and preferred trash day. 2', 'error');
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
      
                            setAddressFeedback('Checking availability... 2', 'loading');
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
      
                                // --- Success: Redirect to Checkout ---
                                setAddressFeedback(\`Service available! \${data.next_service_day ? 'Next estimated service day: ' + data.next_service_day : ''}\`, 'success');
                                
                                // Track address validation success
                                if (window.trackEvent) {
                                    const analyticsData = {
                                        event_id: data.address_id,
                                        value: serviceData.price,
                                        currency: serviceData.currency || 'USD',
                                        items: [{ item_id: serviceData.id, price: serviceData.price, quantity: 1 }]
                                    };

                                    window.trackEvent('address_entered', {
                                        ...analyticsData,
                                        step: 2,
                                        address_type: 'shipping',
                                        form_id: 'service-booking'
                                    });

                                    // Unified e-commerce tracking
                                    window.trackEvent('add_to_cart', analyticsData);
                                }
                                
                                // Check if server returned a redirect URL (preferred method)
                                if (data.redirect_url) {
                                    console.log('Redirecting to checkout:', data.redirect_url);
                                    setAddressFeedback('Address validated! Redirecting to checkout...', 'success');
                                    
                                    // Close modal and redirect after a short delay
                                    setTimeout(() => {
                                        if (currentModal) {
                                            currentModal.remove();
                                            document.body.style.overflow = '';
                                            currentModal = null;
                                        }
                                        window.location.href = data.redirect_url;
                                    }, REDIRECT_DELAY);
                                    return;
                                }
                                
                                // Fallback: construct redirect URL manually if not provided by server
                                let redirectUrl = '/checkout?';
                                const params = new URLSearchParams();
                                if (serviceData.id) params.append('service_id', serviceData.id);
                                if (data.address_id) params.append('address_id', data.address_id);
                                if (emailInput.value.trim()) params.append('email', emailInput.value.trim());
                                if (trashDaySelect.value) params.append('trash_day', trashDaySelect.value);
                if (data.next_service_day) params.append('next_service_day', data.next_service_day);
                // Ensure postal code is always included for tax calculation
                if (zip5Input && zip5Input.value && zip5Input.value.trim()) {
                  params.append('zip5', zip5Input.value.trim());
                }
                                
                                redirectUrl += params.toString();
                                console.log('Fallback redirect to checkout:', redirectUrl);
                                setAddressFeedback('Address validated! Redirecting to checkout...', 'success');
                                
                                // Close modal and redirect after a short delay
                                setTimeout(() => {
                                    if (currentModal) {
                                        currentModal.remove();
                                        document.body.style.overflow = '';
                                        currentModal = null;
                                    }
                                    if (redirectUrl.startsWith('/checkout?')) {
                                        window.location.href = redirectUrl;
                                    } else {
                                        console.error('Invalid redirect URL:', redirectUrl);
                                        setAddressFeedback('Error: Invalid redirect URL.', 'error');
                                    }
                                }, REDIRECT_DELAY);
      
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
      
                  // End of showServiceModal
      };
    </script>
  `;
};
