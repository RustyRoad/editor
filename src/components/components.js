// @ts-nocheck
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
import webinarCheckout1 from "./webinar-checkout-1";
import embeddedCheckout from "./embedded-checkout";
import serviceSignup from "./service-signup";
import serviceValidation from "./service-validation";
import { loadStripe } from '@stripe/stripe-js';
import pricingTable from "./pricing-table";
import locationToAddress from "./LocationToAddressGrapes";
import { formatPrice } from "./utils";
// Register components with GrapesJS
var components = function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    var domc = editor.DomComponents;
    // Register webinar-checkout-1 component
    domc.addType('webinar-checkout-1', {
        model: {
            defaults: {
                component: webinarCheckout1,
                stylable: true,
            }
        }
    });
    // Register Embedded Checkout component
    domc.addType('Embedded Checkout', {
        isComponent: function (el) { return el.getAttribute && el.getAttribute('data-gjs-type') === 'embedded-checkout' ? { type: 'Embedded Checkout' } : false; },
        model: {
            defaults: {
                tagName: 'div',
                attributes: { 'data-gjs-type': 'embedded-checkout', class: 'embedded-checkout-wrapper' },
                content: 'Select a product for embedded checkout...',
                droppable: false,
                stylable: [],
                traits: [
                    {
                        type: 'select',
                        label: 'Select Product',
                        name: 'selectedProduct',
                        options: [],
                        changeProp: true
                    }
                ],
                stripeKey: null,
                products: [],
                selectedProduct: '',
                title: 'Embedded Checkout'
            },
            init: function () {
                var _this = this;
                this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
                this.listenTo(this, 'change:stripeKey change:products', function () { return _this.trigger('rerender'); });
                this.fetchStripeKey();
                this.fetchProducts();
            },
            handleProductChange: function () {
                console.log('[Embedded Model] Product selection changed:', this.get('selectedProduct'));
                this.trigger('rerender');
            },
            fetchStripeKey: function () {
                var _this = this;
                if (this.get('stripeKey'))
                    return;
                fetch('/api/stripe/key')
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error("HTTP error! status: ".concat(response.status));
                    return response.json();
                })
                    .then(function (data) {
                    if (data && data.public_key) {
                        _this.set('stripeKey', data.public_key);
                        console.log('[Embedded Model] Stripe key fetched.');
                    }
                    else {
                        console.warn('[Embedded Model] Stripe public key not found in response.');
                        _this.set('stripeKey', null);
                    }
                }).catch(function (err) {
                    console.error('[Embedded Model] Error fetching Stripe key:', err);
                    _this.set('stripeKey', null);
                });
            },
            fetchProducts: function () {
                var _this = this;
                var _a;
                if (((_a = this.get('products')) === null || _a === void 0 ? void 0 : _a.length) > 0)
                    return;
                fetch('/api/product/all')
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error("HTTP error! status: ".concat(response.status));
                    return response.text().then(function (text) { return text ? JSON.parse(text) : []; });
                })
                    .then(function (data) {
                    var products = (data || []).map(function (product) { return ({
                        id: product.id || "prod_".concat(Date.now(), "_").concat(Math.random()),
                        title: product.name || 'Untitled Product',
                        price: Math.max(0, Number(product.price)) || 0,
                        description: product.description || '',
                        currency: product.currency || 'usd',
                        images: product.images || []
                    }); });
                    _this.set('products', products);
                    console.log('[Embedded Model] Products fetched:', products.length);
                    _this.updateProductTraitOptions();
                }).catch(function (error) {
                    console.error('[Embedded Model] Error fetching products:', error);
                    _this.set('products', []);
                    _this.updateProductTraitOptions();
                });
            },
            updateProductTraitOptions: function () {
                var products = this.get('products') || [];
                var trait = this.getTrait('selectedProduct');
                if (trait) {
                    var options = products.map(function (product) { return ({
                        id: product.id.toString(),
                        name: "".concat(product.name, " (").concat(formatPrice(product.price, product.currency), ")"),
                        value: product.id.toString()
                    }); });
                    options.unshift({ id: '', name: 'Select a Product...', value: '' });
                    trait.set('options', options);
                    console.log('[Embedded Model] Product trait options updated.');
                }
                else {
                    console.warn('[Embedded Model] Could not find selectedProduct trait.');
                }
            },
            toJSON: function (opts) {
                if (opts === void 0) { opts = {}; }
                var obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
                obj.selectedProduct = this.get('selectedProduct');
                return obj;
            },
        },
        view: {
            init: function () {
                this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
            },
            onRender: function () {
                var _this = this;
                var model = this.model;
                var componentRootEl = this.el;
                componentRootEl.innerHTML = '';
                var stripeKey = model.get('stripeKey');
                var selectedProductId = model.get('selectedProduct');
                var products = model.get('products') || [];
                var selectedProduct = products.find(function (p) { var _a; return ((_a = p.id) === null || _a === void 0 ? void 0 : _a.toString()) === selectedProductId; });
                var htmlContent;
                if (!selectedProductId) {
                    htmlContent = '<div class="p-4 text-center text-gray-500">Please select a product from the settings panel.</div>';
                }
                else if (!selectedProduct) {
                    htmlContent = '<div class="p-4 text-center text-red-600">Error: Selected product data not found. Please re-select.</div>';
                }
                else {
                    htmlContent = embeddedCheckout(selectedProduct);
                }
                componentRootEl.innerHTML = htmlContent;
                if (!stripeKey || !selectedProduct) {
                    console.log('[Embedded View] Skipping Stripe init (missing key or product).');
                    return;
                }
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var stripe, stripeInstance, checkout, container, errorContainer, error_1, errorMessageContainer;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, loadStripe(stripeKey)];
                            case 1:
                                stripe = _a.sent();
                                if (!stripe)
                                    throw new Error("Stripe.js failed to load.");
                                stripeInstance = stripe;
                                return [4 /*yield*/, stripeInstance.initEmbeddedCheckout({
                                        fetchClientSecret: function () { return __awaiter(_this, void 0, void 0, function () {
                                            var res, errorData, clientSecret, fetchErr_1, errorContainer;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 5, , 6]);
                                                        return [4 /*yield*/, fetch('/api/stripe/create-checkout-session', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                                                            })];
                                                    case 1:
                                                        res = _a.sent();
                                                        if (!!res.ok) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, res.json().catch(function () { return ({}); })];
                                                    case 2:
                                                        errorData = _a.sent();
                                                        throw new Error(errorData.error || "Failed to create checkout session (Status: ".concat(res.status, ")"));
                                                    case 3: return [4 /*yield*/, res.json()];
                                                    case 4:
                                                        clientSecret = (_a.sent()).clientSecret;
                                                        if (!clientSecret)
                                                            throw new Error("Client secret missing from response.");
                                                        return [2 /*return*/, clientSecret];
                                                    case 5:
                                                        fetchErr_1 = _a.sent();
                                                        console.error('[Embedded View] Error fetching client secret:', fetchErr_1);
                                                        errorContainer = componentRootEl.querySelector('#error-message');
                                                        if (errorContainer)
                                                            errorContainer.textContent = "Error initializing payment: ".concat(fetchErr_1 instanceof Error ? fetchErr_1.message : String(fetchErr_1));
                                                        throw fetchErr_1;
                                                    case 6: return [2 /*return*/];
                                                }
                                            });
                                        }); }
                                    })];
                            case 2:
                                checkout = _a.sent();
                                container = componentRootEl.querySelector('#embedded-checkout-container');
                                if (container) {
                                    checkout.mount(container);
                                    console.log('[Embedded View] Stripe Embedded Checkout mounted.');
                                }
                                else {
                                    console.error('[Embedded View] Mount container #embedded-checkout-container not found.');
                                    errorContainer = componentRootEl.querySelector('#error-message');
                                    if (errorContainer)
                                        errorContainer.textContent = 'Error: Payment form container not found.';
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _a.sent();
                                console.error('[Embedded View] Stripe initialization error:', error_1);
                                errorMessageContainer = componentRootEl.querySelector('#error-message');
                                if (errorMessageContainer)
                                    errorMessageContainer.textContent = "Payment Error: ".concat(error_1 instanceof Error ? error_1.message : String(error_1));
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })();
            },
            onRemove: function () {
                console.log('[Embedded View] Component removed.');
            }
        }
    });
    // Register Service Signup component
    domc.addType('Service Signup', {
        isComponent: function (el) {
            if (el.getAttribute && el.getAttribute('data-gjs-type') === 'service-signup') {
                return { type: 'Service Signup' };
            }
            return false;
        },
        model: {
            defaults: {
                tagName: 'div',
                attributes: { 'data-gjs-type': 'service-signup', class: 'service-signup-wrapper' },
                content: 'Select a service...',
                droppable: false,
                stylable: [],
                traits: [
                    {
                        type: 'select',
                        label: 'Select Service',
                        name: 'selectedProduct',
                        options: [],
                        changeProp: true
                    }
                ],
                stripeKey: null,
                products: [],
                selectedProduct: '',
                title: 'Service Signup'
            },
            init: function () {
                var _this = this;
                this.listenTo(this, 'change:selectedProduct', this.handleProductChange);
                this.listenTo(this, 'change:stripeKey change:products', function () { return _this.trigger('rerender'); });
                this.fetchStripeKey();
                this.fetchProducts();
            },
            handleProductChange: function () {
                console.log('[Service Signup Model] Product/Service selection changed:', this.get('selectedProduct'));
                this.trigger('rerender');
            },
            fetchStripeKey: function () {
                var _this = this;
                if (this.get('stripeKey'))
                    return;
                fetch('/api/stripe/key')
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error("HTTP error! status: ".concat(response.status));
                    return response.json();
                })
                    .then(function (data) {
                    if (data && data.public_key) {
                        _this.set('stripeKey', data.public_key);
                        console.log('[Service Signup Model] Stripe key fetched.');
                    }
                    else {
                        console.warn('[Service Signup Model] Stripe public key not found.');
                        _this.set('stripeKey', null);
                    }
                }).catch(function (err) {
                    console.error('[Service Signup Model] Error fetching Stripe key:', err);
                    _this.set('stripeKey', null);
                });
            },
            fetchProducts: function () {
                var _this = this;
                var _a;
                if (((_a = this.get('products')) === null || _a === void 0 ? void 0 : _a.length) > 0)
                    return;
                fetch('/api/product/all')
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error("HTTP error! status: ".concat(response.status));
                    return response.text().then(function (text) { return text ? JSON.parse(text) : []; });
                })
                    .then(function (data) {
                    var products = (data || []).map(function (product) {
                        var id = product.id ? product.id.toString() : "prod_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                        var title = product.name || 'Untitled Service';
                        var price = typeof product.price === 'number' ? Math.max(0, product.price) : 0;
                        var description = product.description || '';
                        var currency = product.currency || 'usd';
                        var images = Array.isArray(product.images) ? product.images : [];
                        if (!product.id || !product.name || typeof product.price !== 'number') {
                            console.warn('[Service Signup Model] Incomplete product data:', product);
                        }
                        return { id: id, title: title, price: price, description: description, currency: currency, images: images };
                    }).filter(function (p) { return p.id && p.name && p.price >= 0; });
                    _this.set('products', products);
                    console.log('[Service Signup Model] Services fetched:', products.length);
                    _this.updateTraits();
                }).catch(function (error) {
                    console.error('[Service Signup Model] Error fetching services:', error);
                    _this.set('products', []);
                    _this.updateTraits();
                });
            },
            updateTraits: function () {
                var products = this.get('products') || [];
                var trait = this.getTrait('selectedProduct');
                if (trait) {
                    var options = products.map(function (product) { return ({
                        id: product.id.toString(),
                        name: "".concat(product.name, " (").concat(formatPrice(product.price, product.currency), ")"),
                        value: product.id.toString()
                    }); });
                    options.unshift({ id: '', name: 'Select a Service...', value: '' });
                    trait.set('options', options);
                    console.log('[Service Signup Model] Service trait options updated.');
                }
                else {
                    console.warn('[Service Signup Model] Could not find selectedProduct trait.');
                }
            },
            toJSON: function (opts) {
                if (opts === void 0) { opts = {}; }
                var obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
                obj.selectedProduct = this.get('selectedProduct');
                return obj;
            }
        },
        view: {
            init: function () {
                this.listenTo(this.model, 'change:selectedProduct change:stripeKey change:products rerender', this.render);
            },
            onRender: function () {
                var _this = this;
                var model = this.model;
                var componentRootEl = this.el;
                componentRootEl.innerHTML = '';
                var stripeKey = model.get('stripeKey');
                var selectedProductId = model.get('selectedProduct');
                var products = model.get('products') || [];
                var selectedProduct = products.find(function (p) { var _a; return ((_a = p.id) === null || _a === void 0 ? void 0 : _a.toString()) === selectedProductId; });
                var htmlContent;
                // Defensive: Only call serviceSignup if selectedProduct is a valid object
                if (!selectedProductId || !selectedProduct || typeof selectedProduct !== 'object') {
                    htmlContent = '<div class="text-center text-gray-500 p-4">Please select a service from the settings panel.</div>';
                }
                else {
                    htmlContent = serviceSignup(selectedProduct);
                }
                componentRootEl.innerHTML = htmlContent;
                if (!stripeKey || !selectedProduct) {
                    console.log('[Service Signup View] Skipping JS init (missing key or product).');
                    return;
                }
                var address1Input = componentRootEl.querySelector('#address1');
                var cityInput = componentRootEl.querySelector('#city');
                var stateInput = componentRootEl.querySelector('#state');
                var zip5Input = componentRootEl.querySelector('#zip5');
                var checkBtn = componentRootEl.querySelector('#check-availability');
                var feedbackDiv = componentRootEl.querySelector('#address-feedback');
                var submitBtn = componentRootEl.querySelector('#submit-button');
                var errorMsgDiv = componentRootEl.querySelector('#error-message');
                var setFeedback = function (msg, color) {
                    if (feedbackDiv) {
                        feedbackDiv.textContent = msg;
                        feedbackDiv.style.color = color;
                    }
                };
                var setSubmitEnabled = function (enabled) {
                    if (submitBtn) {
                        if (enabled) {
                            submitBtn.removeAttribute('disabled');
                            submitBtn.classList.remove('opacity-50');
                        }
                        else {
                            submitBtn.setAttribute('disabled', 'disabled');
                            submitBtn.classList.add('opacity-50');
                        }
                    }
                };
                setSubmitEnabled(false);
                var checkAvailability = function () { return __awaiter(_this, void 0, void 0, function () {
                    var address1, city, state, zip5, resp, errorMsg, errData, e_1, data, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!address1Input || !cityInput || !stateInput || !zip5Input || !checkBtn) {
                                    setFeedback('Internal error: Address fields missing.', '#b91c1c');
                                    return [2 /*return*/];
                                }
                                address1 = address1Input.value.trim();
                                city = cityInput.value.trim();
                                state = stateInput.value.trim();
                                zip5 = zip5Input.value.trim();
                                setFeedback('⏳ Checking...', '#2563eb');
                                setSubmitEnabled(false);
                                checkBtn.disabled = true;
                                if (!address1 || !city || !state || !zip5) {
                                    setFeedback('Please complete all address fields.', '#b91c1c');
                                    checkBtn.disabled = false;
                                    return [2 /*return*/];
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 9, 10, 11]);
                                return [4 /*yield*/, fetch('/api/geocode', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            address: { address1: address1, address2: null, city: city, state: state, zip5: zip5, zip4: null },
                                            zone_id: 1
                                        })
                                    })];
                            case 2:
                                resp = _a.sent();
                                if (!!resp.ok) return [3 /*break*/, 7];
                                errorMsg = 'API error during address check.';
                                _a.label = 3;
                            case 3:
                                _a.trys.push([3, 5, , 6]);
                                return [4 /*yield*/, resp.json()];
                            case 4:
                                errData = _a.sent();
                                errorMsg = errData.error || errorMsg;
                                return [3 /*break*/, 6];
                            case 5:
                                e_1 = _a.sent();
                                return [3 /*break*/, 6];
                            case 6: throw new Error(errorMsg);
                            case 7: return [4 /*yield*/, resp.json()];
                            case 8:
                                data = _a.sent();
                                if (data.inside_zone || data.in_service_area) {
                                    setFeedback('✅ Address is in service area.', '#16a34a');
                                    setSubmitEnabled(true);
                                }
                                else if (data.invalid_address || data.invalid_zip) {
                                    setFeedback('❌ Address appears invalid. Please check.', '#b91c1c');
                                }
                                else if (data.outside_zone || (data.hasOwnProperty('in_service_area') && !data.in_service_area)) {
                                    setFeedback('❌ Address is outside the service area.', '#b91c1c');
                                }
                                else {
                                    setFeedback('❌ Could not validate address eligibility.', '#b91c1c');
                                }
                                return [3 /*break*/, 11];
                            case 9:
                                e_2 = _a.sent();
                                console.error("[Service Signup View] Address Check Error:", e_2);
                                if (e_2 instanceof Error && (e_2.message.includes('Failed to fetch') || e_2.message.includes('timeout'))) {
                                    setFeedback('⚠️ Connection error. Please check network.', '#b91c1c');
                                }
                                else {
                                    setFeedback("\u26A0\uFE0F Error verifying address: ".concat(e_2 instanceof Error ? e_2.message : String(e_2)), '#b91c1c');
                                }
                                return [3 /*break*/, 11];
                            case 10:
                                if (!this._addressValidated) {
                                    if (checkBtn)
                                        checkBtn.disabled = false;
                                }
                                return [7 /*endfinally*/];
                            case 11: return [2 /*return*/];
                        }
                    });
                }); };
                var clearFeedback = function () {
                    setFeedback('', '');
                    setSubmitEnabled(false);
                    if (checkBtn)
                        checkBtn.disabled = !((address1Input === null || address1Input === void 0 ? void 0 : address1Input.value) && (cityInput === null || cityInput === void 0 ? void 0 : cityInput.value) && (stateInput === null || stateInput === void 0 ? void 0 : stateInput.value) && (zip5Input === null || zip5Input === void 0 ? void 0 : zip5Input.value));
                };
                if (checkBtn)
                    checkBtn.addEventListener('click', checkAvailability);
                if (address1Input)
                    address1Input.addEventListener('input', clearFeedback);
                if (cityInput)
                    cityInput.addEventListener('input', clearFeedback);
                if (stateInput)
                    stateInput.addEventListener('input', clearFeedback);
                if (zip5Input)
                    zip5Input.addEventListener('input', clearFeedback);
                this._serviceSignupListeners = { checkAvailability: checkAvailability, clearFeedback: clearFeedback };
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var stripe, stripeInstance, checkout, container, error_2;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, loadStripe(stripeKey)];
                            case 1:
                                stripe = _a.sent();
                                if (!stripe)
                                    throw new Error("Stripe.js failed to load.");
                                stripeInstance = stripe;
                                return [4 /*yield*/, stripeInstance.initEmbeddedCheckout({
                                        fetchClientSecret: function () { return __awaiter(_this, void 0, void 0, function () {
                                            var res, errorData, clientSecret, fetchErr_2;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 5, , 6]);
                                                        return [4 /*yield*/, fetch('/api/stripe/create-checkout-session', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ productId: selectedProduct.id, amount: selectedProduct.price })
                                                            })];
                                                    case 1:
                                                        res = _a.sent();
                                                        if (!!res.ok) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, res.json().catch(function () { return ({}); })];
                                                    case 2:
                                                        errorData = _a.sent();
                                                        throw new Error(errorData.error || "Failed to create checkout session (Status: ".concat(res.status, ")"));
                                                    case 3: return [4 /*yield*/, res.json()];
                                                    case 4:
                                                        clientSecret = (_a.sent()).clientSecret;
                                                        if (!clientSecret)
                                                            throw new Error("Client secret missing from response.");
                                                        return [2 /*return*/, clientSecret];
                                                    case 5:
                                                        fetchErr_2 = _a.sent();
                                                        console.error('[Service Signup View] Error fetching client secret:', fetchErr_2);
                                                        if (errorMsgDiv)
                                                            errorMsgDiv.textContent = "Payment init error: ".concat(fetchErr_2 instanceof Error ? fetchErr_2.message : String(fetchErr_2));
                                                        throw fetchErr_2;
                                                    case 6: return [2 /*return*/];
                                                }
                                            });
                                        }); }
                                    })];
                            case 2:
                                checkout = _a.sent();
                                container = componentRootEl.querySelector('#payment-element');
                                if (container) {
                                    checkout.mount(container);
                                    console.log('[Service Signup View] Stripe Embedded Checkout mounted.');
                                }
                                else {
                                    console.error('[Service Signup View] Mount container #payment-element not found.');
                                    if (errorMsgDiv)
                                        errorMsgDiv.textContent = 'Error: Payment form container not found.';
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                error_2 = _a.sent();
                                console.error('[Service Signup View] Stripe initialization error:', error_2);
                                if (errorMsgDiv)
                                    errorMsgDiv.textContent = "Payment Error: ".concat(error_2 instanceof Error ? error_2.message : String(error_2));
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })();
            },
            onRemove: function () {
                var _a, _b;
                console.log('[Service Signup View] Component removed.');
                var checkBtn = this.el.querySelector('#check-availability');
                var address1Input = this.el.querySelector('#address1');
                if (checkBtn && ((_a = this._serviceSignupListeners) === null || _a === void 0 ? void 0 : _a.checkAvailability)) {
                    checkBtn.removeEventListener('click', this._serviceSignupListeners.checkAvailability);
                }
                if (address1Input && ((_b = this._serviceSignupListeners) === null || _b === void 0 ? void 0 : _b.clearFeedback)) {
                    address1Input.removeEventListener('input', this._serviceSignupListeners.clearFeedback);
                }
                this._serviceSignupListeners = null;
            }
        }
    });
    // Register service validation component
    domc.addType('service-validation', {
        extend: 'component',
        model: {
            defaults: {
                tagName: 'div',
                attributes: { 'data-gjs-type': 'service-validation', class: 'service-validation-wrapper' },
                content: '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>',
                droppable: false,
                stylable: [],
                traits: [
                    {
                        type: 'select',
                        label: 'Select Service',
                        name: 'selectedService',
                        options: [{ id: '', name: 'Select a Service...' }],
                        changeProp: true
                    }
                ],
                stripeKey: null,
                services: [],
                selectedService: '',
                script: function () {
                    // Ensure serviceData is correctly typed if possible, or handle transformation.
                    // For the script tag, this.get('serviceData') likely refers to the selected service.
                    var currentSelectedId = this.get('selectedService');
                    var servicesArray = this.get('services') || [];
                    var serviceData = servicesArray.find(function (s) { return s.id === currentSelectedId; });
                    if (serviceData && typeof window.initServiceValidation === 'function') {
                        // serviceData here should already be ServiceData due to changes in fetchServices
                        window.initServiceValidation(serviceData);
                    }
                    else if (typeof window.initServiceValidation === 'function') {
                        // Fallback or if serviceData is not found/ready
                        window.initServiceValidation({}); // Let initServiceValidation handle empty/invalid
                    }
                },
                title: 'Service Validation & Billing'
            },
            init: function () {
                this.fetchStripeKey();
                this.fetchServices();
                this.listenTo(this, 'change:selectedService', this.handleServiceChange);
            },
            handleServiceChange: function () {
                var selectedServiceId = this.get('selectedService');
                var services = this.get('services') || [];
                var stripeKey = this.get('stripeKey');
                console.log('[Service Validation Model] Service selection changed:', selectedServiceId);
                var newContent = '';
                if (!selectedServiceId) {
                    newContent = '<div class="p-4 text-center text-gray-500">Please select a service from the settings panel.</div>';
                }
                else {
                    var selectedServiceData = services.find(function (s) { var _a; return ((_a = s.id) === null || _a === void 0 ? void 0 : _a.toString()) === selectedServiceId; });
                    if (!selectedServiceData) {
                        newContent = '<div class="p-4 text-center text-red-600">Error: Selected service data not found. Please try re-selecting.</div>';
                    }
                    else {
                        // selectedServiceData is now ServiceData, which serviceValidation expects
                        var serviceDataWithKey = __assign(__assign({}, selectedServiceData), { stripeKey: stripeKey });
                        var validationResult = serviceValidation(serviceDataWithKey);
                        if (validationResult) {
                            newContent = validationResult;
                        }
                        else {
                            // Fallback content if serviceValidation returns undefined/null (though it should return string or error)
                            newContent = '<div class="p-4 text-center text-red-600">Error generating service view.</div>';
                        }
                    }
                }
                this.set('content', newContent);
            },
            fetchStripeKey: function () {
                var _this = this;
                if (this.get('stripeKey'))
                    return;
                fetch('/settings/stripe-api-key')
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error("HTTP error! status: ".concat(response.status));
                    return response.json();
                })
                    .then(function (data) {
                    if (data && data.stripe_api_key) {
                        _this.set('stripeKey', data.stripe_api_key);
                        console.log('[Service Validation Model] Stripe key fetched.');
                        if (_this.get('selectedService')) {
                            _this.handleServiceChange();
                        }
                    }
                    else {
                        console.warn('[Service Validation Model] Stripe key not found in response.');
                        _this.set('stripeKey', null);
                        if (_this.get('selectedService')) {
                            _this.handleServiceChange();
                        }
                    }
                }).catch(function (err) {
                    console.error('[Service Validation Model] Error fetching Stripe key:', err);
                    _this.set('stripeKey', null);
                    if (_this.get('selectedService')) {
                        _this.handleServiceChange();
                    }
                });
            },
            fetchServices: function () {
                var _this = this;
                var _a;
                if (((_a = this.get('services')) === null || _a === void 0 ? void 0 : _a.length) > 0)
                    return;
                console.log('[Service Validation Model] Fetching services...');
                fetch('/api/product/all')
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error("HTTP error! status: ".concat(response.status));
                    return response.text().then(function (text) { return text ? JSON.parse(text) : []; });
                })
                    .then(function (data) {
                    var services = (data || []).map(function (service) { return ({
                        id: service.id || "service_".concat(Date.now(), "_").concat(Math.random()),
                        name: service.name || 'Untitled Service', // Map name to title
                        price: service.price || 0,
                        description: service.description || '',
                        currency: service.currency || 'usd',
                        images: service.images || [],
                        stripe_product_id: service.stripe_product_id // Ensure all fields from ServiceData are covered
                    }); });
                    _this.set('services', services);
                    console.log('[Service Validation Model] Services fetched:', services.length);
                    _this.updateServiceTraitOptions();
                    var content = _this.get('content') || '';
                    if (_this.get('selectedService') && !content.includes('service-validation-container')) {
                        _this.handleServiceChange();
                    }
                }).catch(function (error) {
                    console.error('[Service Validation Model] Error fetching services:', error);
                    _this.set('services', []);
                    _this.updateServiceTraitOptions();
                });
            },
            updateServiceTraitOptions: function () {
                var services = this.get('services') || [];
                var trait = this.getTrait('selectedService');
                if (trait) {
                    var options = services.map(function (service) { return ({
                        id: service.id.toString(),
                        // Use service.title as it's now ServiceData
                        name: "".concat(service.name, " (").concat(formatPrice(service.price, service.currency), ")"),
                        value: service.id.toString()
                    }); });
                    options.unshift({ id: '', name: 'Select a Service...', value: '' });
                    trait.set('options', options);
                    console.log('[Service Validation Model] Service trait options updated.');
                }
                else {
                    console.warn('[Service Validation Model] Could not find selectedService trait to update.');
                }
            },
            toJSON: function (opts) {
                var _a;
                if (opts === void 0) { opts = {}; }
                var obj = domc.getType('default').model.prototype.toJSON.call(this, opts);
                obj.selectedService = this.get('selectedService');
                console.log('[Service Validation Model] toJSON called, content length:', (_a = obj.content) === null || _a === void 0 ? void 0 : _a.length);
                return obj;
            },
        },
        view: {
            events: function () {
                return {
                    'change:selectedService': 'updateScript'
                };
            },
            init: function () {
                this.listenTo(this.model, 'change:content', this.render);
            },
            updateScript: function () {
                var serviceData = this.model.get('serviceData');
                if (serviceData) {
                    this.model.trigger('change:script');
                }
            },
            onRender: function () {
                var model = this.model;
                var componentRootEl = this.el;
                var content = model.get('content') || '';
                componentRootEl.innerHTML = content;
                console.log('[Service Validation View] Rendered content from model.');
            },
            onRemove: function () {
                console.log('[Service Validation View] Component removed.');
            }
        }
    });
    // Register pricing-table component
    pricingTable(editor);
    // Register location-to-address component
    locationToAddress(editor);
    // Register custom image component with srcset support
    // Register custom image component
    domc.addType('image', {
        isComponent: function (el) { return el.tagName === 'IMG'; },
        model: {
            defaults: {
                tagName: 'img',
                attributes: {
                    src: '',
                    alt: '',
                    class: 'gjs-image'
                },
                traits: [
                    'src',
                    'alt',
                    'title'
                ]
            }
        }
    });
};
// Expose serviceValidation globally for use by other components (like pricing table)
window.initServiceValidation = function (data) {
    if (typeof data === 'object' && data !== null) {
        var transformedData = {};
        // Copy common properties, checking types
        if ('id' in data && typeof data.id === 'string') {
            transformedData.id = data.id;
        }
        if ('price' in data && typeof data.price === 'number') {
            transformedData.price = data.price;
        }
        if ('description' in data && typeof data.description === 'string') {
            transformedData.description = data.description;
        }
        if ('images' in data && Array.isArray(data.images)) {
            transformedData.images = data.images;
        }
        if ('currency' in data && typeof data.currency === 'string') {
            transformedData.currency = data.currency;
        }
        if ('stripe_product_id' in data && typeof data.stripe_product_id === 'string') {
            transformedData.stripe_product_id = data.stripe_product_id;
        }
        // Handle the title/name discrepancy
        if ('title' in data && typeof data.title === 'string') {
            transformedData.name = data.title;
        }
        else if ('name' in data && typeof data.name === 'string') {
            // If 'title' is missing but 'name' (from ModalUiServiceData) exists, use 'name' as 'title'
            transformedData.name = data.name;
        }
        // The serviceValidation function (imported from ./service-validation)
        // has its own internal checks for id, price, name.
        serviceValidation(transformedData);
    }
    else {
        console.error("initServiceValidation: Data is not a valid object or is null.", data);
        // Call serviceValidation with an empty object to trigger its internal error handling.
        serviceValidation({});
    }
};
export { formatPrice };
export default components;
