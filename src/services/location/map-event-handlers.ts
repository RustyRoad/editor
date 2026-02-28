import { MapManager } from './map-manager';
import { CONFIG } from './config';

// Map event handlers for marker and map interactions
export function setupMapEventHandlers(mapManager: MapManager): void {
  if (!mapManager.map || !mapManager.marker) return;
  
  mapManager.marker.on('dragend', async (e) => {
    const position = e.target.getLatLng();
    mapManager.currentPosition = { latitude: position.lat, longitude: position.lng };
    await mapManager.updateAddressDisplay();
  });
  
  mapManager.map.on('click', async (e) => {
    if (!mapManager.marker) return;
    mapManager.marker.setLatLng(e.latlng);
    mapManager.currentPosition = { latitude: e.latlng.lat, longitude: e.latlng.lng };
    await mapManager.updateAddressDisplay();
  });
  
  window.addEventListener('resize', () => {
    if (mapManager.map) mapManager.map.invalidateSize();
  });
}
