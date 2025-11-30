import {
  handleModalClose,
  createModalContainer,
  showModal,
  attachCloseHandlers
} from './modal-core';
import {
  generateModalHTML,
  generateAddressForm, formatPrice,
  ServiceData
} from './modal-ui';
import { setupAddressValidation } from './address-validation';
import { initLocationService } from '../services/locationService';

declare global {
  interface Window {
    trackEvent?: (eventName: string, properties?: Record<string, any>) => void;
  }
}

console.log('[service-modal.ts] Script execution started. Top of the file.');

let currentModal: HTMLDialogElement | null = null;

function closeModal() {
  handleModalClose();
  currentModal = null;
}


export function showServiceModal(serviceData: ServiceData) {
  // Close any existing modal first
  if (currentModal) {
    closeModal();
    setTimeout(() => showServiceModal(serviceData), 350);
    return;
  }

  console.log("Showing modal for service:", serviceData);

  // Basic validation
  // Replaced typeof serviceData.price with Object.prototype.toString.call
  // Reverted to check for serviceData.name, consistent with ServiceData type and API
  if (!serviceData?.id || Object.prototype.toString.call(serviceData.price) !== '[object Number]' || !serviceData.name) {
    console.error('[service-modal.ts] - Invalid service data passed to modal (missing id, price, or name):', serviceData);
    showErrorModal({ message: 'Invalid service data - service modal - missing required fields (ID, Price, Name).' });
    return;
  }
  // Track when a user views a service modal
  // Use the global trackEvent function
  window.trackEvent?.('ViewContent', {
    event_id: serviceData.id,
    value: serviceData.price,
    currency: serviceData.currency || 'USD',
    items: [{
      item_id: serviceData.id,
      item_name: serviceData.name,
      price: serviceData.price,
      quantity: 1,
    }],
  });

  // Create modal container
  const modal = createModalContainer();
  currentModal = modal;

  // Attach serviceData to the <dialog> element for Stripe compatibility
  (modal as HTMLDialogElement).dataset.serviceData = JSON.stringify(serviceData);

  // Generate modal HTML
  modal.innerHTML = generateModalHTML(serviceData);

  // Also attach serviceData to inner modal-content-area for compatibility
  const inner = modal.querySelector('.modal-content-area');
  if (inner) (inner as HTMLElement).dataset.serviceData = JSON.stringify(serviceData);

  // Show modal
  showModal(modal);
  attachCloseHandlers(modal);
  const closeBtn = modal.querySelector('#modal-close-button');
  if (closeBtn) {
    closeBtn.removeEventListener('click', handleModalClose as any);
    closeBtn.addEventListener('click', closeModal);
  }  // Add address form to modal
  const addressSection = modal.querySelector('#address-validation-section');
  if (addressSection) {
    console.log('[service-modal.ts] Address section found in modal. Generating address form...');
    generateAddressForm(modal, serviceData).then((html) => {
      addressSection.innerHTML = html;

      // Set up address validation after the form is generated and DOM is updated
      // Small delay to ensure elements are available
      setTimeout(() => {
        try {
          setupAddressValidation(modal, serviceData);
          console.log('[service-modal.ts] Address validation setup completed successfully');
        } catch (error) {
          console.warn('[service-modal.ts] Address validation setup failed, falling back to form submission:', error);
          // Form submission will still work even if JS validation fails
        }
      }, 100);

    }).catch((err) => {
      console.error('Error generating address form:', err);
    });
  }
}

interface ErrorModalOptions {
  message: string;
}

export function showErrorModal({ message }: ErrorModalOptions): void {
  const modal: HTMLDialogElement = createModalContainer();
  currentModal = modal;

  modal.innerHTML = `
    <div style="background:white; padding:2rem; color:red; border-radius: 8px; max-width: 400px; margin-top: 40px;">
      ${message}
      <button onclick="this.parentNode.parentNode.remove(); document.body.style.overflow='';">Close</button>
    </div>
  `;

  showModal(modal);
  modal.addEventListener('click', function (e: MouseEvent) {
    if (e.target === modal) {
      closeModal();
    }
  });
}
// Make the modal globally accessible for GrapesJS/inline script
if (typeof window !== 'undefined') {
  console.log('[service-modal.ts] About to assign to window.showServiceModal. Current type:', typeof window.showServiceModal);
  window.openPricingModal = showServiceModal;
  window.showServiceModal = showServiceModal;
  console.log('[service-modal.ts] Assigned to window.showServiceModal. New type:', typeof window.showServiceModal, 'Content of showServiceModal function:', showServiceModal.toString().substring(0, 100) + '...'); // Log part of the function code
} else {
  console.error('[service-modal.ts] CRITICAL: window object is undefined at the point of global assignment.');
}

console.log('[service-modal.ts] Script execution finished. End of the file.');

// Service modal no longer overrides the API client base URL; default SDK config handles host resolution.
