import { MapManager } from './map-manager';
import { OriginalStyles } from './types';

export function saveOriginalStyles(container: HTMLElement): OriginalStyles {
  return {
    width: container.style.width,
    height: container.style.height,
    position: container.style.position,
    top: container.style.top,
    left: container.style.left,
    zIndex: container.style.zIndex,
    margin: container.style.margin
  };
}

export function toggleFullscreen(mapManager: MapManager): boolean {
  if (!mapManager.container) return mapManager.isFullscreen;
  
  mapManager.isFullscreen = !mapManager.isFullscreen;
  
  if (mapManager.isFullscreen) {
    mapManager.scrollPosition = window.pageYOffset;
    Object.assign(mapManager.container.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', margin: '0', zIndex: '10000'
    });
    document.body.style.overflow = 'hidden';
  } else {
    Object.assign(mapManager.container.style, mapManager.originalStyles);
    if (getComputedStyle(mapManager.container).position === 'static') {
      mapManager.container.style.position = 'relative';
    }
    document.body.style.overflow = '';
    window.scrollTo(0, mapManager.scrollPosition);
  }
  
  if (mapManager.map) mapManager.map.invalidateSize();
  return mapManager.isFullscreen;
}
