// @ts-nocheck

export default () => `
  <div id="address-validation-section">
    <h3 class="text-lg font-medium text-gray-900 mb-4">1.3 Check Service Availability</h3>
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

    <div class="mt-4">
      <label for="additional-bin" class="inline-flex items-center">
        <input type="checkbox" id="additional-bin" name="additional-bin"
               class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-gray-700">Add an additional bin</span>
      </label>
    </div>

    <button type="button" id="check-availability"
            class="mt-6 px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
      Check Availability
    </button>
    <div id="address-feedback" class="mt-3 text-sm font-medium"></div>
  </div>
`;
