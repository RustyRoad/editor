import { isAdPlatformWebView } from './platform-detection';
import { getDetectedPlatform } from './platform-name';
import { CONFIG } from './config';

export class LocationPositionService {
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
}
