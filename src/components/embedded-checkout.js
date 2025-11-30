// @ts-nocheck
export default (function (selectedProduct) {
    return "\n    <div class=\"max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6\">\n      <div class=\"md:flex\">\n        <div class=\"p-8\">\n          <div class=\"uppercase tracking-wide text-sm text-indigo-500 font-semibold\">".concat(selectedProduct.title, "</div>\n          <p class=\"mt-2 text-gray-500\">").concat(selectedProduct.description, "</p>\n          <div class=\"mt-4\">\n            <span class=\"text-3xl font-bold text-gray-900\">\n              ").concat(new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedProduct.currency || 'USD'
    }).format(selectedProduct.price), "\n            </span>\n          </div>\n        </div>\n      </div>\n      \n      <div id=\"embedded-checkout-container\" class=\"mt-6\">\n        <!-- Embedded Checkout will be mounted here -->\n      </div>\n      \n      <div id=\"error-message\" class=\"text-red-600 mt-4\"></div>\n    </div>\n  ");
});
