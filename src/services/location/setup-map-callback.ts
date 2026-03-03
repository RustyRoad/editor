import { formatAddressForDisplay } from './address-formatter';
import { prepareApiAddress, findInputInContext, findSelectInContext } from './address-api-helpers';
import { setupScheduleServiceButton } from './schedule-service-button';

export function setupMapManagerCallback(addressDisplay: HTMLElement | null): void {
  if (!window.mapManager) { console.warn("MapManager not available for onLocationConfirmed."); return; }

  window.mapManager.onLocationConfirmed = async (locationData) => {
    if (!addressDisplay) { console.error("addressDisplay not found."); return; }
    if (!locationData || !locationData.address || !locationData.coordinates) {
      addressDisplay.innerHTML = formatAddressForDisplay(null, locationData?.coordinates || null);
      return;
    }

    addressDisplay.innerHTML = formatAddressForDisplay(locationData.address, locationData.coordinates);
    const apiAddress = prepareApiAddress(locationData);
    const modalContext: HTMLElement | null = addressDisplay.closest ? addressDisplay.closest('dialog') as HTMLElement : null;
    
    const emailInput = findInputInContext(modalContext, '#email');
    const trashDaySelect = findSelectInContext(modalContext, '#trash-day');
    const subscribeCheckbox = findInputInContext(modalContext, '#subscribe_to_marketing');
    const numberOfBinsElement = findInputInContext(modalContext, '#number-of-bins');

    let additional_bins = 0;
    if (numberOfBinsElement) additional_bins = Math.max(0, (parseInt(numberOfBinsElement.value) || 0) - 2);
    window.additionalBins = additional_bins;

    const geocodePayload = buildGeocodePayload(apiAddress, emailInput, trashDaySelect, subscribeCheckbox, additional_bins, locationData);
    const feedbackElement = createFeedbackElement(addressDisplay);
    await processGeocodeResponse(geocodePayload, feedbackElement, apiAddress, addressDisplay);
  };
}

function buildGeocodePayload(apiAddress: any, emailInput: HTMLInputElement | null, trashDaySelect: HTMLSelectElement | null, subscribeCheckbox: HTMLInputElement | null, additional_bins: number, locationData: any): any {
  const payload: any = {
    address: apiAddress, email: emailInput?.value.trim() || null, trash_day: trashDaySelect?.value || null,
    subscribe_to_marketing: subscribeCheckbox?.checked || null, additional_bins,
    location_type: 'geolocation', coordinates: locationData.coordinates
  };
  Object.keys(payload).forEach(key => { if (payload[key] === null || payload[key] === undefined) delete payload[key]; });
  return payload;
}

function createFeedbackElement(addressDisplay: HTMLElement): HTMLElement {
  let feedbackElement = addressDisplay.querySelector('.api-feedback-message') as HTMLElement;
  if (!feedbackElement) {
    feedbackElement = document.createElement('div');
    feedbackElement.className = 'api-feedback-message';
    feedbackElement.style.marginTop = '10px';
    feedbackElement.style.fontWeight = '500';
    addressDisplay.appendChild(feedbackElement);
  }
  return feedbackElement;
}

async function processGeocodeResponse(geocodePayload: any, feedbackElement: HTMLElement, apiAddress: any, addressDisplay: HTMLElement): Promise<void> {
  const setApiFeedback = (msg: string, type: 'info' | 'success' | 'error' | 'loading' = 'info') => {
    feedbackElement.textContent = msg;
    feedbackElement.className = 'api-feedback-message';
    if (type === 'success') feedbackElement.style.color = 'green';
    else if (type === 'error') feedbackElement.style.color = 'red';
    else if (type === 'loading') feedbackElement.style.color = 'blue';
    else feedbackElement.style.color = 'black';
  };

  setApiFeedback('Checking service availability...', 'loading');
  try {
    const response = await fetch('/api/geocode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geocodePayload) });
    if (!response.ok) throw new Error(`Address validation failed (${response.status})`);
    
    const geocodeDataResponse = await response.json();
    localStorage.setItem('geocode-data', JSON.stringify(geocodeDataResponse));
    window.lastValidatedAddressForModal = { inside_zone: geocodeDataResponse.inside_zone, valid_trash_day: geocodeDataResponse.valid_trash_day, next_service_day: geocodeDataResponse.next_service_day, location: geocodeDataResponse.location, address_id: geocodeDataResponse.address_id };

    if (!geocodeDataResponse.inside_zone) {
      setApiFeedback('Sorry, service is not currently available at this address.', 'error');
    } else {
      setApiFeedback('Service is available!' + (geocodeDataResponse.next_service_day ? ` Next service: ${geocodeDataResponse.next_service_day}.` : ''), 'success');
      populateFormFields(apiAddress);
      await setupScheduleServiceButton(addressDisplay, apiAddress);
    }
  } catch (err) {
    console.error('Error calling /api/geocode:', err);
    setApiFeedback(`Error checking availability: ${(err as Error).message}`, 'error');
  }
}

function populateFormFields(apiAddress: any): void {
  const fields: [string, string][] = [['address1', 'line1'], ['city', 'city'], ['state', 'state'], ['zip5', 'postal_code']];
  fields.forEach(([id, key]) => { const el = document.getElementById(id); if (el) (el as HTMLInputElement).value = apiAddress[key]; });
}
