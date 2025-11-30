import { offerStore } from './funnel-components';
import { addCheckoutFormComponent, addSeamlessCheckoutContainerComponent, addDynamicHeadlineComponent, addDynamicCtaButtonComponent, addProgressComponent, addTripwireCardComponent, addUpsellCardComponent, addContinueToPaymentButtonComponent, registerBlockManager } from './funnel';
/**
 * Main export function to initialize all funnel components
 */
export default function initFunnelComponents(editor) {
    // Proactively start fetching offers so dropdowns populate quickly
    offerStore.ensureFetch();
    // Initialize all funnel components
    addCheckoutFormComponent(editor);
    addSeamlessCheckoutContainerComponent(editor);
    addDynamicHeadlineComponent(editor);
    addDynamicCtaButtonComponent(editor);
    addProgressComponent(editor);
    addTripwireCardComponent(editor);
    addUpsellCardComponent(editor);
    addContinueToPaymentButtonComponent(editor);
    registerBlockManager(editor);
}
