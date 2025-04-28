import { formatPrice } from './components'; // Assuming formatPrice is available here

export default (service = {}) => {
  // Basic validation
  if (!service || !service.id || typeof service.price === 'undefined' || !service.title) {
    console.error("[Service Validation] Invalid service data", { service });
    return '<div class="text-red-600 p-4">Error: Missing required service information</div>';
  }

  // Use the bin icon or a placeholder
  let imageUrl = 'https://spotlessbinco.com/assets/bin-icon.png'; // Default bin icon
  if (service.images && service.images.length > 0 && typeof service.images[0] === 'string') {
    const firstImage = service.images[0];
    if (firstImage.startsWith('http')) {
      imageUrl = firstImage;
    }
  }

  const formattedPrice = formatPrice(service.price, service.currency);
  const buttonText = service.price > 0 ? `Pay ${formattedPrice} & Schedule` : 'Complete Setup';

  // Note: Tailwind CSS is assumed to be loaded globally.
  // Added Poppins font link for consistency if needed, remove if already loaded globally.
  return `
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <div class="service-validation-container p-4 md:p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg" style="font-family: 'Poppins', sans-serif;">

    <div class="mb-6 pb-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800 mb-3">Order Summary</h2>
        <div class="flex items-start space-x-4">
            <img src="${imageUrl}" alt="Service icon" class="h-16 w-16 flex-none rounded-md object-cover border border-gray-200" onerror="this.style.display='none'" />
            <div class="flex-auto space-y-1">
                <h3 class="text-gray-900 font-semibold">${service.title}</h3>
                <p class="text-sm text-gray-600">${service.description || 'Service details not available.'}</p>
            </div>
            <p class="flex-none text-lg font-medium text-gray-900">${formattedPrice}</p>
        </div>
         <dl class="mt-4 space-y-1 text-sm font-medium text-gray-600">
             <div class="flex items-center justify-between pt-2 text-gray-900">
                <dt class="text-base font-semibold">Total</dt>
                <dd class="text-base font-semibold">${formattedPrice}</dd>
             </div>
         </dl>
    </div>

    <div id="address-validation-section">
        <h3 class="text-lg font-medium text-gray-900 mb-4">1. Check Service Availability</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label for="address1" class="block text-sm font-medium text-gray-700">Street Address</label>
            <input type="text" id="address1" name="address1" required autocomplete="address-line1"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700">City</label>
              <input type="text" id="city" name="city" required autocomplete="address-level2"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div>
              <label for="state" class="block text-sm font-medium text-gray-700">State</label>
              <input type="text" id="state" name="state" required autocomplete="address-level1"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div>
              <label for="zip5" class="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input type="text" id="zip5" name="zip5" required autocomplete="postal-code"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <button type="button" id="check-availability"
                class="mt-6 px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
          Check Availability
        </button>
        <div id="address-feedback" class="mt-3 text-sm font-medium"></div>
    </div>

    <form id="payment-form" class="hidden mt-8 pt-6 border-t border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">2. Billing Information</h3>

        <div class="mt-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input type="email" id="email" name="email" autocomplete="email" required
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>

        <h4 class="mt-6 text-md font-medium text-gray-800">Payment Details</h4>
        <div class="mt-1 text-sm text-gray-500">Enter your payment information below.</div>
        <div class="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50" id="payment-element-container">
            <div id="payment-element"></div>
            <div id="payment-message" class="hidden mt-2 text-sm text-red-600"></div>
        </div>

        <div class="mt-6">
             <div class="flex items-center">
                <input id="same-as-service" name="same-as-service" type="checkbox" checked
                       class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label for="same-as-service" class="ml-2 block text-sm font-medium text-gray-900">Billing address is the same as service address</label>
            </div>
            <div id="billing-address-fields" class="mt-4 hidden grid grid-cols-1 gap-4">
              <div>
                <label for="billing-address1" class="block text-sm font-medium text-gray-700">Billing Street Address</label>
                <input type="text" id="billing-address1" name="billing-address1" autocomplete="address-line1"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label for="billing-city" class="block text-sm font-medium text-gray-700">Billing City</label>
                  <input type="text" id="billing-city" name="billing-city" autocomplete="address-level2"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label for="billing-state" class="block text-sm font-medium text-gray-700">Billing State</label>
                  <input type="text" id="billing-state" name="billing-state" autocomplete="address-level1"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label for="billing-zip" class="block text-sm font-medium text-gray-700">Billing ZIP Code</label>
                  <input type="text" id="billing-zip" name="billing-zip" autocomplete="postal-code"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>
        </div>


        <div class="mt-6">
            <label for="coupon" class="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input type="text" id="coupon" name="coupon" placeholder="Enter code"
                     class="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              <button type="button" id="apply-coupon-button"
                      class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                Apply
              </button>
            </div>
            <div id="coupon-feedback" class="mt-1 text-sm"></div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button type="submit" id="submit-button"
                    class="rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    disabled>
                <span id="button-text">${buttonText}</span>
                <span id="spinner" class="hidden ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></span>
            </button>
        </div>
        <div id="error-message" class="mt-4 text-sm text-red-600 text-right"></div>
    </form>
  </div>

  <script src="https://js.stripe.com/v3/"></script>

  <script>
    // Wrap in a function to avoid global scope pollution
    (function () {
      // --- Configuration & State ---
      const serviceDataJson = ${JSON.stringify(service || {})};
      const serviceData = serviceDataJson;
      let stripe = null;
      let elements = null;
      let paymentElement = null;
      let clientSecret = null;
      let validatedAddress = null;
      let stripePublishableKey = null;

      // --- DOM Element References ---
      const container = document.querySelector('.service-validation-container');
      if (!container) {
          console.error('Service validation container not found');
          return;
      }
      const addressSection = container.querySelector('#address-validation-section');
      const address1Input = container.querySelector('#address1');
      const cityInput = container.querySelector('#city');
      const stateInput = container.querySelector('#state');
      const zip5Input = container.querySelector('#zip5');
      const checkBtn = container.querySelector('#check-availability');
      const addressFeedbackDiv = container.querySelector('#address-feedback');
      const paymentForm = container.querySelector('#payment-form');
      const emailInput = container.querySelector('#email');
      const paymentElementContainer = container.querySelector('#payment-element-container');
      const paymentElementDiv = container.querySelector('#payment-element');
      const paymentMessageDiv = container.querySelector('#payment-message');
      const couponInput = container.querySelector('#coupon');
      const applyCouponBtn = container.querySelector('#apply-coupon-button');
      const couponFeedbackDiv = container.querySelector('#coupon-feedback');
      const submitBtn = container.querySelector('#submit-button');
      const submitBtnText = container.querySelector('#button-text');
      const submitSpinner = container.querySelector('#spinner');
      const errorMessageDiv = container.querySelector('#error-message');

      // --- Helper Functions ---
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

      function setPaymentMessage(message) {
          if (!paymentMessageDiv) return;
          paymentMessageDiv.textContent = message;
          paymentMessageDiv.classList.toggle('hidden', !message);
      }

       function setErrorMessage(message) {
          if (!errorMessageDiv) return;
          errorMessageDiv.textContent = message;
          errorMessageDiv.classList.toggle('hidden', !message);
      }

       function setCouponFeedback(msg, type = 'info') {
          if (!couponFeedbackDiv) return;
          couponFeedbackDiv.textContent = msg;
          couponFeedbackDiv.className = 'mt-1 text-sm';
          switch (type) {
              case 'success': couponFeedbackDiv.classList.add('text-green-600'); break;
              case 'error': couponFeedbackDiv.classList.add('text-red-600'); break;
              default: couponFeedbackDiv.classList.add('text-gray-600');
          }
      }

      function setLoading(isLoading) {
          if (!submitBtn || !submitSpinner || !submitBtnText) return;
          submitBtn.disabled = isLoading;
          submitSpinner.classList.toggle('hidden', !isLoading);
          submitBtnText.style.visibility = isLoading ? 'hidden' : 'visible';
      }

      // --- Initialization Functions ---
      async function validateServiceData() {
          if (serviceData && serviceData.stripeKey) {
              return serviceData.stripeKey;
          }
          try {
              const response = await fetch('/settings/stripe-api-key');
              if (!response.ok) throw new Error('Failed to fetch Stripe key');
              const data = await response.json();
              return data?.stripe_api_key || null;
          } catch (err) {
              console.error('Error fetching Stripe key:', err);
              return null;
          }
      }

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


      async function initializeStripeAndElements() {
          setLoading(true);
          setErrorMessage('');

          // First validate required fields
          await validateServiceData();
          stripePublishableKey = await fetchStripeKey();
          if (!stripePublishableKey) {
              setErrorMessage('Payment processing is currently unavailable. Missing configuration.');
              setLoading(false);
              return;
          }

          if (typeof Stripe === 'undefined') {
               setErrorMessage('Stripe.js failed to load. Please check your connection or contact support.');
               setLoading(false);
               return;
          }
          stripe = Stripe(stripePublishableKey);

          try {
              const response = await fetch('/api/stripe/checkout-sessions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      product_id: '' + serviceData.id,
                      quantity: 1 // Default quantity
                  }),
              });
              if (!response.ok) {
                  let errorMsg = 'Failed to create checkout session';
                  try {
                      const errorData = await response.json();
                      errorMsg = errorData.message || errorMsg;
                  } catch (parseError) {
                      console.error('Error parsing error response:', parseError);
                  }
                  throw new Error(errorMsg);
              }
              
              const { status, client_secret } = await response.json();
              if (status !== 'success' || !client_secret) {
                  throw new Error('Invalid payment response from server');
              }

              clientSecret = client_secret;
              elements = stripe.elements({
                  appearance: {
                      theme: 'stripe',
                      variables: {
                          colorPrimary: '#2563eb',
                          colorBackground: '#ffffff',
                          colorText: '#30313d',
                          colorDanger: '#df1b41',
                          fontFamily: 'Poppins, system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '4px'
                      }
                  },
                  clientSecret
              });
              paymentElement = elements.create('payment');

              const appearance = {
                  theme: 'stripe',
                  variables: {
                      colorPrimary: '#2563eb',
                      colorBackground: '#ffffff',
                      colorText: '#30313d',
                      colorDanger: '#df1b41',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '4px'
                  }
              };
              // Initialize Stripe Elements with client_secret
              elements = stripe.elements({
                  appearance: {
                      theme: 'stripe',
                      variables: {
                          colorPrimary: '#2563eb',
                          colorBackground: '#ffffff',
                          colorText: '#30313d',
                          colorDanger: '#df1b41',
                          fontFamily: 'Poppins, system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '4px'
                      }
                  },
                  clientSecret
              });
              paymentElement = elements.create('payment');

              if (paymentElementDiv) {
                  paymentElement.mount(paymentElementDiv);
              } else {
                   throw new Error('Payment element mount point not found.');
              }

              paymentElement.on('ready', () => {
                  if (submitBtn) submitBtn.disabled = false;
                  setLoading(false);
              });
              paymentElement.on('change', (event) => {
                  if (event.error) {
                      setPaymentMessage(event.error.message);
                      if (submitBtn) submitBtn.disabled = true;
                  } else {
                      setPaymentMessage('');
                      // Re-enable submit button if it was ready and no longer has an error
                      // Check if submit button exists and was disabled by this logic
                      if (submitBtn && submitBtn.disabled && !paymentElement._invalid) {
                         // Need a reliable way to know if it was disabled *because* of payment element error
                         // For now, let's assume 'ready' handles initial enabling, and only disable on error.
                         // If the element becomes valid again, we might need to re-enable here cautiously.
                         // submitBtn.disabled = false; // Cautious re-enabling might be needed
                      }
                  }
              });

          } catch (error) { // This is the catch block in question
              console.error('Stripe Elements initialization error:', error);
              // *** FIX START ***
              // Check if error exists and has a message property
              const errorMessage = error && error.message ? error.message : 'An unknown error occurred during payment setup.';
              setErrorMessage('Payment setup failed: ' + errorMessage);
              // *** FIX END ***
              setLoading(false);
          }
      }

      // --- Event Handlers ---
      async function handleCheckAvailability() {
          if (!address1Input || !cityInput || !stateInput || !zip5Input || !checkBtn) {
              console.error('Address input elements not found');
              setAddressFeedback('⚠️ Internal error: Missing address fields.', 'error');
              return;
          }
          const address = {
              address1: address1Input.value.trim(),
              city: cityInput.value.trim(),
              state: stateInput.value.trim(),
              zip5: zip5Input.value.trim()
          };
          setAddressFeedback('⏳ Checking availability...', 'loading');
          checkBtn.disabled = true;
          setErrorMessage('');
          if (!address.address1 || !address.city || !address.state || !address.zip5) {
              const missing = [];
              if (!address.address1) missing.push('street address');
              if (!address.city) missing.push('city');
              if (!address.state) missing.push('state');
              if (!address.zip5) missing.push('ZIP code');
              setAddressFeedback("⚠️ Please fill in all address fields: " + missing.join(', '), 'error');
              checkBtn.disabled = false;
              return;
          }
          try {
              const resp = await fetch('/api/geocode', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + (serviceData?.authToken || '')
                  },
                  body: JSON.stringify({
                  address: {
                      address1: address.address1,
                      city: address.city,
                      state: address.state,
                      zip5: address.zip5
                  },
                  })
              });
              if (!resp.ok) {
                  let errorMsg = 'Failed to validate address';
                  try {
                      const errorData = await resp.json();
                      errorMsg = errorData.message || errorMsg;
                  } catch (parseError) {
                      console.warn('Failed to parse error response:', parseError);
                  }
                  throw new Error(errorMsg);
              }
              const data = await resp.json();
              if (data.inside_zone || data.in_service_area) {
                  setAddressFeedback('✅ Address is in the service area!', 'success');
                  validatedAddress = address;
                  localStorage.setItem("validatedAddress", JSON.stringify(address));
                  if (addressSection) addressSection.classList.add('opacity-50', 'pointer-events-none');
                  checkBtn.disabled = true;
                  if (paymentForm) paymentForm.classList.remove('hidden');
                  await initializeStripeAndElements();
              } else if (data.outside_zone) {
                  setAddressFeedback('❌ Sorry, this address is outside our service area', 'error');
              } else if (data.invalid_address) {
                  setAddressFeedback('❌ Please enter a valid address', 'error');
              } else {
                  setAddressFeedback('❌ Service not available at this address', 'error');
              }
          } catch (error) {
              console.error('Error checking address:', error);
              setAddressFeedback('❌ Error checking address: ' + (error.message || 'Unknown error'), 'error');
          } finally {
               if (!validatedAddress && checkBtn) { checkBtn.disabled = false; }
          }
      }

      async function handlePaymentSubmit(event) {
          event.preventDefault();
          setLoading(true);
          setErrorMessage('');
          setPaymentMessage('');
          if (!stripe || !elements || !clientSecret) {
              setErrorMessage('⚠️ Payment processing is not available. Please check your connection or contact support.');
              setLoading(false);
              return;
            }
          if (!paymentElement) {
              setErrorMessage('⚠️ Payment element is not initialized. Please refresh the page and try again.');
              setLoading(false);
              return;
          }
          const userEmail = emailInput ? emailInput.value.trim() : '';
          if (!userEmail) {
              setErrorMessage('⚠️ Please enter a valid email address.', 'error');
              setLoading(false);
              return;
          }
          const serviceAddress = validatedAddress;
          if (!serviceAddress) {
              setErrorMessage('⚠️ Please validate your service address first');
              setLoading(false);
              return;
          }
          const sameAsServiceCheckbox = container.querySelector('#same-as-service');
          const billingSameAsService = sameAsServiceCheckbox ? sameAsServiceCheckbox.checked : true;
          let billingDetails = {
            email: userEmail,
            address: billingSameAsService ? {
              line1: serviceAddress.address1,
              city: serviceAddress.city,
              state: serviceAddress.state,
              postal_code: serviceAddress.zip5,
              country: 'US'
            } : {
              line1: container.querySelector('#billing-address1').value.trim(),
              city: container.querySelector('#billing-city').value.trim(),
              state: container.querySelector('#billing-state').value.trim(),
              postal_code: container.querySelector('#billing-zip').value.trim(),
              country: 'US'
            }
          };

          // Submit the form and collect payment details
          const {error: submitError} = await elements.submit();

          if (submitError) {
              // Show error to your customer (e.g., invalid information)
              setErrorMessage(submitError.message);
              setLoading(false);
              return;
          }

          // Confirm the payment
          const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
              elements,
              clientSecret,
              confirmParams: {
                  return_url: window.location.origin + '/thank-you' + '?payment_status=completed',
                  receipt_email: userEmail,
                  payment_method_data: {
                      billing_details: billingDetails
                  }
              },
              redirect: 'always'
          });

          if (submitError) {
              console.error("Stripe confirmation error:", submitError);
              setErrorMessage(submitError.message || 'An unexpected error occurred during payment.');
              setLoading(false);
              return;
          }
          
          if (paymentIntent && paymentIntent.status === 'succeeded') {
              setErrorMessage('');
              setPaymentMessage('Payment succeeded! Redirecting...');
              setLoading(false);
              // Store successful payment in localStorage
              localStorage.setItem('lastSuccessfulPayment', JSON.stringify({
                  amount: paymentIntent.amount,
                  currency: paymentIntent.currency,
                  serviceId: serviceData.id,
                  timestamp: Date.now()
              }));
              // Disable form and show success state
              if (paymentForm) paymentForm.classList.add('opacity-50', 'pointer-events-none');
              if (submitBtn) {
                  submitBtn.disabled = true;
                  submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                  submitBtn.classList.add('bg-green-500');
              }
              // Redirect to age page after 2 seconds
              setTimeout(() => {
                  window.location.href = '/age?payment=success&serviceId=' + encodeURIComponent(serviceData.id);
              }, 2000);
          }
          else if (paymentIntent) {
              switch (paymentIntent.status) {
                  case 'processing':
                      setPaymentMessage("Payment processing - we\'ll update you when complete");
                      break;
                  case 'requires_action':
                      setPaymentMessage('Additional authentication required');
                      break;
                  case 'requires_payment_method':
                      setPaymentMessage('Payment failed - please try another method');
                      break;
                  default:
                      setPaymentMessage('Payment status: ' + paymentIntent.status);
              }
          }
          setLoading(false);
      }

      async function handleApplyCoupon() {
          if (!couponInput || !applyCouponBtn) return;
          const code = couponInput.value.trim();
          if (!code) {
              setCouponFeedback('Please enter a coupon code', 'error');
              return;
          }
          setCouponFeedback('⏳ Applying coupon...', 'info');
          applyCouponBtn.disabled = true;
          try {
              const response = await fetch('/api/apply-coupon', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + (serviceData?.authToken || '')
                  },
                  body: JSON.stringify({
                      code: code,
                      serviceId: serviceData.id
                  })
              });
              const result = await response.json();
              if (result.valid) {
                  setCouponFeedback('Coupon applied! ' + (result.message || ''), 'success');
              } else {
                  setCouponFeedback((result.message || 'Invalid coupon code'), 'error');
              }
          } catch (error) {
              setCouponFeedback('⚠️ Failed to apply coupon - please try again', 'error');
              console.error('Coupon API error:', error);
          } finally {
              applyCouponBtn.disabled = false;
          }
      }

      // --- Attach Event Listeners ---
      if (checkBtn) checkBtn.addEventListener('click', handleCheckAvailability);
      if (paymentForm) paymentForm.addEventListener('submit', handlePaymentSubmit);
      if (applyCouponBtn) applyCouponBtn.addEventListener('click', handleApplyCoupon);
      
      // Handle billing address checkbox change
      const sameAsServiceCheckbox = container.querySelector('#same-as-service');
      const billingAddressFields = container.querySelector('#billing-address-fields');
      if (sameAsServiceCheckbox && billingAddressFields) {
          sameAsServiceCheckbox.addEventListener('change', (e) => {
              billingAddressFields.classList.toggle('hidden', e.target.checked);
              if (!e.target.checked) {
                  // Focus first field when showing billing address
                  const firstField = billingAddressFields.querySelector('input');
                  if (firstField) firstField.focus();
              }
          });
          // Initialize visibility based on checkbox state
          billingAddressFields.classList.toggle('hidden', sameAsServiceCheckbox.checked);
      }

      if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
      [address1Input, cityInput, stateInput, zip5Input].forEach(input => {
          if (input) {
              input.addEventListener('input', () => {
                  if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
                  if (validatedAddress) { // Reset if address changed after validation
                      setAddressFeedback('', 'info');
                      if (paymentForm) paymentForm.classList.add('hidden');
                      if (paymentElement) { try { paymentElement.unmount(); } catch(e) { console.warn("Error unmounting payment element:", e); } } // Safely unmount
                      validatedAddress = null;
                      clientSecret = null;
                      if (submitBtn) submitBtn.disabled = true;
                      if (addressSection) addressSection.classList.remove('opacity-50', 'pointer-events-none');
                      if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
                  }
              });
          }
      });

      // --- Initial State ---
      setLoading(false);
      setErrorMessage('');
      setPaymentMessage('');
      setCouponFeedback('');

    })(); // End IIFE
  </script>
  `; // End template literal
}; // End export default
