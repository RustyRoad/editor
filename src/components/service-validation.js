import { formatPrice } from './components';

export default (service = {}) => {
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
  <div class="service-validation p-6 max-w-md mx-auto bg-white rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900">Check Service Availability</h3>
    
    <div class="grid grid-cols-1 gap-4 mt-4">
      <div>
        <label for="address1" class="block text-sm font-medium text-gray-700">Street Address</label>
        <input type="text" id="address1" name="address1" required 
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700">City</label>
          <input type="text" id="city" name="city" required 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="state" class="block text-sm font-medium text-gray-700">State</label>
          <input type="text" id="state" name="state" required 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
      </div>
      <div>
        <label for="zip5" class="block text-sm font-medium text-gray-700">ZIP Code</label>
        <input type="text" id="zip5" name="zip5" required 
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
    </div>

    <button type="button" id="check-availability" 
            class="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
      Check Availability
    </button>
    <div id="address-feedback" class="mt-2 text-sm"></div>

    <div class="mt-6 pt-6 border-t border-gray-200">
      <p class="text-sm text-gray-500">Once validated, you can proceed to checkout</p>
    </div>
  </div>
  <script>
  const serviceDataJson = ${JSON.stringify(service)};
  (function () {
    const service = serviceDataJson;
    const container = document.querySelector('.service-validation');
    if (!container) return;
  
    const address1Input = container.querySelector('#address1');
    const cityInput = container.querySelector('#city');
    const stateInput = container.querySelector('#state');
    const zip5Input = container.querySelector('#zip5');
    const checkBtn = container.querySelector('#check-availability');
    const feedbackDiv = container.querySelector('#address-feedback');
  
    if (!checkBtn || !feedbackDiv) {
      console.error('Required elements not found');
      return;
    }
  
    function setFeedback(msg, color) {
      feedbackDiv.textContent = msg;
      feedbackDiv.style.color = color;
    }

    async function handleCheckAvailability() {
      const address = {
        address1: address1Input.value.trim(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        zip5: zip5Input.value.trim()
      };
  
      setFeedback('⏳ Checking...', '#2563eb');
  
      if (!address.address1 || !address.city || !address.state || !address.zip5) {
        const missingFields = [];
        if (!address.address1) missingFields.push('Street Address');
        if (!address.city) missingFields.push('City');
        if (!address.state) missingFields.push('State');
        if (!address.zip5) missingFields.push('ZIP Code');
  
        setFeedback("⚠️ Please fill in all fields: " + missingFields.join(', '), '#b91c1c');
        return;
      }
  
      try {
        const resp = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: {
              address1: address.address1,
              address2: null,
              city: address.city,
              state: address.state,
              zip5: address.zip5,
              zip4: null
            },
            zone_id: 1
          })
        });
  
        if (!resp.ok) throw new Error('API error');
  
        const data = await resp.json();
        if (data.inside_zone) {
          setFeedback('✅ Address is valid for service', '#16a34a');
          localStorage.setItem("validatedAddress", JSON.stringify(address));
          async function initStripeCheckout(containerEl, stripeKey, selectedService) {
            try {
              const stripe = await loadStripe(stripeKey);
              if (!stripe) throw new Error('Stripe failed to load');
              const checkout = await stripe.initEmbeddedCheckout({
                fetchClientSecret: async () => {
                  const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      productId: selectedService.id,
                      amount: selectedService.price
                    })
                  });
                  const { clientSecret } = await res.json();
                  return clientSecret;
                }
              });
              const container = containerEl.querySelector('#embedded-checkout-container');
              if (container) checkout.mount(container);
            } catch (error) {
              console.error('Stripe checkout error:', error);
            }
          }
          initStripeCheckout(container, service.stripeKey, service);
          setSubmitEnabled(true);
        } else if (data.invalid_address) {
          setFeedback('❌ Address is invalid', '#b91c1c');
        }
        else if (data.invalid_zip) {
          setFeedback('❌ ZIP code is invalid', '#b91c1c');
        } else if (data.error) {
          setFeedback('❌ Address is not valid for service', '#b91c1c');
        } else if (data.outside_zone) {
          setFeedback('❌ Address is not serviceable', '#b91c1c');
  
        } else {
          setFeedback('❌ Address validation failed', '#b91c1c');
        }
      }
      catch (error) {
        console.error('Error checking address:', error);
        setFeedback('❌ Error checking address', '#b91c1c');
      }
    }
  
  
    checkBtn.addEventListener('click', handleCheckAvailability);
  
    address1Input.addEventListener('input', function () {
      setFeedback('', '');
      setSubmitEnabled(false);
    });
  })();
  </script>
  `;
};