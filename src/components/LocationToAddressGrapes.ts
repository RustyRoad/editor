/**
 * LocationToAddressGrapes.js - Collin County Location Selector Component for GrapesJS
 */

import { Editor } from "grapesjs";
import * as L from 'leaflet';

export default (editor: Editor, opts = {}) => {

    // Function to load Leaflet if not already loaded
    function loadLeaflet(callback: () => void) {
        if (window.L) {
            callback();
            return;
        }

        // Load Leaflet CSS
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        // Load Leaflet JS
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        leafletScript.onload = callback;
        document.head.appendChild(leafletScript);
    }

    // Webview detection utility for major ad platforms
    function isTikTokWebView(): boolean {
        return isAdPlatformWebView('tiktok');
    }

    function isAdPlatformWebView(platform?: string): boolean {
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
    function getDetectedPlatform(): string | null {
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
    const domc = editor.DomComponents;
    const defaultType = domc.getType('default');
    const defaultModel = defaultType.model;
    const defaultView = defaultType.view;

    // Configuration options
    const options = {
        // Default Collin County parcel service URL
        parcelServiceUrl: 'https://gismaps.cityofallen.org/arcgis/rest/services/ReferenceData/Collin_County_Appraisal_District_Parcels/MapServer/0',

        // Default map center (McKinney, TX - county seat of Collin County)
        defaultCenter: [33.198, -96.635] as [number, number],
        defaultZoom: 13,

        // Override default options with user provided options
        ...opts,
    };

    // Register the component type
    domc.addType('location-to-address', {
        isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'location-to-address',
        model: {
            ...defaultModel,
            defaults: {
                ...defaultModel.prototype.defaults,
                droppable: true,
                traits: [
                    {
                        name: 'address',
                        label: 'Address',
                        type: 'text'
                    },
                    {
                        name: 'latitude',
                        label: 'Latitude',
                        type: 'number'
                    },
                    {
                        name: 'longitude',
                        label: 'Longitude',
                        type: 'number'
                    }
                ],
                mapContainerId: `map-${Math.random().toString(36).substring(2, 9)}`,
                address: 'Click "Get Location" button',
                latitude: null,
                longitude: null,
                script: function () {
                    // This function will be executed in the browser
                    // Don't use arrow functions here or variables from the outer scope

                    var self = this;
                    var mapId = self.getAttribute('mapContainerId') || `map-${Math.random().toString(36).substring(2, 9)}`;
                    var address = self.getAttribute('address') || 'Click "Get Location" button';
                    var latitude = parseFloat(self.getAttribute('latitude')) || null;
                    var longitude = parseFloat(self.getAttribute('longitude')) || null;

                    // Create the location container if it doesn't exist
                    if (!self.querySelector('.location-container')) {
                        var container = document.createElement('div');
                        container.className = 'location-container';
                        container.style.fontFamily = 'arial, sans-serif';
                        container.style.padding = '10px';
                        container.style.border = '1px solid #ddd';
                        container.style.borderRadius = '5px';

                        container.innerHTML = `
                            <div class="location-header" style="display:flex; justify-content: space-between; margin-bottom: 10px;">
                                <div class="address-display" style="padding: 10px; background-color: #f8f9fa; border-radius: 4px; flex: 1; margin-right: 10px;">
                                    ${address}
                                </div>
                                <button class="get-location-btn" style="
                                    padding: 8px 12px;
                                    background-color: #007bff;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    z-index: 1000;
                                ">Get Location</button>
                            </div>
                            ${isAdPlatformWebView() ? `
                            <div class="manual-address-section" style="margin-bottom: 10px; padding: 10px; background-color: #fff3cd; border-radius: 4px; border: 1px solid #ffeaa7;">
                                <div style="font-size: 12px; color: #856404; margin-bottom: 5px;">
                                    ${getDetectedPlatform() || 'Social media app'} detected: Having location issues? Enter address manually:
                                </div>
                                <input type="text" class="manual-address-input" placeholder="Enter your address..." 
                                    style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px; font-size: 14px;">
                                <button class="manual-address-btn" style="
                                    margin-top: 5px; padding: 5px 10px; background-color: #28a745; color: white; 
                                    border: none; border-radius: 3px; cursor: pointer; font-size: 12px;
                                ">Use This Address</button>
                            </div>
                            ` : ''}
                            <div id="${mapId}" class="map-container" style="height: 300px; width: 100%; border-radius: 4px; overflow: hidden;"></div>
                        `;

                        self.appendChild(container);
                    }

                    // Get references to elements
                    const addressDisplay = self.querySelector('.address-display');
                    const locationButton = self.querySelector('.get-location-btn');
                    const mapContainer = self.querySelector(`#${mapId}`);
                    const manualAddressInput = self.querySelector('.manual-address-input') as HTMLInputElement;
                    const manualAddressBtn = self.querySelector('.manual-address-btn');

                    // Initialize map
                    let map: L.Map;
                    let marker: L.Marker;
                    function initMap() {
                        // Remove the DOM check and setTimeout as we will use a GrapesJS event

                        try {
                            // Create the map
                            map = L.map(mapId).setView(
                                latitude && longitude ? [latitude, longitude] : options.defaultCenter,
                                options.defaultZoom
                            );

                            // Add OpenStreetMap tile layer
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }).addTo(map);

                            // Add marker if coordinates exist
                            if (latitude && longitude) {
                                marker = L.marker([latitude, longitude], {
                                    draggable: true
                                }).addTo(map);

                                // Update coordinates when marker is dragged
                                marker.on('dragend', function (e) {
                                    const pos = e.target.getLatLng();
                                    updateCoordinates(pos.lat, pos.lng);
                                });
                            }

                            // Add click handler to map
                            map.on('click', function (e) {
                                const pos = e.latlng;
                                updateCoordinates(pos.lat, pos.lng);
                            });

                            // Make sure the map renders correctly
                            setTimeout(function () {
                                if (map) map.invalidateSize();
                            }, 100);
                        } catch (error) {
                            console.error('Error initializing map:', error);
                            if (addressDisplay) {
                                addressDisplay.textContent = 'Error loading map. Please try again.';
                            }
                        }
                    }

                    // Update coordinates and get address
                    interface Coordinates {
                        lat: number;
                        lng: number;
                    }

                    function updateCoordinates(lat: number, lng: number) {
                        latitude = lat;
                        longitude = lng;

                        // Update marker position
                        if (marker) {
                            marker.setLatLng([lat, lng]);
                        } else if (map) {
                            marker = L.marker([lat, lng], {
                                draggable: true
                            }).addTo(map);

                            marker.on('dragend', function (e: L.LeafletEvent) {
                                const pos: L.LatLng = (e.target as L.Marker).getLatLng();
                                updateCoordinates(pos.lat, pos.lng);
                            });
                        }

                        // Update component attributes
                        self.setAttribute('latitude', lat);
                        self.setAttribute('longitude', lng);

                        if (addressDisplay) {
                            addressDisplay.textContent = 'Loading address...';
                            reverseGeocode(lat, lng);
                        }
                    }

                    // Reverse geocode to get address from coordinates
                    interface NominatimAddress {
                        house_number?: string;
                        road?: string;
                        city?: string;
                        town?: string;
                        village?: string;
                        county?: string;
                        state?: string;
                        postcode?: string;
                    }

                    interface NominatimResponse {
                        address: NominatimAddress;
                        error?: string;
                    }

                    function reverseGeocode(lat: number, lng: number) {
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
                            .then(function (response) { return response.json(); })
                            .then(function (data: NominatimResponse) {
                                if (data.error) {
                                    throw new Error(data.error);
                                }

                                const addressParts: string[] = [];
                                const addr: NominatimAddress = data.address;

                                if (addr.house_number) addressParts.push(addr.house_number);
                                if (addr.road) addressParts.push(addr.road);
                                if (addr.city) addressParts.push(addr.city);
                                if (addr.town) addressParts.push(addr.town);
                                if (addr.village) addressParts.push(addr.village);
                                if (addr.county) addressParts.push(addr.county);
                                if (addr.state) addressParts.push(addr.state);
                                if (addr.postcode) addressParts.push(addr.postcode);

                                const formattedAddress = addressParts.join(', ');
                                addressDisplay.textContent = formattedAddress;

                                // Update component attribute
                                self.setAttribute('address', formattedAddress);
                                address = formattedAddress;

                                // Optionally query Collin County parcel data
                                queryParcelData(lat, lng);
                            })
                            .catch(function (error) {
                                console.error('Geocoding error:', error);
                                if (addressDisplay) {
                                    addressDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                }
                            });
                    }

                    // Query Collin County parcel data
                    interface ParcelAttributes {
                        PARCEL_ID?: string;
                        PROP_ID?: string;
                        OWNER_NAME?: string;
                        OWNER?: string;
                    }

                    interface ParcelFeature {
                        attributes: ParcelAttributes;
                    }

                    interface ParcelQueryResponse {
                        error?: {
                            message?: string;
                        };
                        features?: ParcelFeature[];
                    }

                    function queryParcelData(lat: number, lng: number): void {
                        const parcelServiceUrl: string = `${options.parcelServiceUrl}`;
                        if (!parcelServiceUrl) return;

                        const queryUrl: string = `${parcelServiceUrl}/query?f=json&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&geometry={"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`;

                        fetch(queryUrl)
                            .then(function (response: Response) { return response.json(); })
                            .then(function (data: ParcelQueryResponse) {
                                if (data.error) {
                                    throw new Error(data.error.message || 'Parcel query error');
                                }

                                if (data.features && data.features.length > 0) {
                                    const parcel: ParcelAttributes = data.features[0].attributes;
                                    const parcelId: string = parcel.PARCEL_ID || parcel.PROP_ID || '';
                                    const ownerName: string = parcel.OWNER_NAME || parcel.OWNER || '';

                                    if (addressDisplay && (parcelId || ownerName)) {
                                        let html: string = addressDisplay.textContent + '<br><br>';
                                        if (parcelId) html += `Parcel ID: ${parcelId}<br>`;
                                        if (ownerName) html += `Owner: ${ownerName}`;
                                        addressDisplay.innerHTML = html;
                                    }
                                }
                            })
                            .catch(function (error: Error) {
                                console.error('Parcel query error:', error);
                            });
                    }

                    // Get location button handler
                    if (locationButton) {
                        locationButton.addEventListener('click', function () {
                            const inWebView = isAdPlatformWebView();
                            const detectedPlatform = getDetectedPlatform();
                            console.log("Get location clicked, webview detected:", inWebView, "Platform:", detectedPlatform);

                            if (addressDisplay) {
                                addressDisplay.textContent = inWebView
                                    ? 'Getting location (may require permissions)...'
                                    : 'Getting location...';
                            }

                            if (!navigator.geolocation) {
                                if (addressDisplay) {
                                    const errorMsg = inWebView
                                        ? `Location not available in this ${detectedPlatform || 'app'} version. Please manually enter your address.`
                                        : 'Geolocation not supported by your browser';
                                    addressDisplay.textContent = errorMsg;
                                }
                                return;
                            }

                            navigator.geolocation.getCurrentPosition(
                                function (position) {
                                    const lat = position.coords.latitude;
                                    const lng = position.coords.longitude;

                                    if (map) {
                                        map.setView([lat, lng], 16);
                                        updateCoordinates(lat, lng);
                                    } else {
                                        latitude = lat;
                                        longitude = lng;
                                        loadLeaflet(initMap);
                                    }
                                },
                                function (error) {
                                    let errorMsg = 'Error getting location';

                                    if (inWebView) {
                                        const platformName = detectedPlatform || 'app';
                                        switch (error.code) {
                                            case error.PERMISSION_DENIED:
                                                errorMsg = `Location permission needed:\n` +
                                                    `1. Check ${platformName} settings\n` +
                                                    `2. Allow location when prompted\n` +
                                                    `Or manually enter address below`;
                                                break;
                                            case error.POSITION_UNAVAILABLE:
                                                errorMsg = `Location unavailable in ${platformName}. Please enter address manually.`;
                                                break;
                                            case error.TIMEOUT:
                                                errorMsg = `Location timeout in ${platformName}. Please enter address manually.`;
                                                break;
                                            default:
                                                errorMsg = `Location error in ${platformName}. Please enter address manually.`;
                                        }
                                    } else {
                                        errorMsg = error.code === 1 ?
                                            'Location permission denied' : 'Error getting location';
                                    }

                                    if (addressDisplay) {
                                        addressDisplay.textContent = errorMsg;
                                    }
                                    console.error('Geolocation error:', error);
                                },
                                {
                                    enableHighAccuracy: true,
                                    maximumAge: inWebView ? 60000 : 0, // Allow cached location in webviews
                                    timeout: inWebView ? 15000 : 10000 // Extended timeout for webviews
                                }
                            );
                        });
                    }

                    // Manual address button handler for TikTok
                    if (manualAddressBtn && manualAddressInput) {
                        manualAddressBtn.addEventListener('click', function () {
                            const manualAddress = manualAddressInput.value.trim();
                            if (!manualAddress) {
                                if (addressDisplay) {
                                    addressDisplay.textContent = 'Please enter an address first.';
                                }
                                return;
                            }

                            if (addressDisplay) {
                                addressDisplay.textContent = 'Looking up address...';
                            }

                            // Use Nominatim to geocode the manual address
                            const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=1&addressdetails=1`;

                            fetch(geocodeUrl)
                                .then(function (response) { return response.json(); })
                                .then(function (data: any[]) {
                                    if (data && data.length > 0) {
                                        const result = data[0];
                                        const lat = parseFloat(result.lat);
                                        const lng = parseFloat(result.lon);

                                        if (!isNaN(lat) && !isNaN(lng)) {
                                            if (map) {
                                                map.setView([lat, lng], 16);
                                                updateCoordinates(lat, lng);
                                            } else {
                                                latitude = lat;
                                                longitude = lng;
                                                loadLeaflet(initMap);
                                            }

                                            if (addressDisplay) {
                                                addressDisplay.textContent = result.display_name || manualAddress;
                                            }

                                            // Clear the input after successful geocoding
                                            manualAddressInput.value = '';
                                        } else {
                                            throw new Error('Invalid coordinates received');
                                        }
                                    } else {
                                        throw new Error('Address not found');
                                    }
                                })
                                .catch(function (error) {
                                    console.error('Manual address geocoding error:', error);
                                    if (addressDisplay) {
                                        addressDisplay.textContent = 'Could not find address. Please try a different address.';
                                    }
                                });
                        });
                    }

                    // Initialize the map if coordinates exist when the component is rendered
                    // The actual initialization will happen in the view's onRender method

                    return {
                        ...this,
                        handleAttributeChange() {
                            const attrs = this.getAttributes();
                            if (attrs.latitude) this.set('latitude', attrs.latitude);
                            if (attrs.longitude) this.set('longitude', attrs.longitude);
                            if (attrs.address) this.set('address', attrs.address);
                        },
                    };
                },
                'script-props': ['mapContainerId', 'address', 'latitude', 'longitude'],
                content: '',
                attributes: {
                    class: 'location-to-address',
                    'data-gjs-type': 'location-to-address',
                    mapContainerId: `map-${Math.random().toString(36).substring(2, 9)}`
                }
            },
            view: defaultView.extend({
                init() {
                    this.listenTo(this.model, 'change:address change:latitude change:longitude', this.updateAttributes);
                },

                // Called when the component's element is rendered and attached to the DOM
                onRender() {
                    const model = this.model;
                    const latitude = parseFloat(model.get('latitude')) || null;
                    const longitude = parseFloat(model.get('longitude')) || null;

                    if (latitude && longitude) {
                        loadLeaflet(initMap);
                    } else {
                        const locationButton = this.el.querySelector('.get-location-btn');
                        if (locationButton) {
                            locationButton.style.backgroundColor = '#28a745'; // Green to indicate action needed
                        }
                    }
                },

                updateAttributes() {
                    const address = this.model.get('address');
                    const latitude = this.model.get('latitude');
                    const longitude = this.model.get('longitude');

                    // Update traits when attributes change
                    const attrs = Object.assign({}, this.model.getAttributes());
                    if (address) attrs.address = address;
                    if (latitude !== null) attrs.latitude = latitude;
                    if (longitude !== null) attrs.longitude = longitude;
                    this.model.setAttributes(attrs);
                }
            })
        }
    });
    // Add to block manager

    // Add a block for the location selector
    editor.BlockManager.add('location-to-address', {
        label: 'Location Selector',
        category: 'Forms',
        content: {
            type: 'location-to-address'
        },
        media: '<i class="fa fa-map-marker"></i>'
    });
}

function initMap(): void {
    // We don't need an implementation here because the map initialization 
    // is already handled in the component's script function
    // This function is just a placeholder for TypeScript type checking
    // The actual map initialization happens in the component's runtime script
}


