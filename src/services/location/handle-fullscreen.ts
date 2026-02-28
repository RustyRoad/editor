import { MapManager } from './map-manager';
import { updateButtonState } from './ui-button-helpers';

export function handleFullscreenToggle(fullscreenButton: HTMLElement | null): void {
  if (!window.mapManager) { console.error("MapManager not available for fullscreen toggle."); return; }
  const isFullscreen = window.mapManager.toggleFullscreen();
  updateButtonState(fullscreenButton, { text: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' });
  const popupFullscreenBtn = window.mapManager.marker?.getPopup()?.getElement()?.querySelector('.fullscreen-btn-popup');
  if (popupFullscreenBtn) popupFullscreenBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
}
