let stripe;
let elements;
let paymentElement;
let clientSecret;

export async function fetchStripeKey(serviceData) {
    if (serviceData && serviceData.stripeKey) {
        return serviceData.stripeKey;
    }
    try {
        const response = await fetch('/settings/stripe-api-key');
        if (!response.ok) throw new Error(`Failed to fetch Stripe key (${response.status})`);
        const data = await response.json();
        if (!data?.stripe_api_key) throw new Error('Stripe key not found in response');
        return data.stripe_api_key;
    } catch (err) {
        console.error('Error fetching Stripe key:', err);
        throw err;
    }
}

export async function initializeStripeElements(modal, serviceData, addressData) {
    if (!serviceData || !serviceData.id) {
        console.error('initializeStripeElements (payment-handler.js): serviceData or serviceData.id is missing.', { serviceData, modal, addressData });
        if (modal && typeof modal.querySelector === 'function') {
            const feedbackDiv = modal.querySelector('#address-feedback') || modal.querySelector('#payment-message') || modal.querySelector('.api-feedback-message');
            if (feedbackDiv) {
                feedbackDiv.textContent = 'Error: Product information is missing. Cannot proceed to payment.';
                feedbackDiv.style.color = 'red';
                if (feedbackDiv.classList.contains('hidden')) {
                    feedbackDiv.classList.remove('hidden');
                }
            }
            const checkAvailBtn = modal.querySelector('#check-availability');
            if (checkAvailBtn) checkAvailBtn.disabled = false;
            const scheduleBtn = modal.querySelector('#checkout-button');
            if (scheduleBtn) scheduleBtn.disabled = false;
        }
        return false; // Indicate failure
    }
    try {
        // Ensure emailInput and trashDaySelect are defined in this scope
        const emailInput = modal.querySelector('#email');
        const trashDaySelect = modal.querySelector('#trash-day');
        if (typeof Stripe === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const publishableKey = await fetchStripeKey(serviceData);
        if (!publishableKey) return false;

        stripe = Stripe(publishableKey);

        //     product_id: String,
        //         quantity: Option < u64 >,
        //             first_name: String,
        //                 last_name: String,
        //                     email: String,
        //                         address_id: u64,
        //                             trash_day: Option < String >,
        //                                 additional_bins: Option < u64 >,
        //                                     location: Option < DbPoint >
        // 



        // alert('Stripe initialized successfully.');

        try {
            const geocodeData = localStorage.getItem('geocode-data');
            if (geocodeData) {
                console.log('Geocode data found in local storage: payment handler', geocodeData);
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
        setPaymentMessage('Initializing payment...', 'loading');
        console.log('[5:35PM ] Initializing payment...');
        const sessionResponse = await fetch('/api/stripe/checkout-sessions', { // Ensure this endpoint is correct
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: String(serviceData.id), // Ensure ID is string
                first_name: modal.querySelector('#first-name')?.value || '',
                last_name: modal.querySelector('#last-name')?.value || '',
                email: emailInput ? emailInput.value.trim() : '', // Pass email for receipt/customer creation
                address_id: Number(window.lastValidatedAddressForModal.address_id), // Ensure address_id is a number
                trash_day: trashDaySelect ? trashDaySelect.value : '', // Pass trash day if needed
                additional_bins: window.additionalBins,
                location: window.lastValidatedAddressForModal.location
            })
        });
        if (!sessionResponse.ok) {
            let errorMsg = `Failed to initialize payment (${sessionResponse.status})`;
            try {
                const errorData = await sessionResponse.json();
                errorMsg = errorData.message || errorMsg;
            } catch (parseError) {
                console.error('Error parsing payment init error response:', parseError);
            }
            throw new Error(errorMsg);
        }

        const responseData = await sessionResponse.json();
        console.log('Stripe init response:', responseData);

        clientSecret = responseData.client_secret;
        if (!clientSecret) {
            throw new Error('Missing client_secret from payment initialization response.');
        }

        // Store next service day for later use in payment confirmation
        window.nextServiceDay = responseData.next_service_day;

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

        // Update order summary with tax and totals
        const taxAmount = responseData.tax_amount ?? 0;
        const serviceAmount = responseData.service_amount ?? 0;
        const additionalBinAmount = responseData.additional_bin_amount ?? 0;
        const subtotal = responseData.subtotal ?? serviceAmount + additionalBinAmount;
        const amountTotal = responseData.total ?? responseData.amount_total ?? 0;
        const currency = serviceData.currency || 'USD';

        const formatOrderPrice = (amount) => {
            const numAmount = Number(amount) / 100;
            if (isNaN(numAmount)) return 'N/A';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(numAmount);
        };

        const orderSummaryList = modal.querySelector('#order-summary-list');
        if (orderSummaryList) {
            const baseBins = 2;
            const additionalCount = window.additionalBins || 0;
            const additionalPricePer = additionalCount > 0 ? additionalBinAmount / additionalCount : 0;

            orderSummaryList.innerHTML = `
        <div class="flex items-center justify-between pt-1">
          <dt>Service (${baseBins} bins included)</dt>
          <dd>${formatOrderPrice(serviceAmount)}</dd>
        </div>
        ${additionalCount > 0 ? `
          <div class="flex items-center justify-between pt-1">
            <dt>Additional bins (${additionalCount} at ${formatOrderPrice(additionalPricePer)} each)</dt>
            <dd>${formatOrderPrice(additionalBinAmount)}</dd>
          </div>` : ''}
        <div class="flex items-center justify-between pt-1">
          <dt>Subtotal</dt>
          <dd>${formatOrderPrice(subtotal)}</dd>
        </div>
        <div class="flex items-center justify-between pt-1">
          <dt>Tax</dt>
          <dd>${formatOrderPrice(taxAmount)}</dd>
        </div>
        <div class="flex items-center justify-between pt-1 font-semibold text-gray-900 dark:text-gray-100">
          <dt>Total</dt>
          <dd>${formatOrderPrice(amountTotal)}</dd>
        </div>
      `;
        }

        // Ensure payment section and element exist before mounting Stripe payment element
        const paymentSection = modal.querySelector('#payment-section');
        if (paymentSection) {
            paymentSection.classList.remove('hidden');
            if (!paymentSection.querySelector('#payment-element')) {
                paymentSection.innerHTML = `
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">2. Billing Information</h3>
                    <form id="payment-form">
                        <div id="payment-element" class="mb-4"></div>
                        <button id="submit-button" class="w-full rounded-md bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 disabled:opacity-50">Submit Payment</button>
                        <div id="payment-message" class="hidden mt-2 text-sm text-red-600 dark:text-red-400"></div>
                    </form>
                `;
            }
        }

        // Initialize Stripe Elements
        elements = stripe.elements({
            clientSecret: clientSecret,
            appearance: {
                theme: 'stripe',
                variables: { colorPrimary: '#2563eb' }
            }
        });

        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        return true;
    } catch (err) {
        console.error('Stripe initialization failed:', err);
        throw err;
    }
}

export async function handlePaymentSubmit(event, modal) {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
        throw new Error('Stripe not initialized for payment submission.');
    }

    const submitBtn = modal.querySelector('#submit-button');

    const paymentMsgDiv = modal.querySelector('#payment-message');

    submitBtn.disabled = true;
    setPaymentMessage('Processing payment...', 'loading');

    const billingDetails = {
        name: `${modal.querySelector('#first-name')?.value || ''} ${modal.querySelector('#last-name')?.value || ''}`.trim(),
        email: localStorage.getItem('geocode-data') ? JSON.parse(localStorage.getItem('geocode-data')).email : '',
    };

    // Build return URL with next service day if available
    let returnUrl = window.location.origin + '/thank-you';
    if (window.nextServiceDay) {
        returnUrl += `?next_service_day=${encodeURIComponent(window.nextServiceDay)}`;
    }

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: returnUrl,
            receipt_email: billingDetails.email,
            payment_method_data: {
                billing_details: billingDetails
            },
        },
    });

    if (error) {
        console.error('Stripe confirmPayment error:', error);
        setPaymentMessage(error.message || 'An unexpected error occurred.', 'error');
        submitBtn.disabled = false;
        throw error;
    } else {
        // Track successful purchase
        if (window.trackEvent) {
            window.trackEvent('purchase', {
                transaction_id: clientSecret.split('_secret')[0],
                value: responseData?.amount_total || amountTotal,
                currency: responseData?.currency || 'USD',
                tax: taxAmount,
                shipping: 0,
                items: [{
                    item_id: String(serviceData?.id),
                    name: serviceData?.name || 'Service',
                    price: serviceAmount,
                    quantity: 1
                }]
            });
        }

        setPaymentMessage('Payment successful! Redirecting...', 'success');
    }
}

function setPaymentMessage(msg, type = 'info') {
    const paymentMsgDiv = document.querySelector('#payment-message');
    if (!paymentMsgDiv) return;

    paymentMsgDiv.textContent = msg;
    paymentMsgDiv.className = 'mt-2 text-sm'; // Reset classes
    switch (type) {
        case 'success':
            paymentMsgDiv.classList.add('text-green-600', 'dark:text-green-400');
            break;
        case 'error':
            paymentMsgDiv.classList.add('text-red-600', 'dark:text-red-400');
            break;
        case 'loading':
            paymentMsgDiv.classList.add('text-blue-600', 'dark:text-blue-400');
            break;
        default:
            paymentMsgDiv.classList.add('text-gray-600', 'dark:text-gray-300');
    }
    paymentMsgDiv.classList.remove('hidden');
}
