import { handleFullscreenToggle } from './handle-fullscreen';
import { handleGetCurrentLocation } from './handle-get-location';
import { FULLSCREEN_BUTTON_ID, LOCATION_BUTTON_ID } from './ui-constants';

export function attachEventListeners(
  uiElements: { locationButton: HTMLElement | null; fullscreenButton: HTMLElement | null; addressDisplay: HTMLElement | null }
): void {
  const { locationButton, fullscreenButton, addressDisplay } = uiElements;

  if (fullscreenButton) {
    fullscreenButton.onclick = () => handleFullscreenToggle(fullscreenButton);
  } else {
    console.warn(`Element with ID '${FULLSCREEN_BUTTON_ID}' not found, cannot attach listener.`);
  }

  if (locationButton) {
    locationButton.onclick = () => handleGetCurrentLocation(addressDisplay, locationButton);
  } else {
    console.warn(`Element with ID '${LOCATION_BUTTON_ID}' not found, cannot attach listener.`);
  }
}
