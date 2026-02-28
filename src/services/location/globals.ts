/// <reference path="../../types/externals.d.ts" />
import type { L } from 'leaflet';
import type { MapManager, ValidatedAddressInfo, ReverseGeocodeResult, GeocodeAddress, GeocodeCoordinates } from './types';

declare global {
    interface Window {
        formatAddressForDisplayHelper?: (address: any, coordinates: any) => string;
        mapManager?: any;
        mapServiceInitialized?: boolean;
        mapServiceInitializing?: boolean;
        LocationService?: typeof import('./geocoding').LocationService;
        setupAddressValidation?: (container: HTMLElement) => void;
        finalizeAddressFormAndMap?: () => Promise<void>;
        initGlobalLocationUI?: (mapContainer: HTMLElement, feedbackContainer: HTMLElement | null, helpers: any) => Promise<void>;
        openPricingModal?: (serviceData: any) => void;
        showServiceModal?: (serviceData: any) => void;
        initializeStripeElementsInModal?: () => Promise<boolean>;
        handlePaymentSubmitInModal?: (event: Event) => Promise<void>;
        tailwind: { config: Record<string, any> };
        initializeTracker?: () => void;
        lastValidatedAddressForModal?: ValidatedAddressInfo;
        L: typeof L & { esri: any };
        additionalBins: number;
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

export {};
