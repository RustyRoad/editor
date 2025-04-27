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
            {/* Add fields for different billing address if needed, shown when checkbox is unchecked */}
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
      // Ensure serviceData is properly handled if service is null/undefined initially
      const serviceDataJson = ${JSON.stringify(service || {})};
      const serviceData = serviceDataJson; // Use the passed service object
      let stripe = null;
      let elements = null;
      let paymentElement = null;
      let clientSecret = null; // To store the Payment Intent client secret
      let validatedAddress = null; // To store the validated service address
      let stripePublishableKey = null; // To store the Stripe key

      // --- DOM Element References ---
      // Use optional chaining ?. for safety in case elements are missing
      const container = document.querySelector('.service-validation-container');
      if (!container) {
          console.error('Service validation container not found');
          return; // Exit if container is missing
      }
      // Address Section
      const addressSection = container.querySelector('#address-validation-section');
      const address1Input = container.querySelector('#address1');
      const cityInput = container.querySelector('#city');
      const stateInput = container.querySelector('#state');
      const zip5Input = container.querySelector('#zip5');
      const checkBtn = container.querySelector('#check-availability');
      const addressFeedbackDiv = container.querySelector('#address-feedback');

      // Payment Form Section
      const paymentForm = container.querySelector('#payment-form');
      const emailInput = container.querySelector('#email');
      const paymentElementContainer = container.querySelector('#payment-element-container'); // Container for styling
      const paymentElementDiv = container.querySelector('#payment-element'); // Actual mount point
      const paymentMessageDiv = container.querySelector('#payment-message'); // For Stripe Element errors
      const couponInput = container.querySelector('#coupon');
      const applyCouponBtn = container.querySelector('#apply-coupon-button');
      const couponFeedbackDiv = container.querySelector('#coupon-feedback');
      const submitBtn = container.querySelector('#submit-button');
      const submitBtnText = container.querySelector('#button-text');
      const submitSpinner = container.querySelector('#spinner');
      const errorMessageDiv = container.querySelector('#error-message'); // General form errors

      // --- Helper Functions ---
      function setAddressFeedback(msg, type = 'info') {
          if (!addressFeedbackDiv) return; // Add null check
          addressFeedbackDiv.textContent = msg;
          addressFeedbackDiv.className = 'mt-3 text-sm font-medium'; // Reset classes
          switch (type) {
              case 'success':
                  addressFeedbackDiv.classList.add('text-green-600');
                  break;
              case 'error':
                  addressFeedbackDiv.classList.add('text-red-600');
                  break;
              case 'loading':
                  addressFeedbackDiv.classList.add('text-blue-600');
                  break;
              default: // info
                  addressFeedbackDiv.classList.add('text-gray-600');
          }
      }

      function setPaymentMessage(message) {
          if (!paymentMessageDiv) return; // Add null check
          paymentMessageDiv.textContent = message;
          paymentMessageDiv.classList.toggle('hidden', !message);
      }

       function setErrorMessage(message) {
          if (!errorMessageDiv) return; // Add null check
          errorMessageDiv.textContent = message;
          errorMessageDiv.classList.toggle('hidden', !message);
      }

       function setCouponFeedback(msg, type = 'info') {
          if (!couponFeedbackDiv) return; // Add null check
          couponFeedbackDiv.textContent = msg;
          couponFeedbackDiv.className = 'mt-1 text-sm'; // Reset classes
          switch (type) {
              case 'success':
                  couponFeedbackDiv.classList.add('text-green-600');
                  break;
              case 'error':
                  couponFeedbackDiv.classList.add('text-red-600');
                  break;
              default: // info
                  couponFeedbackDiv.classList.add('text-gray-600');
          }
      }

      function setLoading(isLoading) {
          if (!submitBtn || !submitSpinner || !submitBtnText) return; // Add null checks
          submitBtn.disabled = isLoading;
          submitSpinner.classList.toggle('hidden', !isLoading);
          // Use visibility instead of display to prevent layout shifts
          submitBtnText.style.visibility = isLoading ? 'hidden' : 'visible';
      }

      // --- Initialization Functions ---

      async function fetchStripeKey() {
          // Use key from service data if provided, otherwise fetch from settings
          // Check if serviceData itself exists
          if (serviceData && serviceData.stripeKey) {
              return serviceData.stripeKey;
          }
          try {
              const response = await fetch('/settings/stripe-api-key'); // Adjust endpoint if needed
              if (!response.ok) throw new Error('Failed to fetch Stripe key');
              const data = await response.json();
              // Check if data and key exist
              return data?.stripe_api_key || null;
          } catch (err) {
              console.error('Error fetching Stripe key:', err);
              return null;
          }
      }

      async function initializeStripeAndElements() {
          setLoading(true);
          setErrorMessage(''); // Clear previous errors

          stripePublishableKey = await fetchStripeKey();
          if (!stripePublishableKey) {
              setErrorMessage('Payment processing is currently unavailable. Missing configuration.');
              setLoading(false);
              return;
          }

          // Ensure Stripe is loaded (it should be from the script tag)
          if (typeof Stripe === 'undefined') {
               setErrorMessage('Stripe.js failed to load. Please check your connection or contact support.');
               setLoading(false);
               return;
          }
          stripe = Stripe(stripePublishableKey);

          // Create Payment Intent
          try {
              const response = await fetch('/api/stripe/create-payment-intent', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      amount: serviceData.price,
                      currency: serviceData.currency || 'usd',
                      serviceId: serviceData.id,
                      metadata: {
                          serviceTitle: serviceData.title,
                      }
                  }),
              });
              if (!response.ok) {
                  // Try to parse error message from backend
                  let errorMsg = 'Failed to create payment intent';
                  try {
                      const errorData = await response.json();
                      errorMsg = errorData.error || errorMsg;
                  } catch (parseError) { /* Ignore if response is not JSON */ }
                  throw new Error(errorMsg);
              }
              const { clientSecret: paymentIntentClientSecret } = await response.json();
              clientSecret = paymentIntentClientSecret;

              if (!clientSecret) {
                  throw new Error('Missing client secret from server.');
              }

              // Appearance object for Elements
              const appearance = {
                  theme: 'stripe',
                  variables: {
                      colorPrimary: '#0570de',
                      colorBackground: '#ffffff',
                      colorText: '#30313d',
                      colorDanger: '#df1b41',
                      fontFamily: 'Poppins, Ideal Sans, system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '4px',
                  }
              };

              // Create and mount the Payment Element
              elements = stripe.elements({ appearance, clientSecret });
              paymentElement = elements.create('payment');

              // Ensure the mount point exists before mounting
              if (paymentElementDiv) {
                  paymentElement.mount(paymentElementDiv);
              } else {
                   throw new Error('Payment element mount point not found.');
              }


              // Handle events from the Payment Element
              paymentElement.on('ready', () => {
                  submitBtn.disabled = false; // Enable submit button only when element is ready
                  setLoading(false);
              });
              paymentElement.on('change', (event) => {
                  if (event.error) {
                      setPaymentMessage(event.error.message);
                      submitBtn.disabled = true; // Disable submit if there's an error
                  } else {
                      setPaymentMessage('');
                      // Re-enable submit button if it was disabled due to an element error
                      // Check if it's also ready
                       if (!submitBtn.disabled && paymentElement._invalid) {
                           // This is a basic check; more robust state might be needed
                       } else if (!submitBtn.disabled) {
                           // Potentially re-enable if needed, but 'ready' should handle initial enable
                           // submitBtn.disabled = false;
                       }
                  }
              });
              // Add semicolon after the last statement in the try block
              ; // Semicolon added

          } catch (error) {
              console.error('Stripe Elements initialization error:', error);
              setErrorMessage("Payment setup failed: " + ${error.message});
              setLoading(false);
          }
      }


      // --- Event Handlers ---

      async function handleCheckAvailability() {
          // Ensure all inputs exist before accessing value
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
          setErrorMessage(''); // Clear previous errors


          if (!address.address1 || !address.city || !address.state || !address.zip5) {
              const missingFields = [
                  !address.address1 && 'Street Address',
                  !address.city && 'City',
                  !address.state && 'State',
                  !address.zip5 && 'ZIP Code'
              ].filter(Boolean).join(', ');
              setAddressFeedback("⚠️ Please fill in all address fields: " + ${missingFields}, 'error');
              checkBtn.disabled = false;
              return;
          }

          try {
              const resp = await fetch('/api/geocode', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      address: { ...address, address2: null, zip4: null },
                      zone_id: 1
                  })
              });

              if (!resp.ok) {
                  let errorMsg = 'API error during address check.';
                  try {
                      const errData = await resp.json();
                      errorMsg = errData.error || errorMsg;
                  } catch (e) { /* Ignore parsing error */ }
                  throw new Error(errorMsg);
              }

              const data = await resp.json();

              // Handle different validation responses
              if (data.inside_zone || data.in_service_area) {
                  setAddressFeedback('✅ Address is in the service area!', 'success');
                  validatedAddress = address;
                  localStorage.setItem("validatedAddress", JSON.stringify(address));

                  // Hide address section, show payment form
                  if (addressSection) addressSection.classList.add('opacity-50', 'pointer-events-none');
                  checkBtn.disabled = true;
                  if (paymentForm) paymentForm.classList.remove('hidden');

                  // Initialize Stripe Elements for payment
                  await initializeStripeAndElements();

              } else if (data.invalid_address || data.invalid_zip) {
                  setAddressFeedback('❌ Address appears invalid. Please check and try again.', 'error');
              } else if (data.outside_zone || (data.hasOwnProperty('in_service_area') && !data.in_service_area)) {
                  setAddressFeedback('❌ Sorry, this address is outside our service area.', 'error');
              } else if (data.error) {
                   setAddressFeedback('❌ Validation Error: ' + ${data.error}', 'error');
              } else {
                  setAddressFeedback('❌ Could not validate address. Please try again.', 'error');
              }
          } catch (error) {
              console.error('Error checking address:', error);
              setAddressFeedback('❌ Error checking address: ' + ${error.message}', 'error');
          } finally {
               // Re-enable check button only if validation failed and needs retry
               if (!validatedAddress && checkBtn) {
                   checkBtn.disabled = false;
               }
               // Add semicolon
               ;
          }
      } // End handleCheckAvailability

      async function handlePaymentSubmit(event) {
          event.preventDefault();
          setLoading(true);
          setErrorMessage('');
          setPaymentMessage('');

          if (!stripe || !elements || !clientSecret) {
              setErrorMessage('Payment system is not ready. Please wait or refresh.');
              setLoading(false);
              return; // Semicolon added
          }

          const userEmail = emailInput ? emailInput.value.trim() : '';
          if (!userEmail) {
               setErrorMessage('Please enter your email address.');
               if (emailInput) emailInput.focus();
               setLoading(false);
               return; // Semicolon added
          }

          // Retrieve the validated service address
          const serviceAddress = validatedAddress;
          if (!serviceAddress) {
              setErrorMessage('Service address validation is missing. Please check address first.');
              setLoading(false);
              return; // Semicolon added
          }

          // Determine billing address
          const sameAsServiceCheckbox = container.querySelector('#same-as-service');
          const billingSameAsService = sameAsServiceCheckbox ? sameAsServiceCheckbox.checked : true; // Default to true if checkbox not found
          let billingDetails = {
              email: userEmail,
              name: '', // Optional: Add name field if needed
              address: billingSameAsService ? {
                  line1: serviceAddress.address1,
                  city: serviceAddress.city,
                  state: serviceAddress.state,
                  postal_code: serviceAddress.zip5,
                  country: 'US', // Assuming US
              } : {
                  // TODO: Get billing address from separate fields if checkbox unchecked
                  line1: '', city: '', state: '', postal_code: '', country: 'US',
              }
          };

          // Confirm the payment
          // ** FIX: Moved redirect: 'always' outside confirmParams **
          const { error: submitError, paymentIntent } = await stripe.confirmPayment({
              elements,
              clientSecret,
              confirmParams: {
                  // Return URL is where the customer is redirected after payment
                  return_url: '${window.location.origin}/payment-confirmation', // ** ADJUST CONFIRMATION URL **
                  payment_method_data: {
                      billing_details: billingDetails
                  },
                  // Shipping details can mirror billing or service address
                   shipping: { // Often required by Stripe for physical goods/services tied to location
                      name: billingDetails.name || userEmail, // Use email if name isn't collected
                      address: {
                          line1: serviceAddress.address1,
                          city: serviceAddress.city,
                          state: serviceAddress.state,
                          postal_code: serviceAddress.zip5,
                          country: 'US',
                      }
                  }
              }, // End confirmParams
              redirect: 'always' // Correctly placed here
          }); // End confirmPayment call

          // Handle Payment Confirmation Results
          if (submitError) {
              console.error("Stripe confirmation error:", submitError);
              setErrorMessage(submitError.message || 'An unexpected error occurred during payment.');
              setLoading(false);
              return; // Semicolon added
          }

          // If redirect: 'if_required' was used and payment succeeded without redirect:
          if (paymentIntent && paymentIntent.status === 'succeeded') {
              console.log('Payment succeeded without redirect:', paymentIntent);
              setErrorMessage('Payment Successful!'); // Example success message
              if (submitBtn) submitBtn.disabled = true; // Semicolon added
          } else if (paymentIntent) {
              console.log('Payment Intent status:', paymentIntent.status);
              setErrorMessage('Payment status: ' + ${paymentIntent.status} + '. You might be redirected.');
          }

          setLoading(false); // Re-enable button if there was an error and no redirect
      } // End handlePaymentSubmit

      function handleApplyCoupon() {
          if (!couponInput || !applyCouponBtn) return; // Add null checks

          const code = couponInput.value.trim();
          if (!code) {
              setCouponFeedback('Please enter a coupon code.', 'error');
              return; // Semicolon added
          }
          setCouponFeedback('⏳ Applying coupon...', 'info');
          applyCouponBtn.disabled = true;

          // --- TODO: Implement Coupon API Call ---
          // Placeholder:
          setTimeout(() => {
              if (code.toUpperCase() === 'BINBUCKS5') {
                   setCouponFeedback('✅ Coupon applied! (Example)', 'success');
                   // TODO: Update price display and potentially payment intent
              } else {
                   setCouponFeedback('❌ Invalid coupon code (Example)', 'error');
              }
              // Ensure button exists before enabling
              if (applyCouponBtn) applyCouponBtn.disabled = false;
          }, 1000);
      } // End handleApplyCoupon


      // --- Attach Event Listeners ---
      // Add null checks before adding listeners
      if (checkBtn) {
          checkBtn.addEventListener('click', handleCheckAvailability);
      }
      if (paymentForm) {
          paymentForm.addEventListener('submit', handlePaymentSubmit);
      }
      if (applyCouponBtn) {
          applyCouponBtn.addEventListener('click', handleApplyCoupon);
      }


      // Disable check button initially if fields are empty or button doesn't exist
      if (checkBtn) {
          checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
      }
      // Add input listeners only if inputs exist
      [address1Input, cityInput, stateInput, zip5Input].forEach(input => {
          if (input) {
              input.addEventListener('input', () => {
                  if (checkBtn) {
                     checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
                  }
                  // Reset payment form if address changes after validation
                  if (validatedAddress) {
                      setAddressFeedback('', 'info'); // Clear feedback
                      if (paymentForm) paymentForm.classList.add('hidden'); // Hide payment form
                      if (paymentElement) paymentElement.unmount(); // Unmount Stripe element
                      validatedAddress = null; // Reset validated state
                      clientSecret = null; // Clear client secret
                      if (submitBtn) submitBtn.disabled = true; // Disable submit
                      if (addressSection) addressSection.classList.remove('opacity-50', 'pointer-events-none'); // Re-enable address section visually
                      // Re-enable check button if fields are now filled
                      if (checkBtn) {
                          checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);
                      }
                  }
              });
          }
      });


      // --- Initial State ---
      setLoading(false); // Ensure button is interactive initially
      setErrorMessage('');
      setPaymentMessage('');
      setCouponFeedback('');

    })(); // End IIFE
  </script>
  `; // End template literal
}; // End export default
