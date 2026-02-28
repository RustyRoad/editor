import { LocationPositionService } from './location-position';
import { LocationGeocodingService } from './location-geocoding';

// Composite service combining position and geocoding capabilities
export class LocationService {
  static async getCurrentPosition() {
    return LocationPositionService.getCurrentPosition();
  }

  static async reverseGeocode(lat: number, lng: number) {
    return LocationGeocodingService.reverseGeocode(lat, lng);
  }
}
