import { GeocodeAddress } from './types';

export function areAddressesEqual(addr1: GeocodeAddress | undefined, addr2: GeocodeAddress | undefined): boolean {
  if (!addr1 || !addr2) return false;
  const country1 = addr1.country?.trim() || "US";
  const country2 = addr2.country?.trim() || "US";

  return addr1.line1?.trim() === addr2.line1?.trim() &&
    addr1.city?.trim() === addr2.city?.trim() &&
    addr1.state?.trim() === addr2.state?.trim() &&
    addr1.postal_code?.trim() === addr2.postal_code?.trim() &&
    country1 === country2;
}
