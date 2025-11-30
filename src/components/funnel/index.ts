/**
 * Funnel Components Index
 *
 * This index file exports all the individual funnel component registration functions
 * that were split from the original initFunnelComponents.ts file to keep each file
 * under 50 lines for better maintainability.
 */

export { addCheckoutFormComponent } from './checkoutForm';
export { addSeamlessCheckoutContainerComponent } from './seamlessCheckoutContainer';
export { addDynamicHeadlineComponent } from './dynamicHeadline';
export { addDynamicCtaButtonComponent } from './dynamicCtaButton';
export { addProgressComponent } from './progress';
export { addTripwireCardComponent } from './tripwireCard';
export { addUpsellCardComponent } from './upsellCard';
export { addContinueToPaymentButtonComponent } from './continueToPaymentButton';
export { registerBlockManager } from './blockManager';