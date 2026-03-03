import { MapManager } from '../locationService';
import { LocationService } from './location-service';
import { waitForLeaflet } from './wait-for-leaflet';
import { waitForElement } from './wait-for-element';
import { setupDOMElements } from './setup-dom-elements';
import { attachEventListeners } from './attach-event-listeners';
import { setupMapManagerCallback } from './setup-map-callback';
import { formatAddressForDisplay } from './address-formatter';
import { CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT, UI_LISTENERS_SETUP_COMPLETE_CLASS } from './ui-constants';

export async function initLocationService(
  mapContainerElement: HTMLElement,
  options: Record<string, unknown> = {}
): Promise<Window['mapManager'] | null> {
  if (!mapContainerElement) throw new Error('Map container element not provided.');
  const feedbackContainerOverride = (options.feedbackContainerOverride as HTMLElement | null | undefined) ?? null;

  window.formatAddressForDisplayHelper = formatAddressForDisplay;
  initGlobalFlags();

  if (window.mapServiceInitialized && window.mapManager?.container === mapContainerElement) {
    console.log('initLocationService: Already initialized for this container.');
    return window.mapManager;
  }

  if (window.mapServiceInitializing) return await waitForInitialization();

  window.mapServiceInitializing = true;
  console.log("initLocationService: Starting initialization for container:", mapContainerElement);

  try {
    await waitForLeaflet();
    await createOrRecreateMapManager(mapContainerElement);
    await initGlobalLocationUI(mapContainerElement, feedbackContainerOverride);
    
    window.LocationService = LocationService;
    window.mapServiceInitialized = true;
    window.mapServiceInitializing = false;
    console.log('initLocationService completed. window.mapManager ready:', window.mapManager);
    return window.mapManager || null;
  } catch (error) {
    console.error('Critical error in initLocationService:', (error as Error).message);
    window.mapServiceInitialized = false;
    window.mapServiceInitializing = false;
    (window as any).mapManager = null;
    if (mapContainerElement) mapContainerElement.innerHTML = `<p style="color:red; padding:10px;">Map could not be loaded: ${(error as Error).message}</p>`;
    throw error;
  }
}

function initGlobalFlags(): void {
  if (typeof window.mapServiceInitialized === 'undefined') window.mapServiceInitialized = false;
  if (typeof window.mapServiceInitializing === 'undefined') window.mapServiceInitializing = false;
}

async function waitForInitialization(): Promise<Window['mapManager'] | null> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.mapServiceInitialized && window.mapManager) { clearInterval(checkInterval); resolve(window.mapManager); }
      else if (!window.mapServiceInitializing || attempts >= 50) { clearInterval(checkInterval); reject(new Error("Ongoing map initialization failed or timed out.")); }
    }, 200);
  });
}

async function createOrRecreateMapManager(mapContainerElement: HTMLElement): Promise<void> {
  if (!window.mapManager || window.mapManager.container !== mapContainerElement) {
    console.log("initLocationService: Creating/recreating MapManager instance.");
    if (window.mapManager?.map?.remove) window.mapManager.map.remove();
    window.mapManager = new MapManager(mapContainerElement, (mapInstance) => console.log('MapManager created:', mapInstance));
  }
}

async function initGlobalLocationUI(mapContainerForButtons: HTMLElement, feedbackContainerOverride: HTMLElement | null): Promise<void> {
  console.log("initGlobalLocationUI: Configuring UI.");
  const contentElement = await waitForElement(CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT, document).catch(() => document.body) as HTMLElement;
  const uiElements = setupDOMElements(contentElement, mapContainerForButtons, feedbackContainerOverride);
  attachEventListeners(uiElements);
  setupMapManagerCallback(uiElements.addressDisplay);
  if (!document.body.classList.contains(UI_LISTENERS_SETUP_COMPLETE_CLASS)) document.body.classList.add(UI_LISTENERS_SETUP_COMPLETE_CLASS);
  console.log("initGlobalLocationUI: UI configuration finished.");
}
