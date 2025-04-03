export default (selectedProduct) => {
  return `
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
      <div class="md:flex">
        <div class="p-8">
          <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">${selectedProduct.title}</div>
          <p class="mt-2 text-gray-500">${selectedProduct.description}</p>
          <div class="mt-4">
            <span class="text-3xl font-bold text-gray-900">
              ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: selectedProduct.currency || 'USD'
              }).format(selectedProduct.price)}
            </span>
          </div>
        </div>
      </div>
      
      <div id="embedded-checkout-container" class="mt-6">
        <!-- Embedded Checkout will be mounted here -->
      </div>
      
      <div id="error-message" class="text-red-600 mt-4"></div>
    </div>
  `;
};