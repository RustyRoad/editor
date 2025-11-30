import type { Editor } from 'grapesjs';
import { offerStore } from './funnel-components';
import {
  addCheckoutFormComponent,
  addSeamlessCheckoutContainerComponent,
  addDynamicHeadlineComponent,
  addDynamicCtaButtonComponent,
  addProgressComponent,
  addTripwireCardComponent,
  addUpsellCardComponent,
  addContinueToPaymentButtonComponent,
  registerBlockManager
} from './funnel';
import initTeraVariables from './tera-variables';

/**
 * Main export function to initialize all funnel components
 */
export default function initFunnelComponents(editor: Editor): void {
  // Proactively start fetching offers so dropdowns populate quickly
  offerStore.ensureFetch();

  // Initialize Tera template variables (Mautic-style tokens)
  initTeraVariables(editor);

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