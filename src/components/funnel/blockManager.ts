import type { Editor } from 'grapesjs';
import { COMPONENT_TYPES } from '../funnel-components';

export function registerBlockManager(editor: Editor): void {
  const bm = editor.BlockManager;

  // Main funnel components
  bm.add(COMPONENT_TYPES.CHECKOUT_FORM, {
    label: 'Funnel Checkout Form',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.CHECKOUT_FORM },
    attributes: {
      class: 'fa fa-shopping-cart',
      title: 'Add a funnel checkout form'
    }
  });

  // Seamless checkout components
  bm.add(COMPONENT_TYPES.SEAMLESS_CHECKOUT_CONTAINER, {
    label: 'Seamless Checkout',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.SEAMLESS_CHECKOUT_CONTAINER },
    attributes: {
      class: 'fa fa-credit-card',
      title: 'Add a seamless two-step checkout flow'
    }
  });

  bm.add(COMPONENT_TYPES.CONTINUE_TO_PAYMENT_BUTTON, {
    label: 'Seamless Checkout Button',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.CONTINUE_TO_PAYMENT_BUTTON },
    attributes: {
      class: 'fa fa-play-circle',
      title: 'Add a seamless checkout trigger button'
    }
  });

  bm.add(COMPONENT_TYPES.PROGRESS, {
    label: 'Funnel Progress',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.PROGRESS },
    attributes: {
      class: 'fa fa-tasks',
      title: 'Add funnel progress indicator'
    }
  });

  // Dynamic content blocks
  bm.add(COMPONENT_TYPES.DYNAMIC_HEADLINE, {
    label: 'Dynamic Headline',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.DYNAMIC_HEADLINE },
    attributes: { class: 'fa fa-header' }
  });

  bm.add(COMPONENT_TYPES.DYNAMIC_CTA_BUTTON, {
    label: 'Dynamic CTA Button',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.DYNAMIC_CTA_BUTTON },
    attributes: { class: 'fa fa-mouse-pointer' }
  });

  // Offer cards
  bm.add(COMPONENT_TYPES.TRIPWIRE_CARD, {
    label: 'Tripwire Offer Card',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.TRIPWIRE_CARD },
    attributes: {
      class: 'fa fa-gift',
      title: 'Add tripwire offer card'
    }
  });

  bm.add(COMPONENT_TYPES.UPSELL_CARD, {
    label: 'Upsell Card',
    category: 'Funnel Components',
    content: { type: COMPONENT_TYPES.UPSELL_CARD },
    attributes: {
      class: 'fa fa-arrow-up',
      title: 'Add upsell offer card'
    }
  });

  // Simple content blocks
  bm.add('address-line', {
    label: 'Address Line',
    category: 'Funnel Components',
    content: '<p class="text-gray-600">Service for {{ ctx.address_line }}</p>',
    attributes: { class: 'fa fa-map-marker' }
  });

  bm.add('neighborhood-badge', {
    label: 'Neighborhood Badge',
    category: 'Funnel Components',
    content: '<span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{{ ctx.neighborhood | default(value="Neighborhood", boolean=true) }} Special</span>',
    attributes: { class: 'fa fa-tag' }
  });
}