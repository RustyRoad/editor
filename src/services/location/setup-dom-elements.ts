import { UIHelpers } from './ui-helpers';
import { getOrCreateById, getOrCreateBySelector } from './ui-dom-helpers';
import { LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID, GLOBAL_ADDRESS_DISPLAY_ID, ADDRESS_DISPLAY_CLASS } from './ui-constants';

interface SetupDOMResult {
  locationButton: HTMLElement | null;
  fullscreenButton: HTMLElement | null;
  addressDisplay: HTMLElement | null;
}

export function setupDOMElements(
  contentElementForAddress: HTMLElement,
  mapContainerForButtons: HTMLElement,
  feedbackContainerOverride: HTMLElement | null
): SetupDOMResult {
  const buttonsParent = mapContainerForButtons;

  const locationButton = getOrCreateById(LOCATION_BUTTON_ID,
    () => UIHelpers.createButton('Get Current Location', { top: '10px', right: '10px' }), buttonsParent);

  const fullscreenButton = getOrCreateById(FULLSCREEN_BUTTON_ID,
    () => UIHelpers.createButton('Fullscreen', { top: '10px', right: '200px' }), buttonsParent);

  let actualFeedbackDisplayTarget: HTMLElement;
  if (feedbackContainerOverride && feedbackContainerOverride instanceof HTMLElement) {
    actualFeedbackDisplayTarget = feedbackContainerOverride;
    actualFeedbackDisplayTarget.innerHTML = '';
  } else if (mapContainerForButtons && mapContainerForButtons.parentElement) {
    actualFeedbackDisplayTarget = document.getElementById(GLOBAL_ADDRESS_DISPLAY_ID) || createAddressDisplay();
    if (!document.getElementById(GLOBAL_ADDRESS_DISPLAY_ID)) {
      mapContainerForButtons.parentElement.insertBefore(actualFeedbackDisplayTarget, mapContainerForButtons);
    }
    actualFeedbackDisplayTarget.innerHTML = '';
  } else {
    actualFeedbackDisplayTarget = getOrCreateBySelector(`.${ADDRESS_DISPLAY_CLASS}`, contentElementForAddress, () => {
      const el = UIHelpers.createAddressDisplay();
      el.classList.add(ADDRESS_DISPLAY_CLASS);
      el.id = GLOBAL_ADDRESS_DISPLAY_ID + "_alt";
      return el;
    }) as HTMLElement;
  }
  
  return { locationButton, fullscreenButton, addressDisplay: actualFeedbackDisplayTarget };
}

function createAddressDisplay(): HTMLElement {
  const el = UIHelpers.createAddressDisplay();
  el.id = GLOBAL_ADDRESS_DISPLAY_ID;
  el.classList.add(ADDRESS_DISPLAY_CLASS);
  return el;
}
