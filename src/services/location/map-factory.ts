import * as L from 'leaflet';
import { CONFIG } from './config';

export function createMap(container: HTMLElement): L.Map {
  const map = L.map(container, { zoomControl: true, scrollWheelZoom: true, doubleClickZoom: true })
    .setView(CONFIG.defaultCenter, CONFIG.defaultZoom);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  if (CONFIG.apiKey && window.L.esri) {
    try { L.esri.basemapLayer('Streets').addTo(map); } catch (e) { console.warn('Could not add Esri basemap:', e); }
  }
  
  return map;
}

export function createMarker(map: L.Map): L.Marker {
  return L.marker(map.getCenter(), { draggable: true, autoPan: true }).addTo(map);
}
