// @ts-nocheck
import { formatPrice } from "./utils";
/**
 * Render a checkout HTML snippet for a webinar/product.
 *
 * Accepts either a plain product object or a GrapesJS model (with `attributes`).
 */
export function renderWebinarCheckout(product) {
    if (product === void 0) { product = {}; }
    // Normalize GrapesJS model case
    var productData = product && product.attributes ? product.attributes : product;
    // Basic validation: require id, price and either title or name
    if (!productData ||
        !productData.id ||
        typeof productData.price === "undefined" ||
        (!productData.title && !productData.name)) {
        console.error("[HTML Template] Invalid product data", {
            input: product,
            extracted: productData,
            missing: {
                id: !productData || !productData.id,
                price: !productData || typeof productData.price === "undefined",
                title_or_name: !productData || (!productData.title && !productData.name),
            },
        });
        return '<div class="text-red-600">Error: Missing required product information</div>';
    }
    // Use the first image or a placeholder
    var imageUrl = "https://tailwindui.com/img/ecommerce-images/checkout-page-07-product-01.jpg";
    if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
        var firstImage = productData.images[0];
        if (typeof firstImage === "string" && (firstImage.startsWith("http") || firstImage.startsWith("/"))) {
            imageUrl = firstImage;
        }
    }
    var formattedPrice = formatPrice(productData.price, productData.currency);
    var buttonText = productData.price > 0 ? "Pay ".concat(formattedPrice) : "Get Access";
    var title = productData.title || productData.name || "Product Name";
    var description = productData.description || "Product Description";
    // Return the HTML structure
    return "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<!-- Background color split screen for large screens -->\n<div class=\"fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block\" aria-hidden=\"true\"></div>\n<div class=\"fixed right-0 top-0 hidden h-full w-1/2 bg-indigo-900 lg:block\" aria-hidden=\"true\"></div>\n\n<div class=\"relative mx-auto grid grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8\">\n  <h1 class=\"sr-only\">Checkout</h1>\n\n  <section aria-labelledby=\"summary-heading\" class=\"bg-indigo-900 pb-12 pt-6 text-indigo-300 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pb-24 lg:pt-0\">\n    <div class=\"mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0\">\n      <h2 id=\"summary-heading\" class=\"sr-only\">Order summary</h2>\n\n      <dl>\n        <dt class=\"text-sm font-medium\">Amount due</dt>\n        <dd class=\"mt-1 text-3xl font-bold tracking-tight text-white\">".concat(formattedPrice, "</dd>\n      </dl>\n\n      <ul role=\"list\" class=\"divide-y divide-white divide-opacity-10 text-sm font-medium\">\n        <li class=\"flex items-start space-x-4 py-6\">\n          <img src=\"").concat(imageUrl, "\" alt=\"").concat(title, "\" class=\"h-20 w-20 flex-none rounded-md object-cover object-center border border-gray-200\">\n          <div class=\"flex-auto space-y-1\">\n            <h3 class=\"text-white\">").concat(title, "</h3>\n            <p>").concat(description, "</p>\n          </div>\n          <p class=\"flex-none text-base font-medium text-white\">").concat(formattedPrice, "</p>\n        </li>\n      </ul>\n\n      <dl class=\"space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium\">\n         <!-- TODO: Subtotal, Shipping, Taxes should be calculated server-side or based on Payment Intent details -->\n        <div class=\"flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white\">\n          <dt class=\"text-base\">Total</dt>\n          <dd class=\"text-base\">").concat(formattedPrice, "</dd>\n        </div>\n      </dl>\n    </div>\n  </section>\n\n  <section aria-labelledby=\"payment-and-shipping-heading\" class=\"py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pb-24 lg:pt-0\">\n    <h2 id=\"payment-and-shipping-heading\" class=\"sr-only\">Payment and shipping details</h2>\n\n    <form id=\"payment-form\">\n      <div class=\"mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0\">\n        <div>\n          <h3 id=\"contact-info-heading\" class=\"text-lg font-medium text-gray-900\">Contact information</h3>\n\n          <div class=\"mt-6\">\n            <label for=\"email-address\" class=\"block text-sm font-medium text-gray-700\">Email address</label>\n            <div class=\"mt-1\">\n              <input type=\"email\" id=\"email-address\" name=\"email-address\" autocomplete=\"email\" required class=\"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm\">\n            </div>\n          </div>\n        </div>\n\n        <div class=\"mt-10\">\n          <h3 id=\"payment-heading\" class=\"text-lg font-medium text-gray-900\">Payment details</h3>\n          <p class=\"mt-1 text-sm text-gray-500\">Enter your payment information below.</p>\n          <div class=\"mt-6\" id=\"payment-element\">\n            <!-- Stripe Payment Element will be inserted here -->\n          </div>\n        </div>\n\n        <div class=\"mt-10\">\n          <h3 id=\"shipping-heading\" class=\"text-lg font-medium text-gray-900\">Shipping address</h3>\n           <p class=\"mt-1 text-sm text-gray-500\">Enter the address where you'd like to receive your order.</p>\n          <div class=\"mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3\">\n            <div class=\"sm:col-span-3\">\n              <label for=\"address\" class=\"block text-sm font-medium text-gray-700\">Address</label>\n              <div class=\"mt-1\">\n                <input type=\"text\" id=\"address\" name=\"address\" autocomplete=\"street-address\" required class=\"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm\">\n              </div>\n            </div>\n\n            <div>\n              <label for=\"city\" class=\"block text-sm font-medium text-gray-700\">City</label>\n              <div class=\"mt-1\">\n                <input type=\"text\" id=\"city\" name=\"city\" autocomplete=\"address-level2\" required class=\"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm\">\n              </div>\n            </div>\n\n            <div>\n              <label for=\"region\" class=\"block text-sm font-medium text-gray-700\">State / Province</label>\n              <div class=\"mt-1\">\n                <input type=\"text\" id=\"region\" name=\"region\" autocomplete=\"address-level1\" required class=\"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm\">\n              </div>\n            </div>\n\n            <div>\n              <label for=\"postal-code\" class=\"block text-sm font-medium text-gray-700\">Postal code</label>\n              <div class=\"mt-1\">\n                <input type=\"text\" id=\"postal-code\" name=\"postal-code\" autocomplete=\"postal-code\" required class=\"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm\">\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"mt-10\">\n          <h3 class=\"text-lg font-medium text-gray-900\">Billing information</h3>\n\n          <div class=\"mt-6 flex items-center\">\n            <input id=\"same-as-shipping\" name=\"same-as-shipping\" type=\"checkbox\" checked class=\"h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500\">\n            <div class=\"ml-2\">\n              <label for=\"same-as-shipping\" class=\"text-sm font-medium text-gray-900\">Same as shipping information</label>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"mt-10 flex justify-end border-t border-gray-200 pt-6\">\n          <button type=\"submit\" id=\"submit-button\" class=\"rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50\">").concat(buttonText, "</button>\n        </div>\n        <div id=\"error-message\" class=\"mt-4 text-sm text-red-600 text-right\"></div>\n      </div>\n    </form>\n  </section>\n</div>\n");
}
// Export as default for compatibility with existing imports
export default renderWebinarCheckout;
