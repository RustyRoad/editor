import { ServiceData } from '../../components/modal-ui';
import { initializeStripeElements, handlePaymentSubmit } from '../../components/payment-handler';

export async function setupScheduleServiceButton(addressDisplay: HTMLElement, apiAddress: any): Promise<void> {
  let scheduleServiceButton = document.getElementById('checkout-button');
  if (!scheduleServiceButton) { console.warn("Schedule service button (checkout-button) not found."); return; }

  const form = scheduleServiceButton.closest('form');
  const isTikTokBrowser = navigator.userAgent.includes('TikTok') || navigator.userAgent.includes('ByteDance') || navigator.userAgent.includes('Musically');
  
  if (form && (isTikTokBrowser || !window.Stripe)) {
    console.log("TikTok browser or no Stripe detected - using standard HTML form submission");
    return;
  }

  const newScheduleServiceButton = scheduleServiceButton.cloneNode(true) as HTMLButtonElement;
  scheduleServiceButton.parentNode?.replaceChild(newScheduleServiceButton, scheduleServiceButton);
  scheduleServiceButton = newScheduleServiceButton;

  scheduleServiceButton.addEventListener('click', async (event) => {
    await handleCheckoutClick(event, scheduleServiceButton as HTMLButtonElement, apiAddress);
  });
}

async function handleCheckoutClick(event: Event, button: HTMLButtonElement, apiAddress: any): Promise<void> {
  button.disabled = true;

  const activeServiceModalElement = button.closest('dialog') as HTMLElement | null;
  if (!activeServiceModalElement) {
    alert('Error: Could not determine the active service context. Please try reopening the service modal.');
    button.disabled = false;
    return;
  }

  const modalContentAreaForStripe = activeServiceModalElement.querySelector('.modal-content-area') as HTMLElement | null;
  if (!modalContentAreaForStripe) {
    alert('Error: Modal content structure error.');
    button.disabled = false;
    return;
  }

  const showInModalFeedback = createFeedbackHelper(modalContentAreaForStripe);

  try {
    const serviceDataString = activeServiceModalElement.dataset.serviceData;
    if (!serviceDataString) throw new Error("Service data is missing from the active modal.");
    const serviceProductData: ServiceData = JSON.parse(serviceDataString);

    const currentEmailInput = modalContentAreaForStripe.querySelector('#email') as HTMLInputElement | null;
    const currentTrashDaySelect = modalContentAreaForStripe.querySelector('#trash-day') as HTMLSelectElement | null;

    const addressDataForStripe = {
      ...apiAddress, email: currentEmailInput?.value.trim() || '', trash_day: currentTrashDaySelect?.value || '',
    };

    const stripeInitialized = await initializeStripeElements(modalContentAreaForStripe, serviceProductData, addressDataForStripe);

    if (stripeInitialized) {
      showInModalFeedback('Please enter payment details.', 'info');
      const paymentForm = modalContentAreaForStripe.querySelector('#payment-form');
      if (paymentForm) paymentForm.addEventListener('submit', (e) => handlePaymentSubmit(e, modalContentAreaForStripe));
      else showInModalFeedback('Error displaying payment form.', 'error');
      
      const addressSect = modalContentAreaForStripe.querySelector('#address-validation-section');
      const paymentSect = modalContentAreaForStripe.querySelector('#payment-section');
      if (addressSect) (addressSect as HTMLElement).style.display = 'none';
      if (paymentSect) (paymentSect as HTMLElement).classList.remove('hidden');
    } else {
      showInModalFeedback('Failed to initialize payment system. Please check details and try again.', 'error');
      button.disabled = false;
    }
  } catch (err) {
    console.error('Error during global checkout button processing:', err);
    showInModalFeedback(`Checkout Error: ${(err as Error).message}`, 'error');
    button.disabled = false;
  }
}

function createFeedbackHelper(modalContentArea: HTMLElement): (msg: string, type: 'info' | 'error' | 'success' | 'loading') => void {
  const modalSpecificFeedbackDiv = modalContentArea.querySelector('#address-feedback') as HTMLElement | null;
  return (msg: string, type: 'info' | 'error' | 'success' | 'loading' = 'info') => {
    if (modalSpecificFeedbackDiv) {
      modalSpecificFeedbackDiv.textContent = msg;
      modalSpecificFeedbackDiv.className = 'mt-3 text-sm font-medium';
      if (type === 'error') modalSpecificFeedbackDiv.classList.add('text-red-600', 'dark:text-red-400');
      else if (type === 'success') modalSpecificFeedbackDiv.classList.add('text-green-600', 'dark:text-green-400');
      else modalSpecificFeedbackDiv.classList.add('text-blue-600', 'dark:text-blue-400');
    } else {
      console.log(`ModalFeedback (${type}): ${msg}`);
    }
  };
}
