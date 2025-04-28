// Helper function to format currency
const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD', // Default to USD
    }).format(amount);
  };
  
  export default (service = {}) => { // Synchronous, only needs service data
    // Basic validation
    if (!service.id || typeof service.price === 'undefined' || !service.title) {
      console.error("[Checkout Template] Invalid service data", { service });
      return '<div class="text-red-600">Error: Missing required service information</div>';
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
    const buttonText = service.price > 0 ? `Pay ${formattedPrice} & Schedule` : 'Get Started';
  
    return `
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  
  <div class="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block" aria-hidden="true"></div>
  <div class="fixed right-0 top-0 hidden h-full w-1/2 bg-blue-800 lg:block" aria-hidden="true"></div>
  
  <div class="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8" style="font-family: 'Poppins', sans-serif;">
    <h1 class="sr-only">Spotless Bin Co Checkout</h1>
  
    <!-- Summary -->
    <section aria-labelledby="summary-heading" class="bg-blue-800 pb-12 pt-6 text-blue-200 md:px-10 lg:col-start-2 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pb-24 lg:pt-0">
      <div class="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
        <h2 id="summary-heading" class="text-xl font-bold text-white">Order Summary</h2>
        <dl class="mt-4">
          <dt class="text-sm font-medium text-blue-200">Amount due</dt>
          <dd class="mt-1 text-3xl font-bold tracking-tight text-white">${formattedPrice}</dd>
        </dl>
        <ul role="list" class="divide-y divide-white divide-opacity-10 text-sm font-medium mt-6">
          <li class="flex items-start space-x-4 py-6">
            <img src="${imageUrl}" alt="Bin cleaning icon" class="h-20 w-20 flex-none rounded-md object-cover object-center border border-gray-200" />
            <div class="flex-auto space-y-1">
              <h3 class="text-white">${service.title}</h3>
              <p>${service.description || 'One-time Residential Bin Cleaning'}</p>
            </div>
            <p class="flex-none text-base font-medium text-white">${formattedPrice}</p>
          </li>
        </ul>
        <dl class="space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium">
          <div class="flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white">
            <dt class="text-base">Total</dt>
            <dd class="text-base">${formattedPrice}</dd>
          </div>
        </dl>
      </div>
    </section>
  
    <!-- Details -->
    <section aria-labelledby="details-heading" class="py-16 lg:col-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pb-24 lg:pt-0">
      <h2 id="details-heading" class="sr-only">Payment and Service Details</h2>
      <form id="payment-form">
        <div class="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
          <!-- Contact Info -->
          <h3 class="text-lg font-medium text-gray-900">Contact Information</h3>
          <label for="email" class="block mt-4 text-sm font-medium text-gray-700">Email address</label>
          <input type="email" id="email" name="email" autocomplete="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
  
          <!-- Payment -->
          <h3 class="mt-10 text-lg font-medium text-gray-900">Payment Details</h3>
          <div class="mt-4 text-sm text-gray-500">Enter your payment information below.</div>
          <div class="mt-6" id="payment-element"></div>
  
          <!-- Service Address -->
          <h3 class="mt-10 text-lg font-medium text-gray-900">Service Address</h3>
          <div class="mt-1 text-sm text-gray-500">Where should we clean?</div>
          <div class="grid grid-cols-1 gap-4 mt-2">
            <div>
              <label for="address1" class="block text-sm font-medium text-gray-700">Street Address</label>
              <input type="text" id="address1" name="address1" autocomplete="address-line1" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                <input type="text" id="city" name="city" autocomplete="address-level2" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700">State</label>
                <input type="text" id="state" name="state" autocomplete="address-level1" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label for="zip5" class="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input type="text" id="zip5" name="zip5" autocomplete="postal-code" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          <button type="button" id="check-availability" class="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Check Availability</button>
          <div id="address-feedback" class="mt-2 text-sm"></div>
  
          <!-- Billing same as service -->
          <div class="mt-10 flex items-center">
            <input id="same-as-shipping" name="same-as-shipping" type="checkbox" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label for="same-as-shipping" class="ml-2 text-sm font-medium text-gray-900">Service & Billing address same</label>
          </div>
  
          <!-- Coupon -->
          <div class="mt-10">
            <label for="coupon" class="block text-sm font-medium text-gray-700">Coupon Code</label>
            <div class="mt-1 flex">
              <input type="text" id="coupon" name="coupon" placeholder="BINBUCKS5" class="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              <button type="button" class="rounded-r-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Apply</button>
            </div>
          </div>
  
          <!-- Submit -->
          <div class="mt-10 flex justify-end border-t border-gray-200 pt-6">
            <button type="submit" id="submit-button" class="rounded-md bg-green-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" disabled>${buttonText}</button>
          </div>
          <div id="error-message" class="mt-4 text-sm text-red-600 text-right"></div>
        </div>
      </form>
    </section>
  </div>
  <script>
    (function() {
      const addressInput = document.getElementById('address1');
      const cityInput = document.getElementById('city');
      const stateInput = document.getElementById('state');
      const zipInput = document.getElementById('zip5');
      const checkBtn = document.getElementById('check-availability');
      const feedbackDiv = document.getElementById('address-feedback');
      const submitBtn = document.getElementById('submit-button');

      function setFeedback(msg, color) {
        feedbackDiv.textContent = msg;
        feedbackDiv.style.color = color;
      }

      function setSubmitEnabled(enabled) {
        if (enabled) {
          submitBtn.removeAttribute('disabled');
          submitBtn.classList.remove('opacity-50');
        } else {
          submitBtn.setAttribute('disabled', 'disabled');
          submitBtn.classList.add('opacity-50');
        }
      }

      setSubmitEnabled(false);

      checkBtn.addEventListener('click', async function() {
        const address = addressInput.value.trim();
        setFeedback('⏳ Checking...', '#2563eb');
        setSubmitEnabled(false);

        if (!address) {
          setFeedback('Please enter an address.', '#b91c1c');
          return;
        }

        try {
          const resp = await fetch('/api/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              street: addressInput.value.trim(),
              city: cityInput.value.trim(),
              state: stateInput.value.trim(),
              zip: zipInput.value.trim()
            })
          });
          if (!resp.ok) {
            throw new Error('API error');
          }
          const data = await resp.json();
          if (data.in_service_area) {
            setFeedback('✅ Address is in service area.', '#16a34a');
            setSubmitEnabled(true);
          } else {
            setFeedback('❌ Address is outside the service area.', '#b91c1c');
            setSubmitEnabled(false);
          }
        } catch (e) {
          setFeedback('⚠️ Could not verify address. Please check and try again.', '#b91c1c');
          setSubmitEnabled(false);
        }
      });

      addressInput.addEventListener('input', function() {
        setFeedback('', '');
        setSubmitEnabled(false);
      });
    })();
  </script>
  `;
  };
  
