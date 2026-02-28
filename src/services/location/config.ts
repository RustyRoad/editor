import { isAdPlatformWebView } from './platform-detection';

export const CONFIG = {
  apiKey: 'AAPTxy8BH1VEsoebNVZXo8HurNm0505kNdgKELIfqKFdBxCaNy4p0hn6ezNaYmZMejfeGM-Uo7dMmpBE5TeGpAVO2K4DDUmTNgbdSZ-ci6gGMP6zhs569bZ7gypISw6rv_eKaaVFl5D-pzH5J6HFvDP3XrHFTtaJcRK6FJvQYvfdCtgTnS37vJiI0ZKHPUWnd0UQjEjtNV3utt7h3lMQ822C3SomL2YXn1gH9LYffAxU78U.AT1_m19P1ODX',
  parcelServiceUrl: (typeof window !== 'undefined' && 'PARCEL_SERVICE_URL' in window) ?
    (window as any).PARCEL_SERVICE_URL :
    'https://gismaps.cityofallen.org/arcgis/rest/services/ReferenceData/Collin_County_Appraisal_District_Parcels/MapServer/0',
  geocodeServiceUrl: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
  defaultCenter: [33.198, -96.635] as [number, number],
  defaultZoom: 13,
  locationTimeout: isAdPlatformWebView() ? 15000 : 10000
};
