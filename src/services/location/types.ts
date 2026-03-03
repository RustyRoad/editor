/// <reference path="../../types/externals.d.ts" />
import type { MapManager } from './map-manager';

export interface WaitForElementOptions {
  selector: string;
  timeout?: number;
  context?: Document | Element;
}

export interface GeocodeAddress {
  line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  [key: string]: any;
}

export interface GeocodeCoordinates {
  latitude: number;
  longitude: number;
}

export interface SetPositionResult {
  success: boolean;
  message?: string;
}

export interface ReverseGeocodeResult {
  success: boolean;
  displayName: string;
  address: GeocodeAddress;
  coordinates: GeocodeCoordinates;
  source?: string;
  error?: string;
  [key: string]: any;
}

export interface MapManagerConfig {
  container: HTMLElement;
  initializedCallback?: (mapManager: MapManager) => void;
}

export interface OriginalStyles {
  width: string;
  height: string;
  position: string;
  top: string;
  left: string;
  zIndex: string;
  margin: string;
}

export interface GeocoderAddress {
  Match_addr?: string;
  LongLabel?: string;
  Address?: string;
  house_number?: string;
  road?: string;
  street?: string;
  city?: string;
  town?: string;
  state?: string;
  Region?: string;
  postcode?: string;
  Postal?: string;
  [key: string]: any;
}

export interface ArcGISResponse {
  address?: GeocoderAddress;
  [key: string]: any;
}

export interface NominatimResponse {
  display_name?: string;
  address?: GeocoderAddress;
  [key: string]: any;
}

export interface WaitForElementResult extends Element {}

export interface ValidatedAddressInfo {
  inside_zone: boolean;
  location: string;
  valid_trash_day?: boolean;
  next_service_day?: string;
  error?: string;
  address_id: number;
}

export interface LocationDataPayload {
  coordinates: { latitude: number; longitude: number };
  address: GeocoderAddress;
}

export interface LocationApiResponse {
  success: boolean;
  [key: string]: any;
}

export interface MapManagerInterface {
  container: HTMLElement;
  addressInfo: ReverseGeocodeResult | null;
  currentPosition: { latitude: number; longitude: number } | null;
  initializedCallback?: (manager: MapManagerInterface) => void;
}
