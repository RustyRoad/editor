import { formatPrice } from './components'; // Assuming formatPrice is available

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  // Define the nested pricing card component type
  domc.addType('pricing-card', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-card',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'pricing-card', class: 'pricing-table-card bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col' },
        components: `
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Product Title</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4 flex-grow">Product Description</p>
          <ul class="text-gray-600 dark:text-gray-300 mb-4 flex-grow list-disc list-inside">
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
          </ul>
          <div class="mt-auto">
            <p class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">$0.00</p>
            <button class="pricing-table-button gjs-pricing-buy-button w-full rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 text-white font-medium transition-colors duration-300">
              Select Plan
            </button>
          </div>
        `,
        droppable: false,
        stylable: true, // Allow all Tailwind classes
        traits: [
          // Traits for editing card content
          {
            type: 'text',
            label: 'Title',
            name: 'cardTitle',
            changeProp: 1
          },
          {
            type: 'textarea',
            label: 'Description',
            name: 'cardDescription',
            changeProp: 1
          },
          {
            type: 'textarea',
            label: 'Features (one per line)',
            name: 'cardFeatures',
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Price',
            name: 'cardPrice',
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Button Text',
            name: 'buttonText',
            changeProp: 1
          },
          // Trait to store the associated service ID
          {
            type: 'hidden',
            name: 'serviceId',
            changeProp: 1
          }
        ],
        // Custom properties to store data
        cardTitle: 'Product Title',
        cardDescription: 'Product Description',
        cardFeatures: 'Feature 1\nFeature 2\nFeature 3',
        cardPrice: '$0.00',
        buttonText: 'Select Plan',
        serviceId: ''
      },

      init() {
        // Update components when traits change
        this.listenTo(this, 'change:cardTitle change:cardDescription change:cardFeatures change:cardPrice change:buttonText', this.updateComponents);
      },

      updateComponents() {
        const title = this.get('cardTitle');
        const description = this.get('cardDescription');
        const features = this.get('cardFeatures')?.split('\n').map(f => f.trim()).filter(f => f) || [];
        const price = this.get('cardPrice');
        const buttonText = this.get('buttonText');

        // Update the inner components based on trait values
        this.components().forEach(component => {
          const tagName = component.get('tagName');
          if (tagName === 'h3') {
            component.set('content', title);
          } else if (tagName === 'p' && component.get('classes').has('flex-grow')) {
            // Update description paragraph if no features
            if (features.length === 0) {
              component.set('content', description);
            } else {
              // Remove description paragraph if features exist
              this.remove(component);
            }
          } else if (tagName === 'ul') {
            // Update features list
            component.empty(); // Clear existing features
            features.forEach(feature => {
              component.append(`<li>${feature}</li>`);
            });
            // If features are added and description was present, remove description
            const descriptionComp = this.components().filter(comp => comp.get('tagName') === 'p' && comp.get('classes').has('flex-grow'))[0];
            if (features.length > 0 && descriptionComp) {
              this.remove(descriptionComp);
            }
          } else if (tagName === 'div' && component.get('classes').has('mt-auto')) {
            // Update price and button text within the footer div
            component.components().forEach(footerComp => {
              const footerTagName = footerComp.get('tagName');
              if (footerTagName === 'p') {
                footerComp.set('content', price);
              } else if (footerTagName === 'button') {
                footerComp.set('content', buttonText);
              }
            });
          }
        });

        // If features were removed and description was not present, add description back
        const hasDescription = this.components().some(comp => comp.get('tagName') === 'p' && comp.get('classes').has('flex-grow'));
        const hasFeaturesList = this.components().some(comp => comp.get('tagName') === 'ul');

        if (features.length === 0 && !hasDescription) {
          // Find the position to insert the description (after title)
          const titleComp = this.components().filter(comp => comp.get('tagName') === 'h3')[0];
          if (titleComp) {
            this.add({
              tagName: 'p',
              attributes: { class: 'text-gray-600 dark:text-gray-300 mb-4 flex-grow' },
              content: description
            }, { at: this.indexOf(titleComp) + 1 });
          }
        } else if (features.length > 0 && !hasFeaturesList) {
          // If features were added and no ul exists, add the ul
          const titleComp = this.components().filter(comp => comp.get('tagName') === 'h3')[0];
          if (titleComp) {
            const ulComp = this.add({
              tagName: 'ul',
              attributes: { class: 'text-gray-600 dark:text-gray-300 mb-4 flex-grow list-disc list-inside' },
              components: features.map(feature => ({ tagName: 'li', content: feature }))
            }, { at: this.indexOf(titleComp) + 1 });
          }
        }
      },
    },
    view: {
      // The view logic for the pricing card component itself
      // GrapesJS handles rendering based on the model's 'components' and 'content'
    }
  });


  domc.addType('pricing-table', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-table',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'pricing-table', class: 'pricing-table-container' },
        // Initial content is just a placeholder, actual content is built with nested components
        content: '<div class="text-center text-gray-500 p-4">Loading pricing table...</div>',
        droppable: false, // The grid container inside will be droppable
        stylable: true, // Allow all Tailwind classes on the main container
        traits: [
          // Grid layout traits
          {
            type: 'select',
            label: 'Grid Columns',
            name: 'gridCols',
            options: [
              { id: 'grid-cols-1', name: '1 Column', value: 'grid-cols-1' },
              { id: 'grid-cols-2', name: '2 Columns', value: 'grid-cols-2' },
              { id: 'grid-cols-3', name: '3 Columns', value: 'grid-cols-3' },
              { id: 'grid-cols-4', name: '4 Columns', value: 'grid-cols-4' }
            ],
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Grid Gap',
            name: 'gridGap',
            options: [
              { id: 'gap-2', name: 'Small', value: 'gap-2' },
              { id: 'gap-4', name: 'Medium', value: 'gap-4' },
              { id: 'gap-6', name: 'Large', value: 'gap-6' },
              { id: 'gap-8', name: 'Extra Large', value: 'gap-8' }
            ],
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Product 1',
            name: 'product1',
            options: [], // Will be populated dynamically
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Features for Product 1',
            name: 'features1',
            placeholder: 'Feature 1, Feature 2, Feature 3',
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Product 2',
            name: 'product2',
            options: [], // Will be populated dynamically
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Features for Product 2',
            name: 'features2',
            placeholder: 'Feature 1, Feature 2, Feature 3',
            changeProp: 1
          },
          {
            type: 'select',
            label: 'Product 3',
            name: 'product3',
            options: [], // Will be populated dynamically
            changeProp: 1
          },
          {
            type: 'text',
            label: 'Features for Product 3',
            name: 'features3',
            placeholder: 'Feature 1, Feature 2, Feature 3',
            changeProp: 1
          }
        ],
        services: [], // To store fetched services
        product1: '', // To store ID of first selected product
        product2: '', // To store ID of second selected product
        product3: '', // To store ID of third selected product
        features1: '', // Features for product 1
        features2: '', // Features for product 2
        features3: '', // Features for product 3
        title: 'Pricing Table',
        // The script property will now hold the client-side script string.
        // This script will be included by GrapesJS in the exported HTML.
        script: `
          (function() {
            const container = document.querySelector('.pricing-table-container'); // Use the container class
            if (!container) {
              console.error('Pricing table container not found in client script.');
              return;
            }

            // Function to initialize button listeners
            function initializeButtonListeners() {
              container.querySelectorAll('.gjs-pricing-buy-button').forEach(button => {
                button.addEventListener('click', (event) => {
                  try {
                      const serviceData = JSON.parse(event.target.getAttribute('data-service'));

                      // Check if the global initServiceValidation function exists
                      if (typeof window.initServiceValidation === 'function') {
                           // Call the global function with the service data
                           window.initServiceValidation(serviceData);
                           console.log('Called window.initServiceValidation with service data:', serviceData);
                      } else {
                          console.error('window.initServiceValidation function not found.');
                          alert('Error: Service validation functionality is not available.');
                      }
                  } catch (e) {
                      console.error('Error parsing service data or calling initServiceValidation:', e);
                      alert('Error processing service selection. Please try again.');
                  }
                });
              });
            }

            // Wait for window.initServiceValidation to be defined
            function waitForServiceValidationInit(callback) {
                if (typeof window.initServiceValidation === 'function') {
                    callback();
                } else {
                    setTimeout(() => waitForServiceValidationInit(callback), 50); // Check again after a short delay
                }
            }

            // Wait for the function and then initialize listeners
            waitForServiceValidationInit(initializeButtonListeners);

          })(); // Self-executing
        `,
      },

      init() {
        this.fetchServices();
        // Listen for changes to services, selectedProducts, featuresList, and fetchError to re-render content
        this.listenTo(this, 'change:services change:product1 change:product2 change:product3 change:features1 change:features2 change:features3 change:fetchError change:gridCols change:gridGap', this.renderContent);
      },

      fetchServices() {
        if (this.get('services')?.length > 0) return; // Avoid redundant fetches

        fetch('/api/product/all') // Use the existing endpoint
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            const services = (data || []).map(service => ({
              id: service.id,
              title: service.name || 'Untitled Service',
              price: Number(service.price) || 0,
              currency: service.currency || 'usd',
              description: service.description || '',
              priceId: service.priceId || null, // Assuming priceId is returned by the backend
              // Add any other fields needed for display or validation
            }));
            this.set('services', services);
            console.log('[Pricing Table Model] Services fetched:', services.length);
            this.updateProductTraitOptions(); // Update the select trait options
            this.renderContent(); // Re-render content after fetching services
          })
          .catch(error => {
            console.error('[Pricing Table Model] Error fetching services:', error);
            this.set('services', []); // Set to empty array on error
            this.set('fetchError', true); // Indicate fetch error
            this.renderContent(); // Render error message
          });
      },

      // Method to update the options for all product selector traits
      updateProductTraitOptions() {
        const services = this.get('services') || [];
        const options = services.map(service => ({
          id: service.id.toString(),
          name: service.title, // Display service title in the dropdown
          value: service.id.toString()
        }));
        options.unshift({ id: '', name: 'Select a product...', value: '' }); // Add empty option

        // Update each product selector trait
        ['product1', 'product2', 'product3'].forEach(traitName => {
          const trait = this.getTrait(traitName);
          if (trait) {
            const currentValue = this.get(traitName);
            // Keep current selection if it still exists in options
            if (currentValue && !options.some(opt => opt.value === currentValue)) {
              this.set(traitName, '');
            }
            trait.set('options', options);
          } else {
            console.warn(`[Pricing Table Model] Could not find ${traitName} trait.`);
          }
        });
        console.log('[Pricing Table Model] Product traits updated.');
      },

      // Method to render content based on state using nested components
      renderContent() {
        const services = this.get('services') || [];
        const fetchError = this.get('fetchError');

        // Clear existing components except the main container if it exists
        const existingContainer = this.components().filter(comp => comp.get('attributes')['data-gjs-type'] === 'pricing-table-container')[0];
        if (existingContainer) {
          existingContainer.empty(); // Clear inner components
        } else {
          this.empty(); // Clear all components if container doesn't exist (shouldn't happen with this structure)
        }


        if (fetchError) {
          this.append('<div class="text-center text-red-600 p-4">Error loading pricing data.</div>');
        } else {
          // Filter services based on selectedProducts trait
          const selectedProductIds = [
            this.get('product1'),
            this.get('product2'),
            this.get('product3')
          ].filter(id => id); // Filter out empty values
          const displayedServices = services.filter(service => selectedProductIds.includes(service.id?.toString()));

          if (displayedServices.length === 0 && selectedProductIds.length > 0) {
            this.append('<div class="text-center text-orange-600 p-4">Selected services not found. Please re-select.</div>');
          } else if (displayedServices.length === 0 && selectedProductIds.length === 0 && services.length > 0) {
            this.append('<div class="text-center text-gray-500 p-4">Please select services from the settings panel.</div>');
          }
          else if (displayedServices.length === 0 && selectedProductIds.length === 0 && services.length === 0) {
            this.append('<div class="text-center text-gray-500 p-4">No services available.</div>');
          }
          else {
            // Create or get the grid container
            let gridContainer = this.components().filter(comp => comp.get('attributes').class?.includes('pricing-table-grid'))[0];
            if (!gridContainer) {
              const gridCols = this.get('gridCols') || 'grid-cols-3';
              const gridGap = this.get('gridGap') || 'gap-6';
              gridContainer = this.add({
                tagName: 'div',
                attributes: { class: `pricing-table-grid grid ${gridCols} ${gridGap} p-4` },
                droppable: '.pricing-table-card', // Only allow pricing-card components inside
                components: [] // Start with empty components
              }, { at: 0 }); // Add as the first component
            } else {
              // Update grid classes if container already exists
              const currentClasses = gridContainer.get('attributes').class.split(' ');
              const newClasses = currentClasses.filter(cls => !cls.startsWith('grid-cols-') && !cls.startsWith('gap-'));
              newClasses.push(this.get('gridCols') || 'grid-cols-3');
              newClasses.push(this.get('gridGap') || 'gap-6');
              gridContainer.set('attributes', { ...gridContainer.get('attributes'), class: newClasses.join(' ') });
              gridContainer.empty(); // Clear existing cards to re-add based on selection
            }


            // Get features for each product
            const productFeatures = {
              product1: this.get('features1')?.split(',').map(f => f.trim()).filter(f => f) || [],
              product2: this.get('features2')?.split(',').map(f => f.trim()).filter(f => f) || [],
              product3: this.get('features3')?.split(',').map(f => f.trim()).filter(f => f) || []
            };

            // Add pricing-card components for each selected service
            displayedServices.forEach((service, index) => {
              const productId = ['product1', 'product2', 'product3'][index];
              const features = productFeatures[productId];

              // Add a pricing-card component
              gridContainer.append({
                type: 'pricing-card', // Use the nested component type
                // Pass data to the pricing-card model
                cardTitle: service.title,
                cardDescription: service.description,
                cardFeatures: features.join('\n'), // Pass features as newline-separated string
                cardPrice: formatPrice(service.price, service.currency),
                buttonText: 'Select Plan', // Or customize if needed
                serviceId: service.id?.toString(), // Pass service ID
                // The inner components of the pricing card are now defined in the pricing-card type defaults
                // We don't need to define them here unless we want to override the defaults.
                // The pricing-card's updateComponents method will handle setting the content based on traits.
                // We need to ensure the data-service attribute is set on the button within the pricing-card.
                // This should be handled by the pricing-card's updateComponents or toHTML method.
                // Let's add a toHTML method to the pricing-card to set the data-service attribute.
              });
            });

            // The content attribute is no longer used to hold the full HTML structure.
            // The structure is defined by the nested components.
            // We can remove the line setting the content attribute.
            // this.set('content', pricingHtml); // Remove this line
          }
        }
      },

      view: {
        onRender() {
          // The script is now included via the model's 'script' property
          // and the component's inner structure is defined by nested components.
          // No need to manually render content or execute script here.
          console.log('[Pricing Table View] Rendered with nested components.');
        }
      }
    }
  });
};