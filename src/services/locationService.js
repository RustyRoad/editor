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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/// <reference path="../types/externals.d.ts" />
function waitForElement(selector_1) {
    return __awaiter(this, arguments, void 0, function (selector, timeout, context) {
        var startTime, element;
        if (timeout === void 0) { timeout = 7000; }
        if (context === void 0) { context = document; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("waitForElement: Searching for \"".concat(selector, "\" in context:"), context ? context.nodeName : 'document');
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - startTime < timeout)) return [3 /*break*/, 3];
                    element = context.querySelector(selector);
                    if (element) {
                        console.log("waitForElement: Found \"".concat(selector, "\""), element);
                        return [2 /*return*/, element];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 2:
                    _a.sent(); // Poll every 100ms
                    return [3 /*break*/, 1];
                case 3:
                    console.error("waitForElement: Element \"".concat(selector, "\" not found in context after ").concat(timeout, "ms."));
                    throw new Error("Element \"".concat(selector, "\" not found in context after ").concat(timeout, "ms"));
            }
        });
    });
}
// Import Leaflet types
import * as L from 'leaflet';
// import { pid } from 'process'; // Removed unused import
import { initializeStripeElements, handlePaymentSubmit } from '../components/payment-handler'; // Added handlePaymentSubmit
// Helper to wait for Leaflet
function waitForLeaflet() {
    return __awaiter(this, arguments, void 0, function (timeout) {
        var startTime;
        if (timeout === void 0) { timeout = 7000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("waitForLeaflet: Waiting for window.L");
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - startTime < timeout)) return [3 /*break*/, 3];
                    if (window.L) {
                        console.log("waitForLeaflet: Found window.L");
                        return [2 /*return*/, window.L];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3:
                    console.error("waitForLeaflet: Leaflet (window.L) not loaded after ".concat(timeout, "ms"));
                    throw new Error("Leaflet (window.L) not loaded after ".concat(timeout, "ms"));
            }
        });
    });
}
// Helper function to compare address objects
function areAddressesEqual(addr1, addr2) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!addr1 || !addr2)
        return false;
    // Normalize country to "US" if undefined or empty, as it's often assumed
    var country1 = ((_a = addr1.country) === null || _a === void 0 ? void 0 : _a.trim()) || "US";
    var country2 = ((_b = addr2.country) === null || _b === void 0 ? void 0 : _b.trim()) || "US";
    return ((_c = addr1.line1) === null || _c === void 0 ? void 0 : _c.trim()) === ((_d = addr2.line1) === null || _d === void 0 ? void 0 : _d.trim()) &&
        ((_e = addr1.city) === null || _e === void 0 ? void 0 : _e.trim()) === ((_f = addr2.city) === null || _f === void 0 ? void 0 : _f.trim()) &&
        ((_g = addr1.state) === null || _g === void 0 ? void 0 : _g.trim()) === ((_h = addr2.state) === null || _h === void 0 ? void 0 : _h.trim()) &&
        ((_j = addr1.postal_code) === null || _j === void 0 ? void 0 : _j.trim()) === ((_k = addr2.postal_code) === null || _k === void 0 ? void 0 : _k.trim()) &&
        country1 === country2;
}
/**
 * Collin County Address Selection Map with ArcGIS Integration
 */
