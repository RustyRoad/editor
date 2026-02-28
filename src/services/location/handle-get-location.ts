import { MapManager } from './map-manager';
import { LocationService } from './location-service';
import { isAdPlatformWebView } from './platform-detection';
import { getDetectedPlatform } from './platform-name';
import { showFeedbackMessage } from './ui-dom-helpers';
import { updateButtonState } from './ui-button-helpers';
import { GETTING_LOCATION_TEXT, LOCATION_FOUND_TEXT } from './ui-constants';

export async function handleGetCurrentLocation(feedbackDisplayTarget: HTMLElement | null, locationButton: HTMLElement | null): Promise<void> {
  const inWebView = isAdPlatformWebView();
  const detectedPlatform = getDetectedPlatform();

  if (!window.mapManager || !feedbackDisplayTarget) {
    console.error("MapManager or feedbackDisplayTarget not ready.");
    if (feedbackDisplayTarget) showFeedbackMessage(feedbackDisplayTarget, 'Error: Map not ready.', 'error');
    return;
  }

  try {
    const statusMessage = inWebView ? `Getting location (may require ${detectedPlatform || 'app'} permissions)...` : GETTING_LOCATION_TEXT;
    showFeedbackMessage(feedbackDisplayTarget, statusMessage, 'status');
    updateButtonState(locationButton, { disabled: true });

    const position = await LocationService.getCurrentPosition();
    const pos = position as { coords: { latitude: number; longitude: number } };
    if (pos?.coords) {
      await window.mapManager.setPosition(pos.coords.latitude, pos.coords.longitude);
      showFeedbackMessage(feedbackDisplayTarget, LOCATION_FOUND_TEXT, 'status', 3000);
    } else { throw new Error("Received invalid position data."); }
  } catch (err) {
    let errorMessage = `Error: ${(err as Error).message || 'Could not retrieve location.'}`;
    if (inWebView) errorMessage += `\n\nFor ${detectedPlatform || 'social media app'} users: You can manually enter your address using the form below the map.`;
    showFeedbackMessage(feedbackDisplayTarget, errorMessage, 'error');
  } finally {
    updateButtonState(locationButton, { disabled: false });
  }
}
