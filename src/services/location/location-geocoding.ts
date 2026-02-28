import { CONFIG } from './config';
import { ReverseGeocodeResult, GeocoderAddress, ArcGISResponse, NominatimResponse } from './types';

export class LocationGeocodingService {
  static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    console.log(`reverseGeocode called for Lat: ${lat}, Lng: ${lng}`);
    try {
      // Try ArcGIS First
      let arcgisUrl = `${CONFIG.geocodeServiceUrl}/reverseGeocode?location=${lng},${lat}&f=json&outSR=4326`;
      if (CONFIG.apiKey) arcgisUrl += `&token=${CONFIG.apiKey}`;
      console.log("ArcGIS reverse geocode URL:", arcgisUrl);

      const response = await fetch(arcgisUrl);
      if (response.ok) {
        const arcgisData: ArcGISResponse = await response.json();
        console.log("ArcGIS reverse geocode RAW response data:", JSON.stringify(arcgisData, null, 2));
        if (arcgisData?.address && Object.keys(arcgisData.address).length > 0) {
          const display = arcgisData.address.Match_addr || arcgisData.address.LongLabel || arcgisData.address.Address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          console.log("ArcGIS reverse geocode SUCCESS.");
          return { success: true, displayName: display, address: arcgisData.address, coordinates: { latitude: lat, longitude: lng }, source: 'ArcGIS' };
        }
      }

      // Use Nominatim as secondary provider
      console.warn('ArcGIS reverse geocoding failed or returned no address, trying Nominatim.');
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      console.log("Nominatim reverse geocode URL:", osmUrl);
      const osmResponse = await fetch(osmUrl);
      if (!osmResponse.ok) {
        console.error(`Nominatim reverse geocoding HTTP error! Status: ${osmResponse.status}`);
        return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: `Nominatim failed with status ${osmResponse.status}`, source: 'Nominatim' };
      }
      const osmData: NominatimResponse = await osmResponse.json();
      console.log("Nominatim reverse geocode RAW response data:", JSON.stringify(osmData, null, 2));
      console.log("Nominatim reverse geocode SUCCESS.");
      const osmDisplayName = osmData.display_name || `${osmData.address?.house_number || ''} ${osmData.address?.road || osmData.address?.street || ''}`.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      return { success: true, displayName: osmDisplayName, address: osmData.address || {}, coordinates: { latitude: lat, longitude: lng }, source: 'Nominatim' };
    } catch (err) {
      console.error('Geocoding error (catch block):', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: errorMessage };
    }
  }
}
