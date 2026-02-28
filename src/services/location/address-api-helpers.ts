import { GeocoderAddress, ReverseGeocodeResult } from './types';

export interface ApiAddress {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export function prepareApiAddress(locationData: ReverseGeocodeResult): ApiAddress {
  const addr = locationData.address;
  const apiAddress: ApiAddress = {
    line1: addr.Address || `${addr.AddNum || addr.house_number || ''} ${addr.StreetName || addr.Street || addr.road || ''}`.trim(),
    city: addr.City || addr.city || addr.town || '',
    state: addr.Region || addr.state || '',
    postal_code: addr.Postal || addr.postcode || '',
    country: "US"
  };

  // Clean up line1 if it's just a number or empty
  if (/^\d+$/.test(apiAddress.line1) || apiAddress.line1.trim() === '') {
    if (addr.Match_addr && addr.Match_addr.includes(',')) {
      apiAddress.line1 = addr.Match_addr.split(',')[0].trim();
    } else if (addr.LongLabel && addr.LongLabel.includes(',')) {
      apiAddress.line1 = addr.LongLabel.split(',')[0].trim();
    }
  }

  return apiAddress;
}

export function findInputInContext(modalContext: HTMLElement | null, selector: string): HTMLInputElement | null {
  if (modalContext) {
    const el = modalContext.querySelector(selector);
    if (el) return el as HTMLInputElement;
  }
  return document.querySelector(selector) as HTMLInputElement | null;
}

export function findSelectInContext(modalContext: HTMLElement | null, selector: string): HTMLSelectElement | null {
  if (modalContext) {
    const el = modalContext.querySelector(selector);
    if (el) return el as HTMLSelectElement;
  }
  return document.querySelector(selector) as HTMLSelectElement | null;
}
