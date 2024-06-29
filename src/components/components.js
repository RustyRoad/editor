import components from ".";
import webinarCheckout1 from "./webinar-checkout-1";

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType('webinar-checkout-1', {
    isComponent: el => {
      if (el.tagName === 'H1') {
        return { type: 'webinar-checkout-1' };
      }
    },
    model: {
      defaults: {
        tagName: 'h1',
        attributes: { title: 'Checkout' },
        components: {
          type: 'text',
          content: 'Click this component and then click the gear icon to use this component.'
        },
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct',
            options: [],
            changeProp: 1
          }
        ],
        title: 'Webinar Checkout 1'
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.updateContent);
        this.fetchStripeKey();
        this.fetchProducts();
      },
      fetchStripeKey() {
        // get the access token from local storage
        const token = localStorage.getItem("access_token");

        fetch('/api/stripe/key',
          {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token,
            },
          }
        )
          .then(response => response.json())
          .then(data => {
            this.set('stripeKey', data.public_key);
          });
      },
      fetchProducts() {

        // log the stripe key
        console.log(this.get('stripeKey'));


        fetch('/api/products', {

        })
          .then(response => response.json())
          .then(data => {
            const products = data.map(product => ({
              id: product.id,
              title: product.title,
              price: product.price,
              description: product.description
            }));
            this.set('products', products);
            this.updateTraits();
          });
      },
      updateTraits() {
        const products = this.get('products');
        const trait = this.getTrait('selectedProduct');
        trait.set('options', products.map(product => ({
          id: product.id,
          name: product.title,
          value: product.id
        })));
      },
      updateContent() {
        const stripeKey = this.get('stripeKey');


        const selectedProductId = this.get('selectedProduct');
        const products = this.get('products');
        const selectedProduct = products.find(product => product.id.toString() === selectedProductId);

        const content = webinarCheckout1(selectedProduct, stripeKey);

        this.components(content);
      }
    }
  });
};