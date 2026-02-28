import * as L from 'leaflet';

export async function waitForLeaflet(timeout = 7000): Promise<typeof L> {
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
