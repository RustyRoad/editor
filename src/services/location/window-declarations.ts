/// <reference path="../../types/externals.d.ts" />
import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import { MapManager, LocationService, ValidatedAddressInfo, ServiceData } from './index';

declare global {
  interface Window {
    formatAddressForDisplayHelper?: (address: any, coordinates: any) => string;
    mapManager?: MapManager;
    mapServiceInitialized?: boolean;
    mapServiceInitializing?: boolean;
    LocationService?: typeof LocationService;
    setupAddressValidation?: (container: HTMLElement) => void;
    finalizeAddressFormAndMap?: () => Promise<void>;
    initGlobalLocationUI?: (mapContainer: HTMLElement, feedbackContainer: HTMLElement | null, helpers: any) => Promise<void>;
    openPricingModal?: (serviceData: ServiceData) => void;
    showServiceModal?: (serviceData: ServiceData) => void;
    initializeStripeElementsInModal?: () => Promise<boolean>;
    handlePaymentSubmitInModal?: (event: Event) => Promise<void>;
    tailwind: { config: Record<string, any> };
    initializeTracker?: () => void;
    lastValidatedAddressForModal?: ValidatedAddressInfo;
    L: typeof L & { esri: typeof EsriLeaflet };
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
