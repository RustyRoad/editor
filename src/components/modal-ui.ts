import { LocationService } from '../services/locationService'; // initLocationService is not called directly here anymore

// Helper function for formatting price
interface PriceFormatOptions {
  style: 'currency';
  currency: string;
}

export function formatPrice(amount: number | string, currency: string): string {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    } as PriceFormatOptions).format(numAmount);
  } catch (e: any) {
    console.warn(`Modal formatPrice error: ${e.message}`);
    const currencySymbol = (currency || 'usd').toLowerCase() === 'usd' ? '$' : ((currency || 'USD').toUpperCase() + ' ');
    return `${currencySymbol}${numAmount.toFixed(2)}`;
  }
}

// Generate modal HTML content
export interface ServiceData {
  id: string;
  stripe_product_id: string;
  price: number;
  currency?: string;
  images?: string[];
  name: string;
  description?: string;
  stripeKey?: string; // Added optional stripeKey
}

export function generateModalHTML(serviceData: ServiceData): string {
  const formattedPrice: string = formatPrice(serviceData.price, serviceData.currency || 'usd');
  const buttonText: string = Number(serviceData.price) > 0 ? `Pay ${formattedPrice} & Schedule` : 'Complete Setup';
  const imageUrl: string = serviceData.images?.[0] || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Icon';

  return `
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
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
          <img src="${imageUrl}" alt="Service icon" class="h-16 w-16 flex-none rounded-lg object-cover border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" onerror="this.src='https://placehold.co/64x64/e2e8f0/94a3b8?text=Icon'; this.onerror=null;">
          <div class="flex-auto space-y-1">
            <h3 class="text-gray-900 dark:text-gray-100 font-semibold text-lg leading-tight">${serviceData.name}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${serviceData.description || 'Service details not available.'}</p>
          </div>
          <p class="flex-none text-lg font-semibold text-gray-900 dark:text-gray-100">${formattedPrice}</p>
        </div>
        <dl id="order-summary-list" class="mt-3 space-y-1 text-sm font-medium text-gray-700 dark:text-gray-300"></dl>
        <div id="next-service-day-display" class="mt-3 text-sm font-medium text-green-600 dark:text-green-400"></div>
      </div>
              <div id="mapContainer" style="height: 300px; width: 100%; margin-bottom: 20px; border-radius: 8px; border: 1px solid #e2e8f0;"></div>
        <!-- Address validation form content will be inserted here by service-modal.js -->
      <div id="address-validation-section">
      </div>
      <div id="payment-section" class="hidden mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <!-- Payment form will be inserted here -->
      </div>
    </div>
  `;
}

