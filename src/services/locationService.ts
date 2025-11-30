/// <reference path="../types/externals.d.ts" />
// Helper to wait for an element
export interface WaitForElementOptions {
    selector: string;
    timeout?: number;
    context?: Document | Element;
}

// Shared window property declarations
declare global {
    interface Window {
        // Location service related
        formatAddressForDisplayHelper?: (address: any, coordinates: any) => string;
        mapManager?: MapManager;
        mapServiceInitialized?: boolean;
        mapServiceInitializing?: boolean;
        LocationService?: typeof LocationService;
        setupAddressValidation?: (container: HTMLElement) => void;
        finalizeAddressFormAndMap?: () => Promise<void>;
        initGlobalLocationUI?: (mapContainer: HTMLElement, feedbackContainer: HTMLElement | null, helpers: any) => Promise<void>;

        // Service modal related
        openPricingModal?: (serviceData: ServiceData) => void;
        showServiceModal?: (serviceData: ServiceData) => void;
        initializeStripeElementsInModal?: () => Promise<boolean>; // Renamed
        handlePaymentSubmitInModal?: (event: Event) => Promise<void>; // Renamed

        tailwind: { config: Record<string, any> };
        initializeTracker?: () => void;

        // Component related
        components?: {
            [key: string]: {
                get?: (prop: string) => any;
                set?: (prop: string, value: any, options?: any) => void;
                listenTo?: (obj: any, event: string, callback: Function) => void;
                getTrait?: (name: string) => any;
                empty?: () => void;
                append?: (content: any) => void;
                components?: () => any;
            };
        };
    }
}

interface SetPositionResult {
    success: boolean;
    message?: string;
}

interface GeocodeAddress {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    [key: string]: any;
}

interface GeocodeCoordinates {
    latitude: number;
    longitude: number;
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

export interface MapManager {
    container: HTMLElement;
    // Removed duplicate declaration of setPosition
    addressInfo: ReverseGeocodeResult | null;
    currentPosition: { latitude: number; longitude: number } | null;
    initializedCallback?: (manager: MapManager) => void;
}

interface SetPositionOptions {
    animate?: boolean;
    zoom?: number;
    panOffset?: number;
}

interface SetPositionResult extends ReverseGeocodeResult {
    // Extends existing ReverseGeocodeResult interface
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
    [key: string]: any; // For other potential address fields
}

export interface ReverseGeocodeResult {
    success: boolean;
    displayName: string;
    address: GeocodeAddress;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    error?: string;
    source?: string;
}

export interface ArcGISResponse {
    address?: GeocoderAddress;
    [key: string]: any; // For other ArcGIS response fields
}

export interface NominatimResponse {
    display_name?: string;
    address?: GeocoderAddress;
    [key: string]: any; // For other Nominatim response fields
}


export interface WaitForElementResult extends Element {
    // This empty export interface extends Element to maintain type compatibility
    // while allowing for future extension if needed
}

async function waitForElement(
    selector: string,
    timeout: number = 7000,
    context: Document | Element = document
): Promise<WaitForElementResult> {
    console.log(`waitForElement: Searching for "${selector}" in context:`, context ? context.nodeName : 'document');
    const startTime: number = Date.now();
    while (Date.now() - startTime < timeout) {
        const element: Element | null = context.querySelector(selector);
        if (element) {
            console.log(`waitForElement: Found "${selector}"`, element);
            return element as WaitForElementResult;
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Poll every 100ms
    }
    console.error(`waitForElement: Element "${selector}" not found in context after ${timeout}ms.`);
    throw new Error(`Element "${selector}" not found in context after ${timeout}ms`);
}

// Import Leaflet types
import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { ServiceData } from '../components/modal-ui';
// import { pid } from 'process'; // Removed unused import
import { initializeStripeElements, handlePaymentSubmit } from '../components/payment-handler'; // Added handlePaymentSubmit

// Interface for storing validated address info to avoid redundant calls
interface ValidatedAddressInfo {
    inside_zone: boolean;
    location: string;
    valid_trash_day?: boolean;
    next_service_day?: string;
    "error"?: string;
    address_id: number;
}


declare global {
    interface Window {
        lastValidatedAddressForModal?: ValidatedAddressInfo; // To store data from the last geocode
        L: typeof L & {
            esri: typeof EsriLeaflet;
        };
        additionalBins: number;
    }
}

// Helper to wait for Leaflet
async function waitForLeaflet(timeout = 7000) {
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

// Helper function to compare address objects
function areAddressesEqual(addr1: GeocodeAddress | undefined, addr2: GeocodeAddress | undefined): boolean {
    if (!addr1 || !addr2) return false;
    // Normalize country to "US" if undefined or empty, as it's often assumed
    const country1 = addr1.country?.trim() || "US";
    const country2 = addr2.country?.trim() || "US";

    return addr1.line1?.trim() === addr2.line1?.trim() &&
        addr1.city?.trim() === addr2.city?.trim() &&
        addr1.state?.trim() === addr2.state?.trim() &&
        addr1.postal_code?.trim() === addr2.postal_code?.trim() &&
        country1 === country2;
}

/**
 * Collin County Address Selection Map with ArcGIS Integration
 */

// Webview detection utility for major ad platforms
export function isTikTokWebView(): boolean {
    return isAdPlatformWebView('tiktok');
}

export function isAdPlatformWebView(platform?: string): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    const userAgent = navigator.userAgent || '';

    // All webview indicators for major ad platforms
    const webviewIndicators = {
        tiktok: ['tiktok', 'musically', 'musical_ly', 'TikTok', 'ByteDance'],
        facebook: ['FBAN', 'FBAV', 'FBA', 'Facebook', 'FacebookApp'],
        instagram: ['Instagram', 'IGTV'],
        snapchat: ['Snapchat'],
        twitter: ['TwitterKit', 'Twitter'],
        pinterest: ['Pinterest'],
        linkedin: ['LinkedInApp'],
        youtube: ['youtube', 'YouTubeApp'],
        reddit: ['Reddit', 'RedditApp'],
        discord: ['Discord', 'DiscordApp'],
        whatsapp: ['WhatsApp', 'WhatsAppWebView']
    };

    if (platform) {
        const platformKey = platform.toLowerCase() as keyof typeof webviewIndicators;
        const indicators = webviewIndicators[platformKey];
        return indicators ? indicators.some(indicator =>
            userAgent.toLowerCase().includes(indicator.toLowerCase())
        ) : false;
    }

    // Check for any webview platform
    return Object.values(webviewIndicators).some(indicators =>
        indicators.some(indicator =>
            userAgent.toLowerCase().includes(indicator.toLowerCase())
        )
    );
}

// Helper to get detected platform name for user-friendly messages
export function getDetectedPlatform(): string | null {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return null;
    }

    const userAgent = navigator.userAgent || '';

    const platformChecks = [
        { name: 'TikTok', indicators: ['tiktok', 'musically', 'musical_ly', 'TikTok', 'ByteDance'] },
        { name: 'Facebook', indicators: ['FBAN', 'FBAV', 'FBA', 'Facebook', 'FacebookApp'] },
        { name: 'Instagram', indicators: ['Instagram', 'IGTV'] },
        { name: 'Snapchat', indicators: ['Snapchat'] },
        { name: 'Twitter', indicators: ['TwitterKit', 'Twitter'] },
        { name: 'Pinterest', indicators: ['Pinterest'] },
        { name: 'LinkedIn', indicators: ['LinkedInApp'] },
        { name: 'YouTube', indicators: ['youtube', 'YouTubeApp'] },
        { name: 'Reddit', indicators: ['Reddit', 'RedditApp'] },
        { name: 'Discord', indicators: ['Discord', 'DiscordApp'] },
        { name: 'WhatsApp', indicators: ['WhatsApp', 'WhatsAppWebView'] }
    ];

    for (const platform of platformChecks) {
        if (platform.indicators.some(indicator =>
            userAgent.toLowerCase().includes(indicator.toLowerCase())
        )) {
            return platform.name;
        }
    }

    return null;
}

export let CONFIG = {
    apiKey: 'AAPTxy8BH1VEsoebNVZXo8HurNm0505kNdgKELIfqKFdBxCaNy4p0hn6ezNaYmZMejfeGM-Uo7dMmpBE5TeGpAVO2K4DDUmTNgbdSZ-ci6gGMP6zhs569bZ7gypISw6rv_eKaaVFl5D-pzH5J6HFvDP3XrHFTtaJcRK6FJvQYvfdCtgTnS37vJiI0ZKHPUWnd0UQjEjtNV3utt7h3lMQ822C3SomL2YXn1gH9LYffAxU78U.AT1_m19P1ODX', // Replace with your actual API key or manage securely
    parcelServiceUrl: (typeof window !== 'undefined' && 'PARCEL_SERVICE_URL' in window) ?
        (window as any).PARCEL_SERVICE_URL :
        'https://gismaps.cityofallen.org/arcgis/rest/services/ReferenceData/Collin_County_Appraisal_District_Parcels/MapServer/0',
    geocodeServiceUrl: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    defaultCenter: [33.198, -96.635] as [number, number], // Default center coordinates (e.g., Collin County)
    defaultZoom: 13,
    locationTimeout: isAdPlatformWebView() ? 15000 : 10000 // Extended timeout for all ad platform webviews
};

export class LocationService {
    static async getCurrentPosition() {
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
                maximumAge: inWebView ? 60000 : 0, // Allow cached location in webviews
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

                    if ('code' in err && err.code === 1) { // PERMISSION_DENIED
                        if (inWebView) {
                            const platformName = detectedPlatform || 'app';
                            errorMsg = `Location permission needed:\n` +
                                `1. Check ${platformName} location permission in device settings\n` +
                                `2. Allow location access when prompted\n` +
                                `Or manually enter your address below.`;
                        } else {
                            errorMsg = 'Location permission denied. Please check browser settings.';
                        }
                    } else if ('code' in err && err.code === 2) { // POSITION_UNAVAILABLE
                        if (inWebView) {
                            const platformName = detectedPlatform || 'this app';
                            errorMsg = `Location unavailable in ${platformName}. Please manually enter your address or try opening in a regular browser.`;
                        } else {
                            errorMsg = 'Location information is unavailable.';
                        }
                    } else if ('code' in err && err.code === 3) { // TIMEOUT
                        if (inWebView) {
                            const platformName = detectedPlatform || 'app';
                            errorMsg = `Location request timed out in ${platformName}. This is common in social media browsers. Please manually enter your address.`;
                        } else {
                            errorMsg = 'Location request timed out.';
                        }
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
            // --- Try ArcGIS First ---
            let arcgisUrl = `${CONFIG.geocodeServiceUrl}/reverseGeocode?location=${lng},${lat}&f=json&outSR=4326`;
            if (CONFIG.apiKey) arcgisUrl += `&token=${CONFIG.apiKey}`; // Corrected: use token for ArcGIS Platform location services
            console.log("ArcGIS reverse geocode URL:", arcgisUrl);

            const response = await fetch(arcgisUrl);
            let arcgisFailed = false;
            let arcgisData: ArcGISResponse | null = null;

            if (response.ok) {
                arcgisData = await response.json();
                console.log("ArcGIS reverse geocode RAW response data:", JSON.stringify(arcgisData, null, 2));
                if (arcgisData && arcgisData.address && Object.keys(arcgisData.address).length > 0) {
                    const display = arcgisData.address.Match_addr || arcgisData.address.LongLabel || arcgisData.address.Address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    console.log("ArcGIS reverse geocode SUCCESS.");
                    return { success: true, displayName: display, address: arcgisData.address, coordinates: { latitude: lat, longitude: lng }, source: 'ArcGIS' };
                } else {
                    console.warn("ArcGIS reverse geocode successful (HTTP 200) but no address found in response.");
                    arcgisFailed = true;
                }
            } else {
                const errorText = await response.text();
                console.error(`ArcGIS reverse geocoding HTTP error! Status: ${response.status}, Body: ${errorText}`);
                arcgisFailed = true;
            }

            // --- Fallback to Nominatim ---
            if (arcgisFailed) {
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
            }

        } catch (err) {
            console.error('Geocoding error (catch block):', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: errorMessage };
        }
        return { success: false, displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {}, coordinates: { latitude: lat, longitude: lng }, error: 'Unknown geocoding failure' };
    }
}

export interface LocationDataPayload {
    coordinates: {
        latitude: number;
        longitude: number;
    };
    address: GeocoderAddress; // Using existing GeocoderAddress interface
}

export interface LocationApiResponse {
    // Minimal interface, extend based on actual API response
    success: boolean;
    [key: string]: any; // Allow for additional properties
}
export class LocationApiService {

