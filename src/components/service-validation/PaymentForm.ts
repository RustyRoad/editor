// @ts-nocheck

export default (buttonText) => `
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
`;
