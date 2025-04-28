import { formatPrice } from './components'; // Assuming formatPrice is available

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType('pricing-table', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-table',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'pricing-table', class: 'pricing-table-container' },
        content: '<div class="text-center text-gray-500 p-4">Loading pricing table...</div>',
        droppable: false,
        stylable: true, // Allow all Tailwind classes
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
        title: 'Pricing Table'
      },

      init() {
        this.fetchServices();
        // Listen for changes to services, selectedProducts, featuresList, and fetchError to re-render content
        this.listenTo(this, 'change:services change:product1 change:product2 change:product3 change:features1 change:features2 change:features3 change:fetchError', this.renderContent);
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
          })
          .catch(error => {
            console.error('[Pricing Table Model] Error fetching services:', error);
            this.set('services', []); // Set to empty array on error
            this.set('fetchError', true); // Indicate fetch error
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

      // Method to render content based on state
      renderContent() {
        const services = this.get('services') || [];
        const fetchError = this.get('fetchError');
        let pricingHtml = '';

        if (fetchError) {
          pricingHtml = '<div class="text-center text-red-600 p-4">Error loading pricing data.</div>';
        } else {
          // Filter services based on selectedProducts trait
          const selectedProductIds = [
            this.get('product1'),
            this.get('product2'),
            this.get('product3')
          ].filter(id => id); // Filter out empty values
          const displayedServices = services.filter(service => selectedProductIds.includes(service.id?.toString()));

          if (displayedServices.length === 0 && selectedProductIds.length > 0) {
              pricingHtml = '<div class="text-center text-orange-600 p-4">Selected services not found. Please re-select.</div>';
          } else if (displayedServices.length === 0 && selectedProductIds.length === 0 && services.length > 0) {
               pricingHtml = '<div class="text-center text-gray-500 p-4">Please select services from the settings panel.</div>';
          }
           else if (displayedServices.length === 0 && selectedProductIds.length === 0 && services.length === 0) {
              pricingHtml = '<div class="text-center text-gray-500 p-4">No services available.</div>';
         }
          else {
             // Render the pricing table HTML based on filtered services
             const gridCols = this.get('gridCols') || 'grid-cols-3';
             const gridGap = this.get('gridGap') || 'gap-6';
             pricingHtml = `<div class="pricing-table-grid grid ${gridCols} ${gridGap} p-4">`;

             // Get features for each product
             const productFeatures = {
               product1: this.get('features1')?.split(',').map(f => f.trim()).filter(f => f) || [],
               product2: this.get('features2')?.split(',').map(f => f.trim()).filter(f => f) || [],
               product3: this.get('features3')?.split(',').map(f => f.trim()).filter(f => f) || []
             };

             displayedServices.forEach((service, index) => {
               const formattedPrice = formatPrice(service.price, service.currency);
               const productId = ['product1', 'product2', 'product3'][index];
               const features = productFeatures[productId];

               pricingHtml += `
                 <div class="pricing-table-card bg-white hover:bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col">
                   <h3 class="text-xl font-bold text-gray-900 mb-4">${service.title}</h3>
                   ${features.length > 0 ? `
                     <ul class="text-gray-600 mb-4 flex-grow list-disc list-inside">
                       ${features.map(feature => `<li>${feature}</li>`).join('')}
                     </ul>
                   ` : `<p class="text-gray-600 mb-4 flex-grow">${service.description || 'No description available.'}</p>`}
                   <div class="mt-auto">
                     <p class="text-2xl font-semibold text-gray-900 mb-4">${formattedPrice}</p>
                     <button class="pricing-table-button gjs-pricing-buy-button w-full rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 text-white font-medium transition-colors duration-300"
                             data-service='${JSON.stringify(service)}' // Pass full service data as JSON
                             >
                       Select Plan
                     </button>
                   </div>
                 </div>
               `;
             });

             pricingHtml += '</div>';
         }
       }

       // Include the script in the rendered content
       const clientSideScript = `
         (function() {
           const container = document.querySelector('.pricing-table-container'); // Use the container class
           if (!container) {
             console.error('Pricing table container not found in client script.');
             return;
           }

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
         })(); // Self-executing
       `;

       pricingHtml += `<script>${clientSideScript}</script>`;


       // Set the component's content attribute
       this.set('content', pricingHtml);
      },

      },
      view: {
        onRender() {
          // The script is now included in the model's 'content' attribute,
          // which is rendered directly by the view.
          // No need to manually execute the script here.
          console.log('[Pricing Table View] Rendered content from model.');
        }
      }
    });
  };