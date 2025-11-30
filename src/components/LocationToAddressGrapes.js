/**
 * LocationToAddressGrapes.js - Collin County Location Selector Component for GrapesJS
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Import Leaflet if not using dynamic loading approach
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export default (function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    // Function to load Leaflet if not already loaded
    function loadLeaflet(callback) {
        if (window.L) {
            callback();
            return;
        }
        // Load Leaflet CSS
        var leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(leafletCss);
        // Load Leaflet JS
        var leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        leafletScript.onload = callback;
        document.head.appendChild(leafletScript);
    }
    // Webview detection utility for major ad platforms
    function isTikTokWebView() {
        return isAdPlatformWebView('tiktok');
    }
    function isAdPlatformWebView(platform) {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return false;
        }
        var userAgent = navigator.userAgent || '';
        // All webview indicators for major ad platforms
        var webviewIndicators = {
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
            var platformKey = platform.toLowerCase();
            var indicators = webviewIndicators[platformKey];
            return indicators ? indicators.some(function (indicator) {
                return userAgent.toLowerCase().includes(indicator.toLowerCase());
            }) : false;
        }
        // Check for any webview platform
        return Object.values(webviewIndicators).some(function (indicators) {
            return indicators.some(function (indicator) {
                return userAgent.toLowerCase().includes(indicator.toLowerCase());
            });
        });
    }
    // Helper to get detected platform name for user-friendly messages
    function getDetectedPlatform() {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return null;
        }
        var userAgent = navigator.userAgent || '';
        var platformChecks = [
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
        for (var _i = 0, platformChecks_1 = platformChecks; _i < platformChecks_1.length; _i++) {
            var platform = platformChecks_1[_i];
            if (platform.indicators.some(function (indicator) {
                return userAgent.toLowerCase().includes(indicator.toLowerCase());
            })) {
                return platform.name;
            }
        }
        return null;
    }
    var domc = editor.DomComponents;
    var defaultType = domc.getType('default');
    var defaultModel = defaultType.model;
    var defaultView = defaultType.view;
    // Configuration options
    var options = __assign({ 
        // Default Collin County parcel service URL
        parcelServiceUrl: 'https://gismaps.cityofallen.org/arcgis/rest/services/ReferenceData/Collin_County_Appraisal_District_Parcels/MapServer/0', 
        // Default map center (McKinney, TX - county seat of Collin County)
        defaultCenter: [33.198, -96.635], defaultZoom: 13 }, opts);
    // Register the component type
    domc.addType('location-to-address', {
        isComponent: function (el) { return el.getAttribute && el.getAttribute('data-gjs-type') === 'location-to-address'; },
        model: __assign(__assign({}, defaultModel), { defaults: __assign(__assign({}, defaultModel.prototype.defaults), { droppable: true, traits: [
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
                ], mapContainerId: "map-".concat(Math.random().toString(36).substring(2, 9)), address: 'Click "Get Location" button', latitude: null, longitude: null, script: function () {
                    // This function will be executed in the browser
                    // Don't use arrow functions here or variables from the outer scope
                    var self = this;
                    var mapId = self.getAttribute('mapContainerId') || "map-".concat(Math.random().toString(36).substring(2, 9));
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
                        container.innerHTML = "\n                            <div class=\"location-header\" style=\"display:flex; justify-content: space-between; margin-bottom: 10px;\">\n                                <div class=\"address-display\" style=\"padding: 10px; background-color: #f8f9fa; border-radius: 4px; flex: 1; margin-right: 10px;\">\n                                    ".concat(address, "\n                                </div>\n                                <button class=\"get-location-btn\" style=\"\n                                    padding: 8px 12px;\n                                    background-color: #007bff;\n                                    color: white;\n                                    border: none;\n                                    border-radius: 4px;\n                                    cursor: pointer;\n                                    z-index: 1000;\n                                \">Get Location</button>\n                            </div>\n                            ").concat(isAdPlatformWebView() ? "\n                            <div class=\"manual-address-section\" style=\"margin-bottom: 10px; padding: 10px; background-color: #fff3cd; border-radius: 4px; border: 1px solid #ffeaa7;\">\n                                <div style=\"font-size: 12px; color: #856404; margin-bottom: 5px;\">\n                                    ".concat(getDetectedPlatform() || 'Social media app', " detected: Having location issues? Enter address manually:\n                                </div>\n                                <input type=\"text\" class=\"manual-address-input\" placeholder=\"Enter your address...\" \n                                    style=\"width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px; font-size: 14px;\">\n                                <button class=\"manual-address-btn\" style=\"\n                                    margin-top: 5px; padding: 5px 10px; background-color: #28a745; color: white; \n                                    border: none; border-radius: 3px; cursor: pointer; font-size: 12px;\n                                \">Use This Address</button>\n                            </div>\n                            ") : '', "\n                            <div id=\"").concat(mapId, "\" class=\"map-container\" style=\"height: 300px; width: 100%; border-radius: 4px; overflow: hidden;\"></div>\n                        ");
                        self.appendChild(container);
                    }
                    // Get references to elements
                    var addressDisplay = self.querySelector('.address-display');
                    var locationButton = self.querySelector('.get-location-btn');
                    var mapContainer = self.querySelector("#".concat(mapId));
                    var manualAddressInput = self.querySelector('.manual-address-input');
                    var manualAddressBtn = self.querySelector('.manual-address-btn');
                    // Initialize map
                    var map;
                    var marker;
                    function initMap() {
                        // Remove the DOM check and setTimeout as we will use a GrapesJS event
                        try {
                            // Create the map
                            map = L.map(mapId).setView(latitude && longitude ? [latitude, longitude] : options.defaultCenter, options.defaultZoom);
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
                                    var pos = e.target.getLatLng();
                                    updateCoordinates(pos.lat, pos.lng);
                                });
                            }
                            // Add click handler to map
                            map.on('click', function (e) {
                                var pos = e.latlng;
                                updateCoordinates(pos.lat, pos.lng);
                            });
                            // Make sure the map renders correctly
                            setTimeout(function () {
                                if (map)
                                    map.invalidateSize();
                            }, 100);
                        }
                        catch (error) {
                            console.error('Error initializing map:', error);
                            if (addressDisplay) {
                                addressDisplay.textContent = 'Error loading map. Please try again.';
                            }
                        }
                    }
                    function updateCoordinates(lat, lng) {
                        latitude = lat;
                        longitude = lng;
                        // Update marker position
                        if (marker) {
                            marker.setLatLng([lat, lng]);
                        }
                        else if (map) {
                            marker = L.marker([lat, lng], {
                                draggable: true
                            }).addTo(map);
                            marker.on('dragend', function (e) {
                                var pos = e.target.getLatLng();
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
                    function reverseGeocode(lat, lng) {
                        fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=".concat(lat, "&lon=").concat(lng, "&addressdetails=1"))
                            .then(function (response) { return response.json(); })
                            .then(function (data) {
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            var addressParts = [];
                            var addr = data.address;
                            if (addr.house_number)
                                addressParts.push(addr.house_number);
                            if (addr.road)
                                addressParts.push(addr.road);
                            if (addr.city)
                                addressParts.push(addr.city);
                            if (addr.town)
                                addressParts.push(addr.town);
                            if (addr.village)
                                addressParts.push(addr.village);
                            if (addr.county)
                                addressParts.push(addr.county);
                            if (addr.state)
                                addressParts.push(addr.state);
                            if (addr.postcode)
                                addressParts.push(addr.postcode);
                            var formattedAddress = addressParts.join(', ');
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
                                addressDisplay.textContent = "".concat(lat.toFixed(6), ", ").concat(lng.toFixed(6));
                            }
                        });
                    }
                    function queryParcelData(lat, lng) {
                        var parcelServiceUrl = "".concat(options.parcelServiceUrl);
                        if (!parcelServiceUrl)
                            return;
                        var queryUrl = "".concat(parcelServiceUrl, "/query?f=json&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&geometry={\"x\":").concat(lng, ",\"y\":").concat(lat, ",\"spatialReference\":{\"wkid\":4326}}");
                        fetch(queryUrl)
                            .then(function (response) { return response.json(); })
                            .then(function (data) {
                            if (data.error) {
                                throw new Error(data.error.message || 'Parcel query error');
                            }
                            if (data.features && data.features.length > 0) {
                                var parcel = data.features[0].attributes;
                                var parcelId = parcel.PARCEL_ID || parcel.PROP_ID || '';
                                var ownerName = parcel.OWNER_NAME || parcel.OWNER || '';
                                if (addressDisplay && (parcelId || ownerName)) {
                                    var html = addressDisplay.textContent + '<br><br>';
                                    if (parcelId)
                                        html += "Parcel ID: ".concat(parcelId, "<br>");
                                    if (ownerName)
                                        html += "Owner: ".concat(ownerName);
                                    addressDisplay.innerHTML = html;
                                }
                            }
                        })
                            .catch(function (error) {
                            console.error('Parcel query error:', error);
                        });
                    }
                    // Get location button handler
                    if (locationButton) {
                        locationButton.addEventListener('click', function () {
                            var inWebView = isAdPlatformWebView();
                            var detectedPlatform = getDetectedPlatform();
                            console.log("Get location clicked, webview detected:", inWebView, "Platform:", detectedPlatform);
                            if (addressDisplay) {
                                addressDisplay.textContent = inWebView
                                    ? 'Getting location (may require permissions)...'
                                    : 'Getting location...';
                            }
                            if (!navigator.geolocation) {
                                if (addressDisplay) {
                                    var errorMsg = inWebView
                                        ? "Location not available in this ".concat(detectedPlatform || 'app', " version. Please manually enter your address.")
                                        : 'Geolocation not supported by your browser';
                                    addressDisplay.textContent = errorMsg;
                                }
                                return;
                            }
                            navigator.geolocation.getCurrentPosition(function (position) {
                                var lat = position.coords.latitude;
                                var lng = position.coords.longitude;
                                if (map) {
                                    map.setView([lat, lng], 16);
                                    updateCoordinates(lat, lng);
                                }
                                else {
                                    latitude = lat;
                                    longitude = lng;
                                    loadLeaflet(initMap);
                                }
                            }, function (error) {
                                var errorMsg = 'Error getting location';
                                if (inWebView) {
                                    var platformName = detectedPlatform || 'app';
                                    switch (error.code) {
                                        case error.PERMISSION_DENIED:
                                            errorMsg = "Location permission needed:\n" +
                                                "1. Check ".concat(platformName, " settings\n") +
                                                "2. Allow location when prompted\n" +
                                                "Or manually enter address below";
                                            break;
                                        case error.POSITION_UNAVAILABLE:
                                            errorMsg = "Location unavailable in ".concat(platformName, ". Please enter address manually.");
                                            break;
                                        case error.TIMEOUT:
                                            errorMsg = "Location timeout in ".concat(platformName, ". Please enter address manually.");
                                            break;
                                        default:
                                            errorMsg = "Location error in ".concat(platformName, ". Please enter address manually.");
                                    }
                                }
                                else {
                                    errorMsg = error.code === 1 ?
                                        'Location permission denied' : 'Error getting location';
                                }
                                if (addressDisplay) {
                                    addressDisplay.textContent = errorMsg;
                                }
                                console.error('Geolocation error:', error);
                            }, {
                                enableHighAccuracy: true,
                                maximumAge: inWebView ? 60000 : 0, // Allow cached location in webviews
                                timeout: inWebView ? 15000 : 10000 // Extended timeout for webviews
                            });
                        });
                    }
                    // Manual address button handler for TikTok
                    if (manualAddressBtn && manualAddressInput) {
                        manualAddressBtn.addEventListener('click', function () {
                            var manualAddress = manualAddressInput.value.trim();
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
                            var geocodeUrl = "https://nominatim.openstreetmap.org/search?format=json&q=".concat(encodeURIComponent(manualAddress), "&limit=1&addressdetails=1");
                            fetch(geocodeUrl)
                                .then(function (response) { return response.json(); })
                                .then(function (data) {
                                if (data && data.length > 0) {
                                    var result = data[0];
                                    var lat = parseFloat(result.lat);
                                    var lng = parseFloat(result.lon);
                                    if (!isNaN(lat) && !isNaN(lng)) {
                                        if (map) {
                                            map.setView([lat, lng], 16);
                                            updateCoordinates(lat, lng);
                                        }
                                        else {
                                            latitude = lat;
                                            longitude = lng;
                                            loadLeaflet(initMap);
                                        }
                                        if (addressDisplay) {
                                            addressDisplay.textContent = result.display_name || manualAddress;
                                        }
                                        // Clear the input after successful geocoding
                                        manualAddressInput.value = '';
                                    }
                                    else {
                                        throw new Error('Invalid coordinates received');
                                    }
                                }
                                else {
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
                    return __assign(__assign({}, this), { handleAttributeChange: function () {
                            var attrs = this.getAttributes();
                            if (attrs.latitude)
                                this.set('latitude', attrs.latitude);
                            if (attrs.longitude)
                                this.set('longitude', attrs.longitude);
                            if (attrs.address)
                                this.set('address', attrs.address);
                        } });
                }, 'script-props': ['mapContainerId', 'address', 'latitude', 'longitude'], content: '', attributes: {
                    class: 'location-to-address',
                    'data-gjs-type': 'location-to-address',
                    mapContainerId: "map-".concat(Math.random().toString(36).substring(2, 9))
                } }), view: defaultView.extend({
                init: function () {
                    this.listenTo(this.model, 'change:address change:latitude change:longitude', this.updateAttributes);
                },
                // Called when the component's element is rendered and attached to the DOM
                onRender: function () {
                    var model = this.model;
                    var latitude = parseFloat(model.get('latitude')) || null;
                    var longitude = parseFloat(model.get('longitude')) || null;
                    if (latitude && longitude) {
                        loadLeaflet(initMap);
                    }
                    else {
                        var locationButton = this.el.querySelector('.get-location-btn');
                        if (locationButton) {
                            locationButton.style.backgroundColor = '#28a745'; // Green to indicate action needed
                        }
                    }
                },
                updateAttributes: function () {
                    var address = this.model.get('address');
                    var latitude = this.model.get('latitude');
                    var longitude = this.model.get('longitude');
                    // Update traits when attributes change
                    var attrs = Object.assign({}, this.model.getAttributes());
                    if (address)
                        attrs.address = address;
                    if (latitude !== null)
                        attrs.latitude = latitude;
                    if (longitude !== null)
                        attrs.longitude = longitude;
                    this.model.setAttributes(attrs);
                }
            }) })
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
});
function initMap() {
    // We don't need an implementation here because the map initialization 
    // is already handled in the component's script function
    // This function is just a placeholder for TypeScript type checking
    // The actual map initialization happens in the component's runtime script
}
