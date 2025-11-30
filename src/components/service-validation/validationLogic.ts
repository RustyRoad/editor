import { ServiceData } from '../modal-ui';

// Type for GrapesJS component model
interface ServiceModel {
    attributes?: ServiceData;
    get?: (key: string) => any;
    dataset?: {
        service?: string;
    };
}

export const validateServiceData = (service: ServiceModel | ServiceData): string | undefined => {
    if (!service) {
        console.error("[Service Validation] Service data is undefined/null");
        return '<div class="text-red-600 p-4">Error: No service data provided</div>';
    }

    // Handle GrapesJS component structure
    let serviceData: ServiceData;
    if ('attributes' in service && service.attributes) {
        serviceData = service.attributes;
    } else if ('get' in service && typeof service.get === 'function') {
        serviceData = {
            id: service.get('id'),
            name: service.get('name'),
            price: service.get('price'),
            description: service.get('description'),
            currency: service.get('currency'),
            images: service.get('images'),
            stripe_product_id: service.get('stripe_product_id') || service.get('id')
        };
    } else if ('dataset' in service && service.dataset?.service) {
        try {
            serviceData = JSON.parse(service.dataset.service);
        } catch (e) {
            console.error("[Service Validation] Failed to parse dataset service", e);
            return '<div class="text-red-600 p-4">Error: Invalid service data format</div>';
        }
    } else {
        serviceData = service as ServiceData;
    }

    // Extract required fields safely
    const safeServiceData = {
        id: String(serviceData.id || ''),
        name: String(serviceData.name || ''),
        price: typeof serviceData.price === 'number' ? serviceData.price : parseFloat(String(serviceData.price)) || 0
    };

    const missingFields: string[] = [];
    if (!safeServiceData.id) missingFields.push('id');
    if (typeof safeServiceData.price !== 'number') missingFields.push('price');
    if (!safeServiceData.name) missingFields.push('name');

    if (missingFields.length > 0) {
        const error = `Missing required fields: ${missingFields.join(', ')}`;
        console.error("[Service Validation] Validation failed:", error, {
            input: serviceData,
            safe: safeServiceData
        });
        return `<div class="text-red-600 p-4">Error: ${error}</div>`;
    }
};