    async submitLocationData(locationData: LocationDataPayload): Promise<LocationApiResponse> {
        try {
            const response = await fetch('/api/locations', { // Example endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
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

export class MapManager {
    container: HTMLElement;
    map: L.Map | null;
    marker: L.Marker | null;
    currentPosition: { latitude: number; longitude: number } | null;
    addressInfo: ReverseGeocodeResult | null;
    isFullscreen: boolean;
    originalStyles: OriginalStyles;
    scrollPosition: number = 0;
    initializedCallback?: (mapManager: MapManager) => void;
    onLocationConfirmed: (locationData: ReverseGeocodeResult) => void;
    constructor(containerElement: HTMLElement, initializedCallback?: (mapManager: MapManager) => void) {
        this.container = containerElement;
        if (!this.container) {
            console.error('Map container DOM element not provided to MapManager constructor.');
            throw new Error('Map container DOM element not provided to MapManager.');
        }
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative'; // Ensure container can host absolutely positioned children
        }
        this.map = null as L.Map | null;
        this.marker = null as L.Marker | null;
        this.currentPosition = null as { latitude: number; longitude: number; } | null;
        this.addressInfo = null as ReverseGeocodeResult | null;
        this.isFullscreen = false;
        this.originalStyles = {} as OriginalStyles;
        this.onLocationConfirmed = (locationData: ReverseGeocodeResult) => console.log('Default onLocationConfirmed:', locationData); // Callback when user confirms location
        this.initialize();
    }

    initialize() {
        if (!window.L) { console.error("Leaflet (L) is not loaded. Map cannot be initialized."); return; }
        this.saveOriginalStyles();
        try {
            this.map = L.map(this.container, { zoomControl: true, scrollWheelZoom: true, doubleClickZoom: true })
                .setView(CONFIG.defaultCenter, CONFIG.defaultZoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            // Optional: Add Esri basemap if API key and Esri Leaflet are available
            if (CONFIG.apiKey && window.L.esri) {
                try { L.esri.basemapLayer('Streets').addTo(this.map); } // Example: 'Streets', 'Topographic', etc.
                catch (e) { console.warn('Could not add Esri basemap:', e); }
            }
            this.marker = L.marker(this.map.getCenter(), { draggable: true, autoPan: true }).addTo(this.map);
            this.setupEventHandlers();
            setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 100); // Ensure map size is correct after init
            if (typeof this.initializedCallback === 'function') this.initializedCallback(this);
            console.log("MapManager initialized successfully with container:", this.container);
        } catch (error) { console.error('Error initializing map in MapManager:', error); }
    }

    saveOriginalStyles() {
        if (!this.container) return;
        this.originalStyles = {
            width: this.container.style.width, height: this.container.style.height,
            position: this.container.style.position, top: this.container.style.top,
            left: this.container.style.left, zIndex: this.container.style.zIndex,
            margin: this.container.style.margin
        };
    }
    setupEventHandlers() {
        if (!this.map || !this.marker) return;
        this.marker.on('dragend', async (e) => {
            const position = e.target.getLatLng();
            this.currentPosition = { latitude: position.lat, longitude: position.lng };
            await this.updateAddressDisplay();
        });
        this.map.on('click', async (e) => {
            if (!this.marker) return;
            this.marker.setLatLng(e.latlng);
            this.currentPosition = { latitude: e.latlng.lat, longitude: e.latlng.lng };
            await this.updateAddressDisplay();
        });
        window.addEventListener('resize', () => { if (this.map) this.map.invalidateSize(); });
    }
    toggleFullscreen() {
        if (!this.container) return this.isFullscreen;
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            this.scrollPosition = window.pageYOffset; // Save scroll position
            Object.assign(this.container.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', margin: '0', zIndex: '10000' });
            document.body.style.overflow = 'hidden'; // Prevent body scrolling
        } else {
            Object.assign(this.container.style, this.originalStyles);
            // Ensure position is relative if it was originally static, to contain absolute buttons
            if (getComputedStyle(this.container).position === 'static') {
                this.container.style.position = 'relative';
            }
            document.body.style.overflow = ''; // Restore body scrolling
            window.scrollTo(0, this.scrollPosition); // Restore scroll position
        }
        if (this.map) this.map.invalidateSize();
        return this.isFullscreen;
    }



    async setPosition(lat: number, lng: number): Promise<SetPositionResult | null> {
        if (!this.map || !this.marker) {
            console.warn('Map or marker not fully initialized in setPosition.');
            return null;
        }
        this.currentPosition = { latitude: lat, longitude: lng };

        const targetZoom: number = 17; // Zoom level for a specific address
        const yPixelPanOffset: number = 75; // Pixels to pan down, so popup is not at the very top edge

        // Set view and marker
        this.map.setView([lat, lng], targetZoom, { animate: false }); // No animation for immediate set
        this.marker.setLatLng([lat, lng]);

        // Pan map slightly so popup is better centered if it's tall 
        if (yPixelPanOffset !== 0) {
            this.map.panBy([0, yPixelPanOffset], { animate: false });
        }

        return this.updateAddressDisplay(); // Update address and open popup
    }

    async updateAddressDisplay() {
        if (!this.currentPosition || !this.marker) return null;
        const { latitude, longitude } = this.currentPosition;
        this.addressInfo = await LocationService.reverseGeocode(latitude, longitude);

        const popupContent = document.createElement('div');
        popupContent.className = 'location-popup'; // For potential custom styling

        let popupBodyHtml = '';
        if (window.formatAddressForDisplayHelper) { // Check if global helper exists
            if (this.addressInfo.success) {
                popupBodyHtml = window.formatAddressForDisplayHelper!(this.addressInfo.address, this.addressInfo.coordinates);
            } else {
                popupBodyHtml = `<h3>Selected Location</h3><p>Could not retrieve address. Error: ${this.addressInfo.error || 'Unknown error'}</p>`;
                if (this.addressInfo.coordinates) {
                    popupBodyHtml += `<p><small>Lat: ${this.addressInfo.coordinates.latitude.toFixed(6)}, Lng: ${this.addressInfo.coordinates.longitude.toFixed(6)}</small></p>`;
                }
            }
        } else {
            console.error("formatAddressForDisplayHelper not found. Cannot format popup address.");
            // Fallback basic display if helper is missing
            const addr = this.addressInfo?.address || {};
            const coords = this.addressInfo?.coordinates;
            popupBodyHtml = `<h3>Selected Location</h3><p>${addr.Address || addr.road || addr.street || 'Address N/A'}</p><p>${addr.City || addr.city || ''} ${addr.Region || addr.state || ''} ${addr.Postal || addr.postcode || ''}</p>`;
            if (coords) popupBodyHtml += `<p><small>Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}</small></p>`;
        }

        popupContent.innerHTML = `<div style="min-width: 250px;">
                ${popupBodyHtml}
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="confirm-btn" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Confirm Location</button>
                    <button class="fullscreen-btn-popup" style="padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">${this.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
                </div>
            </div>`;

        this.marker.bindPopup(popupContent).openPopup();

        // Attach event listeners to buttons inside the popup *after* it's bound and opened
        setTimeout(() => { // Use setTimeout to ensure DOM elements are available
            const confirmBtn = popupContent.querySelector('.confirm-btn');
            const fullscreenBtnPopup = popupContent.querySelector('.fullscreen-btn-popup');
            if (confirmBtn) {
                (confirmBtn as HTMLElement).onclick = () => {
                    if (this.addressInfo) {
                        console.log("Confirm Location clicked. Address Info:", this.addressInfo);
                        this.onLocationConfirmed(this.addressInfo); // Pass the full geocoded result
                    } else {
                        console.error("Address info not available on confirm.");
                    }
                    if (this.marker) this.marker.closePopup(); // Close popup after confirm
                };
            }
            if (fullscreenBtnPopup) {
                (fullscreenBtnPopup as HTMLElement).onclick = () => {
                    const isNowFullscreen = this.toggleFullscreen();
                    fullscreenBtnPopup.textContent = isNowFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                    // Also update the global fullscreen button's text if it exists
                    const globalFullscreenBtn = document.getElementById('global-fullscreen-button'); // Assuming this ID exists
                    if (globalFullscreenBtn) globalFullscreenBtn.textContent = isNowFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                };
            }
        }, 0);

        return this.addressInfo; // Return the full result object
    }

}

export const UIHelpers = {
    createButton(text: string, styles: Partial<CSSStyleDeclaration> = {}): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerText = text;
        Object.assign(button.style, {
            position: 'absolute',
            zIndex: '1000',
            fontSize: '1em',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            ...styles
        });
        if ('id' in styles) button.id = styles['id'] as string;
        // Basic hover effect
        button.onmouseover = () => button.style.backgroundColor = '#0056b3';
        button.onmouseout = () => button.style.backgroundColor = styles.backgroundColor || '#007bff'; // Revert to original or specified bg
        return button;
    },
    createAddressDisplay() {
        const container = document.createElement('div');
        Object.assign(container.style, { margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' });
        return container;
    }
};

// Global flags to manage initialization state
if (typeof window.mapServiceInitialized === 'undefined') window.mapServiceInitialized = false;
if (typeof window.mapServiceInitializing === 'undefined') window.mapServiceInitializing = false;


export
    async function initLocationService(mapContainerElement: HTMLElement, options: Record<string, any> = {}) {
    if (!mapContainerElement) {
        console.error('initLocationService: mapContainerElement argument is missing.');
        throw new Error('Map container element not provided to initLocationService.');
    }

    const { feedbackContainerOverride } = options;

    // --- Define ALL Helper Functions and Constants needed by UI ---
    const defineInternalHelpers = () => {
        const LOCATION_BUTTON_ID = 'global-location-button';
        const FULLSCREEN_BUTTON_ID = 'global-fullscreen-button';
        const ADDRESS_DISPLAY_CLASS = 'address-display-container';
        const GLOBAL_ADDRESS_DISPLAY_ID = 'global-address-display-for-map';
        const SUBMIT_BUTTON_CLASS = 'submit-location-btn'; // Class for the submit button shown after confirm
        const UI_LISTENERS_SETUP_COMPLETE_CLASS = 'location-service-ui-listeners-setup-complete'; // Body class flag
        const CONTENT_ELEMENT_SELECTOR = '#content'; // Fallback parent for address display
        const GETTING_LOCATION_TEXT = 'Getting location...';
        const LOCATION_FOUND_TEXT = 'Location found! Adjust pin on map.';
        const SUBMITTING_TEXT = 'Sending...';
        const SUBMITTED_TEXT = 'Submitted!';
        const SUBMIT_ERROR_TEXT = 'Error - Try Again';
        const DEFAULT_SUBMIT_TEXT = 'Submit Location'; // Default text for the submit button
        const MESSAGE_DISPLAY_DURATION = 3000;
        const WAIT_FOR_ELEMENT_TIMEOUT = 5000;
        const BUTTON_SUCCESS_BG = '#28a745'; // Green for success
        const BUTTON_ERROR_BG = '#dc3545'; // Red for error
        const STATUS_MESSAGE_STYLE = 'padding: 10px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 10px;';
        const ERROR_MESSAGE_STYLE = 'color: #dc3545; padding: 10px;'; // Red text for errors

        const getOrCreateById = (id: string, createFn: () => HTMLElement, parent: HTMLElement | null) => {
            let element = document.getElementById(id);
            if (!element) {
                element = createFn();
                if (!element.id && id) element.id = id; // Ensure ID is set if createFn doesn't do it
                if (parent) { parent.appendChild(element); }
                else { console.warn(`getOrCreateById: No parent for new element "${id}". Appending to body.`); document.body.appendChild(element); }
            } else { // Element exists, ensure it's in the correct parent if specified
                if (parent && element.parentElement !== parent) { parent.appendChild(element); }
                else if (!parent && element.parentElement !== document.body) { document.body.appendChild(element); } // Default to body if no parent and not already there
            }
            return element;
        }

        const getOrCreateBySelector = (
            selector: string,
            parentToSearchAndAppend: HTMLElement,
            createFn: () => HTMLElement
        ) => {
            let element = parentToSearchAndAppend.querySelector(selector);
            if (!element) {
                element = createFn();
                parentToSearchAndAppend.appendChild(element);
            }
            return element;
        }

        const showFeedbackMessage = (
            container: HTMLElement | null,
            textContent: string,
            messageType: 'error' | 'status',
            autoClearDelay = 0
        ) => {
            if (!container) { console.warn("showFeedbackMessage: No container provided."); return; }
            container.innerHTML = ''; // Clear previous messages
            const messageElement = document.createElement('div');
            messageElement.textContent = textContent;
            messageElement.style.cssText = messageType === 'error' ? ERROR_MESSAGE_STYLE : STATUS_MESSAGE_STYLE;
            container.appendChild(messageElement);
            if (autoClearDelay > 0) {
                setTimeout(() => {
                    if (container.contains(messageElement)) { container.removeChild(messageElement); }
                }, autoClearDelay);
            }
        }

        const updateButtonState = (
            button: HTMLElement | null,
            { text, disabled, backgroundColor }: { text?: string, disabled?: boolean, backgroundColor?: string }
        ) => {
            if (!button) return;
            if (text !== undefined) button.innerText = text;
            if (disabled !== undefined) (button as HTMLButtonElement).disabled = disabled;
            if (backgroundColor !== undefined) {
                button.style.backgroundColor = backgroundColor;
                // Update the base color used for mouseout if necessary (assuming UIHelpers.createButton structure)
                button.onmouseout = () => button.style.backgroundColor = backgroundColor || '#007bff'; // Default or new base
            }
        }

        const formatAddressForDisplay = (
            addressComponentData: any,
            coordinates: { latitude: number, longitude: number } | null
        ) => {
            const addr = addressComponentData || {};
            let formattedHtml = '<h3>Selected Location</h3>';
            let streetAddressLine = '';

            if (addr.Address) { streetAddressLine = addr.Address; } // ArcGIS: Full street address
            else if (addr.AddNum && addr.StreetName) { streetAddressLine = `${addr.AddNum} ${addr.StreetName}`; } // ArcGIS specific
            else if (addr.house_number && (addr.road || addr.street)) { streetAddressLine = `${addr.house_number} ${addr.road || addr.street}`; } // Nominatim
            else if (addr.road || addr.street) { streetAddressLine = addr.road || addr.street; } // Nominatim (street only)
            else if (addr.Match_addr) { streetAddressLine = addr.Match_addr.split(',')[0]; } // Fallback to first part of Match_addr

            if (streetAddressLine) { formattedHtml += `<p>${streetAddressLine.trim()}</p>`; }
            else { formattedHtml += '<p>Street address not available.</p>'; }

            const cityLineParts = [addr.City || addr.city || addr.town || '', addr.Region || addr.state || '', addr.Postal || addr.postcode || ''];
            const cityLine = cityLineParts.filter(part => part).join(' ').trim();
            if (cityLine) { formattedHtml += `<p>${cityLine}</p>`; }

            if (!streetAddressLine && !cityLine && (!addr || Object.keys(addr).length === 0)) {
                formattedHtml = '<h3>Selected Location</h3><p>Address information could not be determined.</p>';
            }

            if (coordinates) {
                formattedHtml += `<p><small>Lat: ${coordinates.latitude.toFixed(6)}, Lng: ${coordinates.longitude.toFixed(6)}</small></p>`;
            } else {
                formattedHtml += `<p><small>Coordinates not available.</small></p>`;
            }
            return formattedHtml;
        }
        window.formatAddressForDisplayHelper = formatAddressForDisplay; // Make it globally accessible for MapManager

        const handleFullscreenToggle = (fullscreenButton: HTMLElement | null) => {
            if (!window.mapManager) { console.error("MapManager not available for fullscreen toggle."); return; }
            const isFullscreen = window.mapManager.toggleFullscreen();
            updateButtonState(fullscreenButton, { text: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' });
            // Also update the text of the fullscreen button inside the map popup, if it's open
            const popupFullscreenBtn = window.mapManager.marker?.getPopup()?.getElement()?.querySelector('.fullscreen-btn-popup');
            if (popupFullscreenBtn) popupFullscreenBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
        }

        const handleGetCurrentLocation = async (
            feedbackDisplayTarget: HTMLElement | null,
            locationButton: HTMLElement | null
        ) => {
            console.log("handleGetCurrentLocation called. Feedback target:", feedbackDisplayTarget);
            const inWebView = isAdPlatformWebView();
            const detectedPlatform = getDetectedPlatform();

            if (!window.mapManager || !feedbackDisplayTarget) {
                console.error("MapManager or feedbackDisplayTarget not ready in handleGetCurrentLocation.");
                if (feedbackDisplayTarget) showFeedbackMessage(feedbackDisplayTarget, 'Error: Map not ready.', 'error');
                return;
            }

            try {
                const statusMessage = inWebView
                    ? `Getting location (may require ${detectedPlatform || 'app'} permissions)...`
                    : GETTING_LOCATION_TEXT;
                showFeedbackMessage(feedbackDisplayTarget, statusMessage, 'status');
                updateButtonState(locationButton, { disabled: true });

                const position = await LocationService.getCurrentPosition();
                interface PositionWithCoords {
                    coords: {
                        latitude: number;
                        longitude: number;
                    }
                }
                const pos = position as PositionWithCoords;
                if (pos?.coords) {
                    await window.mapManager.setPosition(pos.coords.latitude, pos.coords.longitude);
                    showFeedbackMessage(feedbackDisplayTarget, LOCATION_FOUND_TEXT, 'status', MESSAGE_DISPLAY_DURATION);
                } else { throw new Error("Received invalid position data."); }
            } catch (err) {
                console.error("Error in handleGetCurrentLocation:", err);
                let errorMessage = `Error: ${(err as Error).message || 'Could not retrieve location.'}`;

                // Add manual address fallback instruction for webviews
                if (inWebView) {
                    const platformName = detectedPlatform || 'social media app';
                    errorMessage += `\n\nFor ${platformName} users: You can manually enter your address using the form below the map.`;
                }

                showFeedbackMessage(feedbackDisplayTarget, errorMessage, 'error');
            } finally {
                updateButtonState(locationButton, { disabled: false });
            }
        }

        const handleSubmitLocation = async (submitButton: HTMLElement | null) => { // This is for the *global* submit button
            if (!window.mapManager || !window.mapManager.currentPosition || !window.mapManager.addressInfo || !window.mapManager.addressInfo.address) {
                console.error("Submit prerequisites not met: mapManager, currentPosition, or addressInfo.address missing.");
                return;
            }
            updateButtonState(submitButton, { text: SUBMITTING_TEXT, disabled: true });
            try {
                // Add this interface near the top of the file
                interface LocationDataPayload {
                    coordinates: {
                        latitude: number;
                        longitude: number;
                    };
                    address: GeocoderAddress;
                }

                const result = await (LocationService as any).submitLocationData({
                    coordinates: window.mapManager.currentPosition,
                    address: window.mapManager.addressInfo.address // Use the full address object
                });
                console.log("Location submitted successfully:", result);
                updateButtonState(submitButton, { text: SUBMITTED_TEXT, backgroundColor: BUTTON_SUCCESS_BG });
                setTimeout(() => { // Reset button after a delay
                    updateButtonState(submitButton, { text: DEFAULT_SUBMIT_TEXT, backgroundColor: UIHelpers.createButton('', { backgroundColor: BUTTON_SUCCESS_BG }).style.backgroundColor, disabled: false }); // Revert to original style
                    if (submitButton) (submitButton as HTMLElement).style.display = 'none'; // Hide after successful submission
                }, MESSAGE_DISPLAY_DURATION);
            } catch (err) {
                console.error("Error submitting location:", err);
                updateButtonState(submitButton, { text: SUBMIT_ERROR_TEXT, backgroundColor: BUTTON_ERROR_BG, disabled: false });
                setTimeout(() => { // Reset button after a delay
                    updateButtonState(submitButton, { text: DEFAULT_SUBMIT_TEXT, backgroundColor: UIHelpers.createButton('', { backgroundColor: BUTTON_ERROR_BG }).style.backgroundColor });
                }, MESSAGE_DISPLAY_DURATION);
            }
        }

        return {
            getOrCreateById, getOrCreateBySelector, showFeedbackMessage, updateButtonState,
            formatAddressForDisplay, handleFullscreenToggle, handleGetCurrentLocation, handleSubmitLocation,
            LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID, ADDRESS_DISPLAY_CLASS,
            GLOBAL_ADDRESS_DISPLAY_ID, SUBMIT_BUTTON_CLASS, CONTENT_ELEMENT_SELECTOR,
            WAIT_FOR_ELEMENT_TIMEOUT, BUTTON_SUCCESS_BG, BUTTON_ERROR_BG, DEFAULT_SUBMIT_TEXT,
            UI_LISTENERS_SETUP_COMPLETE_CLASS
        };
    }

    const helpers = defineInternalHelpers();

    if (window.mapServiceInitialized && window.mapManager && window.mapManager.container === mapContainerElement) {
        console.log('initLocationService: Already initialized for this specific map container.');
        if (window.mapManager && window.mapManager.container) {
            await (window as any).initGlobalLocationUI(window.mapManager.container, feedbackContainerOverride, helpers).catch((err: Error) => {
                console.error("Failed to re-initialize Global Location UI for existing mapManager:", err);
            });
        }
        return window.mapManager;
    }
    if (window.mapServiceInitializing) {
        console.log('initLocationService: Initialization already in progress. Awaiting...');
        return new Promise((resolve, reject) => {
            let attempts = 0; const maxAttempts = 50; // Wait up to 10 seconds
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.mapServiceInitialized && window.mapManager) {
                    clearInterval(checkInterval); resolve(window.mapManager);
                } else if (!window.mapServiceInitializing || attempts >= maxAttempts) {
                    clearInterval(checkInterval); console.error("initLocationService: Ongoing initialization failed or timed out.");
                    reject(new Error("Ongoing map initialization failed or timed out."));
                }
            }, 200);
        });
    }
    window.mapServiceInitializing = true;
    console.log("initLocationService: Starting new initialization for container:", mapContainerElement);

    try {
        await waitForLeaflet();

        if (!window.mapManager || window.mapManager.container !== mapContainerElement) {
            console.log("initLocationService: Creating/recreating MapManager instance.");
            if (window.mapManager && window.mapManager.map && typeof window.mapManager.map.remove === 'function') {
                window.mapManager.map.remove(); // Clean up old map instance if any
            }
            window.mapManager = new MapManager(mapContainerElement, (mapInstance) => {
                console.log('MapManager instance created/re-created via initLocationService, map instance:', mapInstance);
            });
        } else {
            console.log("initLocationService: window.mapManager already exists for the correct container.");
        }

        const setupDOMElements = (
            contentElementForFallbackAddress: HTMLElement,
            mapContainerForButtons: HTMLElement,
            feedbackContainerOverride: HTMLElement | null,
            localHelpers: any
        ) => {
            const { getOrCreateById, getOrCreateBySelector, LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID, GLOBAL_ADDRESS_DISPLAY_ID, ADDRESS_DISPLAY_CLASS, SUBMIT_BUTTON_CLASS, DEFAULT_SUBMIT_TEXT, BUTTON_SUCCESS_BG } = localHelpers;
            const buttonsParent = mapContainerForButtons; // Buttons are positioned relative to the map container

            const locationButton = getOrCreateById(LOCATION_BUTTON_ID,
                () => UIHelpers.createButton('Get Current Location', {
                    top: '10px',
                    right: '10px',
                    ['--button-id' as any]: LOCATION_BUTTON_ID
                }), buttonsParent);
            const fullscreenButton = getOrCreateById(FULLSCREEN_BUTTON_ID,
                () => UIHelpers.createButton('Fullscreen', {
                    top: '10px',
                    right: '200px',
                    ['--button-id' as any]: FULLSCREEN_BUTTON_ID
                }), buttonsParent); // Adjust position as needed

            let actualFeedbackDisplayTarget;
            if (feedbackContainerOverride && feedbackContainerOverride instanceof HTMLElement) {
                actualFeedbackDisplayTarget = feedbackContainerOverride;
                console.log("setupDOMElements: Using provided feedbackContainerOverride:", actualFeedbackDisplayTarget);
                actualFeedbackDisplayTarget.innerHTML = ''; // Clear it for new content
            } else if (mapContainerForButtons && mapContainerForButtons.parentElement) {
                // Try to get/create the global display *above* the map container
                actualFeedbackDisplayTarget = document.getElementById(GLOBAL_ADDRESS_DISPLAY_ID);
                if (!actualFeedbackDisplayTarget) {
                    actualFeedbackDisplayTarget = UIHelpers.createAddressDisplay();
                    actualFeedbackDisplayTarget.id = GLOBAL_ADDRESS_DISPLAY_ID;
                    actualFeedbackDisplayTarget.classList.add(ADDRESS_DISPLAY_CLASS);
                    mapContainerForButtons.parentElement.insertBefore(actualFeedbackDisplayTarget, mapContainerForButtons);
                    console.log("setupDOMElements: Created and inserted address display above map:", actualFeedbackDisplayTarget);
                } else { // Exists, ensure it's correctly positioned relative to map container
                    if (actualFeedbackDisplayTarget.nextSibling !== mapContainerForButtons || actualFeedbackDisplayTarget.parentElement !== mapContainerForButtons.parentElement) {
                        mapContainerForButtons.parentElement.insertBefore(actualFeedbackDisplayTarget, mapContainerForButtons);
                        console.log("setupDOMElements: Moved existing address display above map:", actualFeedbackDisplayTarget);
                    } else { console.log("setupDOMElements: Existing address display is already above map:", actualFeedbackDisplayTarget); }
                }
                actualFeedbackDisplayTarget.innerHTML = ''; // Clear it
            } else { // Fallback if map container or its parent isn't available for standard placement
                console.warn("setupDOMElements: Fallback for address display. Using contentElementForFallbackAddress:", contentElementForFallbackAddress);
                actualFeedbackDisplayTarget = getOrCreateBySelector(`.${ADDRESS_DISPLAY_CLASS}`, contentElementForFallbackAddress, () => {
                    const el = UIHelpers.createAddressDisplay();
                    el.classList.add(ADDRESS_DISPLAY_CLASS);
                    el.id = GLOBAL_ADDRESS_DISPLAY_ID + "_fallback"; return el; // Unique ID for fallback
                });
            }
            return { locationButton, fullscreenButton, addressDisplay: actualFeedbackDisplayTarget };
        }

        const attachEventListeners = (
            { locationButton, fullscreenButton, addressDisplay }: {
                locationButton: HTMLElement | null,
                fullscreenButton: HTMLElement | null,
                addressDisplay: HTMLElement | null
            },
            localHelpers: any
        ) => {
            const { handleFullscreenToggle, handleGetCurrentLocation, LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID } = localHelpers;

            if (fullscreenButton) fullscreenButton.onclick = () => handleFullscreenToggle(fullscreenButton);
            else console.warn(`Element with ID '${FULLSCREEN_BUTTON_ID}' not found, cannot attach listener.`);

            if (locationButton) locationButton.onclick = () => handleGetCurrentLocation(addressDisplay, locationButton);
            else console.warn(`Element with ID '${LOCATION_BUTTON_ID}' not found, cannot attach listener.`);
        }

        const setupMapManagerCallback = (
            { addressDisplay }: {
                addressDisplay: HTMLElement | null
            },
            localHelpers: any
        ) => {
            const { formatAddressForDisplay, updateButtonState, DEFAULT_SUBMIT_TEXT, BUTTON_SUCCESS_BG, BUTTON_ERROR_BG } = localHelpers;
            if (!window.mapManager) { console.warn("MapManager not available for onLocationConfirmed."); return; }

            window.mapManager.onLocationConfirmed = async (locationData) => { // MODIFIED: Made async
                if (!addressDisplay) {
                    console.error("addressDisplay not found for onLocationConfirmed.");
                    return;
                }

                if (!locationData || !locationData.address || !locationData.coordinates) {
                    console.error("onLocationConfirmed called with invalid locationData.");
                    if (addressDisplay) {
                        addressDisplay.innerHTML = formatAddressForDisplay(null, locationData ? locationData.coordinates : null);
                        // Add a distinct feedback message area if not using showFeedbackMessage helper here
                        const errorDiv = document.createElement('div');
                        errorDiv.textContent = 'Could not confirm location details.';
                        errorDiv.style.color = 'red'; errorDiv.style.marginTop = '10px';
                        addressDisplay.appendChild(errorDiv);
                    }
                    return;
                }

                // 1. Update main address display with formatted selected address
                addressDisplay.innerHTML = formatAddressForDisplay(locationData.address, locationData.coordinates);

                // 2. Prepare address for /api/geocode
                //    Map various geocoder address formats to a consistent structure
                const addr = locationData.address;
                const apiAddress = {
                    line1: addr.Address || `${addr.AddNum || addr.house_number || ''} ${addr.StreetName || addr.Street || addr.road || ''}`.trim(),
                    city: addr.City || addr.city || addr.town || '',
                    state: addr.Region || addr.state || '',
                    postal_code: addr.Postal || addr.postcode || '',
                    country: "US" // Assuming US
                };

                // Clean up line1 if it's just a number or empty
                if (/^\d+$/.test(apiAddress.line1) || apiAddress.line1.trim() === '') {
                    // Try to reconstruct more robustly or use Match_addr if available and more complete
                    if (addr.Match_addr && addr.Match_addr.includes(',')) {
                        apiAddress.line1 = addr.Match_addr.split(',')[0].trim();
                    } else if (addr.LongLabel && addr.LongLabel.includes(',')) {
                        apiAddress.line1 = addr.LongLabel.split(',')[0].trim();
                    } else {
                        // If still problematic, it might be better to indicate an issue or rely on user correction
                        console.warn("Could not form a valid street line1 from geocoded data:", addr);
                    }
                }


                // Attempt to get email and trash_day from existing form inputs on the page

                // Try to scope input lookups to the active modal/dialog if possible
                let modalContext: HTMLElement | null = null;
                // Try to find the closest open dialog/modal from the addressDisplay
                if (addressDisplay && addressDisplay.closest && addressDisplay.closest('dialog')) {
                    modalContext = addressDisplay.closest('dialog') as HTMLElement;
                }

                // Helper to find input in modal, fallback to global
                function findInput(selector: string): HTMLInputElement | null {
                    if (modalContext) {
                        const el = modalContext.querySelector(selector);
                        if (el) return el as HTMLInputElement;
                    }
                    return document.querySelector(selector) as HTMLInputElement | null;
                }

                // Helper to find select element in modal, fallback to global
                function findSelect(selector: string): HTMLSelectElement | null {
                    if (modalContext) {
                        const el = modalContext.querySelector(selector);
                        if (el) return el as HTMLSelectElement;
                    }
                    return document.querySelector(selector) as HTMLSelectElement | null;
                }

                const emailInput = findInput('#email');
                const trashDaySelect = findSelect('#trash-day');
                const subscribeToMarketingCheckbox = findInput('#subscribe_to_marketing');
                const numberOfBinsElement = findInput('#number-of-bins');

                // Always read the current value at the time of payload creation
                let additional_bins = 0;
                if (numberOfBinsElement) {
                    const val = parseInt(numberOfBinsElement.value);
                    additional_bins = isNaN(val) ? 0 : Math.max(0, val - 2); // Never negative
                }
                window.additionalBins = additional_bins; // Keep global for modal if needed
                console.log("Number of bins (current, modal-aware):", numberOfBinsElement?.value, "additional_bins:", additional_bins);
                // on change update the window
                if (numberOfBinsElement) {
                    numberOfBinsElement.addEventListener('change', () => {
                        const val = parseInt(numberOfBinsElement.value);
                        window.additionalBins = isNaN(val) ? 0 : Math.max(0, val - 2); // Never negative
                        console.log("Number of bins changed:", numberOfBinsElement.value, "additional_bins:", window.additionalBins);
                    });
                }

                const geocodePayload = {
                    address: apiAddress,
                    email: emailInput ? emailInput.value.trim() : null,
                    trash_day: trashDaySelect ? trashDaySelect.value : null,
                    subscribe_to_marketing: subscribeToMarketingCheckbox ? subscribeToMarketingCheckbox.checked : null,
                    additional_bins,
                    location_type: 'geolocation', // Indicate this comes from geolocation
                    coordinates: locationData.coordinates // Include original coordinates
                };

                // Remove null/undefined properties from payload as backend might not expect them
                Object.keys(geocodePayload).forEach(key => {
                    if ((geocodePayload as Record<string, any>)[key] === null || (geocodePayload as Record<string, any>)[key] === undefined) {
                        delete (geocodePayload as Record<string, any>)[key];
                    }
                });


                // 3. Create or get a dedicated feedback element within addressDisplay
                let feedbackElement = addressDisplay.querySelector('.api-feedback-message');
                if (!feedbackElement) {
                    feedbackElement = document.createElement('div');
                    feedbackElement.className = 'api-feedback-message';
                    (feedbackElement as HTMLElement).style.marginTop = '10px'; // Basic styling
                    (feedbackElement as HTMLElement).style.fontWeight = '500';
                    addressDisplay.appendChild(feedbackElement);
                }

                const setApiFeedback = (msg: string, type: 'info' | 'success' | 'error' | 'loading' = 'info') => {
                    feedbackElement.textContent = msg;
                    feedbackElement.className = 'api-feedback-message'; // Reset classes
                    // Basic text color styling, assuming no Tailwind here for simplicity or use classes if available
                    switch (type) {
                        case 'success': (feedbackElement as HTMLElement).style.color = 'green'; break;
                        case 'error': (feedbackElement as HTMLElement).style.color = 'red'; break;
                        case 'loading': (feedbackElement as HTMLElement).style.color = 'blue'; break;
                        default: (feedbackElement as HTMLElement).style.color = 'black';
                    }
                };

                setApiFeedback('Checking service availability for the confirmed location...', 'loading');

                try {
                    const response = await fetch('/api/geocode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(geocodePayload)
                    });

                    if (!response.ok) {
                        let errorMsg = `Address validation failed (${response.status})`;
                        try {
                            const errorData = await response.json();
                            errorMsg = errorData.message || errorMsg;
                        } catch (e) { console.error("Could not parse error response from /api/geocode on confirm", e); }
                        throw new Error(errorMsg);
                    }

                    const geocodeDataResponse = await response.json(); // Renamed to avoid conflict
                    console.log('Geocode response on confirm:', geocodeDataResponse);

                    localStorage.setItem('geocode-data', JSON.stringify(geocodeDataResponse)); // Store for later use
                    // Store the validation result globally for potential reuse in modal
                    window.lastValidatedAddressForModal = {
                        inside_zone: geocodeDataResponse.inside_zone,
                        valid_trash_day: geocodeDataResponse.valid_trash_day,
                        next_service_day: geocodeDataResponse.next_service_day,
                        location: geocodeDataResponse.location,
                        address_id: geocodeDataResponse.address_id
                    }

                    if (!geocodeDataResponse.inside_zone) {
                        setApiFeedback('Sorry, service is not currently available at this address.', 'error');
                    } else {
                        let successMsg = 'Service is available!';
                        if (geocodeDataResponse.next_service_day) {
                            successMsg += ` Next estimated service day: ${geocodeDataResponse.next_service_day}.`;
                        }
                        setApiFeedback(successMsg, 'success');

                        // Note: FindLocation event is now sent server-side for better reliability
                        // The server sends this event when address validation succeeds

                        // Populate form fields if they exist on the page
                        const formAddress1Input = document.getElementById('address1');
                        const formCityInput = document.getElementById('city');
                        const formStateInput = document.getElementById('state');
                        const formZipInput = document.getElementById('zip5'); // Or 'zip', check your form

                        if (formAddress1Input) (formAddress1Input as HTMLInputElement).value = apiAddress.line1;
                        if (formCityInput) (formCityInput as HTMLInputElement).value = apiAddress.city;
                        if (formStateInput) (formStateInput as HTMLInputElement).value = apiAddress.state;
                        if (formZipInput) (formZipInput as HTMLInputElement).value = apiAddress.postal_code;

                        console.log("Form fields populated after /api/geocode success from map confirm.");

                        // add event listener to schedule service button (checkout-button)
                        let scheduleServiceButton = document.getElementById('checkout-button');

                        if (scheduleServiceButton) {
                            // Check if we should use standard HTML form submission for browser compatibility
                            // This is particularly important for TikTok's in-app browser
                            const form = scheduleServiceButton.closest('form');
                            const isTikTokBrowser = navigator.userAgent.includes('TikTok') || 
                                                  navigator.userAgent.includes('ByteDance') ||
                                                  navigator.userAgent.includes('Musically');
                            
                            if (form && (isTikTokBrowser || !window.Stripe)) {
                                console.log("TikTok browser or no Stripe detected - using standard HTML form submission instead of JavaScript");
                                // For TikTok browser compatibility, let the form submit normally
                                // Don't add click event listeners that might interfere
                                return;
                            }
                            
                            // Clone and replace to remove previous listeners, a common simple strategy.
                            // For more complex scenarios, consider AbortSignal or named functions for removal.
                            const newScheduleServiceButton = scheduleServiceButton.cloneNode(true) as HTMLButtonElement;
                            scheduleServiceButton.parentNode?.replaceChild(newScheduleServiceButton, scheduleServiceButton);
                            scheduleServiceButton = newScheduleServiceButton;

                            scheduleServiceButton.addEventListener('click', async (event) => {
                                console.log("Global checkout-button (from map confirm context) clicked.");
                                const thisClickedButton = event.currentTarget as HTMLButtonElement;
                                thisClickedButton.disabled = true;

                                const activeServiceModalElement = thisClickedButton.closest('dialog') as HTMLElement | null;

                                if (!activeServiceModalElement) {
                                    console.error("Checkout button clicked, but could not find its parent service modal (div[id^='service-modal-']). Button:", thisClickedButton);
                                    // Feedback here is tricky. setApiFeedback is tied to the map's context.
                                    // A global alert or a more sophisticated notification system might be needed.
                                    alert('Error: Could not determine the active service context. Please try reopening the service modal.');
                                    thisClickedButton.disabled = false;
                                    return;
                                }

                                const modalContentAreaForStripe = activeServiceModalElement.querySelector('.modal-content-area') as HTMLElement | null;
                                if (!modalContentAreaForStripe) {
                                    console.error(".modal-content-area not found within the active service modal.", activeServiceModalElement);
                                    alert('Error: Modal content structure error.'); // This alert might be better if tied to modalSpecificFeedback if available
                                    thisClickedButton.disabled = false;
                                    return;
                                }

                                // Define a helper for modal-specific feedback
                                const modalSpecificFeedbackDiv = modalContentAreaForStripe.querySelector('#address-feedback') as HTMLElement | null;
                                const showInModalFeedback = (msg: string, type: 'info' | 'error' | 'success' | 'loading' = 'info') => {
                                    if (modalSpecificFeedbackDiv) {
                                        modalSpecificFeedbackDiv.textContent = msg;
                                        modalSpecificFeedbackDiv.className = 'mt-3 text-sm font-medium'; // Reset
                                        if (type === 'error') modalSpecificFeedbackDiv.classList.add('text-red-600', 'dark:text-red-400');
                                        else if (type === 'success') modalSpecificFeedbackDiv.classList.add('text-green-600', 'dark:text-green-400');
                                        else modalSpecificFeedbackDiv.classList.add('text-blue-600', 'dark:text-blue-400'); // loading or info
                                    } else {
                                        console.log(`ModalFeedback (${type}): ${msg}`); // Fallback
                                    }
                                };


                                try {
                                    const serviceDataString = activeServiceModalElement.dataset.serviceData;
                                    if (!serviceDataString) {
                                        console.error("Service data not found on the active service modal's dataset.", activeServiceModalElement);
                                        throw new Error("Service data is missing from the active modal.");
                                    }
                                    const serviceProductData: ServiceData = JSON.parse(serviceDataString);

                                    // 'apiAddress' is from the outer scope of onLocationConfirmed (address confirmed on map)
                                    // Get email and trash_day from the form fields *within the active service modal*
                                    const currentEmailInput = modalContentAreaForStripe.querySelector('#email') as HTMLInputElement | null;
                                    const currentTrashDaySelect = modalContentAreaForStripe.querySelector('#trash-day') as HTMLSelectElement | null;

                                    const addressDataForStripe = {
                                        ...apiAddress, // Address parts from map confirmation (outer scope)
                                        email: currentEmailInput?.value.trim() || '',
                                        trash_day: currentTrashDaySelect?.value || '',
                                    };

                                    // Initialize Stripe using the imported function.
                                    // It expects (modalContentArea, serviceData, addressData)
                                    const stripeInitialized = await initializeStripeElements(modalContentAreaForStripe, serviceProductData, addressDataForStripe);

                                    if (stripeInitialized) {
                                        showInModalFeedback('Please enter payment details.', 'info');
                                        const paymentForm = modalContentAreaForStripe.querySelector('#payment-form');
                                        if (paymentForm) {
                                            // handlePaymentSubmit expects (event, modalContentArea)
                                            paymentForm.addEventListener('submit', (e) => handlePaymentSubmit(e, modalContentAreaForStripe));
                                        } else {
                                            console.error("Payment form not found in modal after Stripe init!");
                                            showInModalFeedback('Error displaying payment form.', 'error');
                                        }
                                        // Hide address section, show payment section within the modal
                                        const addressSect = modalContentAreaForStripe.querySelector('#address-validation-section');
                                        const paymentSect = modalContentAreaForStripe.querySelector('#payment-section');
                                        if (addressSect) (addressSect as HTMLElement).style.display = 'none';
                                        if (paymentSect) (paymentSect as HTMLElement).classList.remove('hidden');
                                    } else {
                                        // Error message should have been shown by initializeStripeElements or its callees
                                        showInModalFeedback('Failed to initialize payment system. Please check details and try again.', 'error');
                                        thisClickedButton.disabled = false;
                                    }
                                } catch (err) {
                                    console.error('Error during global checkout button processing:', err);
                                    showInModalFeedback(`Checkout Error: ${(err as Error).message}`, 'error');
                                    thisClickedButton.disabled = false;
                                }
                            });
                        } else {
                            console.warn("Schedule service button (checkout-button) not found.");
                        }
                    }
                } catch (err) {
                    console.error('Error calling /api/geocode on confirm:', err);
                    setApiFeedback(`Error checking availability: ${(err as Error).message}`, 'error');
                }
            };
        }


        const initGlobalLocationUI = async (
            mapContainerForButtons: HTMLElement,
            feedbackContainerOverride: HTMLElement | null,
            localHelpers: any
        ) => {
            const { CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT, UI_LISTENERS_SETUP_COMPLETE_CLASS } = localHelpers;
            console.log("initGlobalLocationUI: Configuring UI. Buttons target:", mapContainerForButtons, "Feedback target:", feedbackContainerOverride || "Default (above map or fallback)");

            const contentElementForFallbackAddress = await waitForElement(CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT, document)
                .catch(() => {
                    console.warn(`'${CONTENT_ELEMENT_SELECTOR}' not found, using document.body for fallback address display parent.`);
                    return document.body; // Fallback to body
                });

            const uiElements = setupDOMElements(contentElementForFallbackAddress as HTMLElement, mapContainerForButtons, feedbackContainerOverride, localHelpers);

            // Attach listeners only once per page load, or re-attach if elements were recreated.
            // The UI_LISTENERS_SETUP_COMPLETE_CLASS flag helps manage this.
            // However, if uiElements are recreated (e.g. modal), listeners need re-attaching to new elements.
            // For simplicity here, we re-attach each time initGlobalLocationUI is called,
            // assuming setupDOMElements might return new instances or ensure old ones are correctly parented.
            attachEventListeners(uiElements, localHelpers);
            setupMapManagerCallback(uiElements, localHelpers); // This sets/updates the onLocationConfirmed callback

            if (!document.body.classList.contains(UI_LISTENERS_SETUP_COMPLETE_CLASS)) {
                document.body.classList.add(UI_LISTENERS_SETUP_COMPLETE_CLASS);
                console.log("initGlobalLocationUI: First-time listener and callback setup complete.");
            } else {
                console.log("initGlobalLocationUI: Re-applied listeners and mapManager callback.");
            }
            console.log("initGlobalLocationUI: UI configuration finished.");
        }

        await initGlobalLocationUI(mapContainerElement, feedbackContainerOverride, helpers).catch(err => {
            console.error("Failed to initialize Global Location UI:", err);
            // Potentially show error to user in a fallback way if UI init fails critically
        });

        window.LocationService = LocationService; // Expose service globally if needed
        window.mapServiceInitialized = true;
        window.mapServiceInitializing = false;
        console.log('initLocationService completed successfully. window.mapManager is ready:', window.mapManager);
        return window.mapManager;
    } catch (error) {
        console.error('Critical error in initLocationService:', (error as Error).message, (error as Error).stack);
        window.mapServiceInitialized = false; window.mapServiceInitializing = false; (window as any).mapManager = null;
        // Optionally, display a user-facing error message on the page if map init fails
        if (mapContainerElement) mapContainerElement.innerHTML = `<p style="color:red; padding:10px;">Map could not be loaded: ${(error as Error).message}</p>`;
        throw error; // Re-throw for calling code to handle if necessary
    }
}


// This function is called when the address modal is shown, to initialize/update the map

// and prefill address fields from the map's current location.
window.finalizeAddressFormAndMap = async function () {
    console.log("finalizeAddressFormAndMap: Called.");
    // Assuming the modal and its content are already in the DOM
    const modalElement = document.querySelector('.modal-content-area'); // Adjust if your modal has a different class/ID
    if (!modalElement) { console.error("Modal element not found for finalizeAddressFormAndMap."); return; }

    const addressValidationSection = modalElement.querySelector('#address-validation-section'); // Standard ID from modal-ui.js
    if (!addressValidationSection) { console.error("Address validation section not found in modal."); return; }

    const modalFeedbackDiv = addressValidationSection.querySelector('#address-feedback'); // Standard ID

    let mapContainerInModal;
    try {
        mapContainerInModal = await waitForElement('#mapContainer', 7000, modalElement); // Wait for map container within modal
    } catch (error) {
        const errorMsg = `Map container (#mapContainer) could not be found within the modal. ${(error as Error).message}`;
        if (modalFeedbackDiv) modalFeedbackDiv.innerHTML = `<p class="text-red-500">${errorMsg}</p>`; // Tailwind class
        else console.error(errorMsg, error);
        return;
    }

    // Temporary feedback helper if main one isn't ready or scoped
    const tempShowFeedback = (container: HTMLElement, msg: string, type: 'info' | 'success' | 'error' | 'loading') => {
        if (container) container.innerHTML = `<div style="${type === 'error' ? 'color: #dc3545; padding: 10px;' : 'padding: 10px;'}">${msg}</div>`;
        else console.error("tempShowFeedback: No container for message:", msg);
    };

    try {
        // Initialize the map service for the container *inside the modal*.
        // Pass modalFeedbackDiv as the override for displaying map-related feedback.
        const mapManagerInstance = await initLocationService(mapContainerInModal as HTMLElement, { feedbackContainerOverride: modalFeedbackDiv });

        if (mapManagerInstance) {
            console.log("finalizeAddressFormAndMap: Map manager initialized for modal, attempting to get current location.");
            // Try to get user's current geographic position
            const position = await LocationService.getCurrentPosition();
            console.log("finalizeAddressFormAndMap: Got geographic position", position);
            // Set the map to this position; this will also trigger reverse geocoding and open the popup
            const pos = position as GeolocationPosition;
            await (mapManagerInstance as any).setPosition(pos.coords.latitude, pos.coords.longitude);
            console.log("finalizeAddressFormAndMap: Set map position, waiting for reverse geocode and popup...");

            // Give a brief moment for the reverse geocoding in setPosition/updateAddressDisplay to complete
            await new Promise(resolve => setTimeout(resolve, 500)); // Adjust delay if needed

            const addressInfo = (mapManagerInstance as any).addressInfo; // This should now be populated
            console.log("finalizeAddressFormAndMap: Address info from mapManager after setPosition:", addressInfo);

            if (addressInfo && addressInfo.address) {
                const addr = addressInfo.address;
                // Map geocoded address components to form fields
                let street = '';
                if (addr.Address) { street = addr.Address; }
                else if (addr.AddNum && (addr.StreetName || addr.Street)) { street = `${addr.AddNum} ${addr.StreetName || addr.Street}`; }
                else if (addr.house_number && (addr.road || addr.street)) { street = `${addr.house_number} ${addr.road || addr.street}`; }
                else if (addr.road || addr.street) { street = addr.road || addr.street; }


                const city = addr.City || addr.city || addr.town || '';
                const state = addr.Region || addr.state || '';
                const zip = addr.Postal || addr.postcode || '';

                // Populate the form fields within the modal's address validation section
                const address1Input = addressValidationSection.querySelector('#address1');
                const cityInput = addressValidationSection.querySelector('#city');
                const stateInput = addressValidationSection.querySelector('#state');
                const zipInput = addressValidationSection.querySelector('#zip5'); // Ensure this matches your form's ZIP input ID

                if (address1Input) (address1Input as HTMLInputElement).value = street.trim(); else console.warn("finalizeAddressFormAndMap: #address1 input not found in modal.");
                if (cityInput) (cityInput as HTMLInputElement).value = city.trim(); else console.warn("finalizeAddressFormAndMap: #city input not found in modal.");
                if (stateInput) (stateInput as HTMLInputElement).value = state.trim(); else console.warn("finalizeAddressFormAndMap: #state input not found in modal.");
                if (zipInput) (zipInput as HTMLInputElement).value = zip.trim(); else console.warn("finalizeAddressFormAndMap: #zip5 input not found in modal.");
                console.log("finalizeAddressFormAndMap: Address form in modal populated from map.");

                // Optionally, trigger the /api/geocode call here as well if the user doesn't interact with "Confirm"
                // This would be similar to the logic in onLocationConfirmed
                // For now, we assume "Confirm Location" on the map is the primary trigger for the API call.

            } else {
                console.warn("finalizeAddressFormAndMap: Could not retrieve address details for prefill from addressInfo:", addressInfo);
                if (modalFeedbackDiv) {
                    const errorMsg = addressInfo?.error ? `Could not retrieve address details: ${addressInfo.error}` : 'Could not retrieve address details for prefill.';
                    if (modalFeedbackDiv) tempShowFeedback(modalFeedbackDiv as HTMLElement, errorMsg, 'error');
                }
            }
        } else {
            console.error("finalizeAddressFormAndMap: Map manager failed to initialize in modal.");
            if (modalFeedbackDiv) tempShowFeedback(modalFeedbackDiv as HTMLElement, 'Map manager failed to initialize.', 'error');
        }
    } catch (error) { // Catch errors from getCurrentPosition, setPosition, or initLocationService
        console.error("Error in finalizeAddressFormAndMap during map/location operations:", error);
        if (modalFeedbackDiv) {
            if (modalFeedbackDiv) tempShowFeedback(modalFeedbackDiv as HTMLElement, `Could not auto-detect location or initialize map. ${(error as Error).message}`, 'error');
        }
    }

    // Call setupAddressValidation if it's globally available (from service-validation.js or similar)
    // This would attach listeners to the "Check Availability" button in the modal's address form.
    if (typeof window.setupAddressValidation === 'function') {
        console.log("finalizeAddressFormAndMap: Calling setupAddressValidation for the modal form.");
        (window as any).setupAddressValidation(addressValidationSection as HTMLElement); // Pass the scope of the address form
    } else {
        console.warn("finalizeAddressFormAndMap: window.setupAddressValidation not found. Address form listeners in modal might not be active.");
    }
};




// Assign to window object if in a browser environment
if (typeof window !== 'undefined') {

}

// Optionally, export for use in other modules if this file is part of an ES module system



// DOMContentLoaded: Attempt to initialize map for any *global* (non-modal) map containers
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded: Passive initLocationService attempt for global map.");
    try {
        await waitForLeaflet(3000).catch(err => { console.warn("Leaflet not ready for global map init:", err); throw err; });

        // Find a map container that is NOT inside a typical modal structure
        const potentialGlobalContainers = Array.from(document.querySelectorAll('#mapContainer'));
        const globalContainer = potentialGlobalContainers.find(c => !c.closest('.modal-content-area')); // Adjust modal selector if needed

        if (!window.mapServiceInitialized && globalContainer) {
            console.log("DOMContentLoaded: Global map container found, attempting initLocationService.");
            await initLocationService(globalContainer as HTMLElement); // No feedback override, uses default placement
        } else if (window.mapServiceInitialized) {
            console.log("DOMContentLoaded: Location service (global map) already initialized or in progress.");
        } else {
            console.log("DOMContentLoaded: No suitable global map container found, or service already initializing.");
        }
    } catch (err) {
        console.warn("DOMContentLoaded: initLocationService for global map failed or was skipped:", (err as Error).message);
    }
});
