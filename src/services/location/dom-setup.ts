import { UIHelpers } from './ui-helpers';
import { UIConstants } from './init-helpers';

export const getOrCreateById = (id: string, createFn: () => HTMLElement, parent: HTMLElement | null): HTMLElement => {
    let element = document.getElementById(id);
    if (!element) {
        element = createFn();
        if (!element.id) element.id = id;
        if (parent) parent.appendChild(element);
        else document.body.appendChild(element);
    } else if (parent && element.parentElement !== parent) {
        parent.appendChild(element);
    }
    return element;
};

export const getOrCreateBySelector = (selector: string, parent: HTMLElement, createFn: () => HTMLElement): Element => {
    let element = parent.querySelector(selector);
    if (!element) { element = createFn(); parent.appendChild(element); }
    return element;
};

export const setupDOMElements = (
    contentElementForAlt: HTMLElement,
    mapContainerForButtons: HTMLElement,
    feedbackContainerOverride: HTMLElement | null
) => {
    const { LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID, GLOBAL_ADDRESS_DISPLAY_ID, ADDRESS_DISPLAY_CLASS } = UIConstants;
    const buttonsParent = mapContainerForButtons;
    const locationButton = getOrCreateById(LOCATION_BUTTON_ID, () => UIHelpers.createButton('Get Current Location', { top: '10px', right: '10px' }), buttonsParent);
    const fullscreenButton = getOrCreateById(FULLSCREEN_BUTTON_ID, () => UIHelpers.createButton('Fullscreen', { top: '10px', right: '200px' }), buttonsParent);
    let actualFeedbackDisplayTarget: HTMLElement;
    if (feedbackContainerOverride) {
        actualFeedbackDisplayTarget = feedbackContainerOverride;
        actualFeedbackDisplayTarget.innerHTML = '';
    } else if (mapContainerForButtons.parentElement) {
        const existing = document.getElementById(GLOBAL_ADDRESS_DISPLAY_ID);
        if (existing) {
            actualFeedbackDisplayTarget = existing;
            actualFeedbackDisplayTarget.innerHTML = '';
        } else {
            actualFeedbackDisplayTarget = UIHelpers.createAddressDisplay();
            actualFeedbackDisplayTarget.id = GLOBAL_ADDRESS_DISPLAY_ID;
            actualFeedbackDisplayTarget.classList.add(ADDRESS_DISPLAY_CLASS);
            mapContainerForButtons.parentElement.insertBefore(actualFeedbackDisplayTarget, mapContainerForButtons);
        }
    } else {
        actualFeedbackDisplayTarget = getOrCreateBySelector(`.${ADDRESS_DISPLAY_CLASS}`, contentElementForAlt, () => {
            const el = UIHelpers.createAddressDisplay();
            el.classList.add(ADDRESS_DISPLAY_CLASS);
            el.id = GLOBAL_ADDRESS_DISPLAY_ID + "_alt";
            return el;
        }) as HTMLElement;
    }
    return { locationButton, fullscreenButton, addressDisplay: actualFeedbackDisplayTarget };
};

export const attachEventListeners = (
    { locationButton, fullscreenButton, addressDisplay }: { locationButton: HTMLElement | null; fullscreenButton: HTMLElement | null; addressDisplay: HTMLElement | null },
    helpers: { handleFullscreenToggle: typeof import('./init-helpers').handleFullscreenToggle; handleGetCurrentLocation: typeof import('./init-helpers').handleGetCurrentLocation }
) => {
    if (fullscreenButton) fullscreenButton.onclick = () => helpers.handleFullscreenToggle(fullscreenButton);
    if (locationButton) locationButton.onclick = () => helpers.handleGetCurrentLocation(addressDisplay, locationButton);
};
