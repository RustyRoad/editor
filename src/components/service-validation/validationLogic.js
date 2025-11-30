export var validateServiceData = function (service) {
    var _a;
    if (!service) {
        console.error("[Service Validation] Service data is undefined/null");
        return '<div class="text-red-600 p-4">Error: No service data provided</div>';
    }
    // Handle GrapesJS component structure
    var serviceData;
    if ('attributes' in service && service.attributes) {
        serviceData = service.attributes;
    }
    else if ('get' in service && typeof service.get === 'function') {
        serviceData = {
            id: service.get('id'),
            name: service.get('name'),
            price: service.get('price'),
            description: service.get('description'),
            currency: service.get('currency'),
            images: service.get('images'),
            stripe_product_id: service.get('stripe_product_id') || service.get('id')
        };
    }
    else if ('dataset' in service && ((_a = service.dataset) === null || _a === void 0 ? void 0 : _a.service)) {
        try {
            serviceData = JSON.parse(service.dataset.service);
        }
        catch (e) {
            console.error("[Service Validation] Failed to parse dataset service", e);
            return '<div class="text-red-600 p-4">Error: Invalid service data format</div>';
        }
    }
    else {
        serviceData = service;
    }
    // Extract required fields safely
    var safeServiceData = {
        id: String(serviceData.id || ''),
        name: String(serviceData.name || ''),
        price: typeof serviceData.price === 'number' ? serviceData.price : parseFloat(String(serviceData.price)) || 0
    };
    var missingFields = [];
    if (!safeServiceData.id)
        missingFields.push('id');
    if (typeof safeServiceData.price !== 'number')
        missingFields.push('price');
    if (!safeServiceData.name)
        missingFields.push('name');
    if (missingFields.length > 0) {
        var error = "Missing required fields: ".concat(missingFields.join(', '));
        console.error("[Service Validation] Validation failed:", error, {
            input: serviceData,
            safe: safeServiceData
        });
        return "<div class=\"text-red-600 p-4\">Error: ".concat(error, "</div>");
    }
};