// Generates only the HTML for the address form fields.
// Map initialization and prefilling are handled by finalizeAddressFormAndMap in locationService.js
export function generateAddressFormHTML(serviceData: ServiceData) {
  console.log("generateAddressFormHTML: Generating basic form structure.");
  const street = ''; // Will be prefilled by finalizeAddressFormAndMap
  const city = '';
  const state = '';
  const zip = '';

  return `
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">1.1 Check Service Availability</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Please enter your address to confirm service availability. We'll try to detect your location.</p>
    <form id="location-validation-form" action="/submit-location-validation" method="POST">
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label for="address1" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
        <input type="text" id="address1" name="address1" required autocomplete="address-line1"
          value="${street}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
          <input type="text" id="city" name="city" required autocomplete="address-level2"
            value="${city}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        </div>
        <div>
          <label for="state" class="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
          <input type="text" id="state" name="state" required autocomplete="address-level1"
            value="${state}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        </div>
        <div>
          <label for="zip5" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
          <input type="text" id="zip5" name="zip5" required autocomplete="postal-code"
            value="${zip}" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        </div>
      </div>
      <div>
        <label for="trash-day" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Trash Day</label>
        <select id="trash-day" name="trash_day" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
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
        <label for="number-of-bins" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Bins</label>
        <input type="number" id="number-of-bins" name="number_of_bins" required min="1" max="10" value="2" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="first-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
          <input type="text" id="first-name" name="first_name" required autocomplete="given-name" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        </div>
        <div>
          <label for="last-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
          <input type="text" id="last-name" name="last_name" required autocomplete="family-name" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        </div>
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input type="email" id="email" name="email" required autocomplete="email" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
      </div>
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
        <input type="tel" id="phone" name="phone" autocomplete="tel" placeholder="+1 (555) 123-4567" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional - for service reminders and updates</p>
      </div>
      <div id="sms-consent-container" class="hidden mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div class="flex items-start">
          <input type="checkbox" id="sms_consent" name="sms_consent" class="h-4 w-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
          <label for="sms_consent" class="ml-2 block text-xs text-gray-700 dark:text-gray-300">
            I agree to receive <strong>recurring</strong> service updates &amp; reminders from Spotless Bin Co. via SMS. <strong>Message &amp; data rates may apply.</strong> Reply <strong>STOP</strong> to cancel, <strong>HELP</strong> for help. See <a href="https://spotlessbinco.com/sms-terms" target="_blank" class="text-blue-600 hover:text-blue-700 underline">Mobile Terms</a> and <a href="https://spotlessbinco.com/privacy" target="_blank" class="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>. Consent not required for purchase.
          </label>
        </div>
      </div>
      <div id="marketing-optin-container" class="hidden mt-3 flex items-center">
        <input type="checkbox" id="subscribe_to_marketing" name="subscribe_to_marketing" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked>
        <label for="subscribe_to_marketing" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Subscribe to marketing emails</label>
      </div>
      <!-- Hidden field to pass service ID -->
      <input type="hidden" id="service_id" name="service_id" value="${"" + serviceData.id}">
    </div>
    <button type="button" id="check-availability" class="address-validation-btn mt-6 w-full px-5 py-3 rounded-md bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto">Check Availability</button>
    </form>
    <div id="address-feedback" class="address-validation-feedback mt-3 text-sm font-medium"></div>
    <script>
      console.log('[modal-ui.js inline script] Executing.');
      const scriptElement = document.currentScript;
      if (!scriptElement) {
        console.error('[modal-ui.js inline script] document.currentScript is null. This might prevent hostElement detection.');
      }
      // hostElement is the direct parent of this script tag, which should be the root div of generateAddressFormHTML's output.
      const hostElement = scriptElement ? scriptElement.parentElement : null; 
      
      if (!hostElement) {
        console.error('[modal-ui.js inline script] hostElement could not be determined. Script cannot reliably proceed.');
      } else {
        console.log('[modal-ui.js inline script] hostElement determined:', hostElement);
      }

      // Ensure hostElement is valid before querying
      const form = hostElement ? hostElement.querySelector('#location-validation-form') : null;
      const serviceIdInput = hostElement ? hostElement.querySelector('#service_id') : null;
      // The modal root is where serviceData is expected to be stored.
      const modalRoot = hostElement ? hostElement.closest('.modal-content-area') : null;
      if (hostElement && !modalRoot) {
        // This might happen if the structure assumptions are wrong, or if hostElement is not yet in the main DOM.
        console.warn('[modal-ui.js inline script] hostElement found, but modalRoot (.modal-content-area) could not be found by traversing up. Service data retrieval might fail.');
      }

      // Set the service ID from modal data
      if (serviceIdInput && modalRoot) {
        const serviceDataString = modalRoot.dataset.serviceData;
        if (serviceDataString) {
          try {
            const serviceData = JSON.parse(serviceDataString);
            serviceIdInput.value = serviceData.id || serviceData.stripe_product_id || '';
            console.log('[modal-ui.js inline script] Set service ID:', serviceIdInput.value);
          } catch (e) {
            console.error('[modal-ui.js inline script] Failed to parse serviceData:', e);
          }
        }
      }

      // SMS Consent Logic: Show checkbox when phone number is entered
      const phoneInput = hostElement ? hostElement.querySelector('#phone') : null;
      const smsConsentContainer = hostElement ? hostElement.querySelector('#sms-consent-container') : null;
      const smsConsentCheckbox = hostElement ? hostElement.querySelector('#sms_consent') : null;

      if (phoneInput && smsConsentContainer) {
        phoneInput.addEventListener('input', function() {
          const phoneValue = phoneInput.value.trim();
          if (phoneValue.length > 0) {
            smsConsentContainer.classList.remove('hidden');
          } else {
            smsConsentContainer.classList.add('hidden');
            if (smsConsentCheckbox) {
              smsConsentCheckbox.checked = false;
            }
          }
        });
      }

      // Ensure form submits as standard HTML form for TikTok browser compatibility
      // This makes sure the form submission works even if JavaScript is restricted
      if (form) {
        console.log('[modal-ui.js inline script] Setting up form for standard HTML submission (TikTok browser compatible)');
        
        // Add basic client-side validation but allow form submission to proceed
        form.addEventListener('submit', function(event) {
          console.log('[modal-ui.js inline script] Form submission detected - ensuring TikTok browser compatibility');
          
          // Basic validation - but don't prevent submission
          const requiredFields = form.querySelectorAll('input[required], select[required]');
          let hasEmptyRequired = false;
          
          requiredFields.forEach(field => {
            if (!field.value.trim()) {
              hasEmptyRequired = true;
              field.style.borderColor = '#ef4444'; // Red border for missing fields
            } else {
              field.style.borderColor = ''; // Reset border
            }
          });
          
          // SMS Consent validation: If phone is provided, SMS consent must be checked
          const phoneValue = phoneInput ? phoneInput.value.trim() : '';
          const smsConsented = smsConsentCheckbox ? smsConsentCheckbox.checked : false;
          
          if (phoneValue.length > 0 && !smsConsented) {
            hasEmptyRequired = true;
            if (smsConsentContainer) {
              smsConsentContainer.style.borderColor = '#ef4444';
            }
            const feedback = hostElement.querySelector('#address-feedback');
            if (feedback) {
              feedback.textContent = 'Please check the SMS consent checkbox to receive service updates via text message.';
              feedback.className = 'mt-3 text-sm font-medium text-red-600';
            }
            event.preventDefault();
            return;
          } else if (smsConsentContainer) {
            smsConsentContainer.style.borderColor = '';
          }
          
          if (hasEmptyRequired) {
            const feedback = hostElement.querySelector('#address-feedback');
            if (feedback) {
              feedback.textContent = 'Please fill in all required fields.';
              feedback.className = 'mt-3 text-sm font-medium text-red-600';
            }
            event.preventDefault(); // Only prevent if required fields are missing
            return;
          }
          
          // For TikTok browser: Let the form submit normally to server
          // The server will handle validation and redirect to checkout
          console.log('[modal-ui.js inline script] Allowing form to submit to server for TikTok browser compatibility');
        });
      }

      // Timer for finalizeAddressFormAndMap (optional map functionality)
      let finalizeMapTimerId = null;

      // Deferred call to finalizeAddressFormAndMap for map initialization or other tasks.
      if (hostElement) { // Only set up this timer if hostElement is valid
        console.log('[modal-ui.js inline script] Setting up setTimeout for finalizeAddressFormAndMap.');
        finalizeMapTimerId = setTimeout(() => {
          console.log('[modal-ui.js inline script] setTimeout callback for finalizeAddressFormAndMap triggered.');
          finalizeMapTimerId = null; 
          if (typeof window.finalizeAddressFormAndMap === 'function') {
            // Check if hostElement is still part of the document.
            if (document.body.contains(hostElement)) {
              console.log('[modal-ui.js inline script] Calling window.finalizeAddressFormAndMap(). Context:', hostElement);
              window.finalizeAddressFormAndMap(hostElement);
            } else {
              console.log('[modal-ui.js inline script] hostElement for finalizeAddressFormAndMap is no longer in the document. Skipping call to finalizeAddressFormAndMap.');
            }
          } else {
            console.warn('[modal-ui.js inline script] window.finalizeAddressFormAndMap is not defined. Map/address prefill will not work.');
          }
        }, 250); // Delay to allow DOM to settle.
      } else {
        console.error('[modal-ui.js inline script] Cannot setup finalizeAddressFormAndMap timer because hostElement is invalid.');
      }
    </script>
  `;
}

// This function is now primarily for fallback if the script tag method fails or for manual calls.
// The main logic is moved to finalizeAddressFormAndMap in locationService.js
export async function generateAddressForm(modal: HTMLDialogElement, serviceData: ServiceData) { // Keep modal param for now if service-modal.js expects it
  console.warn("generateAddressForm (async) called. It now just returns HTML. Ensure service-modal.js uses the script tag for finalization.");
  return generateAddressFormHTML(serviceData); // generateAddressFormHTML does not use the modal param
}
