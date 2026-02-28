import { isAdPlatformWebView, getDetectedPlatform } from './platform';
import { UIHelpers } from './ui-helpers';
import { LocationService } from './geocoding';

export const UIConstants = {
    LOCATION_BUTTON_ID: 'global-location-button',
    FULLSCREEN_BUTTON_ID: 'global-fullscreen-button',
    ADDRESS_DISPLAY_CLASS: 'address-display-container',
    GLOBAL_ADDRESS_DISPLAY_ID: 'global-address-display-for-map',
    SUBMIT_BUTTON_CLASS: 'submit-location-btn',
    UI_LISTENERS_SETUP_COMPLETE_CLASS: 'location-service-ui-listeners-setup-complete',
    CONTENT_ELEMENT_SELECTOR: '#content',
    GETTING_LOCATION_TEXT: 'Getting location...',
    LOCATION_FOUND_TEXT: 'Location found! Adjust pin on map.',
    SUBMITTING_TEXT: 'Sending...',
    SUBMITTED_TEXT: 'Submitted!',
    SUBMIT_ERROR_TEXT: 'Error - Try Again',
    DEFAULT_SUBMIT_TEXT: 'Submit Location',
    MESSAGE_DISPLAY_DURATION: 3000,
    WAIT_FOR_ELEMENT_TIMEOUT: 5000,
    BUTTON_SUCCESS_BG: '#28a745',
    BUTTON_ERROR_BG: '#dc3545'
};

export const formatAddressForDisplay = (addressComponentData: any, coordinates: { latitude: number; longitude: number } | null): string => {
    const addr = addressComponentData || {};
    let formattedHtml = '<h3>Selected Location</h3>';
    let streetAddressLine = '';
    if (addr.Address) streetAddressLine = addr.Address;
    else if (addr.AddNum && addr.StreetName) streetAddressLine = `${addr.AddNum} ${addr.StreetName}`;
    else if (addr.house_number && (addr.road || addr.street)) streetAddressLine = `${addr.house_number} ${addr.road || addr.street}`;
    else if (addr.road || addr.street) streetAddressLine = addr.road || addr.street;
    else if (addr.Match_addr) streetAddressLine = addr.Match_addr.split(',')[0];
    formattedHtml += streetAddressLine ? `<p>${streetAddressLine.trim()}</p>` : '<p>Street address not available.</p>';
    const cityLineParts = [addr.City || addr.city || addr.town || '', addr.Region || addr.state || '', addr.Postal || addr.postcode || ''];
    const cityLine = cityLineParts.filter(p => p).join(' ').trim();
    if (cityLine) formattedHtml += `<p>${cityLine}</p>`;
    if (!streetAddressLine && !cityLine && (!addr || Object.keys(addr).length === 0)) {
        formattedHtml = '<h3>Selected Location</h3><p>Address information could not be determined.</p>';
    }
    formattedHtml += coordinates
        ? `<p><small>Lat: ${coordinates.latitude.toFixed(6)}, Lng: ${coordinates.longitude.toFixed(6)}</small></p>`
        : `<p><small>Coordinates not available.</small></p>`;
    return formattedHtml;
};

export const showFeedbackMessage = (container: HTMLElement | null, textContent: string, messageType: 'error' | 'status', autoClearDelay = 0) => {
    if (!container) return;
    container.innerHTML = '';
    const msg = document.createElement('div');
    msg.textContent = textContent;
    msg.style.cssText = messageType === 'error' ? 'color: #dc3545; padding: 10px;' : 'padding: 10px; background: #f8f9fa; border-radius: 5px; margin-bottom: 10px;';
    container.appendChild(msg);
    if (autoClearDelay > 0) setTimeout(() => { if (container.contains(msg)) container.removeChild(msg); }, autoClearDelay);
};

export const updateButtonState = (button: HTMLElement | null, { text, disabled, backgroundColor }: { text?: string; disabled?: boolean; backgroundColor?: string }) => {
    if (!button) return;
    if (text !== undefined) button.innerText = text;
    if (disabled !== undefined) (button as HTMLButtonElement).disabled = disabled;
    if (backgroundColor !== undefined) {
        button.style.backgroundColor = backgroundColor;
        button.onmouseout = () => button.style.backgroundColor = backgroundColor || '#007bff';
    }
};

export const handleFullscreenToggle = (fullscreenButton: HTMLElement | null) => {
    if (!window.mapManager) return;
    const isFullscreen = window.mapManager.toggleFullscreen();
    updateButtonState(fullscreenButton, { text: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' });
};

export const handleGetCurrentLocation = async (feedbackDisplayTarget: HTMLElement | null, locationButton: HTMLElement | null) => {
    const inWebView = isAdPlatformWebView();
    const detectedPlatform = getDetectedPlatform();
    if (!window.mapManager || !feedbackDisplayTarget) return;
    try {
        const statusMessage = inWebView ? `Getting location (may require ${detectedPlatform || 'app'} permissions)...` : UIConstants.GETTING_LOCATION_TEXT;
        showFeedbackMessage(feedbackDisplayTarget, statusMessage, 'status');
        updateButtonState(locationButton, { disabled: true });
        const position = await LocationService.getCurrentPosition();
        const pos = position as any;
        if (pos?.coords) {
            await window.mapManager.setPosition(pos.coords.latitude, pos.coords.longitude);
            showFeedbackMessage(feedbackDisplayTarget, UIConstants.LOCATION_FOUND_TEXT, 'status', UIConstants.MESSAGE_DISPLAY_DURATION);
        } else { throw new Error("Invalid position data."); }
    } catch (err) {
        let errorMessage = `Error: ${(err as Error).message || 'Could not retrieve location.'}`;
        if (inWebView) errorMessage += `\n\nFor ${detectedPlatform || 'social media app'} users: You can manually enter your address using the form below the map.`;
        showFeedbackMessage(feedbackDisplayTarget, errorMessage, 'error');
    } finally { updateButtonState(locationButton, { disabled: false }); }
};
