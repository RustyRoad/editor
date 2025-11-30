import { ServiceData } from "./modal-ui";

declare global {
    interface Window {
        trackEvent?: (eventName: string, properties?: Record<string, any>) => void;
    }
}

export function setupAddressValidation(modal: HTMLDialogElement, serviceData: ServiceData) {
    const address1Input = modal.querySelector<HTMLInputElement>('#address1');
    const cityInput = modal.querySelector<HTMLInputElement>('#city');
    const stateInput = modal.querySelector<HTMLInputElement>('#state');
    const zip5Input = modal.querySelector<HTMLInputElement>('#zip5');
    const checkBtn = modal.querySelector<HTMLButtonElement>('#check-availability');
    const addressFeedbackDiv = modal.querySelector<HTMLDivElement>('#address-feedback');
    const emailInput = modal.querySelector<HTMLInputElement>('#email');
    const firstNameInput = modal.querySelector<HTMLInputElement>('#first-name');
    const lastNameInput = modal.querySelector<HTMLInputElement>('#last-name');
    const subscribeToMarketing = modal.querySelector<HTMLInputElement>('#subscribe_to_marketing');
    const trashDaySelect = modal.querySelector<HTMLSelectElement>('#trash-day');
    const numberOfBinsInput = modal.querySelector<HTMLInputElement>('#number-of-bins');



    function setAddressFeedback(msg: string, type = 'info') {
        if (!addressFeedbackDiv) return;
        addressFeedbackDiv.textContent = msg;
        addressFeedbackDiv.className = 'mt-3 text-sm font-medium'; // Reset classes
        switch (type) {
            case 'success':
                addressFeedbackDiv.classList.add('text-green-600', 'dark:text-green-400');
                break;
            case 'error':
                addressFeedbackDiv.classList.add('text-red-600', 'dark:text-red-400');
                break;
            case 'loading':
                addressFeedbackDiv.classList.add('text-blue-600', 'dark:text-blue-400');
                break;
            default:
                addressFeedbackDiv.classList.add('text-gray-600', 'dark:text-gray-300');
        }
    }

    // Attach event listener for address check
    if (checkBtn && addressFeedbackDiv) {
        checkBtn.addEventListener('click', async () => {
            if (!address1Input?.value.trim() || !cityInput?.value.trim() ||
                !stateInput?.value.trim() || !zip5Input?.value.trim() ||
                !emailInput?.value.trim() || !firstNameInput?.value.trim() ||
                !lastNameInput?.value.trim()) {
                setAddressFeedback('Please fill in all required fields including name, address, email, and preferred trash day.', 'error');
                return;
            }

            // Validate trash day selection
            const trashDay = trashDaySelect?.value;
            const validTrashDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (!trashDay || !validTrashDays.includes(trashDay)) {
                setAddressFeedback('Please select a valid trash day.', 'error');
                return;
            }

            const address = {
                line1: address1Input?.value.trim() || '',
                line2: null,
                city: cityInput?.value.trim() || '',
                state: stateInput?.value.trim() || '',
                postal_code: zip5Input?.value.trim() || '',
                country: "US"
            };

            setAddressFeedback('Checking availability... 1', 'loading');
            if (checkBtn) checkBtn.disabled = true;


            let additional_bins = numberOfBinsInput ? parseInt(numberOfBinsInput.value) - 2 : 0; // Assuming 2 is the default number of bins,
            window.additionalBins = additional_bins; // Store globally for potential use in modal


            try {
                const resp = await fetch('/api/geocode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address,
                        email: emailInput?.value.trim() || '',
                        trash_day: trashDay || '',
                        subscribe_to_marketing: subscribeToMarketing?.checked || false,
                        service_id: serviceData?.id || '',
                        location_type: 'manual' // Indicate this is manual address entry
                    })
                });

                if (!resp.ok) {
                    let errorMsg = `Address validation failed (${resp.status})`;
                    try {
                        const errorData = await resp.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch (e) {
                        console.error("Could not parse error response from /api/geocode");
                    }
                    throw new Error(errorMsg);
                }

                const data = await resp.json();
                console.log('Geocode response:', data);

                if (!data.inside_zone) {
                    setAddressFeedback('Sorry, service is not currently available at this address.', 'error');
                    if (checkBtn) checkBtn.disabled = false;
                    return;
                }

                if (!data.valid_trash_day) {
                    setAddressFeedback(`Trash day (${trashDay}) is not valid for this service area. Please check collection schedule or contact support.`, 'error');
                    if (checkBtn) checkBtn.disabled = false;
                    return;
                }

                setAddressFeedback(`Service available! ${data.next_service_day ? 'Next estimated service day: ' + data.next_service_day : ''}`, 'success');

                const nextServiceDayDisplay = modal.querySelector('#next-service-day-display');
                if (nextServiceDayDisplay && data.next_service_day) {
                    nextServiceDayDisplay.textContent = 'Next available service day: ' + data.next_service_day;
                }

                const analyticsData = {
                    event_id: data.address_id,
                    value: serviceData.price,
                    currency: serviceData.currency || 'USD',
                    items: [{ item_id: serviceData.id, price: serviceData.price, quantity: 1 }]
                };

                // Track successful address validation with business event
                window.trackEvent?.('address_entered', {
                    ...analyticsData,
                    step: 2,
                    address_type: 'shipping',
                    form_id: 'service-booking'
                });

                // Note: FindLocation event is now sent server-side for better reliability
                // The server sends this event when address validation succeeds

                // Unified e-commerce tracking
                window.trackEvent?.('add_to_cart', analyticsData);

                // After successful validation, redirect to checkout with the validated data
                setTimeout(() => {
                    const checkoutUrl = new URL('/checkout', window.location.origin);
                    checkoutUrl.searchParams.set('service_id', serviceData.id);
                    checkoutUrl.searchParams.set('address_id', data.address_id);
                    checkoutUrl.searchParams.set('email', emailInput?.value.trim() || '');
                    checkoutUrl.searchParams.set('first_name', firstNameInput?.value.trim() || '');
                    checkoutUrl.searchParams.set('last_name', lastNameInput?.value.trim() || '');
                    checkoutUrl.searchParams.set('trash_day', trashDay || '');

                    console.log('Redirecting to checkout:', checkoutUrl.toString());
                    window.location.href = checkoutUrl.toString();
                }, 2000); // 2 second delay to show success message

                return data; // Return the response data for further processing
            } catch (err) {
                console.error('Availability check error:', err);
                const message = err instanceof Error ? err.message : 'Unknown error';
                setAddressFeedback(`Error checking availability: ${message}`, 'error');
                if (checkBtn) checkBtn.disabled = false;
                throw err; // Re-throw for error handling in calling code
            }
        });
    } else {
        console.error("Could not find address check button or feedback div in modal.");
        throw new Error("Missing required elements for address validation");
    }
}
