import type { WaitForElementResult } from './types';
import * as L from 'leaflet';

export async function waitForElement(
    selector: string,
    timeout: number = 7000,
    context: Document | Element = document
): Promise<WaitForElementResult> {
    console.log(`waitForElement: Searching for "${selector}" in context:`, context ? context.nodeName : 'document');
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const element = context.querySelector(selector);
        if (element) {
            console.log(`waitForElement: Found "${selector}"`, element);
            return element as WaitForElementResult;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.error(`waitForElement: Element "${selector}" not found after ${timeout}ms.`);
    throw new Error(`Element "${selector}" not found in context after ${timeout}ms`);
}

export async function waitForLeaflet(timeout = 7000) {
    console.log("waitForLeaflet: Waiting for window.L");
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (window.L) {
            console.log("waitForLeaflet: Found window.L");
            return window.L;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.error(`waitForLeaflet: Leaflet (window.L) not loaded after ${timeout}ms`);
    throw new Error(`Leaflet (window.L) not loaded after ${timeout}ms`);
}

export function areAddressesEqual(addr1: any, addr2: any): boolean {
    if (!addr1 || !addr2) return false;
    const country1 = addr1.country?.trim() || "US";
    const country2 = addr2.country?.trim() || "US";
    return addr1.line1?.trim() === addr2.line1?.trim() &&
        addr1.city?.trim() === addr2.city?.trim() &&
        addr1.state?.trim() === addr2.state?.trim() &&
        addr1.postal_code?.trim() === addr2.postal_code?.trim() &&
        country1 === country2;
}

export const CONFIG = {
    apiKey: 'AAPTxy8BH1VEsoebNVZXo8HurNm0505kNdgKELIfqKFdBxCaNy4p0hn6ezNaYmZMejfeGM-Uo7dMmpBE5TeGpAVO2K4DDUmTNgbdSZ-ci6gGMP6zhs569bZ7gypISw6rv_eKaaVFl5D-pzH5J6HFvDP3XrHFTtaJcRK6FJvQYvfdCtgTnS37vJiI0ZKHPUWnd0UQjEjtNV3utt7h3lMQ822C3SomL2YXn1gH9LYffAxU78U.AT1_m19P1ODX',
    parcelServiceUrl: (typeof window !== 'undefined' && 'PARCEL_SERVICE_URL' in window) ?
        (window as any).PARCEL_SERVICE_URL :
        'https://gismaps.cityofallen.org/arcgis/rest/services/ReferenceData/Collin_County_Appraisal_District_Parcels/MapServer/0',
    geocodeServiceUrl: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    defaultCenter: [33.198, -96.635] as [number, number],
    defaultZoom: 13,
    locationTimeout: require('./platform').isAdPlatformWebView() ? 15000 : 10000
};
