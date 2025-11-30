// @ts-nocheck
import { formatCurrency } from './pricing-table/utils';
import initPricingCard from './pricing-card';
import initSmallPricingCard from './small-pricing-card';
export default (function (editor) {
    var domc = editor.DomComponents;
    // Define the nested pricing card component type
    // Initialize the new small pricing card component type
    // Initialize the pricing card component type
    initPricingCard(editor);
    // Initialize the small pricing card component type
    initSmallPricingCard(editor);
    // Define the pricing-table-grid-container component type
    domc.addType('pricing-table-grid-container', {
        isComponent: function (el) { return el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-table-grid-container'; },
        model: {
            defaults: {
                tagName: 'div',
                attributes: { 'data-gjs-type': 'pricing-table-grid-container', class: 'pricing-table-grid flex flex-wrap justify-center gap-6' },
                components: [],
                droppable: '[data-gjs-type=pricing-card], [data-gjs-type=small-pricing-card]', // Allow pricing-card and small-pricing-card
                stylable: false, // Usually, styling is managed by the parent or individual cards
            },
        },
        view: {
        // Optionally, add custom view logic if needed
        }
    });
    domc.addType('pricing-table', {
        isComponent: function (el) { return el.getAttribute && el.getAttribute('data-gjs-type') === 'pricing-table'; },
        model: {
            defaults: {
                tagName: 'div',
                attributes: { 'data-gjs-type': 'pricing-table', class: 'pricing-table-container p-4' },
                components: [
                    { type: 'pricing-table-grid-container' }, // Use the defined type
                ],
                droppable: false,
                stylable: true,
                traits: [
                    { type: 'select', label: 'Grid Gap', name: 'gridGap', options: [{ id: 'gap-2', name: 'Small', value: 'gap-2' }, { id: 'gap-4', name: 'Medium', value: 'gap-4' }, { id: 'gap-6', name: 'Large', value: 'gap-6' }, { id: 'gap-8', name: 'Extra Large', value: 'gap-8' }], changeProp: true, default: 'gap-6' },
                    { type: 'select', label: 'Product 1', name: 'product1', options: [], changeProp: true },
                    { type: 'textarea', label: 'Features for Product 1', name: 'features1', placeholder: 'Feature 1\nFeature 2\nFeature 3', changeProp: true },
                    { type: 'select', label: 'Product 2', name: 'product2', options: [], changeProp: true },
                    { type: 'textarea', label: 'Features for Product 2', name: 'features2', placeholder: 'Feature 1\nFeature 2\nFeature 3', changeProp: true },
                    { type: 'select', label: 'Product 3', name: 'product3', options: [], changeProp: true },
                    { type: 'textarea', label: 'Features for Product 3', name: 'features3', placeholder: 'Feature 1\nFeature 2\nFeature 3', changeProp: true },
                    { type: 'select', label: 'Alternative Product', name: 'product4', options: [], changeProp: true },
                    { type: 'text', label: 'Alternative Message', name: 'smallOptionMessage', placeholder: 'Need a different option?', changeProp: true }
                ],
                services: [],
                product1: '', product2: '', product3: '', product4: '',
                features1: '', features2: '', features3: '',
                smallOptionMessage: 'Need a different option?',
                gridGap: 'gap-6',
                fetchError: false,
                // Removed problematic script concatenation
                // Attach delegated click handler to open the modal for any "Select Plan" button, with debug logs
            }, // End of defaults
            init: function () {
                this.fetchServices();
                this.listenTo(this, 'change:product1 change:product2 change:product3 change:product4 change:features1 change:features2 change:features3 change:smallOptionMessage change:gridGap change:fetchError change:services', this.renderContent);
                this.listenTo(this, 'change:services change:product1 change:product2 change:product3 change:product4', this.updateProductTraitOptions);
            },
            fetchServices: function () {
                var _this = this;
                var _a;
                if (((_a = this.get('services')) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    this.updateProductTraitOptions();
                    this.renderContent();
                    return;
                }
                console.log('[Pricing Table] Fetching services...');
                fetch('/api/product/all')
                    .then(function (response) { if (!response.ok)
                    throw new Error("HTTP error! status: ".concat(response.status)); return response.json(); })
                    .then(function (data) {
                    console.log('[Pricing Table] Services received:', data);
                    _this.set('services', data, { silent: true });
                    _this.set('fetchError', false, { silent: true });
                    _this.updateProductTraitOptions();
                    _this.renderContent();
                })
                    .catch(function (error) {
                    console.error('[Pricing Table Model] Error fetching services:', error);
                    _this.set('services', [], { silent: true });
                    _this.set('fetchError', true, { silent: true });
                    _this.updateProductTraitOptions();
                    _this.renderContent();
                });
            },
            updateProductTraitOptions: function () {
                var _this = this;
                var services = this.get('services') || [];
                var allProductKeys = ['product1', 'product2', 'product3', 'product4'];
                var selectedIds = allProductKeys.map(function (key) { var _a; return (_a = _this.get(key)) === null || _a === void 0 ? void 0 : _a.toString(); }).filter(function (id) { return id; });
                var defaultOption = [{ id: '', name: 'Select a product...', value: '' }];
                allProductKeys.forEach(function (currentTraitName) {
                    var _a;
                    var trait = _this.getTrait(currentTraitName);
                    if (!trait) {
                        console.warn("[Pricing Table Model] Could not find trait: ".concat(currentTraitName));
                        return;
                    }
                    var currentValue = (_a = _this.get(currentTraitName)) === null || _a === void 0 ? void 0 : _a.toString();
                    var availableOptions = services
                        .filter(function (service) {
                        var serviceIdStr = service.id.toString();
                        return (serviceIdStr === currentValue) || !selectedIds.includes(serviceIdStr);
                    })
                        .map(function (service) { return ({
                        id: service.id.toString(),
                        name: service.name,
                        value: service.id.toString()
                    }); });
                    var finalOptions = defaultOption.concat(availableOptions);
                    trait.set('options', finalOptions);
                });
            },
            renderContent: function () {
                var _this = this;
                var _a;
                var services = this.get('services') || [];
                var fetchError = this.get('fetchError');
                var gridGap = this.get('gridGap') || 'gap-6';
                var gridContainer = this.components().find(function (comp) { return comp.getAttributes()['data-gjs-type'] === 'pricing-table-grid-container'; });
                if (!gridContainer) {
                    console.error("[Pricing Table] Grid container not found! Recreating.");
                    this.empty();
                    // Ensure the recreated container is of the correct type
                    gridContainer = this.append({ type: 'pricing-table-grid-container', attributes: { class: "pricing-table-grid flex flex-wrap justify-center ".concat(gridGap) } })[0];
                }
                gridContainer.empty();
                var siblings = this.components().models.slice();
                for (var i = siblings.length - 1; i >= 0; i--) {
                    var sibling = siblings[i];
                    if (sibling !== gridContainer && sibling.cid !== gridContainer.cid) {
                        sibling.remove();
                    }
                }
                gridContainer.setClass("pricing-table-grid flex flex-wrap justify-center ".concat(gridGap));
                if (fetchError) {
                    this.append('<div data-gjs-type="error-message" class="text-center text-red-600 p-4">Error loading pricing data. Please check the API endpoint or network connection.</div>');
                    return;
                }
                if (services.length === 0 && !fetchError) {
                    this.append('<div data-gjs-type="info-message" class="text-center text-gray-500 p-4">No pricing plans available. Configure products or check the data source.</div>');
                    return;
                }
                var productKeys = ['product1', 'product2', 'product3'];
                var featureKeys = ['features1', 'features2', 'features3'];
                productKeys.forEach(function (productKey, index) {
                    var _a, _b;
                    var productId = (_a = _this.get(productKey)) === null || _a === void 0 ? void 0 : _a.toString();
                    var service = services.find(function (s) { var _a; return ((_a = s.id) === null || _a === void 0 ? void 0 : _a.toString()) === productId; });
                    var features = _this.get(featureKeys[index]) || '';
                    // Use the formatCurrency imported at the top
                    var displayPrice = service ? formatCurrency(service.price, service.currency) : '$ -';
                    // Create complete service data object
                    var serviceData = service ? {
                        id: service.id,
                        name: service.name,
                        description: service.description,
                        price: Number(service.price) || 0,
                        currency: service.currency || 'usd'
                    } : null;
                    gridContainer.append({
                        type: 'pricing-card',
                        cardTitle: (service === null || service === void 0 ? void 0 : service.name) || 'Select Product',
                        cardDescription: (service === null || service === void 0 ? void 0 : service.description) || 'Select a product using the traits panel.',
                        cardFeatures: features,
                        cardPrice: displayPrice,
                        buttonText: service ? 'Select Plan' : 'Unavailable',
                        serviceId: ((_b = service === null || service === void 0 ? void 0 : service.id) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                        serviceData: serviceData // Pass full service data
                    });
                });
                var smallOptionId = (_a = this.get('product4')) === null || _a === void 0 ? void 0 : _a.toString();
                var smallOptionService = services.find(function (s) { var _a; return ((_a = s.id) === null || _a === void 0 ? void 0 : _a.toString()) === smallOptionId; });
                if (smallOptionService) {
                    var smallOptionMessage = this.get('smallOptionMessage') || '';
                    var smallOptionButtonText = 'Select Option';
                    var numericPrice = Number(smallOptionService.price) || 0;
                    // Ensure 'name' field is used, consistent with API and likely ServiceData type
                    var serviceData = { id: smallOptionService.id, name: smallOptionService.name, description: smallOptionService.description, price: numericPrice, currency: smallOptionService.currency || 'usd' };
                    // Use the formatCurrency imported at the top
                    var displayPrice = formatCurrency(smallOptionService.price, smallOptionService.currency);
                    this.append({
                        tagName: 'div',
                        attributes: { 'data-gjs-type': 'pricing-table-alternative', class: 'pricing-table-small-option flex flex-col items-center mt-6 text-center' },
                        components: [
                            { tagName: 'span', attributes: { class: 'text-gray-700 dark:text-gray-300 mb-2 text-base' }, content: smallOptionMessage },
                            {
                                tagName: 'button',
                                attributes: {
                                    class: 'gjs-pricing-buy-button px-5 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 font-medium',
                                    'data-service': JSON.stringify(serviceData) // Use data-service with full JSON
                                },
                                content: "".concat(smallOptionButtonText, " (").concat(displayPrice, ")")
                            }
                        ]
                    });
                }
                else if (smallOptionId) {
                    this.append({ tagName: 'div', attributes: { 'data-gjs-type': 'pricing-table-alternative-error', class: 'pricing-table-small-option flex flex-col items-center mt-6 text-center' }, components: [{ tagName: 'span', attributes: { class: 'text-yellow-600 dark:text-yellow-400 mb-2 text-base' }, content: 'The selected alternative product is no longer available.' }] });
                }
            } // End renderContent
        }, // End model
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
                    console.warn('[PricingTable] Service ID not found on button:', button);
                }
            },
        }
    }); // End domc.addType
});
