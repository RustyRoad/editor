export default (function (editor) {
    var domc = editor.DomComponents;
    // --- pricing-card component definition ---
    domc.addType('pricing-card', {
        isComponent: function (el) { return el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-card'; },
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
            },
            init: function () {
                var _this = this;
                this.listenTo(this, 'change:cardTitle change:cardDescription change:cardFeatures change:cardPrice change:buttonText change:serviceId change:serviceData', this.updateComponents);
                setTimeout(function () { return _this.updateComponents(); }, 0);
            },
            updateComponents: function () {
                var title = this.get('cardTitle');
                var description = this.get('cardDescription');
                var features = (this.get('cardFeatures') || '').split('\\n').map(function (f) { return f.trim(); }).filter(function (f) { return Boolean(f); });
                var price = this.get('cardPrice');
                var buttonText = this.get('buttonText');
                var serviceId = this.get('serviceId');
                var serviceData = this.get('serviceData');
                var titleComp = this.components().at(0);
                var descFeatContainer = this.components().at(1);
                var priceButtonContainer = this.components().at(2);
                if (titleComp) {
                    titleComp.set('content', title);
                }
                if (descFeatContainer) {
                    descFeatContainer.empty();
                    if (features.length > 0) {
                        descFeatContainer.append({ tagName: 'ul', attributes: { class: 'text-gray-600 dark:text-gray-300 list-disc list-inside' }, components: features.map(function (feature) { return ({ tagName: 'li', content: feature }); }) });
                    }
                    else {
                        descFeatContainer.append({ tagName: 'p', attributes: { class: 'text-gray-600 dark:text-gray-300' }, content: description });
                    }
                }
                if (priceButtonContainer) {
                    var priceComp = priceButtonContainer.components().at(0);
                    var buttonComp = priceButtonContainer.components().at(1);
                    if (priceComp) {
                        priceComp.set('content', price);
                    }
                    if (buttonComp) {
                        buttonComp.set('content', buttonText);
                        buttonComp.addAttributes({ 'data-service-id': serviceId }); // Keep for backward compatibility
                        // Add data-service attribute with full service data if available
                        if (serviceData) {
                            var dataServiceAttr = typeof serviceData === 'string' ? serviceData : JSON.stringify(serviceData);
                            buttonComp.addAttributes({ 'data-service': dataServiceAttr });
                        }
                    }
                }
            },
        },
        view: {
            events: function () {
                return {
                    'click .gjs-pricing-buy-button': 'handleSelectPlanClick',
                };
            },
            handleSelectPlanClick: function (event) {
                var button = event.currentTarget;
                var serviceId = button.dataset.serviceId;
                if (serviceId) {
                    // Prevent GrapesJS default behavior if any and stop propagation
                    event.preventDefault();
                    event.stopPropagation();
                    // Navigate to the new server-rendered modal page
                    window.location.href = "/service/modal/".concat(serviceId);
                }
                else {
                    console.warn('[PricingCard] Service ID not found on button:', button);
                }
            },
        }
    });
});
