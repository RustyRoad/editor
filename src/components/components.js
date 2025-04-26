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
      },

      toJSON(opts = {}) {
        const obj = {
          attributes: this.getAttributes(),
          components: this.get('components').toJSON(opts),
          stripeKey: this.get('stripeKey'),
          products: this.get('products'),
          traits: this.get('traits'),
          template: 'serviceSignup'
        };
        
        if (this.view && this.view.el) {
          obj.renderedHTML = this.view.el.innerHTML;
          const inputs = this.view.el.querySelectorAll('input');
          obj.formValues = {};
          inputs.forEach(input => {
            obj.formValues[input.id] = input.value;
          });
        }
        return obj;
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
        // Initialize with empty content, will be set in init()
        content: '',
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
        // Initialize with empty content
        this.set('content', '');

        // Load services first if needed, then load content
        if (!this.get('services')?.length) {
          this.fetchServices().finally(() => {
            this.loadContent();
          });
        } else {
          this.loadContent();
        }

        this.listenTo(this, 'change:selectedService', this.handleProductChange);
        this.listenTo(this, 'change:stripeKey', this.handleDataChange);
        this.listenTo(this, 'change:services', this.handleDataChange);

        this.fetchStripeKey();
        // fetchServices is called above if needed
      },
      handleProductChange() {
        const selectedService = this.get('selectedService');
        console.log('[Service Validation] Service changed to:', selectedService);

        // Clear previous rendered state
        this.set('renderedHTML', null);

        // Load new content, the HTML capture happens in onRender
        this.loadContent();
      },

      handleDataChange() {
        console.log('[Service Validation Model] Stripe key or products updated.');
        this.loadContent();
        if (this.get('selectedService')) {
          this.trigger('rerender');
        }
      },

      loadContent() {
        const selectedService = this.get('selectedService');
        const services = this.get('services') || [];
        const serviceData = services.find(s => s.id?.toString() === selectedService);

        // Use saved HTML if available and matches the selected service
        const savedHTML = this.get('renderedHTML');
        const lastSavedService = this.get('lastSavedService');

        if (savedHTML && lastSavedService === selectedService) {
            this.set('content', savedHTML);
            return;
        }

        if (selectedService && serviceData) {
          this.set('content', serviceValidation(serviceData));
        } else {
          this.set('content', 'Please select a service from the settings panel.');
        }

        // Trigger immediate render if we have a selected service
        if (selectedService) {
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
        return fetch('/api/product/all')
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
      },

      toJSON(opts = {}) {
        // Capture current state directly from the model
        const obj = {
          attributes: this.getAttributes(),
          components: this.get('components').toJSON(opts),
          stripeKey: this.get('stripeKey'),
          services: this.get('services'),
          traits: this.get('traits'),
          template: 'serviceValidation',
          selectedService: this.get('selectedService')
        };

        // Include rendered HTML and form values if available
        // These are captured in the view's onRender method
        if (this.get('renderedHTML')) {
          obj.renderedHTML = this.get('renderedHTML');
          const feedbackEl = this.view?.el?.querySelector('#address-feedback');
          if (feedbackEl) {
            obj.validationState = {
              message: feedbackEl.textContent,
              color: feedbackEl.style.color
            };
          }
          const inputs = this.view?.el?.querySelectorAll('input');
          obj.formValues = {};
          inputs?.forEach(input => {
            obj.formValues[input.id] = input.value;
          });
        }
        return obj;
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change:selectedService change:stripeKey change:services rerender', this.render);
        // Listen to the 'render' event to capture HTML after the view updates
        this.listenTo(this, 'render', this.captureRenderedHTML);
      },

      captureRenderedHTML() {
          // Capture the innerHTML after the view has rendered
          if (this.el) {
              this.model.set({
                renderedHTML: this.el.innerHTML,
                lastSavedService: this.model.get('selectedService')
              });
          }
      },
      onRender() {
        const model = this.model;
        const componentRootEl = this.el;
        const stripeKey = model.get('stripeKey');
        const selectedServiceId = model.get('selectedService');
        const services = model.get('services') || [];
        const selectedService = services.find(s => s.id?.toString() === selectedServiceId);

        // The content is already set in the model's loadContent method
        // We just need to ensure the view updates based on model changes
        // The actual HTML content is now managed by the model's 'content' attribute
        // The onRender method's primary role is to initialize event listeners and external libraries

        // Re-initialize address validation and Stripe if needed after render
        // This part of the onRender logic seems correct for initializing interactive elements
        // based on the rendered HTML content.

        // No need to set innerHTML here, it's handled by the framework based on model.get('content')

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
              this.isValidated = true;
              // Show checkout form
              const checkoutForm = embeddedCheckout(selectedService);
              componentRootEl.innerHTML = checkoutForm;
              // Initialize Stripe embedded checkout
              this.initStripeCheckout(componentRootEl, stripeKey, selectedService);
            } else {
              setFeedback('❌ Address is outside the service area.', '#b91c1c');
              this.isValidated = false;
            }
          });
        });

      },
      
      initStripeCheckout(containerEl, stripeKey, selectedService) {
        (async () => {
          try {
            const stripeInstance = await loadStripe(stripeKey);
            if (!stripeInstance) throw new Error("Stripe.js failed to load.");
            
            const checkout = await stripeInstance.initEmbeddedCheckout({
              fetchClientSecret: async () => {
                const res = await fetch('/api/stripe/create-checkout-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    productId: selectedService.id,
                    amount: selectedService.price
                  })
                });
                const { clientSecret } = await res.json();
                return clientSecret;
              }
            });

            const checkoutContainer = containerEl.querySelector('#embedded-checkout-container');
            if (checkoutContainer) {
              checkout.mount(checkoutContainer);
            }
          } catch (error) {
            const errorMessage = containerEl.querySelector('#error-message');
            if (errorMessage) errorMessage.textContent = error.message;
          }
        })();
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