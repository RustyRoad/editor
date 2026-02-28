import { LocationDataPayload, LocationApiResponse } from './types';

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
