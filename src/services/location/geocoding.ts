import type { ReverseGeocodeResult, GeocoderAddress, ArcGISResponse, NominatimResponse, LocationDataPayload, LocationApiResponse } from './types';
import { isAdPlatformWebView, getDetectedPlatform } from './platform';
import { CONFIG } from './utils';

export class LocationService {
    static async getCurrentPosition(): Promise<GeolocationPosition> {
        console.log("Attempting to get current position...");
        const inWebView = isAdPlatformWebView();
        const detectedPlatform = getDetectedPlatform();
        console.log("Ad platform webview detected:", inWebView, "Platform:", detectedPlatform);

        if (!navigator.geolocation) {
            console.error('Geolocation API not supported by this browser.');
            const errorMsg = inWebView
                ? `Location services not available in this ${detectedPlatform || 'app'} version. Please manually enter your address or open in a regular browser.`
                : 'Geolocation not supported by your browser';
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            const options = {
                enableHighAccuracy: true,
                maximumAge: inWebView ? 60000 : 0,
                timeout: CONFIG.locationTimeout
            };
            console.log("Calling navigator.geolocation.getCurrentPosition with options:", options);

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    console.log("navigator.geolocation.getCurrentPosition - SUCCESS:", pos);
                    resolve(pos);
                },
                (err) => {
                    console.error("navigator.geolocation.getCurrentPosition - ERROR:", err);
                    let errorMsg = `Error getting location: ${err.message} (Code: ${err.code})`;

                    if (err.code === 1) { // PERMISSION_DENIED
                        if (inWebView) {
                            const platformName = detectedPlatform || 'app';
                            errorMsg = `Location permission needed:\n1. Check ${platformName} location permission in device settings\n2. Allow location access when prompted\nOr manually enter your address below.`;
                        } else {
                            errorMsg = 'Location permission denied. Please check browser settings.';
                        }
                    } else if (err.code === 2) { // POSITION_UNAVAILABLE
                        const platformName = detectedPlatform || 'this app';
                        errorMsg = inWebView
                            ? `Location unavailable in ${platformName}. Please manually enter your address or try opening in a regular browser.`
                            : 'Location information is unavailable.';
                    } else if (err.code === 3) { // TIMEOUT
                        const platformName = detectedPlatform || 'app';
                        errorMsg = inWebView
                            ? `Location request timed out in ${platformName}. This is common in social media browsers. Please manually enter your address.`
                            : 'Location request timed out.';
                    }
                    reject(new Error(errorMsg));
                },
                options
            );
        });
    }

    static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
        console.log(`reverseGeocode called for Lat: ${lat}, Lng: ${lng}`);
        try {
            let arcgisUrl = `${CONFIG.geocodeServiceUrl}/reverseGeocode?location=${lng},${lat}&f=json&outSR=4326`;
            if (CONFIG.apiKey) arcgisUrl += `&token=${CONFIG.apiKey}`;
            console.log("ArcGIS reverse geocode URL:", arcgisUrl);

            const response = await fetch(arcgisUrl);
            let arcgisFailed = false;
            let arcgisData: ArcGISResponse | null = null;

            if (response.ok) {
                arcgisData = await response.json();
                console.log("ArcGIS reverse geocode RAW response data:", JSON.stringify(arcgisData, null, 2));
                if (arcgisData?.address && Object.keys(arcgisData.address).length > 0) {
                    const display = arcgisData.address.Match_addr || arcgisData.address.LongLabel || arcgisData.address.Address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    console.log("ArcGIS reverse geocode SUCCESS.");
                    return { success: true, displayName: display, address: arcgisData.address, coordinates: { latitude: lat, longitude: lng }, source: 'ArcGIS' };
                } else {
                    console.warn("ArcGIS reverse geocode successful but no address found.");
                    arcgisFailed = true;
                }
            } else {
                console.error(`ArcGIS reverse geocoding HTTP error! Status: ${response.status}`);
                arcgisFailed = true;
            }

            if (arcgisFailed) {
                console.warn('ArcGIS failed, trying Nominatim.');
                const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
                const osmResponse = await fetch(osmUrl);
                if (!osmResponse.ok) {
                    return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: `Nominatim failed with status ${osmResponse.status}`, source: 'Nominatim' };
                }
                const osmData: NominatimResponse = await osmResponse.json();
                const osmDisplayName = osmData.display_name || `${osmData.address?.house_number || ''} ${osmData.address?.road || osmData.address?.street || ''}`.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                return { success: true, displayName: osmDisplayName, address: osmData.address || {}, coordinates: { latitude: lat, longitude: lng }, source: 'Nominatim' };
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: errorMessage };
        }
        return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: 'Unknown geocoding failure' };
    }
}

export class LocationApiService {
    async submitLocationData(locationData: LocationDataPayload): Promise<LocationApiResponse> {
        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationData)
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API submission failed with status ${response.status}: ${errorBody}`);
            }
            return await response.json();
        } catch (err) {
            console.error('API error:', err);
            throw err;
        }
    }
}
