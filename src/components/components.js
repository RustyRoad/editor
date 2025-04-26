import webinarCheckout1 from "./webinar-checkout-1";
import embeddedCheckout from "./embedded-checkout";
import serviceSignup from "./service-signup";
import serviceValidation from "./service-validation";
import { loadStripe } from '@stripe/stripe-js';

// Helper function defined within the main export scope
const formatPrice = (amount, currency) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(numAmount);
};

// Register components with GrapesJS
const components = (editor, opts = {}) => {
  const components = editor.DomComponents;



  // Register other existing components
  components.addType('webinar-checkout-1', {
    model: {
      defaults: {
        component: webinarCheckout1,
        stylable: true
      }
    }
  });

  components.addType('embedded-checkout', {
    model: {
      defaults: {
        component: embeddedCheckout,
        stylable: true
      }
    }
  });

  components.addType('service-signup', {
    model: {
      defaults: {
        component: serviceSignup,
        stylable: true
      }
    }
  });
  const domc = editor.DomComponents;
  const componentType = 'Checkout 2 Step';
  
  // Add Embedded Checkout component type
  domc.addType('Embedded Checkout', {
    isComponent: el => {
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'embedded-checkout') {
        return { type: 'Embedded Checkout' };
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'embedded-checkout' },
        content: 'Select a product for embedded checkout...',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Product',
            name: 'selectedProduct',
            options: [],
            changeProp: 1
          }
        ],
        stripeKey: null,
        products: [],
        title: 'Embedded Checkout'
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey', this.handleDataChange);
        this.listenTo(this, 'change:products', this.handleDataChange);
        
        this.fetchStripeKey();
        this.fetchProducts();
      },
      handleProductChange() {
        console.log('[Embedded Model] Product selection changed:', this.get('selectedProduct'));
        this.trigger('rerender');
      },
      handleDataChange() {
        console.log('[Embedded Model] Stripe key or products updated.');
        if (this.get('selectedProduct')) {
          this.trigger('rerender');
        }
      },
      fetchStripeKey() {
        fetch('/api/stripe/key')
          .then(response => response.json())
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
            } else {
              this.set('stripeKey', null);
            }
          }).catch(err => {
            this.set('stripeKey', null);
          });
        },
      fetchProducts() {
        fetch('/api/products')
        .then(response => response.text().then(text => text ? JSON.parse(text) : []))
        .then(data => {
            const products = data.map(product => ({
              id: product.id || Date.now() + Math.random(),
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              currency: product.currency
            }));
            this.set('products', products);
            this.updateTraits();
          }).catch(error => {
            this.set('products', []);
            this.updateTraits();
          });
      },
      updateTraits() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
          const options = products.map(product => ({
            id: product.id.toString(),
            name: `${product.title} (${formatPrice(product.price, product.currency)})`,
            value: product.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Product...', value: '' });
          trait.set('options', options);
        }
      },
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);
        
        let htmlContent;
        if (!selectedProductId) {
          htmlContent = 'Please select a product from the settings panel.';
        } else if (!selectedProduct) {
          htmlContent = '<div class="text-red-600">Selected product data not found. Please re-select.</div>';
        } else {
          htmlContent = embeddedCheckout(selectedProduct);
        }
        componentRootEl.innerHTML = htmlContent;

        if (!stripeKey || !selectedProduct) return;
        
        (async () => {
          try {
            const stripeInstance = await loadStripe(stripeKey);
            if (!stripeInstance) throw new Error("Stripe.js failed to load.");
            
            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                const res = await fetch('/api/stripe/create-checkout-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                });
                const { clientSecret } = await res.json();
                return clientSecret;
              }
            });

            const container = componentRootEl.querySelector('#embedded-checkout-container');
            if (container) {
              checkout.mount(container);
            }
          } catch (error) {
            const errorMessage = componentRootEl.querySelector('#error-message');
            if (errorMessage) errorMessage.textContent = error.message;
          }
        })();
      }
    }
  });

  // Add Service Signup component type
  domc.addType('Service Signup', {
    isComponent: el => {
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'service-signup') {
        return { type: 'Service Signup' };
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'service-signup' },
        content: 'Select a service...',
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Service',
            name: 'selectedProduct',
            
            options: [],
            changeProp: 1
          }
        ],
        stripeKey: null,
        products: [],
        title: 'Service Signup'
      },
      init() {
        this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey', this.handleDataChange);
        this.listenTo(this, 'change:products', this.handleDataChange);

        this.fetchStripeKey();
        this.fetchProducts();
      },
      handleProductChange() {
        console.log('[Service Signup Model] Product selection changed:', this.get('selectedProduct'));
        this.trigger('rerender');
      },
      handleDataChange() {
        console.log('[Service Signup Model] Stripe key or products updated.');
        if (this.get('selectedProduct')) {
          this.trigger('rerender');
        }
      },
      fetchStripeKey() {
        fetch('/api/stripe/key')
          .then(response => response.json())
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
            } else {
              this.set('stripeKey', null);
            }
          }).catch(err => {
            this.set('stripeKey', null);
          });
      },
      fetchProducts() {
        fetch('/api/product/all')
          .then(response => response.text().then(text => text ? JSON.parse(text) : []))
          .then(data => {
            const products = data.map(product => ({
              id: product.id || Date.now() + Math.random(),
              title: product.name || 'Untitled Product',
              price: Math.max(0, Number(product.price)) || 0,
              description: product.description || '',
              currency: product.currency
            }));
            this.set('products', products);
            this.updateTraits();
          }).catch(error => {
            this.set('products', []);
            this.updateTraits();
          });
      },
      updateTraits() {
        const products = this.get('products') || [];
        const trait = this.getTrait('selectedProduct');
        if (trait) {
          const options = products.map(product => ({
            id: product.id.toString(),
            name: `${product.title} (${formatPrice(product.price, product.currency)})`,
            value: product.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Service...', value: '' });
          trait.set('options', options);
        }
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        const stripeKey = model.get('stripeKey');
        const selectedProductId = model.get('selectedProduct');
        const products = model.get('products') || [];
        const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);

        let htmlContent;
        if (!selectedProductId) {
          htmlContent = 'Please select a service from the settings panel.';
        } else if (!selectedProduct) {
          htmlContent = '<div class="text-red-600">Selected service data not found. Please re-select.</div>';
        } else {
          htmlContent = serviceSignup(selectedProduct);
        }
        componentRootEl.innerHTML = htmlContent;

        if (!stripeKey || !selectedProduct) return;

        // Initialize address validation
        const address1Input = componentRootEl.querySelector('#address1');
        const cityInput = componentRootEl.querySelector('#city');
        const stateInput = componentRootEl.querySelector('#state');
        const zip5Input = componentRootEl.querySelector('#zip5');
        const checkBtn = componentRootEl.querySelector('#check-availability');
        const feedbackDiv = componentRootEl.querySelector('#address-feedback');
        const submitBtn = componentRootEl.querySelector('#submit-button');

        function setFeedback(msg, color) {
          feedbackDiv.textContent = msg;
          feedbackDiv.style.color = color;
        }

        function setSubmitEnabled(enabled) {
          if (enabled) {
            submitBtn.removeAttribute('disabled');
            submitBtn.classList.remove('opacity-50');
          } else {
            submitBtn.setAttribute('disabled', 'disabled');
            submitBtn.classList.add('opacity-50');
          }
        }

        setSubmitEnabled(false);

        const checkAvailability = async function () {
          const address1 = address1Input.value.trim();
          const city = cityInput.value.trim();
          const state = stateInput.value.trim();
          const zip5 = zip5Input.value.trim();

          setFeedback('⏳ Checking...', '#2563eb');
          setSubmitEnabled(false);

          if (!address1 || !city || !state || !zip5) {
            setFeedback('Please complete all address fields.', '#b91c1c');
            return;
          }

          try {
            const resp = await fetch('/api/geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address: {
                  address1,
                  address2: null,
                  city,
                  state,
                  zip5,
                  zip4: null
                },
                zone_id: 1
              })
            });

            if (!resp.ok) {
              throw new Error('API error');
            }
            const data = await resp.json();
            if (data.inside_zone) {
              setFeedback('✅ Address is in service area.', '#16a34a');
              setSubmitEnabled(true);
            } else {
              setFeedback('❌ Address is outside the service area.', '#b91c1c');
              setSubmitEnabled(false);
            }
          } catch (e) {
            if (e.message.includes('Failed to fetch') || e.message.includes('timeout')) {
              setFeedback('⚠️ Connection error. Please check your network and try again.', '#b91c1c');
            } else {
              setFeedback('⚠️ Could not verify address. Please check and try again.', '#b91c1c');
            }
            setSubmitEnabled(false);
          }
        };

        const clearFeedback = function () {
          setFeedback('', '');
          setSubmitEnabled(false);
        };

        checkBtn.addEventListener('click', checkAvailability);
        address1Input.addEventListener('input', clearFeedback);
        cityInput.addEventListener('input', clearFeedback);
        stateInput.addEventListener('input', clearFeedback);
        zip5Input.addEventListener('input', clearFeedback);

        // Cleanup event listeners when component is removed
        this.listenTo(this.model, 'destroy', () => {
          checkBtn.removeEventListener('click', checkAvailability);
          address1Input.removeEventListener('input', clearFeedback);
          cityInput.removeEventListener('input', clearFeedback);
          stateInput.removeEventListener('input', clearFeedback);
          zip5Input.removeEventListener('input', clearFeedback);
        });

        // Initialize Stripe embedded checkout
        (async () => {
          try {
            const stripeInstance = await loadStripe(stripeKey);
            if (!stripeInstance) throw new Error("Stripe.js failed to load.");

            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                const res = await fetch('/api/stripe/create-checkout-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                });
                const { clientSecret } = await res.json();
                return clientSecret;
              }
            });

            const container = componentRootEl.querySelector('#embedded-checkout-container');
            if (container) {
              checkout.mount(container);
            }
          } catch (error) {
            const errorMessage = componentRootEl.querySelector('#error-message');
            if (errorMessage) errorMessage.textContent = error.message;
          }
        })();
      }
    }
  });

  // Add service validation component type
  domc.addType('Service Validation', {
    isComponent: el => {
      if (el.getAttribute && el.getAttribute('data-gjs-type') === 'service-validation') {
        return { type: 'Service Validation' };
      }
    },
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'service-validation' },
        content: serviceValidation,
        droppable: false,
        stylable: [],
        traits: [
          {
            type: 'select',
            label: 'Select Service',
            name: 'selectedService',
            options: [],
            changeProp: 1
          }
        ],
        stripeKey: null,
        services: [],
        title: 'Service Validation'
      },
      init() {
        this.listenTo(this, 'change:selectedService', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey', this.handleDataChange);
        this.listenTo(this, 'change:services', this.handleDataChange);

        this.fetchStripeKey();
        this.fetchServices();
      },
      handleProductChange() {
        console.log('[Service Validation Model] Service selection changed:', this.get('selectedService'));
        this.trigger('rerender');
      },
      handleDataChange() {
        console.log('[Service Validation Model] Stripe key or services updated.');
        if (this.get('selectedService')) {
          this.trigger('rerender');
        }
      },
      fetchStripeKey() {
        fetch('/api/stripe/key')
          .then(response => response.json())
          .then(data => {
            if (data && data.public_key) {
              this.set('stripeKey', data.public_key);
            } else {
              this.set('stripeKey', null);
            }
          }).catch(err => {
            this.set('stripeKey', null);
          });
      },
      fetchServices() {
        alert('Fetching services...');
        fetch('/api/product/all')
          .then(response => response.text().then(text => text ? JSON.parse(text) : []))
          .then(data => {
            const services = data.map(service => ({
              id: service.id || Date.now() + Math.random(),
              title: service.name || 'Untitled Service',
              price: Math.max(0, Number(service.price)) || 0,
              description: service.description || '',
              currency: service.currency
            }));
            this.set('services', services);
            this.updateTraits();
          }).catch(error => {
            this.set('services', []);
            this.updateTraits();
          });
        },
      updateTraits() {
        const services = this.get('services') || [];
        const trait = this.getTrait('selectedService');
        if (trait) {
          const options = services.map(service => ({
            id: service.id.toString(),
            name: `${service.title} (${formatPrice(service.price, service.currency)})`,
            value: service.id.toString()
          }));
          options.unshift({ id: '', name: 'Select a Service...', value: '' });
          trait.set('options', options);
        }
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedService change:stripeKey change:services rerender', this.render);
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        const stripeKey = model.get('stripeKey');
        const selectedServiceId = model.get('selectedService');
        const services = model.get('services') || [];
        const selectedService = services.find(s => s.id?.toString() === selectedServiceId);

        let htmlContent;
        if (!selectedServiceId) {
          htmlContent = 'Please select a service from the settings panel.';
        } else if (!selectedService) {
          htmlContent = '<div class="text-red-600">Selected service data not found. Please re-select.</div>';
        } else {
          htmlContent = serviceValidation(selectedService);
        }
        componentRootEl.innerHTML = htmlContent;

        if (!stripeKey || !selectedService) return;

        // Initialize address validation
        const address1Input = componentRootEl.querySelector('#address1');
        const cityInput = componentRootEl.querySelector('#city');
        const stateInput = componentRootEl.querySelector('#state');
        const zip5Input = componentRootEl.querySelector('#zip5');
        const checkBtn = componentRootEl.querySelector('#check-availability');
        const feedbackDiv = componentRootEl.querySelector('#address-feedback');

        function setFeedback(msg, color) {
          feedbackDiv.textContent = msg;
          feedbackDiv.style.color = color;
        }

        checkBtn.addEventListener('click', () => {
        
          const address1 = address1Input.value.trim();
          const city = cityInput.value.trim();
          const state = stateInput.value.trim();
          const zip5 = zip5Input.value.trim();
          setFeedback('⏳ Checking...', '#2563eb');
          if (!address1 || !city || !state || !zip5) {
            setFeedback('Please complete all address fields.', '#b91c1c');
            return;
          }
          fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: {
                address1,
                address2: null,
                city,
                state,
                zip5,
                zip4: null
              },
              zone_id: 1
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('API error');
            }
            return response.json();
          })
          .then(data => {
            if (data.inside_zone) {
              setFeedback('✅ Address is in service area.', '#16a34a');
            } else {
              setFeedback('❌ Address is outside the service area.', '#b91c1c');
            }
          });
        });

      }
    }
  });


    // Register Service Validation component
    components.addType('service-validation', {
      model: {
        defaults: {
          component: serviceValidation,
          stylable: true
        }

      }
    });
  
}



export { formatPrice };
export default components;