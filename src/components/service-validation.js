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
  // Escape potential special characters in button text if necessary, though unlikely here
  const buttonText = service.price > 0 ? 'Pay ' + formattedPrice + ' & Schedule' : 'Complete Setup';

  // Note: Tailwind CSS is assumed to be loaded globally.
  // Construct HTML using string concatenation
  let htmlString = ''; // Initialize empty string

  htmlString += '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">';
  htmlString += '<div class="service-validation-container p-4 md:p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg" style="font-family: \'Poppins\', sans-serif;">'; // Escaped single quotes in style

  // Order Summary Section
  htmlString += '<div class="mb-6 pb-4 border-b border-gray-200">';
  htmlString += '<h2 class="text-xl font-bold text-gray-800 mb-3">Order Summary</h2>';
  htmlString += '<div class="flex items-start space-x-4">';
  htmlString += '<img src="' + imageUrl + '" alt="Service icon" class="h-16 w-16 flex-none rounded-md object-cover border border-gray-200" onerror="this.style.display=\'none\'" />'; // Escaped quotes in onerror
  htmlString += '<div class="flex-auto space-y-1">';
  htmlString += '<h3 class="text-gray-900 font-semibold">' + (service.title || 'Untitled Service') + '</h3>'; // Handle potential null title
  htmlString += '<p class="text-sm text-gray-600">' + (service.description || 'Service details not available.') + '</p>'; // Handle potential null description
  htmlString += '</div>';
  htmlString += '<p class="flex-none text-lg font-medium text-gray-900">' + formattedPrice + '</p>';
  htmlString += '</div>';
  htmlString += '<dl class="mt-4 space-y-1 text-sm font-medium text-gray-600">';
  htmlString += '<div class="flex items-center justify-between pt-2 text-gray-900">';
  htmlString += '<dt class="text-base font-semibold">Total</dt>';
  htmlString += '<dd class="text-base font-semibold">' + formattedPrice + '</dd>';
  htmlString += '</div>';
  htmlString += '</dl>';
  htmlString += '</div>'; // End Order Summary Section

  // Address Validation Section
  htmlString += '<div id="address-validation-section">';
  htmlString += '<h3 class="text-lg font-medium text-gray-900 mb-4">1. Check Service Availability</h3>';
  htmlString += '<div class="grid grid-cols-1 gap-4">';
  htmlString += '<div>';
  htmlString += '<label for="address1" class="block text-sm font-medium text-gray-700">Street Address</label>';
  htmlString += '<input type="text" id="address1" name="address1" required autocomplete="address-line1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />';
  htmlString += '</div>';
  htmlString += '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">';
  htmlString += '<div>';
  htmlString += '<label for="city" class="block text-sm font-medium text-gray-700">City</label>';
  htmlString += '<input type="text" id="city" name="city" required autocomplete="address-level2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />';
  htmlString += '</div>';
  htmlString += '<div>';
  htmlString += '<label for="state" class="block text-sm font-medium text-gray-700">State</label>';
  htmlString += '<input type="text" id="state" name="state" required autocomplete="address-level1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />';
  htmlString += '</div>';
  htmlString += '<div>';
  htmlString += '<label for="zip5" class="block text-sm font-medium text-gray-700">ZIP Code</label>';
  htmlString += '<input type="text" id="zip5" name="zip5" required autocomplete="postal-code" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />';
  htmlString += '</div>';
  htmlString += '</div>'; // End grid-cols-3
  htmlString += '</div>'; // End grid-cols-1 gap-4
  htmlString += '<button type="button" id="check-availability" class="mt-6 px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">';
  htmlString += 'Check Availability';
  htmlString += '</button>';
  htmlString += '<div id="address-feedback" class="mt-3 text-sm font-medium"></div>';
  htmlString += '</div>'; // End Address Validation Section

  // Payment Form Section
  htmlString += '<form id="payment-form" class="hidden mt-8 pt-6 border-t border-gray-200">';
  htmlString += '<h3 class="text-lg font-medium text-gray-900">2. Billing Information</h3>';
  htmlString += '<div class="mt-4">';
  htmlString += '<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>';
  htmlString += '<input type="email" id="email" name="email" autocomplete="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />';
  htmlString += '</div>';
  htmlString += '<h4 class="mt-6 text-md font-medium text-gray-800">Payment Details</h4>';
  htmlString += '<div class="mt-1 text-sm text-gray-500">Enter your payment information below.</div>';
  htmlString += '<div class="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50" id="payment-element-container">';
  htmlString += '<div id="payment-element"></div>';
  htmlString += '<div id="payment-message" class="hidden mt-2 text-sm text-red-600"></div>';
  htmlString += '</div>';
  htmlString += '<div class="mt-6">';
  htmlString += '<div class="flex items-center">';
  htmlString += '<input id="same-as-service" name="same-as-service" type="checkbox" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />';
  htmlString += '<label for="same-as-service" class="ml-2 block text-sm font-medium text-gray-900">Billing address is the same as service address</label>';
  htmlString += '</div>';
  htmlString += '</div>';
  htmlString += '<div class="mt-6">';
  htmlString += '<label for="coupon" class="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>';
  htmlString += '<div class="mt-1 flex rounded-md shadow-sm">';
  htmlString += '<input type="text" id="coupon" name="coupon" placeholder="Enter code" class="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />';
  htmlString += '<button type="button" id="apply-coupon-button" class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">';
  htmlString += 'Apply';
  htmlString += '</button>';
  htmlString += '</div>';
  htmlString += '<div id="coupon-feedback" class="mt-1 text-sm"></div>';
  htmlString += '</div>';
  htmlString += '<div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">';
  htmlString += '<button type="submit" id="submit-button" class="rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50" disabled>';
  htmlString += '<span id="button-text">' + buttonText + '</span>';
  htmlString += '<span id="spinner" class="hidden ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></span>';
  htmlString += '</button>';
  htmlString += '</div>';
  htmlString += '<div id="error-message" class="mt-4 text-sm text-red-600 text-right"></div>';
  htmlString += '</form>'; // End Payment Form Section
  htmlString += '</div>'; // End Container

  // Script Tags
  htmlString += '<script src="https://js.stripe.com/v3/"></script>';
  htmlString += '<script>';
  // IIFE Start
  htmlString += '(function () {';
  // --- Configuration & State ---
  // Use JSON.stringify for the service data within the script
  htmlString += 'const serviceDataJson = ' + JSON.stringify(service || {}) + ';';
  htmlString += 'const serviceData = serviceDataJson;';
  htmlString += 'let stripe = null, elements = null, paymentElement = null, clientSecret = null, validatedAddress = null, stripePublishableKey = null;';

  // --- DOM Element References --- (Keep as is)
  htmlString += 'const container = document.querySelector(\'.service-validation-container\');';
  htmlString += 'if (!container) { console.error(\'Container not found\'); return; }';
  htmlString += 'const addressSection = container.querySelector(\'#address-validation-section\');';
  htmlString += 'const address1Input = container.querySelector(\'#address1\');';
  htmlString += 'const cityInput = container.querySelector(\'#city\');';
  htmlString += 'const stateInput = container.querySelector(\'#state\');';
  htmlString += 'const zip5Input = container.querySelector(\'#zip5\');';
  htmlString += 'const checkBtn = container.querySelector(\'#check-availability\');';
  htmlString += 'const addressFeedbackDiv = container.querySelector(\'#address-feedback\');';
  htmlString += 'const paymentForm = container.querySelector(\'#payment-form\');';
  htmlString += 'const emailInput = container.querySelector(\'#email\');';
  htmlString += 'const paymentElementContainer = container.querySelector(\'#payment-element-container\');';
  htmlString += 'const paymentElementDiv = container.querySelector(\'#payment-element\');';
  htmlString += 'const paymentMessageDiv = container.querySelector(\'#payment-message\');';
  htmlString += 'const couponInput = container.querySelector(\'#coupon\');';
  htmlString += 'const applyCouponBtn = container.querySelector(\'#apply-coupon-button\');';
  htmlString += 'const couponFeedbackDiv = container.querySelector(\'#coupon-feedback\');';
  htmlString += 'const submitBtn = container.querySelector(\'#submit-button\');';
  htmlString += 'const submitBtnText = container.querySelector(\'#button-text\');';
  htmlString += 'const submitSpinner = container.querySelector(\'#spinner\');';
  htmlString += 'const errorMessageDiv = container.querySelector(\'#error-message\');';

  // --- Helper Functions --- (Keep as is)
  htmlString += 'function setAddressFeedback(msg, type = \'info\') { if (!addressFeedbackDiv) return; addressFeedbackDiv.textContent = msg; addressFeedbackDiv.className = \'mt-3 text-sm font-medium\'; switch (type) { case \'success\': addressFeedbackDiv.classList.add(\'text-green-600\'); break; case \'error\': addressFeedbackDiv.classList.add(\'text-red-600\'); break; case \'loading\': addressFeedbackDiv.classList.add(\'text-blue-600\'); break; default: addressFeedbackDiv.classList.add(\'text-gray-600\'); } }';
  htmlString += 'function setPaymentMessage(message) { if (!paymentMessageDiv) return; paymentMessageDiv.textContent = message; paymentMessageDiv.classList.toggle(\'hidden\', !message); }';
  htmlString += 'function setErrorMessage(message) { if (!errorMessageDiv) return; errorMessageDiv.textContent = message; errorMessageDiv.classList.toggle(\'hidden\', !message); }';
  htmlString += 'function setCouponFeedback(msg, type = \'info\') { if (!couponFeedbackDiv) return; couponFeedbackDiv.textContent = msg; couponFeedbackDiv.className = \'mt-1 text-sm\'; switch (type) { case \'success\': couponFeedbackDiv.classList.add(\'text-green-600\'); break; case \'error\': couponFeedbackDiv.classList.add(\'text-red-600\'); break; default: couponFeedbackDiv.classList.add(\'text-gray-600\'); } }';
  htmlString += 'function setLoading(isLoading) { if (!submitBtn || !submitSpinner || !submitBtnText) return; submitBtn.disabled = isLoading; submitSpinner.classList.toggle(\'hidden\', !isLoading); submitBtnText.style.visibility = isLoading ? \'hidden\' : \'visible\'; }';

  // --- Initialization Functions --- (Keep async/await and logic, just ensure strings are concatenated)
  htmlString += 'async function fetchStripeKey() { if (serviceData && serviceData.stripeKey) { return serviceData.stripeKey; } try { const response = await fetch(\'http://192.168.50.14/settings/stripe-api-key\'); if (!response.ok) throw new Error(\'Failed to fetch Stripe key\'); const data = await response.json(); return data?.stripe_api_key || null; } catch (err) { console.error(\'Error fetching Stripe key:\', err); return null; } }';
  htmlString += 'async function initializeStripeAndElements() { setLoading(true); setErrorMessage(\'\'); stripePublishableKey = await fetchStripeKey(); if (!stripePublishableKey) { setErrorMessage(\'Payment processing is currently unavailable. Missing configuration.\'); setLoading(false); return; } if (typeof Stripe === \'undefined\') { setErrorMessage(\'Stripe.js failed to load. Please check your connection or contact support.\'); setLoading(false); return; } stripe = Stripe(stripePublishableKey); try { const response = await fetch(\'http://192.168.50.14/api/stripe/create-payment-intent\', { method: \'POST\', headers: { \'Content-Type\': \'application/json\' }, body: JSON.stringify({ amount: serviceData.price, currency: serviceData.currency || \'usd\', serviceId: serviceData.id, metadata: { serviceTitle: serviceData.title } }) }); if (!response.ok) { let errorMsg = \'Failed to create payment intent\'; try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (parseError) { /* Ignore */ } throw new Error(errorMsg); } const { clientSecret: paymentIntentClientSecret } = await response.json(); clientSecret = paymentIntentClientSecret; if (!clientSecret) throw new Error(\'Missing client secret from server.\'); const appearance = { theme: \'stripe\', variables: { /* ... */ } }; elements = stripe.elements({ appearance, clientSecret }); paymentElement = elements.create(\'payment\'); if (paymentElementDiv) { paymentElement.mount(paymentElementDiv); } else { throw new Error(\'Payment element mount point not found.\'); } paymentElement.on(\'ready\', () => { if (submitBtn) submitBtn.disabled = false; setLoading(false); }); paymentElement.on(\'change\', (event) => { if (event.error) { setPaymentMessage(event.error.message); if (submitBtn) submitBtn.disabled = true; } else { setPaymentMessage(\'\'); } }); } catch (caughtError) { console.error(\'Stripe Elements initialization error:\', caughtError); let displayMessage = \'An unknown error occurred during payment setup.\'; if (caughtError instanceof Error) { displayMessage = caughtError.message; } else if (typeof caughtError === \'string\') { displayMessage = caughtError; } else if (caughtError && typeof caughtError === \'object\' && caughtError.message) { displayMessage = caughtError.message; } setErrorMessage(\'Payment setup failed: \' + displayMessage); setLoading(false); } }';

  // --- Event Handlers --- (Keep async/await and logic)
    // Note: The template literals `${missing}` and `${error.message || 'Unknown error'}` inside handleCheckAvailability were replaced with string concatenation.
  htmlString += 'async function handleCheckAvailability() { if (!address1Input || !cityInput || !stateInput || !zip5Input || !checkBtn) { console.error(\'Address input elements not found\'); setAddressFeedback(\'⚠️ Internal error: Missing address fields.\', \'error\'); return; } const address = { address1: address1Input.value.trim(), city: cityInput.value.trim(), state: stateInput.value.trim(), zip5: zip5Input.value.trim() }; setAddressFeedback(\'⏳ Checking availability...\', \'loading\'); checkBtn.disabled = true; setErrorMessage(\'\'); if (!address.address1 || !address.city || !address.state || !address.zip5) { const missing = [!address.address1 && \'Street Address\', !address.city && \'City\', !address.state && \'State\', !address.zip5 && \'ZIP Code\'].filter(Boolean).join(\', \'); setAddressFeedback(\'⚠️ Please fill in all address fields: \' + missing, \'error\'); checkBtn.disabled = false; return; } try { const resp = await fetch(\'http://192.168.50.14/api/geocode\', { method: \'POST\', headers:{\'Content-Type\':\'application/json\'}, body: JSON.stringify({address:{...address, address2:null, zip4:null}, zone_id:1}) }); if (!resp.ok) { let errorMsg=\'API error\'; try{const d=await resp.json(); errorMsg=d.error||errorMsg;}catch(e){} throw new Error(errorMsg); } const data = await resp.json(); if (data.inside_zone || data.in_service_area) { setAddressFeedback(\'✅ Address is in the service area!\', \'success\'); validatedAddress = address; localStorage.setItem("validatedAddress", JSON.stringify(address)); if (addressSection) addressSection.classList.add(\'opacity-50\', \'pointer-events-none\'); checkBtn.disabled = true; if (paymentForm) paymentForm.classList.remove(\'hidden\'); await initializeStripeAndElements(); } else if (data.invalid_address || data.invalid_zip) { setAddressFeedback(\'❌ Address appears invalid.\', \'error\'); } else if (data.outside_zone || (data.hasOwnProperty(\'in_service_area\') && !data.in_service_area)) { setAddressFeedback(\'❌ Address outside service area.\', \'error\'); } else if (data.error) { setAddressFeedback(\'❌ Validation Error: \' + data.error, \'error\'); } else { setAddressFeedback(\'❌ Could not validate address.\', \'error\'); } } catch (error) { console.error(\'Error checking address:\', error); setAddressFeedback(\'❌ Error checking address: \' + (error.message || \'Unknown error\'), \'error\'); } finally { if (!validatedAddress && checkBtn) { checkBtn.disabled = false; } } }';
  htmlString += 'async function handlePaymentSubmit(event) { event.preventDefault(); setLoading(true); setErrorMessage(\'\'); setPaymentMessage(\'\'); if (!stripe || !elements || !clientSecret) { setErrorMessage(\'Payment system not ready.\'); setLoading(false); return; } const userEmail = emailInput ? emailInput.value.trim() : \'\'; if (!userEmail) { setErrorMessage(\'Please enter email.\'); if(emailInput) emailInput.focus(); setLoading(false); return; } const serviceAddress = validatedAddress; if (!serviceAddress) { setErrorMessage(\'Service address validation missing.\'); setLoading(false); return; } const sameAsServiceCheckbox = container.querySelector(\'#same-as-service\'); const billingSameAsService = sameAsServiceCheckbox ? sameAsServiceCheckbox.checked : true; let billingDetails = { email: userEmail, name: \'\', address: billingSameAsService ? { line1: serviceAddress.address1, city: serviceAddress.city, state: serviceAddress.state, postal_code: serviceAddress.zip5, country: \'US\' } : { line1: \'\', city: \'\', state: \'\', postal_code: \'\', country: \'US\' } }; const { error: submitError, paymentIntent } = await stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url: window.location.origin + \'/payment-confirmation\', payment_method_data: { billing_details: billingDetails }, shipping: { name: billingDetails.name || userEmail, address: { line1: serviceAddress.address1, city: serviceAddress.city, state: serviceAddress.state, postal_code: serviceAddress.zip5, country: \'US\' } } }, redirect: \'always\' }); if (submitError) { console.error("Stripe confirmation error:", submitError); setErrorMessage(submitError.message || \'Payment error.\'); setLoading(false); return; } if (paymentIntent && paymentIntent.status === \'succeeded\') { console.log(\'Payment succeeded w/o redirect:\', paymentIntent); setErrorMessage(\'Payment Successful!\'); if(submitBtn) submitBtn.disabled = true; } else if (paymentIntent) { console.log(\'Payment Intent status:\', paymentIntent.status); setErrorMessage(\'Payment status: \' + paymentIntent.status); } setLoading(false); }';
  htmlString += 'function handleApplyCoupon() { if (!couponInput || !applyCouponBtn) return; const code = couponInput.value.trim(); if (!code) { setCouponFeedback(\'Enter coupon code.\', \'error\'); return; } setCouponFeedback(\'⏳ Applying coupon...\', \'info\'); applyCouponBtn.disabled = true; setTimeout(() => { if (code.toUpperCase() === \'BINBUCKS5\') { setCouponFeedback(\'✅ Coupon applied! (Example)\', \'success\'); } else { setCouponFeedback(\'❌ Invalid coupon code (Example)\', \'error\'); } if (applyCouponBtn) applyCouponBtn.disabled = false; }, 1000); }';

  // --- Attach Event Listeners & Initial State --- (Keep as is)
  htmlString += 'if (checkBtn) checkBtn.addEventListener(\'click\', handleCheckAvailability);';
  htmlString += 'if (paymentForm) paymentForm.addEventListener(\'submit\', handlePaymentSubmit);';
  htmlString += 'if (applyCouponBtn) applyCouponBtn.addEventListener(\'click\', handleApplyCoupon);';
  htmlString += 'if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value);';
  htmlString += '[address1Input, cityInput, stateInput, zip5Input].forEach(input => { if (input) { input.addEventListener(\'input\', () => { if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value); if (validatedAddress) { setAddressFeedback(\'\', \'info\'); if (paymentForm) paymentForm.classList.add(\'hidden\'); if (paymentElement) { try { paymentElement.unmount(); } catch(e) { console.warn("Error unmounting payment element:", e); } } validatedAddress = null; clientSecret = null; if (submitBtn) submitBtn.disabled = true; if (addressSection) addressSection.classList.remove(\'opacity-50\', \'pointer-events-none\'); if (checkBtn) checkBtn.disabled = !(address1Input?.value && cityInput?.value && stateInput?.value && zip5Input?.value); } }); } });';
  htmlString += 'setLoading(false); setErrorMessage(\'\'); setPaymentMessage(\'\'); setCouponFeedback(\'\');';

  // IIFE End
  htmlString += '})();';
  htmlString += '</script>';

  return htmlString; // Return the concatenated string
}; // End export default
