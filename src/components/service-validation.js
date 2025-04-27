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
`;
};