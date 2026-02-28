import { ReverseGeocodeResult } from './types';
import { MapManager } from './map-manager';

export function buildPopupContent(addressInfo: ReverseGeocodeResult | null, isFullscreen: boolean): HTMLElement {
  const popupContent = document.createElement('div');
  popupContent.className = 'location-popup';
  
  let popupBodyHtml = '';
  if (window.formatAddressForDisplayHelper && addressInfo?.success) {
    popupBodyHtml = window.formatAddressForDisplayHelper(addressInfo.address, addressInfo.coordinates);
  } else {
    const addr = addressInfo?.address || {};
    popupBodyHtml = `<h3>Selected Location</h3><p>${addr.Address || addr.road || 'Address N/A'}</p>`;
  }
  
  popupContent.innerHTML = `<div style="min-width: 250px;">${popupBodyHtml}
    <div style="display: flex; gap: 10px; margin-top: 10px;">
      <button class="confirm-btn" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Confirm Location</button>
      <button class="fullscreen-btn-popup" style="padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">${isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
    </div></div>`;
  
  return popupContent;
}

export function attachPopupListeners(popupContent: HTMLElement, mapManager: MapManager): void {
  const confirmBtn = popupContent.querySelector('.confirm-btn');
  const fullscreenBtnPopup = popupContent.querySelector('.fullscreen-btn-popup');
  
  if (confirmBtn) {
    (confirmBtn as HTMLElement).onclick = () => {
      if (mapManager.addressInfo) mapManager.onLocationConfirmed(mapManager.addressInfo);
      if (mapManager.marker) mapManager.marker.closePopup();
    };
  }
  
  if (fullscreenBtnPopup) {
    (fullscreenBtnPopup as HTMLElement).onclick = () => {
      const isNowFullscreen = mapManager.toggleFullscreen();
      fullscreenBtnPopup.textContent = isNowFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    };
  }
}
