m# Rusty Road Editor

This is a WYSIWYG editor for the [Rusty Road](https://github.com/RustyRoad/RustyRoad) web framework.

It is an optional feature of the framework, and can be used to create and edit pages in a visual way.

## Installation

Run the following command in your Rusty Road project directory:

```bash
rustyroad feature add grapesjs
```

## Usage

This will generate an edit page for each page in your project. You can access it by going to `/edit/<page-name>`.

## Development

This is a grapesjs plugin, and is built using the [tailwind version](https://github.com/Ju99ernaut/grapesjs-tailwind).

To build the plugin, run the following command:

```bash
npm run build
```
This will launch the editor, which is only good for development purposes.


## Publishing

To publish the plugin, run the following command:

```bash
npm run publish
```

This will build the plugin, and then publish it to npm.
Ensure to update the version number in `package.json` before publishing as well as in the rustyroad project to load the latest version.

<!-- Note -->
## Note
The changes you publish will be available immediately in your editor as the editor loads the plugin from unpkg.

Only the javascript file is published, if you make changes to the javascript in the html file, you will need to copy them to the editor file.

## Components

This project also includes reusable UI components.

### Webinar Checkout (`src/components/webinar-checkout-1.js`)

This component provides a Stripe-powered checkout page specifically designed for purchasing a single item, like a webinar seat.

**Usage:**

The component is exported as a default asynchronous function that takes a `product` object as an argument and returns an HTML string for the checkout page.

```javascript
import webinarCheckout from './src/components/webinar-checkout-1.js';

// Example product data structure (fetch this from your API)
const product = {
    "id": 3,
    "stripe_product_id": "prod_123", // Example
    "name": "Advanced Web Development Webinar",
    "description": "Join us for an in-depth look at modern web technologies.",
    "active": true,
    "attributes": [],
    "created_at": "2024-10-13T23:26:23.360301",
    "updated_at": "2024-10-13T23:26:23.360360",
    "images": [
        "https://example.com/webinar-image.jpg" // Optional image URL
    ],
    "metadata": "{}", // Example
    "price": 99.00,
    "currency": "usd"
};

// Generate the checkout HTML
const checkoutHtml = await webinarCheckout(product);

// Inject the HTML into your page
document.getElementById('checkout-container').innerHTML = checkoutHtml;
```

**Required Setup:**

1.  **Stripe Publishable Key:** Replace the placeholder `pk_test_YOUR_PUBLISHABLE_KEY` in `src/components/webinar-checkout-1.js` with your actual Stripe publishable key.
2.  **Server-Side Payment Intent:** You **must** create a server-side endpoint (e.g., `/api/create-payment-intent`) that:
    *   Accepts a product ID (or necessary details).
    *   Creates a Stripe Payment Intent for the correct amount and currency.
    *   Returns the `clientSecret` of the Payment Intent.
3.  **Fetch Client Secret:** Modify the component to fetch this `clientSecret` from your endpoint and replace the placeholder `pi_123_secret_PLACEHOLDER`.
4.  **Confirmation URL:** Update the `return_url` in the `confirmParams` within the component's JavaScript to point to your actual order confirmation page (e.g., `/order-confirmation`).

## License

[MIT](https://choosealicense.com/licenses/mit/)
```
