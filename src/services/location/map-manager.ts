import * as L from 'leaflet';
import { ReverseGeocodeResult, OriginalStyles } from './types';
import { LocationService } from './location-service';
import { setupMapEventHandlers } from './map-event-handlers';
import { saveOriginalStyles, toggleFullscreen } from './map-styles';
import { createMap, createMarker } from './map-factory';
import { buildPopupContent, attachPopupListeners } from './popup-builder';

export class MapManager {
  container: HTMLElement;
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  currentPosition: { latitude: number; longitude: number } | null = null;
  addressInfo: ReverseGeocodeResult | null = null;
  isFullscreen: boolean = false;
  originalStyles: OriginalStyles;
  scrollPosition: number = 0;
  initializedCallback?: (mapManager: MapManager) => void;
  onLocationConfirmed: (locationData: ReverseGeocodeResult) => void = () => {};

  constructor(containerElement: HTMLElement, initializedCallback?: (mapManager: MapManager) => void) {
    this.container = containerElement;
    if (!this.container) throw new Error('Map container DOM element not provided.');
    if (getComputedStyle(this.container).position === 'static') this.container.style.position = 'relative';
    this.originalStyles = {} as OriginalStyles;
    this.initializedCallback = initializedCallback;
    this.initialize();
  }

  initialize() {
    if (!window.L) { console.error("Leaflet (L) is not loaded."); return; }
    this.originalStyles = saveOriginalStyles(this.container);
    try {
      this.map = createMap(this.container);
      this.marker = createMarker(this.map);
      setupMapEventHandlers(this);
      setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 100);
      if (this.initializedCallback) this.initializedCallback(this);
    } catch (error) { console.error('Error initializing map:', error); }
  }

  toggleFullscreen(): boolean { return toggleFullscreen(this); }

  async setPosition(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    if (!this.map || !this.marker) return null;
    this.currentPosition = { latitude: lat, longitude: lng };
    this.map.setView([lat, lng], 17, { animate: false });
    this.marker.setLatLng([lat, lng]);
    this.map.panBy([0, 75], { animate: false });
    return this.updateAddressDisplay();
  }

  async updateAddressDisplay(): Promise<ReverseGeocodeResult | null> {
    if (!this.currentPosition || !this.marker) return null;
    this.addressInfo = await LocationService.reverseGeocode(this.currentPosition.latitude, this.currentPosition.longitude);
    const popupContent = buildPopupContent(this.addressInfo, this.isFullscreen);
    this.marker.bindPopup(popupContent).openPopup();
    setTimeout(() => attachPopupListeners(popupContent, this), 0);
    return this.addressInfo;
  }
}
