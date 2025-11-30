import { Editor } from 'grapesjs';
export default (editor: Editor) => {
  const domc = editor.DomComponents;

  // --- pricing-card component definition ---
  domc.addType('pricing-card', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-card',
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': 'pricing-card',
          class: 'pricing-table-card bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col basis-1  min-w-[250px]'
        },
        components: [
          { tagName: 'h3', attributes: { id: 'card-title', class: 'text-xl font-bold text-gray-900 dark:text-white mb-4' }, content: 'Product Title' },
          { tagName: 'div', attributes: { id: 'card-description-features', class: 'description-features-container flex-grow mb-4' }, components: [{ tagName: 'p', attributes: { class: 'text-gray-600 dark:text-gray-300' }, content: 'Product Description' }] },
          { tagName: 'div', attributes: { id: 'card-price-button', class: 'mt-auto' }, components: [{ tagName: 'p', attributes: { class: 'text-2xl font-semibold text-gray-900 dark:text-white mb-4' }, content: '$0.00' }, { tagName: 'button', attributes: { class: 'pricing-table-button gjs-pricing-buy-button w-full rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 text-white font-medium transition-colors duration-300', 'data-service-id': '' }, content: 'Select Plan' }] }
        ],
        droppable: false,
        stylable: true, traits: [
          { type: 'text', label: 'Title', name: 'cardTitle', changeProp: true },
          { type: 'textarea', label: 'Description', name: 'cardDescription', changeProp: true },
          { type: 'textarea', label: 'Features (one per line)', name: 'cardFeatures', changeProp: true },
          { type: 'text', label: 'Price', name: 'cardPrice', changeProp: true },
          { type: 'text', label: 'Button Text', name: 'buttonText', changeProp: true },
          { type: 'hidden', name: 'serviceId', changeProp: true },
          { type: 'hidden', name: 'serviceData', changeProp: true } // Store full service data
        ], cardTitle: 'Product Title',
        cardDescription: 'Product Description',
        cardFeatures: '',
        cardPrice: '$0.00',
        buttonText: 'Select Plan',
        serviceId: '',
        serviceData: null
      }, init() {
        this.listenTo(this, 'change:cardTitle change:cardDescription change:cardFeatures change:cardPrice change:buttonText change:serviceId change:serviceData', this.updateComponents);
        setTimeout(() => this.updateComponents(), 0);
      }, updateComponents() {
        const title = this.get('cardTitle');
        const description = this.get('cardDescription');
        const features = (this.get('cardFeatures') || '').split('\\n').map((f: string) => f.trim()).filter((f: string) => Boolean(f));
        const price = this.get('cardPrice');
        const buttonText = this.get('buttonText');
        const serviceId = this.get('serviceId');
        const serviceData = this.get('serviceData');
        const titleComp = this.components().at(0);
        const descFeatContainer = this.components().at(1);
        const priceButtonContainer = this.components().at(2);
        if (titleComp) { titleComp.set('content', title); }
        if (descFeatContainer) {
          descFeatContainer.empty();
          if (features.length > 0) {
            descFeatContainer.append({ tagName: 'ul', attributes: { class: 'text-gray-600 dark:text-gray-300 list-disc list-inside' }, components: features.map((feature: string) => ({ tagName: 'li', content: feature })) });
          } else {
            descFeatContainer.append({ tagName: 'p', attributes: { class: 'text-gray-600 dark:text-gray-300' }, content: description });
          }
        }
        if (priceButtonContainer) {
          const priceComp = priceButtonContainer.components().at(0);
          const buttonComp = priceButtonContainer.components().at(1);
          if (priceComp) { priceComp.set('content', price); }
          if (buttonComp) {
            buttonComp.set('content', buttonText);
            buttonComp.addAttributes({ 'data-service-id': serviceId }); // Keep for backward compatibility

            // Add data-service attribute with full service data if available
            if (serviceData) {
              const dataServiceAttr = typeof serviceData === 'string' ? serviceData : JSON.stringify(serviceData);
              buttonComp.addAttributes({ 'data-service': dataServiceAttr });
            }
          }
        }
      },
    },
    view: {
      events() { // Changed to a function
        return {
          'click .gjs-pricing-buy-button': 'handleSelectPlanClick',
        };
      },
      handleSelectPlanClick(event: Event) {
        const button = event.currentTarget as HTMLElement;
        const serviceId = button.dataset.serviceId;
        if (serviceId) {
          // Prevent GrapesJS default behavior if any and stop propagation
          event.preventDefault();
          event.stopPropagation();
          // Navigate to the new server-rendered modal page
          window.location.href = `/service/modal/${serviceId}`;
        } else {
          console.warn('[PricingCard] Service ID not found on button:', button);
        }
      },
    }
  });
};
