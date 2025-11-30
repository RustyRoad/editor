// @ts-nocheck

import { formatPrice } from "./utils";

/**
 * Render a checkout HTML snippet for a webinar/product.
 *
 * Accepts either a plain product object or a GrapesJS model (with `attributes`).
 */
export function renderWebinarCheckout(product: any = {}): string {
	// Normalize GrapesJS model case
	const productData = product && product.attributes ? product.attributes : product;

	// Basic validation: require id, price and either title or name
	if (
		!productData ||
		!productData.id ||
		typeof productData.price === "undefined" ||
		(!productData.title && !productData.name)
	) {
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
	let imageUrl = "https://tailwindui.com/img/ecommerce-images/checkout-page-07-product-01.jpg";
	if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
		const firstImage = productData.images[0];
		if (typeof firstImage === "string" && (firstImage.startsWith("http") || firstImage.startsWith("/"))) {
			imageUrl = firstImage;
		}
	}

	const formattedPrice = formatPrice(productData.price, productData.currency);
	const buttonText = productData.price > 0 ? `Pay ${formattedPrice}` : "Get Access";
	const title = productData.title || productData.name || "Product Name";
	const description = productData.description || "Product Description";

	// Return the HTML structure
	return `<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Background color split screen for large screens -->
<div class="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block" aria-hidden="true"></div>
<div class="fixed right-0 top-0 hidden h-full w-1/2 bg-indigo-900 lg:block" aria-hidden="true"></div>

<div class="relative mx-auto grid grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8">
  <h1 class="sr-only">Checkout</h1>

  <section aria-labelledby="summary-heading" class="bg-indigo-900 pb-12 pt-6 text-indigo-300 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pb-24 lg:pt-0">
    <div class="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
      <h2 id="summary-heading" class="sr-only">Order summary</h2>

      <dl>
        <dt class="text-sm font-medium">Amount due</dt>
        <dd class="mt-1 text-3xl font-bold tracking-tight text-white">${formattedPrice}</dd>
      </dl>

      <ul role="list" class="divide-y divide-white divide-opacity-10 text-sm font-medium">
        <li class="flex items-start space-x-4 py-6">
          <img src="${imageUrl}" alt="${title}" class="h-20 w-20 flex-none rounded-md object-cover object-center border border-gray-200">
          <div class="flex-auto space-y-1">
            <h3 class="text-white">${title}</h3>
            <p>${description}</p>
          </div>
          <p class="flex-none text-base font-medium text-white">${formattedPrice}</p>
        </li>
      </ul>

      <dl class="space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium">
         <!-- TODO: Subtotal, Shipping, Taxes should be calculated server-side or based on Payment Intent details -->
        <div class="flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white">
          <dt class="text-base">Total</dt>
          <dd class="text-base">${formattedPrice}</dd>
        </div>
      </dl>
    </div>
  </section>

  <section aria-labelledby="payment-and-shipping-heading" class="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pb-24 lg:pt-0">
    <h2 id="payment-and-shipping-heading" class="sr-only">Payment and shipping details</h2>

    <form id="payment-form">
      <div class="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
        <div>
          <h3 id="contact-info-heading" class="text-lg font-medium text-gray-900">Contact information</h3>

          <div class="mt-6">
            <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input type="email" id="email-address" name="email-address" autocomplete="email" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            </div>
          </div>
        </div>

        <div class="mt-10">
          <h3 id="payment-heading" class="text-lg font-medium text-gray-900">Payment details</h3>
          <p class="mt-1 text-sm text-gray-500">Enter your payment information below.</p>
          <div class="mt-6" id="payment-element">
            <!-- Stripe Payment Element will be inserted here -->
          </div>
        </div>

        <div class="mt-10">
          <h3 id="shipping-heading" class="text-lg font-medium text-gray-900">Shipping address</h3>
           <p class="mt-1 text-sm text-gray-500">Enter the address where you'd like to receive your order.</p>
          <div class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div class="sm:col-span-3">
              <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
              <div class="mt-1">
                <input type="text" id="address" name="address" autocomplete="street-address" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="city" class="block text-sm font-medium text-gray-700">City</label>
              <div class="mt-1">
                <input type="text" id="city" name="city" autocomplete="address-level2" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="region" class="block text-sm font-medium text-gray-700">State / Province</label>
              <div class="mt-1">
                <input type="text" id="region" name="region" autocomplete="address-level1" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="postal-code" class="block text-sm font-medium text-gray-700">Postal code</label>
              <div class="mt-1">
                <input type="text" id="postal-code" name="postal-code" autocomplete="postal-code" required class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10">
          <h3 class="text-lg font-medium text-gray-900">Billing information</h3>

          <div class="mt-6 flex items-center">
            <input id="same-as-shipping" name="same-as-shipping" type="checkbox" checked class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            <div class="ml-2">
              <label for="same-as-shipping" class="text-sm font-medium text-gray-900">Same as shipping information</label>
            </div>
          </div>
        </div>

        <div class="mt-10 flex justify-end border-t border-gray-200 pt-6">
          <button type="submit" id="submit-button" class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50">${buttonText}</button>
        </div>
        <div id="error-message" class="mt-4 text-sm text-red-600 text-right"></div>
      </div>
    </form>
  </section>
</div>
`;
}

// Export as default for compatibility with existing imports
export default renderWebinarCheckout;