// Webview detection utility for major ad platforms
export function isTikTokWebView() {
    return isAdPlatformWebView('tiktok');
}
export function isAdPlatformWebView(platform) {
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
export function getDetectedPlatform() {
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
export var CONFIG = {
    apiKey: 'AAPTxy8BH1VEsoebNVZXo8HurNm0505kNdgKELIfqKFdBxCaNy4p0hn6ezNaYmZMejfeGM-Uo7dMmpBE5TeGpAVO2K4DDUmTNgbdSZ-ci6gGMP6zhs569bZ7gypISw6rv_eKaaVFl5D-pzH5J6HFvDP3XrHFTtaJcRK6FJvQYvfdCtgTnS37vJiI0ZKHPUWnd0UQjEjtNV3utt7h3lMQ822C3SomL2YXn1gH9LYffAxU78U.AT1_m19P1ODX', // Replace with your actual API key or manage securely
    parcelServiceUrl: (typeof window !== 'undefined' && 'PARCEL_SERVICE_URL' in window) ?
        window.PARCEL_SERVICE_URL :
        'https://gismaps.cityofallen.org/arcgis/rest/services/ReferenceData/Collin_County_Appraisal_District_Parcels/MapServer/0',
    geocodeServiceUrl: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    defaultCenter: [33.198, -96.635], // Default center coordinates (e.g., Collin County)
    defaultZoom: 13,
    locationTimeout: isAdPlatformWebView() ? 15000 : 10000 // Extended timeout for all ad platform webviews
};
var LocationService = /** @class */ (function () {
    function LocationService() {
    }
    LocationService.getCurrentPosition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inWebView, detectedPlatform, errorMsg;
            return __generator(this, function (_a) {
                console.log("Attempting to get current position...");
                inWebView = isAdPlatformWebView();
                detectedPlatform = getDetectedPlatform();
                console.log("Ad platform webview detected:", inWebView, "Platform:", detectedPlatform);
                if (!navigator.geolocation) {
                    console.error('Geolocation API not supported by this browser.');
                    errorMsg = inWebView
                        ? "Location services not available in this ".concat(detectedPlatform || 'app', " version. Please manually enter your address or open in a regular browser.")
                        : 'Geolocation not supported by your browser';
                    throw new Error(errorMsg);
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var options = {
                            enableHighAccuracy: true,
                            maximumAge: inWebView ? 60000 : 0, // Allow cached location in webviews
                            timeout: CONFIG.locationTimeout
                        };
                        console.log("Calling navigator.geolocation.getCurrentPosition with options:", options);
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            console.log("navigator.geolocation.getCurrentPosition - SUCCESS:", pos);
                            resolve(pos);
                        }, function (err) {
                            console.error("navigator.geolocation.getCurrentPosition - ERROR:", err);
                            var errorMsg = "Error getting location: ".concat(err.message, " (Code: ").concat(err.code, ")");
                            if ('code' in err && err.code === 1) { // PERMISSION_DENIED
                                if (inWebView) {
                                    var platformName = detectedPlatform || 'app';
                                    errorMsg = "Location permission needed:\n" +
                                        "1. Check ".concat(platformName, " location permission in device settings\n") +
                                        "2. Allow location access when prompted\n" +
                                        "Or manually enter your address below.";
                                }
                                else {
                                    errorMsg = 'Location permission denied. Please check browser settings.';
                                }
                            }
                            else if ('code' in err && err.code === 2) { // POSITION_UNAVAILABLE
                                if (inWebView) {
                                    var platformName = detectedPlatform || 'this app';
                                    errorMsg = "Location unavailable in ".concat(platformName, ". Please manually enter your address or try opening in a regular browser.");
                                }
                                else {
                                    errorMsg = 'Location information is unavailable.';
                                }
                            }
                            else if ('code' in err && err.code === 3) { // TIMEOUT
                                if (inWebView) {
                                    var platformName = detectedPlatform || 'app';
                                    errorMsg = "Location request timed out in ".concat(platformName, ". This is common in social media browsers. Please manually enter your address.");
                                }
                                else {
                                    errorMsg = 'Location request timed out.';
                                }
                            }
                            reject(new Error(errorMsg));
                        }, options);
                    })];
            });
        });
    };
    LocationService.reverseGeocode = function (lat, lng) {
        return __awaiter(this, void 0, void 0, function () {
            var arcgisUrl, response, arcgisFailed, arcgisData, display, errorText, osmUrl, osmResponse, osmData, osmDisplayName, err_1, errorMessage;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("reverseGeocode called for Lat: ".concat(lat, ", Lng: ").concat(lng));
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 10, , 11]);
                        arcgisUrl = "".concat(CONFIG.geocodeServiceUrl, "/reverseGeocode?location=").concat(lng, ",").concat(lat, "&f=json&outSR=4326");
                        if (CONFIG.apiKey)
                            arcgisUrl += "&token=".concat(CONFIG.apiKey); // Corrected: use token for ArcGIS Platform location services
                        console.log("ArcGIS reverse geocode URL:", arcgisUrl);
                        return [4 /*yield*/, fetch(arcgisUrl)];
                    case 2:
                        response = _d.sent();
                        arcgisFailed = false;
                        arcgisData = null;
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        arcgisData = _d.sent();
                        console.log("ArcGIS reverse geocode RAW response data:", JSON.stringify(arcgisData, null, 2));
                        if (arcgisData && arcgisData.address && Object.keys(arcgisData.address).length > 0) {
                            display = arcgisData.address.Match_addr || arcgisData.address.LongLabel || arcgisData.address.Address || "".concat(lat.toFixed(6), ", ").concat(lng.toFixed(6));
                            console.log("ArcGIS reverse geocode SUCCESS.");
                            return [2 /*return*/, { success: true, displayName: display, address: arcgisData.address, coordinates: { latitude: lat, longitude: lng }, source: 'ArcGIS' }];
                        }
                        else {
                            console.warn("ArcGIS reverse geocode successful (HTTP 200) but no address found in response.");
                            arcgisFailed = true;
                        }
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, response.text()];
                    case 5:
                        errorText = _d.sent();
                        console.error("ArcGIS reverse geocoding HTTP error! Status: ".concat(response.status, ", Body: ").concat(errorText));
                        arcgisFailed = true;
                        _d.label = 6;
                    case 6:
                        if (!arcgisFailed) return [3 /*break*/, 9];
                        console.warn('ArcGIS reverse geocoding failed or returned no address, trying Nominatim.');
                        osmUrl = "https://nominatim.openstreetmap.org/reverse?format=json&lat=".concat(lat, "&lon=").concat(lng, "&addressdetails=1");
                        console.log("Nominatim reverse geocode URL:", osmUrl);
                        return [4 /*yield*/, fetch(osmUrl)];
                    case 7:
                        osmResponse = _d.sent();
                        if (!osmResponse.ok) {
                            console.error("Nominatim reverse geocoding HTTP error! Status: ".concat(osmResponse.status));
                            return [2 /*return*/, { success: false, displayName: "".concat(lat.toFixed(6), ", ").concat(lng.toFixed(6)), address: {}, coordinates: { latitude: lat, longitude: lng }, error: "Nominatim failed with status ".concat(osmResponse.status), source: 'Nominatim' }];
                        }
                        return [4 /*yield*/, osmResponse.json()];
                    case 8:
                        osmData = _d.sent();
                        console.log("Nominatim reverse geocode RAW response data:", JSON.stringify(osmData, null, 2));
                        console.log("Nominatim reverse geocode SUCCESS.");
                        osmDisplayName = osmData.display_name || "".concat(((_a = osmData.address) === null || _a === void 0 ? void 0 : _a.house_number) || '', " ").concat(((_b = osmData.address) === null || _b === void 0 ? void 0 : _b.road) || ((_c = osmData.address) === null || _c === void 0 ? void 0 : _c.street) || '').trim() || "".concat(lat.toFixed(6), ", ").concat(lng.toFixed(6));
                        return [2 /*return*/, { success: true, displayName: osmDisplayName, address: osmData.address || {}, coordinates: { latitude: lat, longitude: lng }, source: 'Nominatim' }];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        err_1 = _d.sent();
                        console.error('Geocoding error (catch block):', err_1);
                        errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error occurred';
                        return [2 /*return*/, { success: false, displayName: "".concat(lat.toFixed(6), ", ").concat(lng.toFixed(6)), address: {}, coordinates: { latitude: lat, longitude: lng }, error: errorMessage }];
                    case 11: return [2 /*return*/, { success: false, displayName: "".concat(lat.toFixed(6), ", ").concat(lng.toFixed(6)), address: {}, coordinates: { latitude: lat, longitude: lng }, error: 'Unknown geocoding failure' }];
                }
            });
        });
    };
    return LocationService;
}());
export { LocationService };
var LocationApiService = /** @class */ (function () {
    function LocationApiService() {
    }
    LocationApiService.prototype.submitLocationData = function (locationData) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorBody, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch('/api/locations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', },
                                body: JSON.stringify(locationData)
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorBody = _a.sent();
                        throw new Error("API submission failed with status ".concat(response.status, ": ").concat(errorBody));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        err_2 = _a.sent();
                        console.error('API error:', err_2);
                        throw err_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return LocationApiService;
}());
export { LocationApiService };
var MapManager = /** @class */ (function () {
    function MapManager(containerElement, initializedCallback) {
        this.scrollPosition = 0;
        this.container = containerElement;
        if (!this.container) {
            console.error('Map container DOM element not provided to MapManager constructor.');
            throw new Error('Map container DOM element not provided to MapManager.');
        }
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative'; // Ensure container can host absolutely positioned children
        }
        this.map = null;
        this.marker = null;
        this.currentPosition = null;
        this.addressInfo = null;
        this.isFullscreen = false;
        this.originalStyles = {};
        this.onLocationConfirmed = function (locationData) { return console.log('Default onLocationConfirmed:', locationData); }; // Callback when user confirms location
        this.initialize();
    }
    MapManager.prototype.initialize = function () {
        var _this = this;
        if (!window.L) {
            console.error("Leaflet (L) is not loaded. Map cannot be initialized.");
            return;
        }
        this.saveOriginalStyles();
        try {
            this.map = L.map(this.container, { zoomControl: true, scrollWheelZoom: true, doubleClickZoom: true })
                .setView(CONFIG.defaultCenter, CONFIG.defaultZoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            // Optional: Add Esri basemap if API key and Esri Leaflet are available
            if (CONFIG.apiKey && window.L.esri) {
                try {
                    L.esri.basemapLayer('Streets').addTo(this.map);
                } // Example: 'Streets', 'Topographic', etc.
                catch (e) {
                    console.warn('Could not add Esri basemap:', e);
                }
            }
            this.marker = L.marker(this.map.getCenter(), { draggable: true, autoPan: true }).addTo(this.map);
            this.setupEventHandlers();
            setTimeout(function () { if (_this.map)
                _this.map.invalidateSize(); }, 100); // Ensure map size is correct after init
            if (typeof this.initializedCallback === 'function')
                this.initializedCallback(this);
            console.log("MapManager initialized successfully with container:", this.container);
        }
        catch (error) {
            console.error('Error initializing map in MapManager:', error);
        }
    };
    MapManager.prototype.saveOriginalStyles = function () {
        if (!this.container)
            return;
        this.originalStyles = {
            width: this.container.style.width, height: this.container.style.height,
            position: this.container.style.position, top: this.container.style.top,
            left: this.container.style.left, zIndex: this.container.style.zIndex,
            margin: this.container.style.margin
        };
    };
    MapManager.prototype.setupEventHandlers = function () {
        var _this = this;
        if (!this.map || !this.marker)
            return;
        this.marker.on('dragend', function (e) { return __awaiter(_this, void 0, void 0, function () {
            var position;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        position = e.target.getLatLng();
                        this.currentPosition = { latitude: position.lat, longitude: position.lng };
                        return [4 /*yield*/, this.updateAddressDisplay()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this.map.on('click', function (e) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.marker)
                            return [2 /*return*/];
                        this.marker.setLatLng(e.latlng);
                        this.currentPosition = { latitude: e.latlng.lat, longitude: e.latlng.lng };
                        return [4 /*yield*/, this.updateAddressDisplay()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        window.addEventListener('resize', function () { if (_this.map)
            _this.map.invalidateSize(); });
    };
    MapManager.prototype.toggleFullscreen = function () {
        if (!this.container)
            return this.isFullscreen;
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            this.scrollPosition = window.pageYOffset; // Save scroll position
            Object.assign(this.container.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', margin: '0', zIndex: '10000' });
            document.body.style.overflow = 'hidden'; // Prevent body scrolling
        }
        else {
            Object.assign(this.container.style, this.originalStyles);
            // Ensure position is relative if it was originally static, to contain absolute buttons
            if (getComputedStyle(this.container).position === 'static') {
                this.container.style.position = 'relative';
            }
            document.body.style.overflow = ''; // Restore body scrolling
            window.scrollTo(0, this.scrollPosition); // Restore scroll position
        }
        if (this.map)
            this.map.invalidateSize();
        return this.isFullscreen;
    };
    MapManager.prototype.setPosition = function (lat, lng) {
        return __awaiter(this, void 0, void 0, function () {
            var targetZoom, yPixelPanOffset;
            return __generator(this, function (_a) {
                if (!this.map || !this.marker) {
                    console.warn('Map or marker not fully initialized in setPosition.');
                    return [2 /*return*/, null];
                }
                this.currentPosition = { latitude: lat, longitude: lng };
                targetZoom = 17;
                yPixelPanOffset = 75;
                // Set view and marker
                this.map.setView([lat, lng], targetZoom, { animate: false }); // No animation for immediate set
                this.marker.setLatLng([lat, lng]);
                // Pan map slightly so popup is better centered if it's tall 
                if (yPixelPanOffset !== 0) {
                    this.map.panBy([0, yPixelPanOffset], { animate: false });
                }
                return [2 /*return*/, this.updateAddressDisplay()]; // Update address and open popup
            });
        });
    };
    MapManager.prototype.updateAddressDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, latitude, longitude, _b, popupContent, popupBodyHtml, addr, coords;
            var _this = this;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.currentPosition || !this.marker)
                            return [2 /*return*/, null];
                        _a = this.currentPosition, latitude = _a.latitude, longitude = _a.longitude;
                        _b = this;
                        return [4 /*yield*/, LocationService.reverseGeocode(latitude, longitude)];
                    case 1:
                        _b.addressInfo = _e.sent();
                        popupContent = document.createElement('div');
                        popupContent.className = 'location-popup'; // For potential custom styling
                        popupBodyHtml = '';
                        if (window.formatAddressForDisplayHelper) { // Check if global helper exists
                            if (this.addressInfo.success) {
                                popupBodyHtml = window.formatAddressForDisplayHelper(this.addressInfo.address, this.addressInfo.coordinates);
                            }
                            else {
                                popupBodyHtml = "<h3>Selected Location</h3><p>Could not retrieve address. Error: ".concat(this.addressInfo.error || 'Unknown error', "</p>");
                                if (this.addressInfo.coordinates) {
                                    popupBodyHtml += "<p><small>Lat: ".concat(this.addressInfo.coordinates.latitude.toFixed(6), ", Lng: ").concat(this.addressInfo.coordinates.longitude.toFixed(6), "</small></p>");
                                }
                            }
                        }
                        else {
                            console.error("formatAddressForDisplayHelper not found. Cannot format popup address.");
                            addr = ((_c = this.addressInfo) === null || _c === void 0 ? void 0 : _c.address) || {};
                            coords = (_d = this.addressInfo) === null || _d === void 0 ? void 0 : _d.coordinates;
                            popupBodyHtml = "<h3>Selected Location</h3><p>".concat(addr.Address || addr.road || addr.street || 'Address N/A', "</p><p>").concat(addr.City || addr.city || '', " ").concat(addr.Region || addr.state || '', " ").concat(addr.Postal || addr.postcode || '', "</p>");
                            if (coords)
                                popupBodyHtml += "<p><small>Lat: ".concat(coords.latitude.toFixed(6), ", Lng: ").concat(coords.longitude.toFixed(6), "</small></p>");
                        }
                        popupContent.innerHTML = "<div style=\"min-width: 250px;\">\n                ".concat(popupBodyHtml, "\n                <div style=\"display: flex; gap: 10px; margin-top: 10px;\">\n                    <button class=\"confirm-btn\" style=\"padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;\">Confirm Location</button>\n                    <button class=\"fullscreen-btn-popup\" style=\"padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;\">").concat(this.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen', "</button>\n                </div>\n            </div>");
                        this.marker.bindPopup(popupContent).openPopup();
                        // Attach event listeners to buttons inside the popup *after* it's bound and opened
                        setTimeout(function () {
                            var confirmBtn = popupContent.querySelector('.confirm-btn');
                            var fullscreenBtnPopup = popupContent.querySelector('.fullscreen-btn-popup');
                            if (confirmBtn) {
                                confirmBtn.onclick = function () {
                                    if (_this.addressInfo) {
                                        console.log("Confirm Location clicked. Address Info:", _this.addressInfo);
                                        _this.onLocationConfirmed(_this.addressInfo); // Pass the full geocoded result
                                    }
                                    else {
                                        console.error("Address info not available on confirm.");
                                    }
                                    if (_this.marker)
                                        _this.marker.closePopup(); // Close popup after confirm
                                };
                            }
                            if (fullscreenBtnPopup) {
                                fullscreenBtnPopup.onclick = function () {
                                    var isNowFullscreen = _this.toggleFullscreen();
                                    fullscreenBtnPopup.textContent = isNowFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                                    // Also update the global fullscreen button's text if it exists
                                    var globalFullscreenBtn = document.getElementById('global-fullscreen-button'); // Assuming this ID exists
                                    if (globalFullscreenBtn)
                                        globalFullscreenBtn.textContent = isNowFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                                };
                            }
                        }, 0);
                        return [2 /*return*/, this.addressInfo]; // Return the full result object
                }
            });
        });
    };
    return MapManager;
}());
export { MapManager };
export var UIHelpers = {
    createButton: function (text, styles) {
        if (styles === void 0) { styles = {}; }
        var button = document.createElement('button');
        button.innerText = text;
        Object.assign(button.style, __assign({ position: 'absolute', zIndex: '1000', fontSize: '1em', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }, styles));
        if ('id' in styles)
            button.id = styles['id'];
        // Basic hover effect
        button.onmouseover = function () { return button.style.backgroundColor = '#0056b3'; };
        button.onmouseout = function () { return button.style.backgroundColor = styles.backgroundColor || '#007bff'; }; // Revert to original or specified bg
        return button;
    },
    createAddressDisplay: function () {
        var container = document.createElement('div');
        Object.assign(container.style, { margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' });
        return container;
    }
};
// Global flags to manage initialization state
if (typeof window.mapServiceInitialized === 'undefined')
    window.mapServiceInitialized = false;
if (typeof window.mapServiceInitializing === 'undefined')
    window.mapServiceInitializing = false;
export function initLocationService(mapContainerElement_1) {
    return __awaiter(this, arguments, void 0, function (mapContainerElement, options) {
        var feedbackContainerOverride, defineInternalHelpers, helpers, setupDOMElements_1, attachEventListeners_1, setupMapManagerCallback_1, initGlobalLocationUI, error_1;
        var _this = this;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mapContainerElement) {
                        console.error('initLocationService: mapContainerElement argument is missing.');
                        throw new Error('Map container element not provided to initLocationService.');
                    }
                    feedbackContainerOverride = options.feedbackContainerOverride;
                    defineInternalHelpers = function () {
                        var LOCATION_BUTTON_ID = 'global-location-button';
                        var FULLSCREEN_BUTTON_ID = 'global-fullscreen-button';
                        var ADDRESS_DISPLAY_CLASS = 'address-display-container';
                        var GLOBAL_ADDRESS_DISPLAY_ID = 'global-address-display-for-map';
                        var SUBMIT_BUTTON_CLASS = 'submit-location-btn'; // Class for the submit button shown after confirm
                        var UI_LISTENERS_SETUP_COMPLETE_CLASS = 'location-service-ui-listeners-setup-complete'; // Body class flag
                        var CONTENT_ELEMENT_SELECTOR = '#content'; // Fallback parent for address display
                        var GETTING_LOCATION_TEXT = 'Getting location...';
                        var LOCATION_FOUND_TEXT = 'Location found! Adjust pin on map.';
                        var SUBMITTING_TEXT = 'Sending...';
                        var SUBMITTED_TEXT = 'Submitted!';
                        var SUBMIT_ERROR_TEXT = 'Error - Try Again';
                        var DEFAULT_SUBMIT_TEXT = 'Submit Location'; // Default text for the submit button
                        var MESSAGE_DISPLAY_DURATION = 3000;
                        var WAIT_FOR_ELEMENT_TIMEOUT = 5000;
                        var BUTTON_SUCCESS_BG = '#28a745'; // Green for success
                        var BUTTON_ERROR_BG = '#dc3545'; // Red for error
                        var STATUS_MESSAGE_STYLE = 'padding: 10px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 10px;';
                        var ERROR_MESSAGE_STYLE = 'color: #dc3545; padding: 10px;'; // Red text for errors
                        var getOrCreateById = function (id, createFn, parent) {
                            var element = document.getElementById(id);
                            if (!element) {
                                element = createFn();
                                if (!element.id && id)
                                    element.id = id; // Ensure ID is set if createFn doesn't do it
                                if (parent) {
                                    parent.appendChild(element);
                                }
                                else {
                                    console.warn("getOrCreateById: No parent for new element \"".concat(id, "\". Appending to body."));
                                    document.body.appendChild(element);
                                }
                            }
                            else { // Element exists, ensure it's in the correct parent if specified
                                if (parent && element.parentElement !== parent) {
                                    parent.appendChild(element);
                                }
                                else if (!parent && element.parentElement !== document.body) {
                                    document.body.appendChild(element);
                                } // Default to body if no parent and not already there
                            }
                            return element;
                        };
                        var getOrCreateBySelector = function (selector, parentToSearchAndAppend, createFn) {
                            var element = parentToSearchAndAppend.querySelector(selector);
                            if (!element) {
                                element = createFn();
                                parentToSearchAndAppend.appendChild(element);
                            }
                            return element;
                        };
                        var showFeedbackMessage = function (container, textContent, messageType, autoClearDelay) {
                            if (autoClearDelay === void 0) { autoClearDelay = 0; }
                            if (!container) {
                                console.warn("showFeedbackMessage: No container provided.");
                                return;
                            }
                            container.innerHTML = ''; // Clear previous messages
                            var messageElement = document.createElement('div');
                            messageElement.textContent = textContent;
                            messageElement.style.cssText = messageType === 'error' ? ERROR_MESSAGE_STYLE : STATUS_MESSAGE_STYLE;
                            container.appendChild(messageElement);
                            if (autoClearDelay > 0) {
                                setTimeout(function () {
                                    if (container.contains(messageElement)) {
                                        container.removeChild(messageElement);
                                    }
                                }, autoClearDelay);
                            }
                        };
                        var updateButtonState = function (button, _a) {
                            var text = _a.text, disabled = _a.disabled, backgroundColor = _a.backgroundColor;
                            if (!button)
                                return;
                            if (text !== undefined)
                                button.innerText = text;
                            if (disabled !== undefined)
                                button.disabled = disabled;
                            if (backgroundColor !== undefined) {
                                button.style.backgroundColor = backgroundColor;
                                // Update the base color used for mouseout if necessary (assuming UIHelpers.createButton structure)
                                button.onmouseout = function () { return button.style.backgroundColor = backgroundColor || '#007bff'; }; // Default or new base
                            }
                        };
                        var formatAddressForDisplay = function (addressComponentData, coordinates) {
                            var addr = addressComponentData || {};
                            var formattedHtml = '<h3>Selected Location</h3>';
                            var streetAddressLine = '';
                            if (addr.Address) {
                                streetAddressLine = addr.Address;
                            } // ArcGIS: Full street address
                            else if (addr.AddNum && addr.StreetName) {
                                streetAddressLine = "".concat(addr.AddNum, " ").concat(addr.StreetName);
                            } // ArcGIS specific
                            else if (addr.house_number && (addr.road || addr.street)) {
                                streetAddressLine = "".concat(addr.house_number, " ").concat(addr.road || addr.street);
                            } // Nominatim
                            else if (addr.road || addr.street) {
                                streetAddressLine = addr.road || addr.street;
                            } // Nominatim (street only)
                            else if (addr.Match_addr) {
                                streetAddressLine = addr.Match_addr.split(',')[0];
                            } // Fallback to first part of Match_addr
                            if (streetAddressLine) {
                                formattedHtml += "<p>".concat(streetAddressLine.trim(), "</p>");
                            }
                            else {
                                formattedHtml += '<p>Street address not available.</p>';
                            }
                            var cityLineParts = [addr.City || addr.city || addr.town || '', addr.Region || addr.state || '', addr.Postal || addr.postcode || ''];
                            var cityLine = cityLineParts.filter(function (part) { return part; }).join(' ').trim();
                            if (cityLine) {
                                formattedHtml += "<p>".concat(cityLine, "</p>");
                            }
                            if (!streetAddressLine && !cityLine && (!addr || Object.keys(addr).length === 0)) {
                                formattedHtml = '<h3>Selected Location</h3><p>Address information could not be determined.</p>';
                            }
                            if (coordinates) {
                                formattedHtml += "<p><small>Lat: ".concat(coordinates.latitude.toFixed(6), ", Lng: ").concat(coordinates.longitude.toFixed(6), "</small></p>");
                            }
                            else {
                                formattedHtml += "<p><small>Coordinates not available.</small></p>";
                            }
                            return formattedHtml;
                        };
                        window.formatAddressForDisplayHelper = formatAddressForDisplay; // Make it globally accessible for MapManager
                        var handleFullscreenToggle = function (fullscreenButton) {
                            var _a, _b, _c;
                            if (!window.mapManager) {
                                console.error("MapManager not available for fullscreen toggle.");
                                return;
                            }
                            var isFullscreen = window.mapManager.toggleFullscreen();
                            updateButtonState(fullscreenButton, { text: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' });
                            // Also update the text of the fullscreen button inside the map popup, if it's open
                            var popupFullscreenBtn = (_c = (_b = (_a = window.mapManager.marker) === null || _a === void 0 ? void 0 : _a.getPopup()) === null || _b === void 0 ? void 0 : _b.getElement()) === null || _c === void 0 ? void 0 : _c.querySelector('.fullscreen-btn-popup');
                            if (popupFullscreenBtn)
                                popupFullscreenBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
                        };
                        var handleGetCurrentLocation = function (feedbackDisplayTarget, locationButton) { return __awaiter(_this, void 0, void 0, function () {
                            var inWebView, detectedPlatform, statusMessage, position, pos, err_3, errorMessage, platformName;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("handleGetCurrentLocation called. Feedback target:", feedbackDisplayTarget);
                                        inWebView = isAdPlatformWebView();
                                        detectedPlatform = getDetectedPlatform();
                                        if (!window.mapManager || !feedbackDisplayTarget) {
                                            console.error("MapManager or feedbackDisplayTarget not ready in handleGetCurrentLocation.");
                                            if (feedbackDisplayTarget)
                                                showFeedbackMessage(feedbackDisplayTarget, 'Error: Map not ready.', 'error');
                                            return [2 /*return*/];
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 6, 7, 8]);
                                        statusMessage = inWebView
                                            ? "Getting location (may require ".concat(detectedPlatform || 'app', " permissions)...")
                                            : GETTING_LOCATION_TEXT;
                                        showFeedbackMessage(feedbackDisplayTarget, statusMessage, 'status');
                                        updateButtonState(locationButton, { disabled: true });
                                        return [4 /*yield*/, LocationService.getCurrentPosition()];
                                    case 2:
                                        position = _a.sent();
                                        pos = position;
                                        if (!(pos === null || pos === void 0 ? void 0 : pos.coords)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, window.mapManager.setPosition(pos.coords.latitude, pos.coords.longitude)];
                                    case 3:
                                        _a.sent();
                                        showFeedbackMessage(feedbackDisplayTarget, LOCATION_FOUND_TEXT, 'status', MESSAGE_DISPLAY_DURATION);
                                        return [3 /*break*/, 5];
                                    case 4: throw new Error("Received invalid position data.");
                                    case 5: return [3 /*break*/, 8];
                                    case 6:
                                        err_3 = _a.sent();
                                        console.error("Error in handleGetCurrentLocation:", err_3);
                                        errorMessage = "Error: ".concat(err_3.message || 'Could not retrieve location.');
                                        // Add manual address fallback instruction for webviews
                                        if (inWebView) {
                                            platformName = detectedPlatform || 'social media app';
                                            errorMessage += "\n\nFor ".concat(platformName, " users: You can manually enter your address using the form below the map.");
                                        }
                                        showFeedbackMessage(feedbackDisplayTarget, errorMessage, 'error');
                                        return [3 /*break*/, 8];
                                    case 7:
                                        updateButtonState(locationButton, { disabled: false });
                                        return [7 /*endfinally*/];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); };
                        var handleSubmitLocation = function (submitButton) { return __awaiter(_this, void 0, void 0, function () {
                            var result, err_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!window.mapManager || !window.mapManager.currentPosition || !window.mapManager.addressInfo || !window.mapManager.addressInfo.address) {
                                            console.error("Submit prerequisites not met: mapManager, currentPosition, or addressInfo.address missing.");
                                            return [2 /*return*/];
                                        }
                                        updateButtonState(submitButton, { text: SUBMITTING_TEXT, disabled: true });
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, LocationService.submitLocationData({
                                                coordinates: window.mapManager.currentPosition,
                                                address: window.mapManager.addressInfo.address // Use the full address object
                                            })];
                                    case 2:
                                        result = _a.sent();
                                        console.log("Location submitted successfully:", result);
                                        updateButtonState(submitButton, { text: SUBMITTED_TEXT, backgroundColor: BUTTON_SUCCESS_BG });
                                        setTimeout(function () {
                                            updateButtonState(submitButton, { text: DEFAULT_SUBMIT_TEXT, backgroundColor: UIHelpers.createButton('', { backgroundColor: BUTTON_SUCCESS_BG }).style.backgroundColor, disabled: false }); // Revert to original style
                                            if (submitButton)
                                                submitButton.style.display = 'none'; // Hide after successful submission
                                        }, MESSAGE_DISPLAY_DURATION);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_4 = _a.sent();
                                        console.error("Error submitting location:", err_4);
                                        updateButtonState(submitButton, { text: SUBMIT_ERROR_TEXT, backgroundColor: BUTTON_ERROR_BG, disabled: false });
                                        setTimeout(function () {
                                            updateButtonState(submitButton, { text: DEFAULT_SUBMIT_TEXT, backgroundColor: UIHelpers.createButton('', { backgroundColor: BUTTON_ERROR_BG }).style.backgroundColor });
                                        }, MESSAGE_DISPLAY_DURATION);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        return {
                            getOrCreateById: getOrCreateById,
                            getOrCreateBySelector: getOrCreateBySelector,
                            showFeedbackMessage: showFeedbackMessage,
                            updateButtonState: updateButtonState,
                            formatAddressForDisplay: formatAddressForDisplay,
                            handleFullscreenToggle: handleFullscreenToggle,
                            handleGetCurrentLocation: handleGetCurrentLocation,
                            handleSubmitLocation: handleSubmitLocation,
                            LOCATION_BUTTON_ID: LOCATION_BUTTON_ID,
                            FULLSCREEN_BUTTON_ID: FULLSCREEN_BUTTON_ID,
                            ADDRESS_DISPLAY_CLASS: ADDRESS_DISPLAY_CLASS,
                            GLOBAL_ADDRESS_DISPLAY_ID: GLOBAL_ADDRESS_DISPLAY_ID,
                            SUBMIT_BUTTON_CLASS: SUBMIT_BUTTON_CLASS,
                            CONTENT_ELEMENT_SELECTOR: CONTENT_ELEMENT_SELECTOR,
                            WAIT_FOR_ELEMENT_TIMEOUT: WAIT_FOR_ELEMENT_TIMEOUT,
                            BUTTON_SUCCESS_BG: BUTTON_SUCCESS_BG,
                            BUTTON_ERROR_BG: BUTTON_ERROR_BG,
                            DEFAULT_SUBMIT_TEXT: DEFAULT_SUBMIT_TEXT,
                            UI_LISTENERS_SETUP_COMPLETE_CLASS: UI_LISTENERS_SETUP_COMPLETE_CLASS
                        };
                    };
                    helpers = defineInternalHelpers();
                    if (!(window.mapServiceInitialized && window.mapManager && window.mapManager.container === mapContainerElement)) return [3 /*break*/, 3];
                    console.log('initLocationService: Already initialized for this specific map container.');
                    if (!(window.mapManager && window.mapManager.container)) return [3 /*break*/, 2];
                    return [4 /*yield*/, window.initGlobalLocationUI(window.mapManager.container, feedbackContainerOverride, helpers).catch(function (err) {
                            console.error("Failed to re-initialize Global Location UI for existing mapManager:", err);
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, window.mapManager];
                case 3:
                    if (window.mapServiceInitializing) {
                        console.log('initLocationService: Initialization already in progress. Awaiting...');
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var attempts = 0;
                                var maxAttempts = 50; // Wait up to 10 seconds
                                var checkInterval = setInterval(function () {
                                    attempts++;
                                    if (window.mapServiceInitialized && window.mapManager) {
                                        clearInterval(checkInterval);
                                        resolve(window.mapManager);
                                    }
                                    else if (!window.mapServiceInitializing || attempts >= maxAttempts) {
                                        clearInterval(checkInterval);
                                        console.error("initLocationService: Ongoing initialization failed or timed out.");
                                        reject(new Error("Ongoing map initialization failed or timed out."));
                                    }
                                }, 200);
                            })];
                    }
                    window.mapServiceInitializing = true;
                    console.log("initLocationService: Starting new initialization for container:", mapContainerElement);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, waitForLeaflet()];
                case 5:
                    _a.sent();
                    if (!window.mapManager || window.mapManager.container !== mapContainerElement) {
                        console.log("initLocationService: Creating/recreating MapManager instance.");
                        if (window.mapManager && window.mapManager.map && typeof window.mapManager.map.remove === 'function') {
                            window.mapManager.map.remove(); // Clean up old map instance if any
                        }
                        window.mapManager = new MapManager(mapContainerElement, function (mapInstance) {
                            console.log('MapManager instance created/re-created via initLocationService, map instance:', mapInstance);
                        });
                    }
                    else {
                        console.log("initLocationService: window.mapManager already exists for the correct container.");
                    }
                    setupDOMElements_1 = function (contentElementForFallbackAddress, mapContainerForButtons, feedbackContainerOverride, localHelpers) {
                        var getOrCreateById = localHelpers.getOrCreateById, getOrCreateBySelector = localHelpers.getOrCreateBySelector, LOCATION_BUTTON_ID = localHelpers.LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID = localHelpers.FULLSCREEN_BUTTON_ID, GLOBAL_ADDRESS_DISPLAY_ID = localHelpers.GLOBAL_ADDRESS_DISPLAY_ID, ADDRESS_DISPLAY_CLASS = localHelpers.ADDRESS_DISPLAY_CLASS, SUBMIT_BUTTON_CLASS = localHelpers.SUBMIT_BUTTON_CLASS, DEFAULT_SUBMIT_TEXT = localHelpers.DEFAULT_SUBMIT_TEXT, BUTTON_SUCCESS_BG = localHelpers.BUTTON_SUCCESS_BG;
                        var buttonsParent = mapContainerForButtons; // Buttons are positioned relative to the map container
                        var locationButton = getOrCreateById(LOCATION_BUTTON_ID, function () {
                            var _a;
                            return UIHelpers.createButton('Get Current Location', (_a = {
                                    top: '10px',
                                    right: '10px'
                                },
                                _a['--button-id'] = LOCATION_BUTTON_ID,
                                _a));
                        }, buttonsParent);
                        var fullscreenButton = getOrCreateById(FULLSCREEN_BUTTON_ID, function () {
                            var _a;
                            return UIHelpers.createButton('Fullscreen', (_a = {
                                    top: '10px',
                                    right: '200px'
                                },
                                _a['--button-id'] = FULLSCREEN_BUTTON_ID,
                                _a));
                        }, buttonsParent); // Adjust position as needed
                        var actualFeedbackDisplayTarget;
                        if (feedbackContainerOverride && feedbackContainerOverride instanceof HTMLElement) {
                            actualFeedbackDisplayTarget = feedbackContainerOverride;
                            console.log("setupDOMElements: Using provided feedbackContainerOverride:", actualFeedbackDisplayTarget);
                            actualFeedbackDisplayTarget.innerHTML = ''; // Clear it for new content
                        }
                        else if (mapContainerForButtons && mapContainerForButtons.parentElement) {
                            // Try to get/create the global display *above* the map container
                            actualFeedbackDisplayTarget = document.getElementById(GLOBAL_ADDRESS_DISPLAY_ID);
                            if (!actualFeedbackDisplayTarget) {
                                actualFeedbackDisplayTarget = UIHelpers.createAddressDisplay();
                                actualFeedbackDisplayTarget.id = GLOBAL_ADDRESS_DISPLAY_ID;
                                actualFeedbackDisplayTarget.classList.add(ADDRESS_DISPLAY_CLASS);
                                mapContainerForButtons.parentElement.insertBefore(actualFeedbackDisplayTarget, mapContainerForButtons);
                                console.log("setupDOMElements: Created and inserted address display above map:", actualFeedbackDisplayTarget);
                            }
                            else { // Exists, ensure it's correctly positioned relative to map container
                                if (actualFeedbackDisplayTarget.nextSibling !== mapContainerForButtons || actualFeedbackDisplayTarget.parentElement !== mapContainerForButtons.parentElement) {
                                    mapContainerForButtons.parentElement.insertBefore(actualFeedbackDisplayTarget, mapContainerForButtons);
                                    console.log("setupDOMElements: Moved existing address display above map:", actualFeedbackDisplayTarget);
                                }
                                else {
                                    console.log("setupDOMElements: Existing address display is already above map:", actualFeedbackDisplayTarget);
                                }
                            }
                            actualFeedbackDisplayTarget.innerHTML = ''; // Clear it
                        }
                        else { // Fallback if map container or its parent isn't available for standard placement
                            console.warn("setupDOMElements: Fallback for address display. Using contentElementForFallbackAddress:", contentElementForFallbackAddress);
                            actualFeedbackDisplayTarget = getOrCreateBySelector(".".concat(ADDRESS_DISPLAY_CLASS), contentElementForFallbackAddress, function () {
                                var el = UIHelpers.createAddressDisplay();
                                el.classList.add(ADDRESS_DISPLAY_CLASS);
                                el.id = GLOBAL_ADDRESS_DISPLAY_ID + "_fallback";
                                return el; // Unique ID for fallback
                            });
                        }
                        return { locationButton: locationButton, fullscreenButton: fullscreenButton, addressDisplay: actualFeedbackDisplayTarget };
                    };
                    attachEventListeners_1 = function (_a, localHelpers) {
                        var locationButton = _a.locationButton, fullscreenButton = _a.fullscreenButton, addressDisplay = _a.addressDisplay;
                        var handleFullscreenToggle = localHelpers.handleFullscreenToggle, handleGetCurrentLocation = localHelpers.handleGetCurrentLocation, LOCATION_BUTTON_ID = localHelpers.LOCATION_BUTTON_ID, FULLSCREEN_BUTTON_ID = localHelpers.FULLSCREEN_BUTTON_ID;
                        if (fullscreenButton)
                            fullscreenButton.onclick = function () { return handleFullscreenToggle(fullscreenButton); };
                        else
                            console.warn("Element with ID '".concat(FULLSCREEN_BUTTON_ID, "' not found, cannot attach listener."));
                        if (locationButton)
                            locationButton.onclick = function () { return handleGetCurrentLocation(addressDisplay, locationButton); };
                        else
                            console.warn("Element with ID '".concat(LOCATION_BUTTON_ID, "' not found, cannot attach listener."));
                    };
                    setupMapManagerCallback_1 = function (_a, localHelpers) {
                        var addressDisplay = _a.addressDisplay;
                        var formatAddressForDisplay = localHelpers.formatAddressForDisplay, updateButtonState = localHelpers.updateButtonState, DEFAULT_SUBMIT_TEXT = localHelpers.DEFAULT_SUBMIT_TEXT, BUTTON_SUCCESS_BG = localHelpers.BUTTON_SUCCESS_BG, BUTTON_ERROR_BG = localHelpers.BUTTON_ERROR_BG;
                        if (!window.mapManager) {
                            console.warn("MapManager not available for onLocationConfirmed.");
                            return;
                        }
                        window.mapManager.onLocationConfirmed = function (locationData) { return __awaiter(_this, void 0, void 0, function () {
                            // Helper to find input in modal, fallback to global
                            function findInput(selector) {
                                if (modalContext) {
                                    var el = modalContext.querySelector(selector);
                                    if (el)
                                        return el;
                                }
                                return document.querySelector(selector);
                            }
                            // Helper to find select element in modal, fallback to global
                            function findSelect(selector) {
                                if (modalContext) {
                                    var el = modalContext.querySelector(selector);
                                    if (el)
                                        return el;
                                }
                                return document.querySelector(selector);
                            }
                            var errorDiv, addr, apiAddress, modalContext, emailInput, trashDaySelect, subscribeToMarketingCheckbox, numberOfBinsElement, additional_bins, val, geocodePayload, feedbackElement, setApiFeedback, response, errorMsg, errorData, e_1, geocodeDataResponse, successMsg, formAddress1Input, formCityInput, formStateInput, formZipInput, scheduleServiceButton, form, isTikTokBrowser, newScheduleServiceButton, err_5;
                            var _this = this;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!addressDisplay) {
                                            console.error("addressDisplay not found for onLocationConfirmed.");
                                            return [2 /*return*/];
                                        }
                                        if (!locationData || !locationData.address || !locationData.coordinates) {
                                            console.error("onLocationConfirmed called with invalid locationData.");
                                            if (addressDisplay) {
                                                addressDisplay.innerHTML = formatAddressForDisplay(null, locationData ? locationData.coordinates : null);
                                                errorDiv = document.createElement('div');
                                                errorDiv.textContent = 'Could not confirm location details.';
                                                errorDiv.style.color = 'red';
                                                errorDiv.style.marginTop = '10px';
                                                addressDisplay.appendChild(errorDiv);
                                            }
                                            return [2 /*return*/];
                                        }
                                        // 1. Update main address display with formatted selected address
                                        addressDisplay.innerHTML = formatAddressForDisplay(locationData.address, locationData.coordinates);
                                        addr = locationData.address;
                                        apiAddress = {
                                            line1: addr.Address || "".concat(addr.AddNum || addr.house_number || '', " ").concat(addr.StreetName || addr.Street || addr.road || '').trim(),
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
                                            }
                                            else if (addr.LongLabel && addr.LongLabel.includes(',')) {
                                                apiAddress.line1 = addr.LongLabel.split(',')[0].trim();
                                            }
                                            else {
                                                // If still problematic, it might be better to indicate an issue or rely on user correction
                                                console.warn("Could not form a valid street line1 from geocoded data:", addr);
                                            }
                                        }
                                        modalContext = null;
                                        // Try to find the closest open dialog/modal from the addressDisplay
                                        if (addressDisplay && addressDisplay.closest && addressDisplay.closest('dialog')) {
                                            modalContext = addressDisplay.closest('dialog');
                                        }
                                        emailInput = findInput('#email');
                                        trashDaySelect = findSelect('#trash-day');
                                        subscribeToMarketingCheckbox = findInput('#subscribe_to_marketing');
                                        numberOfBinsElement = findInput('#number-of-bins');
                                        additional_bins = 0;
                                        if (numberOfBinsElement) {
                                            val = parseInt(numberOfBinsElement.value);
                                            additional_bins = isNaN(val) ? 0 : Math.max(0, val - 2); // Never negative
                                        }
                                        window.additionalBins = additional_bins; // Keep global for modal if needed
                                        console.log("Number of bins (current, modal-aware):", numberOfBinsElement === null || numberOfBinsElement === void 0 ? void 0 : numberOfBinsElement.value, "additional_bins:", additional_bins);
                                        // on change update the window
                                        if (numberOfBinsElement) {
                                            numberOfBinsElement.addEventListener('change', function () {
                                                var val = parseInt(numberOfBinsElement.value);
                                                window.additionalBins = isNaN(val) ? 0 : Math.max(0, val - 2); // Never negative
                                                console.log("Number of bins changed:", numberOfBinsElement.value, "additional_bins:", window.additionalBins);
                                            });
                                        }
                                        geocodePayload = {
                                            address: apiAddress,
                                            email: emailInput ? emailInput.value.trim() : null,
                                            trash_day: trashDaySelect ? trashDaySelect.value : null,
                                            subscribe_to_marketing: subscribeToMarketingCheckbox ? subscribeToMarketingCheckbox.checked : null,
                                            additional_bins: additional_bins,
                                            location_type: 'geolocation', // Indicate this comes from geolocation
                                            coordinates: locationData.coordinates // Include original coordinates
                                        };
                                        // Remove null/undefined properties from payload as backend might not expect them
                                        Object.keys(geocodePayload).forEach(function (key) {
                                            if (geocodePayload[key] === null || geocodePayload[key] === undefined) {
                                                delete geocodePayload[key];
                                            }
                                        });
                                        feedbackElement = addressDisplay.querySelector('.api-feedback-message');
                                        if (!feedbackElement) {
                                            feedbackElement = document.createElement('div');
                                            feedbackElement.className = 'api-feedback-message';
                                            feedbackElement.style.marginTop = '10px'; // Basic styling
                                            feedbackElement.style.fontWeight = '500';
                                            addressDisplay.appendChild(feedbackElement);
                                        }
                                        setApiFeedback = function (msg, type) {
                                            if (type === void 0) { type = 'info'; }
                                            feedbackElement.textContent = msg;
                                            feedbackElement.className = 'api-feedback-message'; // Reset classes
                                            // Basic text color styling, assuming no Tailwind here for simplicity or use classes if available
                                            switch (type) {
                                                case 'success':
                                                    feedbackElement.style.color = 'green';
                                                    break;
                                                case 'error':
                                                    feedbackElement.style.color = 'red';
                                                    break;
                                                case 'loading':
                                                    feedbackElement.style.color = 'blue';
                                                    break;
                                                default: feedbackElement.style.color = 'black';
                                            }
                                        };
                                        setApiFeedback('Checking service availability for the confirmed location...', 'loading');
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 9, , 10]);
                                        return [4 /*yield*/, fetch('/api/geocode', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(geocodePayload)
                                            })];
                                    case 2:
                                        response = _b.sent();
                                        if (!!response.ok) return [3 /*break*/, 7];
                                        errorMsg = "Address validation failed (".concat(response.status, ")");
                                        _b.label = 3;
                                    case 3:
                                        _b.trys.push([3, 5, , 6]);
                                        return [4 /*yield*/, response.json()];
                                    case 4:
                                        errorData = _b.sent();
                                        errorMsg = errorData.message || errorMsg;
                                        return [3 /*break*/, 6];
                                    case 5:
                                        e_1 = _b.sent();
                                        console.error("Could not parse error response from /api/geocode on confirm", e_1);
                                        return [3 /*break*/, 6];
                                    case 6: throw new Error(errorMsg);
                                    case 7: return [4 /*yield*/, response.json()];
                                    case 8:
                                        geocodeDataResponse = _b.sent();
                                        console.log('Geocode response on confirm:', geocodeDataResponse);
                                        localStorage.setItem('geocode-data', JSON.stringify(geocodeDataResponse)); // Store for later use
                                        // Store the validation result globally for potential reuse in modal
                                        window.lastValidatedAddressForModal = {
                                            inside_zone: geocodeDataResponse.inside_zone,
                                            valid_trash_day: geocodeDataResponse.valid_trash_day,
                                            next_service_day: geocodeDataResponse.next_service_day,
                                            location: geocodeDataResponse.location,
                                            address_id: geocodeDataResponse.address_id
                                        };
                                        if (!geocodeDataResponse.inside_zone) {
                                            setApiFeedback('Sorry, service is not currently available at this address.', 'error');
                                        }
                                        else {
                                            successMsg = 'Service is available!';
                                            if (geocodeDataResponse.next_service_day) {
                                                successMsg += " Next estimated service day: ".concat(geocodeDataResponse.next_service_day, ".");
                                            }
                                            setApiFeedback(successMsg, 'success');
                                            formAddress1Input = document.getElementById('address1');
                                            formCityInput = document.getElementById('city');
                                            formStateInput = document.getElementById('state');
                                            formZipInput = document.getElementById('zip5');
                                            if (formAddress1Input)
                                                formAddress1Input.value = apiAddress.line1;
                                            if (formCityInput)
                                                formCityInput.value = apiAddress.city;
                                            if (formStateInput)
                                                formStateInput.value = apiAddress.state;
                                            if (formZipInput)
                                                formZipInput.value = apiAddress.postal_code;
                                            console.log("Form fields populated after /api/geocode success from map confirm.");
                                            scheduleServiceButton = document.getElementById('checkout-button');
                                            if (scheduleServiceButton) {
                                                form = scheduleServiceButton.closest('form');
                                                isTikTokBrowser = navigator.userAgent.includes('TikTok') ||
                                                    navigator.userAgent.includes('ByteDance') ||
                                                    navigator.userAgent.includes('Musically');
                                                if (form && (isTikTokBrowser || !window.Stripe)) {
                                                    console.log("TikTok browser or no Stripe detected - using standard HTML form submission instead of JavaScript");
                                                    // For TikTok browser compatibility, let the form submit normally
                                                    // Don't add click event listeners that might interfere
                                                    return [2 /*return*/];
                                                }
                                                newScheduleServiceButton = scheduleServiceButton.cloneNode(true);
                                                (_a = scheduleServiceButton.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newScheduleServiceButton, scheduleServiceButton);
                                                scheduleServiceButton = newScheduleServiceButton;
                                                scheduleServiceButton.addEventListener('click', function (event) { return __awaiter(_this, void 0, void 0, function () {
                                                    var thisClickedButton, activeServiceModalElement, modalContentAreaForStripe, modalSpecificFeedbackDiv, showInModalFeedback, serviceDataString, serviceProductData, currentEmailInput, currentTrashDaySelect, addressDataForStripe, stripeInitialized, paymentForm, addressSect, paymentSect, err_6;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                console.log("Global checkout-button (from map confirm context) clicked.");
                                                                thisClickedButton = event.currentTarget;
                                                                thisClickedButton.disabled = true;
                                                                activeServiceModalElement = thisClickedButton.closest('dialog');
                                                                if (!activeServiceModalElement) {
                                                                    console.error("Checkout button clicked, but could not find its parent service modal (div[id^='service-modal-']). Button:", thisClickedButton);
                                                                    // Feedback here is tricky. setApiFeedback is tied to the map's context.
                                                                    // A global alert or a more sophisticated notification system might be needed.
                                                                    alert('Error: Could not determine the active service context. Please try reopening the service modal.');
                                                                    thisClickedButton.disabled = false;
                                                                    return [2 /*return*/];
                                                                }
                                                                modalContentAreaForStripe = activeServiceModalElement.querySelector('.modal-content-area');
                                                                if (!modalContentAreaForStripe) {
                                                                    console.error(".modal-content-area not found within the active service modal.", activeServiceModalElement);
                                                                    alert('Error: Modal content structure error.'); // This alert might be better if tied to modalSpecificFeedback if available
                                                                    thisClickedButton.disabled = false;
                                                                    return [2 /*return*/];
                                                                }
                                                                modalSpecificFeedbackDiv = modalContentAreaForStripe.querySelector('#address-feedback');
                                                                showInModalFeedback = function (msg, type) {
                                                                    if (type === void 0) { type = 'info'; }
                                                                    if (modalSpecificFeedbackDiv) {
                                                                        modalSpecificFeedbackDiv.textContent = msg;
                                                                        modalSpecificFeedbackDiv.className = 'mt-3 text-sm font-medium'; // Reset
                                                                        if (type === 'error')
                                                                            modalSpecificFeedbackDiv.classList.add('text-red-600', 'dark:text-red-400');
                                                                        else if (type === 'success')
                                                                            modalSpecificFeedbackDiv.classList.add('text-green-600', 'dark:text-green-400');
                                                                        else
                                                                            modalSpecificFeedbackDiv.classList.add('text-blue-600', 'dark:text-blue-400'); // loading or info
                                                                    }
                                                                    else {
                                                                        console.log("ModalFeedback (".concat(type, "): ").concat(msg)); // Fallback
                                                                    }
                                                                };
                                                                _a.label = 1;
                                                            case 1:
                                                                _a.trys.push([1, 3, , 4]);
                                                                serviceDataString = activeServiceModalElement.dataset.serviceData;
                                                                if (!serviceDataString) {
                                                                    console.error("Service data not found on the active service modal's dataset.", activeServiceModalElement);
                                                                    throw new Error("Service data is missing from the active modal.");
                                                                }
                                                                serviceProductData = JSON.parse(serviceDataString);
                                                                currentEmailInput = modalContentAreaForStripe.querySelector('#email');
                                                                currentTrashDaySelect = modalContentAreaForStripe.querySelector('#trash-day');
                                                                addressDataForStripe = __assign(__assign({}, apiAddress), { email: (currentEmailInput === null || currentEmailInput === void 0 ? void 0 : currentEmailInput.value.trim()) || '', trash_day: (currentTrashDaySelect === null || currentTrashDaySelect === void 0 ? void 0 : currentTrashDaySelect.value) || '' });
                                                                return [4 /*yield*/, initializeStripeElements(modalContentAreaForStripe, serviceProductData, addressDataForStripe)];
                                                            case 2:
                                                                stripeInitialized = _a.sent();
                                                                if (stripeInitialized) {
                                                                    showInModalFeedback('Please enter payment details.', 'info');
                                                                    paymentForm = modalContentAreaForStripe.querySelector('#payment-form');
                                                                    if (paymentForm) {
                                                                        // handlePaymentSubmit expects (event, modalContentArea)
                                                                        paymentForm.addEventListener('submit', function (e) { return handlePaymentSubmit(e, modalContentAreaForStripe); });
                                                                    }
                                                                    else {
                                                                        console.error("Payment form not found in modal after Stripe init!");
                                                                        showInModalFeedback('Error displaying payment form.', 'error');
                                                                    }
                                                                    addressSect = modalContentAreaForStripe.querySelector('#address-validation-section');
                                                                    paymentSect = modalContentAreaForStripe.querySelector('#payment-section');
                                                                    if (addressSect)
                                                                        addressSect.style.display = 'none';
                                                                    if (paymentSect)
                                                                        paymentSect.classList.remove('hidden');
                                                                }
                                                                else {
                                                                    // Error message should have been shown by initializeStripeElements or its callees
                                                                    showInModalFeedback('Failed to initialize payment system. Please check details and try again.', 'error');
                                                                    thisClickedButton.disabled = false;
                                                                }
                                                                return [3 /*break*/, 4];
                                                            case 3:
                                                                err_6 = _a.sent();
                                                                console.error('Error during global checkout button processing:', err_6);
                                                                showInModalFeedback("Checkout Error: ".concat(err_6.message), 'error');
                                                                thisClickedButton.disabled = false;
                                                                return [3 /*break*/, 4];
                                                            case 4: return [2 /*return*/];
                                                        }
                                                    });
                                                }); });
                                            }
                                            else {
                                                console.warn("Schedule service button (checkout-button) not found.");
                                            }
                                        }
                                        return [3 /*break*/, 10];
                                    case 9:
                                        err_5 = _b.sent();
                                        console.error('Error calling /api/geocode on confirm:', err_5);
                                        setApiFeedback("Error checking availability: ".concat(err_5.message), 'error');
                                        return [3 /*break*/, 10];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); };
                    };
                    initGlobalLocationUI = function (mapContainerForButtons, feedbackContainerOverride, localHelpers) { return __awaiter(_this, void 0, void 0, function () {
                        var CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT, UI_LISTENERS_SETUP_COMPLETE_CLASS, contentElementForFallbackAddress, uiElements;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    CONTENT_ELEMENT_SELECTOR = localHelpers.CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT = localHelpers.WAIT_FOR_ELEMENT_TIMEOUT, UI_LISTENERS_SETUP_COMPLETE_CLASS = localHelpers.UI_LISTENERS_SETUP_COMPLETE_CLASS;
                                    console.log("initGlobalLocationUI: Configuring UI. Buttons target:", mapContainerForButtons, "Feedback target:", feedbackContainerOverride || "Default (above map or fallback)");
                                    return [4 /*yield*/, waitForElement(CONTENT_ELEMENT_SELECTOR, WAIT_FOR_ELEMENT_TIMEOUT, document)
                                            .catch(function () {
                                            console.warn("'".concat(CONTENT_ELEMENT_SELECTOR, "' not found, using document.body for fallback address display parent."));
                                            return document.body; // Fallback to body
                                        })];
                                case 1:
                                    contentElementForFallbackAddress = _a.sent();
                                    uiElements = setupDOMElements_1(contentElementForFallbackAddress, mapContainerForButtons, feedbackContainerOverride, localHelpers);
                                    // Attach listeners only once per page load, or re-attach if elements were recreated.
                                    // The UI_LISTENERS_SETUP_COMPLETE_CLASS flag helps manage this.
                                    // However, if uiElements are recreated (e.g. modal), listeners need re-attaching to new elements.
                                    // For simplicity here, we re-attach each time initGlobalLocationUI is called,
                                    // assuming setupDOMElements might return new instances or ensure old ones are correctly parented.
                                    attachEventListeners_1(uiElements, localHelpers);
                                    setupMapManagerCallback_1(uiElements, localHelpers); // This sets/updates the onLocationConfirmed callback
                                    if (!document.body.classList.contains(UI_LISTENERS_SETUP_COMPLETE_CLASS)) {
                                        document.body.classList.add(UI_LISTENERS_SETUP_COMPLETE_CLASS);
                                        console.log("initGlobalLocationUI: First-time listener and callback setup complete.");
                                    }
                                    else {
                                        console.log("initGlobalLocationUI: Re-applied listeners and mapManager callback.");
                                    }
                                    console.log("initGlobalLocationUI: UI configuration finished.");
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, initGlobalLocationUI(mapContainerElement, feedbackContainerOverride, helpers).catch(function (err) {
                            console.error("Failed to initialize Global Location UI:", err);
                            // Potentially show error to user in a fallback way if UI init fails critically
                        })];
                case 6:
                    _a.sent();
                    window.LocationService = LocationService; // Expose service globally if needed
                    window.mapServiceInitialized = true;
                    window.mapServiceInitializing = false;
                    console.log('initLocationService completed successfully. window.mapManager is ready:', window.mapManager);
                    return [2 /*return*/, window.mapManager];
                case 7:
                    error_1 = _a.sent();
                    console.error('Critical error in initLocationService:', error_1.message, error_1.stack);
                    window.mapServiceInitialized = false;
                    window.mapServiceInitializing = false;
                    window.mapManager = null;
                    // Optionally, display a user-facing error message on the page if map init fails
                    if (mapContainerElement)
                        mapContainerElement.innerHTML = "<p style=\"color:red; padding:10px;\">Map could not be loaded: ".concat(error_1.message, "</p>");
                    throw error_1; // Re-throw for calling code to handle if necessary
                case 8: return [2 /*return*/];
            }
        });
    });
}
// This function is called when the address modal is shown, to initialize/update the map
// and prefill address fields from the map's current location.
window.finalizeAddressFormAndMap = function () {
    return __awaiter(this, void 0, void 0, function () {
        var modalElement, addressValidationSection, modalFeedbackDiv, mapContainerInModal, error_2, errorMsg, tempShowFeedback, mapManagerInstance, position, pos, addressInfo, addr, street, city, state, zip, address1Input, cityInput, stateInput, zipInput, errorMsg, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("finalizeAddressFormAndMap: Called.");
                    modalElement = document.querySelector('.modal-content-area');
                    if (!modalElement) {
                        console.error("Modal element not found for finalizeAddressFormAndMap.");
                        return [2 /*return*/];
                    }
                    addressValidationSection = modalElement.querySelector('#address-validation-section');
                    if (!addressValidationSection) {
                        console.error("Address validation section not found in modal.");
                        return [2 /*return*/];
                    }
                    modalFeedbackDiv = addressValidationSection.querySelector('#address-feedback');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, waitForElement('#mapContainer', 7000, modalElement)];
                case 2:
                    mapContainerInModal = _a.sent(); // Wait for map container within modal
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    errorMsg = "Map container (#mapContainer) could not be found within the modal. ".concat(error_2.message);
                    if (modalFeedbackDiv)
                        modalFeedbackDiv.innerHTML = "<p class=\"text-red-500\">".concat(errorMsg, "</p>"); // Tailwind class
                    else
                        console.error(errorMsg, error_2);
                    return [2 /*return*/];
                case 4:
                    tempShowFeedback = function (container, msg, type) {
                        if (container)
                            container.innerHTML = "<div style=\"".concat(type === 'error' ? 'color: #dc3545; padding: 10px;' : 'padding: 10px;', "\">").concat(msg, "</div>");
                        else
                            console.error("tempShowFeedback: No container for message:", msg);
                    };
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 12, , 13]);
                    return [4 /*yield*/, initLocationService(mapContainerInModal, { feedbackContainerOverride: modalFeedbackDiv })];
                case 6:
                    mapManagerInstance = _a.sent();
                    if (!mapManagerInstance) return [3 /*break*/, 10];
                    console.log("finalizeAddressFormAndMap: Map manager initialized for modal, attempting to get current location.");
                    return [4 /*yield*/, LocationService.getCurrentPosition()];
                case 7:
                    position = _a.sent();
                    console.log("finalizeAddressFormAndMap: Got geographic position", position);
                    pos = position;
                    return [4 /*yield*/, mapManagerInstance.setPosition(pos.coords.latitude, pos.coords.longitude)];
                case 8:
                    _a.sent();
                    console.log("finalizeAddressFormAndMap: Set map position, waiting for reverse geocode and popup...");
                    // Give a brief moment for the reverse geocoding in setPosition/updateAddressDisplay to complete
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 9:
                    // Give a brief moment for the reverse geocoding in setPosition/updateAddressDisplay to complete
                    _a.sent(); // Adjust delay if needed
                    addressInfo = mapManagerInstance.addressInfo;
                    console.log("finalizeAddressFormAndMap: Address info from mapManager after setPosition:", addressInfo);
                    if (addressInfo && addressInfo.address) {
                        addr = addressInfo.address;
                        street = '';
                        if (addr.Address) {
                            street = addr.Address;
                        }
                        else if (addr.AddNum && (addr.StreetName || addr.Street)) {
                            street = "".concat(addr.AddNum, " ").concat(addr.StreetName || addr.Street);
                        }
                        else if (addr.house_number && (addr.road || addr.street)) {
                            street = "".concat(addr.house_number, " ").concat(addr.road || addr.street);
                        }
                        else if (addr.road || addr.street) {
                            street = addr.road || addr.street;
                        }
                        city = addr.City || addr.city || addr.town || '';
                        state = addr.Region || addr.state || '';
                        zip = addr.Postal || addr.postcode || '';
                        address1Input = addressValidationSection.querySelector('#address1');
                        cityInput = addressValidationSection.querySelector('#city');
                        stateInput = addressValidationSection.querySelector('#state');
                        zipInput = addressValidationSection.querySelector('#zip5');
                        if (address1Input)
                            address1Input.value = street.trim();
                        else
                            console.warn("finalizeAddressFormAndMap: #address1 input not found in modal.");
                        if (cityInput)
                            cityInput.value = city.trim();
                        else
                            console.warn("finalizeAddressFormAndMap: #city input not found in modal.");
                        if (stateInput)
                            stateInput.value = state.trim();
                        else
                            console.warn("finalizeAddressFormAndMap: #state input not found in modal.");
                        if (zipInput)
                            zipInput.value = zip.trim();
                        else
                            console.warn("finalizeAddressFormAndMap: #zip5 input not found in modal.");
                        console.log("finalizeAddressFormAndMap: Address form in modal populated from map.");
                        // Optionally, trigger the /api/geocode call here as well if the user doesn't interact with "Confirm"
                        // This would be similar to the logic in onLocationConfirmed
                        // For now, we assume "Confirm Location" on the map is the primary trigger for the API call.
                    }
                    else {
                        console.warn("finalizeAddressFormAndMap: Could not retrieve address details for prefill from addressInfo:", addressInfo);
                        if (modalFeedbackDiv) {
                            errorMsg = (addressInfo === null || addressInfo === void 0 ? void 0 : addressInfo.error) ? "Could not retrieve address details: ".concat(addressInfo.error) : 'Could not retrieve address details for prefill.';
                            if (modalFeedbackDiv)
                                tempShowFeedback(modalFeedbackDiv, errorMsg, 'error');
                        }
                    }
                    return [3 /*break*/, 11];
                case 10:
                    console.error("finalizeAddressFormAndMap: Map manager failed to initialize in modal.");
                    if (modalFeedbackDiv)
                        tempShowFeedback(modalFeedbackDiv, 'Map manager failed to initialize.', 'error');
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_3 = _a.sent();
                    console.error("Error in finalizeAddressFormAndMap during map/location operations:", error_3);
                    if (modalFeedbackDiv) {
                        if (modalFeedbackDiv)
                            tempShowFeedback(modalFeedbackDiv, "Could not auto-detect location or initialize map. ".concat(error_3.message), 'error');
                    }
                    return [3 /*break*/, 13];
                case 13:
                    // Call setupAddressValidation if it's globally available (from service-validation.js or similar)
                    // This would attach listeners to the "Check Availability" button in the modal's address form.
                    if (typeof window.setupAddressValidation === 'function') {
                        console.log("finalizeAddressFormAndMap: Calling setupAddressValidation for the modal form.");
                        window.setupAddressValidation(addressValidationSection); // Pass the scope of the address form
                    }
                    else {
                        console.warn("finalizeAddressFormAndMap: window.setupAddressValidation not found. Address form listeners in modal might not be active.");
                    }
                    return [2 /*return*/];
            }
        });
    });
};
// Assign to window object if in a browser environment
if (typeof window !== 'undefined') {
}
// Optionally, export for use in other modules if this file is part of an ES module system
// DOMContentLoaded: Attempt to initialize map for any *global* (non-modal) map containers
document.addEventListener('DOMContentLoaded', function () { return __awaiter(void 0, void 0, void 0, function () {
    var potentialGlobalContainers, globalContainer, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("DOMContentLoaded: Passive initLocationService attempt for global map.");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, waitForLeaflet(3000).catch(function (err) { console.warn("Leaflet not ready for global map init:", err); throw err; })];
            case 2:
                _a.sent();
                potentialGlobalContainers = Array.from(document.querySelectorAll('#mapContainer'));
                globalContainer = potentialGlobalContainers.find(function (c) { return !c.closest('.modal-content-area'); });
                if (!(!window.mapServiceInitialized && globalContainer)) return [3 /*break*/, 4];
                console.log("DOMContentLoaded: Global map container found, attempting initLocationService.");
                return [4 /*yield*/, initLocationService(globalContainer)];
            case 3:
                _a.sent(); // No feedback override, uses default placement
                return [3 /*break*/, 5];
            case 4:
                if (window.mapServiceInitialized) {
                    console.log("DOMContentLoaded: Location service (global map) already initialized or in progress.");
                }
                else {
                    console.log("DOMContentLoaded: No suitable global map container found, or service already initializing.");
                }
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                err_7 = _a.sent();
                console.warn("DOMContentLoaded: initLocationService for global map failed or was skipped:", err_7.message);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
