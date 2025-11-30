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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/** Component type constants to avoid magic strings */
export var COMPONENT_TYPES = {
    CHECKOUT_FORM: 'funnel-checkout-form',
    DYNAMIC_HEADLINE: 'dynamic-headline',
    DYNAMIC_CTA_BUTTON: 'dynamic-cta-button',
    PROGRESS: 'funnel-progress',
    TRIPWIRE_CARD: 'tripwire-offer-card',
    UPSELL_CARD: 'upsell-card',
    // Seamless checkout components
    SEAMLESS_CHECKOUT_CONTAINER: 'seamless-checkout-container',
    STEP_ONE_CONFIRMATION: 'step-one-confirmation',
    STEP_TWO_PAYMENT: 'step-two-payment',
    CONTINUE_TO_PAYMENT_BUTTON: 'continue-payment-button',
    CHECKOUT_PROGRESS_INDICATOR: 'checkout-progress-indicator'
};
/** Flow mode constants */
export var FLOW_MODES = {
    REDIRECT: 'redirect',
    VALIDATE_THEN_CHECKOUT: 'validate_then_checkout',
};
/** Input name constants */
export var INPUT_NAMES = {
    OFFER: 'offer',
    TOKEN: 'tok',
    ADDRESS_ID: 'address_id',
    SERVICE_ID: 'service_id',
    EMAIL: 'email',
};
/** Centralized API endpoint paths */
export var API_ENDPOINTS = {
    INITIATE_CHECKOUT: '/api/checkout/initiate',
};
export var formatCurrency = function (cents, currency) {
    if (currency === void 0) { currency = 'USD'; }
    var amount = cents / 100;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    }
    catch (_a) {
        return "$".concat(amount.toFixed(2));
    }
};
var formatOfferType = function (value) {
    if (!value)
        return undefined;
    return value
        .toString()
        .split(/[-_]/)
        .map(function (part) { return part.charAt(0).toUpperCase() + part.slice(1); })
        .join(' ');
};
var parseNumeric = function (value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        var trimmed = value.trim();
        if (!trimmed)
            return undefined;
        var parsed = Number(trimmed);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return undefined;
};
var parseNullableNumeric = function (value) {
    if (value === null)
        return null;
    return parseNumeric(value);
};
export var OFFER_TYPE_BADGE_BASE = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide';
export var OFFER_TYPE_BADGE_COLORS = {
    standard: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'rollover-upsell': 'bg-purple-100 text-purple-700 border border-purple-200',
    'rollover_credits': 'bg-purple-100 text-purple-700 border border-purple-200',
    upsell: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};
var OFFER_TYPE_LABELS = {
    'rollover-upsell': 'Credit Upsell',
    'rollover_credits': 'Credit Upsell',
};
export var getOfferTypePresentation = function (rawType) {
    var normalized = (rawType || 'standard').toLowerCase();
    var label = OFFER_TYPE_LABELS[normalized] || formatOfferType(normalized) || 'Standard';
    var color = OFFER_TYPE_BADGE_COLORS[normalized] || 'bg-slate-100 text-slate-700 border border-slate-200';
    return { normalized: normalized, label: label, className: "".concat(OFFER_TYPE_BADGE_BASE, " ").concat(color) };
};
var normalizeOfferList = function (entries) {
    var list = Array.isArray(entries)
        ? entries
        : Array.isArray(entries === null || entries === void 0 ? void 0 : entries.offers)
            ? entries.offers
            : [];
    return list
        .map(function (item) {
        var _a, _b;
        if (!item || typeof item !== 'object')
            return null;
        var record = item;
        var token = record.link_token ||
            record.token ||
            record.value ||
            record.offer_token ||
            record.id ||
            '';
        var label = record.name ||
            record.offer_name ||
            record.product_name ||
            record.title ||
            record.label ||
            '';
        if (!token || !label)
            return null;
        var rolloverMeta = record.rollover && typeof record.rollover === 'object' && record.rollover !== null
            ? record.rollover
            : undefined;
        var rolloverDescription = rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['description'];
        var rolloverCreditsPerCycle = (_a = rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['credits_per_cycle']) !== null && _a !== void 0 ? _a : rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['creditsPerCycle'];
        var rolloverCap = (_b = rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['rollover_cap']) !== null && _b !== void 0 ? _b : rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['rolloverCap'];
        var pricingMeta = record.pricing && typeof record.pricing === 'object' && record.pricing !== null
            ? record.pricing
            : undefined;
        var description = record.description ||
            record.offer_description ||
            record.product_description ||
            (typeof rolloverDescription === 'string' ? rolloverDescription : undefined);
        var resolvePriceCents = function () {
            var candidates = [
                record.price_cents,
                record.priceCents,
                record.unit_amount_cents,
                record.unitAmountCents,
                record.amount_cents,
                record.amountCents,
                pricingMeta === null || pricingMeta === void 0 ? void 0 : pricingMeta['unit_amount_cents'],
                pricingMeta === null || pricingMeta === void 0 ? void 0 : pricingMeta['unitAmountCents'],
                pricingMeta === null || pricingMeta === void 0 ? void 0 : pricingMeta['amount_cents'],
                pricingMeta === null || pricingMeta === void 0 ? void 0 : pricingMeta['amountCents'],
                rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['unit_amount_cents'],
            ];
            for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
                var value = candidates_1[_i];
                if (typeof value === 'number' && Number.isFinite(value))
                    return Math.round(value);
            }
            if (typeof record.price === 'number' && Number.isFinite(record.price)) {
                return Math.round(record.price * 100);
            }
            if (typeof record.price === 'string') {
                var parsed = parseFloat(record.price.replace(/[^0-9.]/g, ''));
                if (!Number.isNaN(parsed)) {
                    return Math.round(parsed * 100);
                }
            }
            return undefined;
        };
        var priceCents = resolvePriceCents();
        var currencySource = record.currency ||
            record.price_currency ||
            (pricingMeta === null || pricingMeta === void 0 ? void 0 : pricingMeta['currency']) ||
            (rolloverMeta === null || rolloverMeta === void 0 ? void 0 : rolloverMeta['currency']) ||
            'USD';
        var currency = currencySource === null || currencySource === void 0 ? void 0 : currencySource.toString().toUpperCase();
        var offerType = record.offer_type
            ? String(record.offer_type)
            : record.type
                ? String(record.type)
                : record.kind
                    ? String(record.kind)
                    : record.offerType
                        ? String(record.offerType)
                        : undefined;
        var resolveCreditsPerCycle = function () {
            var candidates = [
                record.credits_per_cycle,
                record.creditsPerCycle,
                record.rollover_credits_per_cycle,
                record.rolloverCreditsPerCycle,
                rolloverCreditsPerCycle,
            ];
            for (var _i = 0, candidates_2 = candidates; _i < candidates_2.length; _i++) {
                var candidate = candidates_2[_i];
                var numeric = parseNumeric(candidate);
                if (typeof numeric === 'number') {
                    return Math.round(numeric);
                }
            }
            return undefined;
        };
        var resolveRolloverCap = function () {
            var candidates = [
                record.rollover_cap,
                record.rolloverCap,
                rolloverCap,
            ];
            for (var _i = 0, candidates_3 = candidates; _i < candidates_3.length; _i++) {
                var candidate = candidates_3[_i];
                var numeric = parseNullableNumeric(candidate);
                if (numeric === null) {
                    return null;
                }
                if (typeof numeric === 'number') {
                    return Math.round(numeric);
                }
            }
            return undefined;
        };
        return {
            token: String(token),
            label: String(label),
            description: description ? String(description) : undefined,
            priceCents: priceCents,
            currency: currency,
            offerType: offerType,
            creditsPerCycle: resolveCreditsPerCycle(),
            rolloverCap: resolveRolloverCap(),
        };
    })
        .filter(function (offer) { return Boolean(offer); });
};
var createOfferStore = function () {
    var offers = [];
    var loaded = false;
    var fetchPromise = null;
    var listeners = new Set();
    var notify = function () {
        var meta = { loaded: loaded };
        listeners.forEach(function (listener) {
            try {
                listener(offers, meta);
            }
            catch (err) {
                console.warn('[Funnel Components] Offer listener failed', err);
            }
        });
    };
    var setOffers = function (incoming) {
        offers = normalizeOfferList(incoming);
        loaded = true;
        notify();
        return offers;
    };
    var ensureFetch = function () {
        if (fetchPromise)
            return fetchPromise;
        if (typeof fetch === 'undefined') {
            loaded = true;
            notify();
            return Promise.resolve(offers);
        }
        fetchPromise = fetch('/api/admin/offers/list-simple', {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
            .then(function (response) { return __awaiter(void 0, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json().catch(function () { return []; })];
                    case 1:
                        body = _a.sent();
                        return [2 /*return*/, setOffers(body)];
                }
            });
        }); })
            .catch(function (error) {
            console.warn('[Funnel Components] Failed to load offers', error);
            loaded = true;
            offers = [];
            notify();
            return offers;
        });
        return fetchPromise;
    };
    var getTraitOptions = function () {
        if (!loaded && offers.length === 0) {
            return [{ id: '', value: '', name: 'Loading offers…' }];
        }
        if (offers.length === 0) {
            return [{ id: '', value: '', name: 'No offers available' }];
        }
        return __spreadArray([
            { id: '', value: '', name: 'Select an offer' }
        ], offers.map(function (offer) { return ({
            id: offer.token,
            value: offer.token,
            name: offer.offerType && offer.offerType.toLowerCase() !== 'standard'
                ? "".concat(offer.label, " (").concat(OFFER_TYPE_LABELS[offer.offerType.toLowerCase()] || formatOfferType(offer.offerType), ")")
                : offer.label,
        }); }), true);
    };
    var subscribe = function (listener) {
        listeners.add(listener);
        listener(offers, { loaded: loaded });
        return function () { return listeners.delete(listener); };
    };
    var findByToken = function (token) {
        return token ? offers.find(function (offer) { return offer.token === token; }) : undefined;
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('offers:updated', function (event) {
            try {
                var detail = event.detail;
                setOffers(detail);
            }
            catch (err) {
                console.warn('[Funnel Components] offers:updated handler failed', err);
            }
        });
        if (window.__AVAILABLE_OFFERS__) {
            setOffers(window.__AVAILABLE_OFFERS__);
        }
    }
    return {
        ensureFetch: ensureFetch,
        getTraitOptions: getTraitOptions,
        subscribe: subscribe,
        findByToken: findByToken,
        isLoaded: function () { return loaded; },
        getOffers: function () { return offers.slice(); },
        setOffers: setOffers,
    };
};
export var offerStore = createOfferStore();
export var TRIPWIRE_DEFAULTS = {
    title: 'One-Time Bin Cleaning',
    price: '$29',
    description: 'Professional cleaning of your trash bins. See the difference immediately!',
};
export function gjsSeoFaq(editor, _opts) {
    if (_opts === void 0) { _opts = {}; }
    var dc = editor.DomComponents; // untyped to avoid version-specific type deps
    var bm = editor.BlockManager;
    // ----------------- JSON-LD generator -----------------
    var generateJsonLd = function (faqList) {
        // We rely on data-gjs-type to find components (robust across reloads)
        var items = faqList.find('[data-gjs-type="faq-item"]');
        var entities = [];
        items.forEach(function (item) {
            var qCmp = item.find('[data-gjs-type="faq-question"]')[0];
            var aCmp = item.find('[data-gjs-type="faq-answer"]')[0];
            if (!qCmp || !aCmp)
                return;
            var qText = stripTags(String(qCmp.get('content') || ''));
            var aText = stripTags(String(aCmp.get('content') || ''));
            if (qText && aText) {
                entities.push({
                    '@type': 'Question',
                    name: qText,
                    acceptedAnswer: { '@type': 'Answer', text: aText },
                });
            }
        });
        // Ensure/refresh the JSON-LD <script>
        var scriptCmp = faqList.find('script[type="application/ld+json"].faq-jsonld')[0];
        if (!entities.length) {
            if (scriptCmp)
                scriptCmp.remove();
            return;
        }
        var data = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities };
        var json = JSON.stringify(data, null, 2);
        if (!scriptCmp) {
            scriptCmp = faqList.append({
                type: 'faq-jsonld',
                components: [{ type: 'textnode', content: json }],
            });
        }
        else {
            var kids = scriptCmp.components();
            if (kids.length)
                kids.at(0).set('content', json);
            else
                scriptCmp.append({ type: 'textnode', content: json });
        }
    };
    var debouncedGenerate = debounce(generateJsonLd, 60);
    // ----------------- Types -----------------
    dc.addType('faq-question', {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === 'faq-question' ? { type: 'faq-question' } : false; },
        extend: 'text',
        model: {
            defaults: {
                name: 'FAQ Question',
                tagName: 'summary',
                editable: true,
                draggable: false,
                attributes: { class: 'faq-question', 'data-gjs-type': 'faq-question' },
            },
        },
    });
    dc.addType('faq-answer', {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === 'faq-answer' ? { type: 'faq-answer' } : false; },
        extend: 'text',
        model: {
            defaults: {
                name: 'FAQ Answer',
                tagName: 'div',
                editable: true,
                draggable: false,
                attributes: { class: 'faq-answer', 'data-gjs-type': 'faq-answer' },
            },
        },
    });
    dc.addType('faq-item', {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === 'faq-item' ? { type: 'faq-item' } : false; },
        model: {
            defaults: {
                name: 'FAQ Item',
                tagName: 'details',
                attributes: { class: 'faq-item', 'data-gjs-type': 'faq-item' },
                droppable: false,
                components: [
                    { type: 'faq-question', content: 'What is your return policy?' },
                    {
                        type: 'faq-answer',
                        content: '<p>We accept returns within 30 days of delivery with proof of purchase.</p>',
                    },
                ],
                // Toolbar: add a button to remove and a button to toggle open
                toolbar: [
                    { attributes: { class: 'fa fa-trash' }, command: 'tlb-delete' },
                    {
                        attributes: { class: 'fa fa-chevron-down', title: 'Toggle open' },
                        command: function (ed) {
                            var sel = ed.getSelected();
                            if (!sel)
                                return;
                            var attrs = sel.getAttributes();
                            if (attrs.open)
                                sel.removeAttributes('open');
                            else
                                sel.addAttributes({ open: true });
                        },
                    },
                ],
            },
        },
    });
    dc.addType('faq-jsonld', {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === 'faq-jsonld' ? { type: 'faq-jsonld' } : false; },
        model: {
            defaults: {
                name: 'FAQ JSON-LD',
                tagName: 'script',
                attributes: {
                    type: 'application/ld+json',
                    class: 'faq-jsonld',
                    'data-gjs-type': 'faq-jsonld',
                },
                editable: false,
                copyable: false,
                selectable: false,
                draggable: false,
                highlightable: false,
                layerable: false,
            },
        },
    });
    dc.addType('faq-list', {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === 'faq-list' ? { type: 'faq-list' } : false; },
        model: {
            defaults: {
                name: 'FAQ (SEO)',
                tagName: 'section',
                attributes: {
                    class: 'faq',
                    'aria-label': 'Frequently Asked Questions',
                    'data-gjs-type': 'faq-list',
                },
                droppable: '[data-gjs-type="faq-item"]',
                components: [
                    {
                        type: 'text',
                        tagName: 'h2',
                        attributes: { class: 'faq-title' },
                        content: 'Frequently Asked Questions',
                    },
                    { type: 'faq-item' },
                    {
                        type: 'faq-item',
                        components: [
                            { type: 'faq-question', content: 'Do you ship internationally?' },
                            { type: 'faq-answer', content: '<p>Yes, we ship internationally.</p>' },
                        ],
                    },
                ],
                traits: [
                    { type: 'text', label: 'Title', name: 'faqTitle', changeProp: true },
                ],
                faqTitle: 'Frequently Asked Questions',
                // Toolbar: add item + rebuild JSON-LD
                toolbar: [
                    {
                        attributes: { class: 'fa fa-plus', title: 'Add FAQ Item' },
                        command: 'faq-add-item',
                    },
                    {
                        attributes: { class: 'fa fa-refresh', title: 'Rebuild JSON-LD' },
                        command: 'faq-jsonld-rebuild',
                    },
                ],
            },
            init: function () {
                // Sync JSON-LD on create
                // `this` is the model instance; cast to Component for the generator's type
                var self = this;
                generateJsonLd(self);
                self.on('change:faqTitle', function () {
                    var h = self.find('.faq-title')[0];
                    if (h)
                        h.set('content', self.get('faqTitle') || 'Frequently Asked Questions');
                });
            },
        },
    });
    // ----------------- Styles -----------------
    editor.addStyle("\n    section.faq { max-width: 800px; margin: 20px auto; line-height: 1.6; }\n    section.faq .faq-title { margin: 0 0 12px; }\n    section.faq details.faq-item { border: 1px solid #ddd; border-radius: 6px; padding: .5rem 1rem; margin-bottom: .5rem; }\n    section.faq summary.faq-question { font-weight: 600; cursor: pointer; outline: none; }\n    section.faq details[open] .faq-answer { margin-top: .5rem; }\n  ");
    // ----------------- Commands -----------------
    editor.Commands.add('faq-add-item', {
        run: function (ed) {
            var sel = ed.getSelected();
            var list = sel && (sel.get('type') === 'faq-list'
                ? sel
                : (sel.closest && sel.closest('[data-gjs-type="faq-list"]')));
            if (!list)
                return;
            var item = list.append({ type: 'faq-item' });
            // Focus question for quick editing
            var q = item.find('[data-gjs-type="faq-question"]')[0];
            if (q)
                ed.select(q);
            generateJsonLd(list);
        },
    });
    editor.Commands.add('faq-jsonld-rebuild', {
        run: function (ed) {
            var sel = ed.getSelected();
            var node = sel && (sel.get('type') === 'faq-list'
                ? sel
                : (sel.closest && sel.closest('[data-gjs-type="faq-list"]')));
            if (node)
                generateJsonLd(node);
        },
    });
    // ----------------- Block -----------------
    bm.add('seo-faq', {
        label: 'SEO FAQ',
        category: 'SEO / Structured Data',
        media: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 6h16v2H4V6zm0 5h16v-2zm0 5h10v2H4v-2z"/></svg>',
        content: { type: 'faq-list' },
    });
    // ----------------- Keep JSON-LD in sync -----------------
    var shouldSync = function (cmp) {
        var t = cmp.get('type');
        return t === 'faq-item' || t === 'faq-question' || t === 'faq-answer';
    };
    var syncFrom = function (cmp) {
        if (!cmp || !cmp.closest)
            return;
        var faqList = cmp.closest('[data-gjs-type="faq-list"]');
        if (faqList)
            debouncedGenerate(faqList);
    };
    editor.on('component:add', function (cmp) { return shouldSync(cmp) && syncFrom(cmp); });
    editor.on('component:remove', function (cmp) { return shouldSync(cmp) && syncFrom(cmp); });
    editor.on('component:update', function (cmp) { return shouldSync(cmp) && syncFrom(cmp); });
}
var TYPES = {
    GROUP: 'aeo-answer-group',
    CARD: 'aeo-answer-card',
    JSONLD: 'aeo-jsonld',
    DATACARD: 'aeo-data',
};
var stripTags = function (html) {
    if (html === void 0) { html = ''; }
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};
var nowISO = function () { return new Date().toISOString(); };
var debounce = function (fn, wait) {
    if (wait === void 0) { wait = 80; }
    var t;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(t);
        t = setTimeout(function () { return fn.apply(void 0, args); }, wait);
    };
};
// Parse trait text areas into arrays
var lines = function (v) {
    return (v || '')
        .split(/\r?\n/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
};
// Parse "Title | URL | Publisher | YYYY-MM-DD"
function parseSources(raw) {
    return lines(raw).map(function (ln) {
        var parts = ln.split('|').map(function (p) { return p.trim(); });
        var name = parts[0], url = parts[1], publisher = parts[2], datePublished = parts[3];
        var obj = {};
        if (name)
            obj.name = name;
        if (url)
            obj.url = url;
        if (publisher)
            obj.publisher = { '@type': 'Organization', name: publisher };
        if (datePublished)
            obj.datePublished = datePublished;
        obj['@type'] = 'CreativeWork';
        return obj;
    });
}
function gatherCardData(card) {
    var q = card.find('[data-role="question"]')[0];
    var a = card.find('[data-role="tldr"]')[0];
    var factsCmp = card.find('[data-role="facts"]')[0];
    var authorName = card.get('authorName') || '';
    var authorUrl = card.get('authorUrl') || '';
    var authorTitle = card.get('authorTitle') || '';
    var keywords = (card.get('keywords') || '').toString();
    var entities = (card.get('entities') || '').toString();
    var dateModified = card.get('dateModified') || nowISO();
    var sourcesRaw = card.get('sourcesRaw') || '';
    var facts = factsCmp
        ? factsCmp.components().map(function (li) { return stripTags(String(li.get('content') || '')); }).filter(Boolean)
        : [];
    return {
        question: stripTags(String((q === null || q === void 0 ? void 0 : q.get('content')) || '')),
        answer: stripTags(String((a === null || a === void 0 ? void 0 : a.get('content')) || '')),
        facts: facts,
        keywords: keywords,
        entities: entities,
        dateModified: dateModified,
        author: authorName
            ? __assign(__assign({ '@type': 'Person', name: authorName }, (authorUrl ? { url: authorUrl } : {})), (authorTitle ? { jobTitle: authorTitle } : {})) : undefined,
        citations: parseSources(String(sourcesRaw)),
    };
}
function buildFAQPage(cards) {
    var mainEntity = cards
        .filter(function (c) { return c.question && c.answer; })
        .map(function (c) {
        var _a;
        var q = {
            '@type': 'Question',
            name: c.question,
            acceptedAnswer: __assign(__assign(__assign({ '@type': 'Answer', text: c.answer }, (c.author ? { author: c.author } : {})), { dateModified: c.dateModified }), (((_a = c.citations) === null || _a === void 0 ? void 0 : _a.length) ? { citation: c.citations } : {})),
        };
        if (c.keywords)
            q.keywords = c.keywords;
        if (c.entities) {
            var aboutEntries = c.entities
                .split(',')
                .map(function (raw) { return ({ '@type': 'Thing', name: raw.trim() }); })
                .filter(function (entry) { return Boolean(entry.name); });
            q.about = aboutEntries;
        }
        return q;
    });
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: mainEntity,
    };
}
export function gjsAeo(editor, _opts) {
    if (_opts === void 0) { _opts = {}; }
    var dc = editor.DomComponents;
    var bm = editor.BlockManager;
    // ============ AEO Answer Card ============
    dc.addType(TYPES.CARD, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === TYPES.CARD ? { type: TYPES.CARD } : false; },
        model: {
            defaults: {
                name: 'AEO Answer Card',
                tagName: 'section',
                attributes: {
                    class: 'aeo-card max-w-2xl mx-auto my-4 p-4 sm:p-6 rounded-lg border border-gray-200 bg-white',
                    'data-gjs-type': TYPES.CARD,
                },
                components: [
                    {
                        type: 'text',
                        tagName: 'h3',
                        attributes: {
                            class: 'text-xl sm:text-2xl font-bold mb-2',
                            'data-role': 'question',
                        },
                        content: 'What is AEO (Answer Engine Optimization)?',
                    },
                    {
                        type: 'text',
                        tagName: 'p',
                        attributes: {
                            class: 'text-gray-900 text-base sm:text-lg mb-3',
                            'data-role': 'tldr',
                        },
                        // ~50–80 words works well for “direct answer” extractions in AI UIs.
                        content: 'AEO is the practice of structuring content so AI systems can extract a concise, source-backed answer. It emphasizes a short TL;DR, clearly labeled facts, citations with canonical URLs, author expertise, and a recent “updated” timestamp — all mirrored in JSON-LD.',
                    },
                    {
                        tagName: 'ul',
                        attributes: {
                            class: 'list-disc pl-5 text-gray-700 text-sm sm:text-base mb-4',
                            'data-role': 'facts',
                        },
                        components: [
                            { type: 'text', tagName: 'li', content: 'Concise, unambiguous definition.' },
                            { type: 'text', tagName: 'li', content: '3–5 bullet “key facts”.' },
                            { type: 'text', tagName: 'li', content: 'Citations from authoritative sources.' },
                        ],
                    },
                    {
                        tagName: 'div',
                        attributes: { class: 'text-xs text-gray-600 mb-4', 'data-role': 'byline' },
                        components: [
                            {
                                type: 'text',
                                tagName: 'div',
                                attributes: { 'data-role': 'author' },
                                content: 'By <strong data-role="author-name">Your Name</strong> — <span data-role="author-title">Your Title</span>',
                            },
                            {
                                type: 'text',
                                tagName: 'div',
                                attributes: { 'data-role': 'updated' },
                                content: 'Updated <time data-role="updated-time" datetime="{{ ctx.updated_at | default(value="" , boolean=true) }}">{{ ctx.updated_at | default(value="2025-01-01", boolean=true) }}</time>',
                            },
                        ],
                    },
                    {
                        tagName: 'div',
                        attributes: { 'data-role': 'sources-block' },
                        components: [
                            {
                                type: 'text',
                                tagName: 'h4',
                                attributes: { class: 'font-semibold mb-1' },
                                content: 'Sources',
                            },
                            {
                                tagName: 'ol',
                                attributes: {
                                    class: 'list-decimal pl-5 text-sm sm:text-base',
                                    'data-role': 'sources',
                                },
                                components: [
                                    {
                                        type: 'text',
                                        tagName: 'li',
                                        content: '<a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" rel="canonical nofollow">Google: Helpful, reliable, people-first content</a>',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                traits: [
                    { type: 'text', name: 'question', label: 'Question', changeProp: true },
                    { type: 'textarea', name: 'tldr', label: 'TL;DR (concise answer)', changeProp: true },
                    { type: 'textarea', name: 'factsRaw', label: 'Facts (1 per line)', changeProp: true },
                    { type: 'text', name: 'keywords', label: 'Keywords (comma‑sep)', changeProp: true },
                    { type: 'text', name: 'entities', label: 'Entities (comma‑sep)', changeProp: true },
                    { type: 'text', name: 'authorName', label: 'Author Name', changeProp: true },
                    { type: 'text', name: 'authorTitle', label: 'Author Title', changeProp: true },
                    { type: 'text', name: 'authorUrl', label: 'Author URL', changeProp: true },
                    { type: 'text', name: 'dateModified', label: 'Updated ISO', changeProp: true },
                    {
                        type: 'textarea',
                        name: 'sourcesRaw',
                        label: 'Sources (Title | URL | Publisher | YYYY-MM-DD)',
                        changeProp: true,
                    },
                ],
                // Pre-populate trait values from default content
                question: 'What is AEO (Answer Engine Optimization)?',
                tldr: 'AEO is the practice of structuring content so AI systems can extract a concise, source-backed answer. It emphasizes a short TL;DR, clearly labeled facts, citations with canonical URLs, author expertise, and a recent “updated” timestamp — all mirrored in JSON-LD.',
                factsRaw: 'Concise, unambiguous definition.\n3–5 bullet “key facts”.\nCitations from authoritative sources.',
                keywords: 'AEO, Answer Engine Optimization, AI Overviews',
                entities: 'Answer Engine Optimization, Google AI Overviews, LLMs',
                authorName: 'Your Name',
                authorTitle: 'Editor',
                authorUrl: '',
                dateModified: '{{ ctx.updated_at | default(value="2025-01-01T00:00:00Z", boolean=true) }}',
                sourcesRaw: 'Google helpful content | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | Google | 2024-12-01',
            },
            init: function () {
                var _this = this;
                // Keep visible HTML synced with trait edits
                this.on('change:question change:tldr change:factsRaw change:authorName change:authorTitle change:authorUrl change:dateModified change:sourcesRaw', this.syncFromTraits);
                setTimeout(function () { return _this.syncFromTraits(); }, 0);
            },
            syncFromTraits: function () {
                var q = (this.get('question') || '').toString();
                var a = (this.get('tldr') || '').toString();
                var facts = lines(this.get('factsRaw'));
                var authorName = (this.get('authorName') || '').toString();
                var authorTitle = (this.get('authorTitle') || '').toString();
                var authorUrl = (this.get('authorUrl') || '').toString();
                var dateModified = (this.get('dateModified') || '').toString();
                var sources = parseSources(String(this.get('sourcesRaw') || ''));
                var qCmp = this.find('[data-role="question"]')[0];
                qCmp && qCmp.set('content', q || 'Question');
                var aCmp = this.find('[data-role="tldr"]')[0];
                aCmp && aCmp.set('content', a || 'Short, direct answer.');
                var factsCmp = this.find('[data-role="facts"]')[0];
                if (factsCmp) {
                    factsCmp.components().reset(facts.map(function (f) { return ({ type: 'text', tagName: 'li', content: f }); }));
                }
                var authorNameNode = this.find('[data-role="author-name"]')[0];
                authorNameNode && authorNameNode.set('content', authorName || 'Your Name');
                var authorTitleNode = this.find('[data-role="author-title"]')[0];
                authorTitleNode && authorTitleNode.set('content', authorTitle || 'Editor');
                var authorLinkTarget = this.find('[data-role="author"]')[0];
                if (authorLinkTarget) {
                    var html = authorUrl
                        ? "By <a href=\"".concat(authorUrl, "\" rel=\"me nofollow\"><strong data-role=\"author-name\">").concat(authorName || 'Your Name', "</strong></a> \u2014 <span data-role=\"author-title\">").concat(authorTitle || 'Editor', "</span>")
                        : "By <strong data-role=\"author-name\">".concat(authorName || 'Your Name', "</strong> \u2014 <span data-role=\"author-title\">").concat(authorTitle || 'Editor', "</span>");
                    authorLinkTarget.set('content', html);
                }
                var time = this.find('[data-role="updated-time"]')[0];
                if (time) {
                    time.addAttributes({ datetime: dateModified });
                    time.set('content', dateModified);
                }
                var srcList = this.find('[data-role="sources"]')[0];
                if (srcList) {
                    var items = sources.map(function (s) {
                        var _a;
                        var title = s.name || s.url || 'Source';
                        var pub = ((_a = s.publisher) === null || _a === void 0 ? void 0 : _a.name) ? " <span class=\"text-gray-500\">(".concat(s.publisher.name, ")</span>") : '';
                        return {
                            type: 'text',
                            tagName: 'li',
                            content: s.url
                                ? "<a href=\"".concat(s.url, "\" rel=\"canonical nofollow\">").concat(title, "</a>").concat(pub)
                                : "".concat(title).concat(pub),
                        };
                    });
                    srcList.components().reset(items);
                }
                // Let the group rebuild aggregated JSON-LD
                this.emit('aeo:changed');
            },
        },
    });
    // ============ AEO Answer Group (aggregator) ============
    dc.addType(TYPES.GROUP, {
        isComponent: function (el) { var _a; return ((_a = el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, 'data-gjs-type')) === TYPES.GROUP ? { type: TYPES.GROUP } : false; },
        model: {
            defaults: {
                name: 'AEO Answer Group',
                tagName: 'section',
                attributes: {
                    class: 'aeo-group mx-auto my-6',
                    'data-gjs-type': TYPES.GROUP,
                    'aria-label': 'Answers',
                },
                droppable: "[data-gjs-type=\"".concat(TYPES.CARD, "\"]"),
                components: [
                    {
                        type: 'text',
                        tagName: 'h2',
                        attributes: { class: 'text-2xl sm:text-3xl font-extrabold mb-3 aeo-title' },
                        content: '{{ ctx.title | default(value="Answers & Key Facts", boolean=true) }}',
                    },
                    // Script containers auto-managed
                ],
                traits: [
                    { type: 'text', name: 'title', label: 'Group Title', changeProp: true },
                    { type: 'text', name: 'pageKeywords', label: 'Page Keywords', changeProp: true },
                    { type: 'text', name: 'pageEntities', label: 'Page Entities', changeProp: true },
                ],
                title: 'Answers & Key Facts',
                pageKeywords: '',
                pageEntities: '',
            },
            init: function () {
                var _this = this;
                var rebuild = debounce(function () { return _this.rebuildJsonLd(); }, 80);
                this.rebuildJsonLd = function () {
                    var cards = _this.find("[data-gjs-type=\"".concat(TYPES.CARD, "\"]"));
                    var data = cards.map(gatherCardData).filter(function (c) { return c.question && c.answer; });
                    // FAQPage JSON-LD
                    var faq = buildFAQPage(data);
                    // Extra machine-readable “data card”
                    var dataCard = __assign(__assign({ '@type': 'Dataset', name: _this.get('title') || 'Answers', version: '1', items: data.map(function (d) { return ({
                            question: d.question,
                            answer: d.answer,
                            facts: d.facts,
                            keywords: d.keywords,
                            entities: d.entities,
                            dateModified: d.dateModified,
                            citations: d.citations,
                        }); }) }, (_this.get('pageKeywords') ? { keywords: _this.get('pageKeywords') } : {})), (_this.get('pageEntities')
                        ? { about: _this.get('pageEntities').split(',').map(function (x) { return x.trim(); }).filter(Boolean) }
                        : {}));
                    // Ensure/refresh script nodes
                    var json = _this.find("script.".concat(TYPES.JSONLD))[0];
                    if (!json) {
                        json = _this.append({
                            type: 'script',
                            tagName: 'script',
                            attributes: { type: 'application/ld+json', class: TYPES.JSONLD },
                            components: [{ type: 'textnode', content: JSON.stringify(faq, null, 2) }],
                        });
                    }
                    else {
                        var kids = json.components();
                        if (kids.length)
                            kids.at(0).set('content', JSON.stringify(faq, null, 2));
                    }
                    var dataScript = _this.find("script.".concat(TYPES.DATACARD))[0];
                    if (!dataScript) {
                        dataScript = _this.append({
                            type: 'script',
                            tagName: 'script',
                            attributes: { type: 'application/json', class: TYPES.DATACARD },
                            components: [{ type: 'textnode', content: JSON.stringify(dataCard, null, 2) }],
                        });
                    }
                    else {
                        var kids = dataScript.components();
                        if (kids.length)
                            kids.at(0).set('content', JSON.stringify(dataCard, null, 2));
                    }
                };
                // Initial build and listeners
                this.on('change:title change:pageKeywords change:pageEntities', rebuild);
                this.listenTo(this.components(), 'add remove', rebuild);
                // Rebuild when any child card signals change
                this.on('component:add', function (cmp) {
                    if (cmp.get('type') === TYPES.CARD) {
                        cmp.on('aeo:changed', rebuild);
                    }
                });
                this.on('component:update', function (cmp) {
                    if (cmp.get('type') === TYPES.CARD)
                        _this.rebuildJsonLd();
                });
                setTimeout(function () { return _this.rebuildJsonLd(); }, 0);
            },
            updated: function (property) {
                if (property === 'components') {
                    this.rebuildJsonLd();
                }
            },
        },
    });
    // ============ Block Manager ============
    bm.add(TYPES.GROUP, {
        label: 'AEO Answer Group',
        category: 'AEO',
        attributes: { class: 'fa fa-comments' },
        content: { type: TYPES.GROUP, components: [{ type: TYPES.CARD }] },
    });
    bm.add(TYPES.CARD, {
        label: 'AEO Answer Card',
        category: 'AEO',
        attributes: { class: 'fa fa-commenting-o' },
        content: { type: TYPES.CARD },
    });
    // Small style helpers
    editor.addStyle("\n    .aeo-card a { text-decoration: underline; }\n    .aeo-card .list-disc li { margin-bottom: .25rem; }\n  ");
}
// Optional UMD auto-register (keep only if you use <script> tags)
// if (typeof window !== 'undefined' && (window as any).grapesjs) {
//   (window as any).grapesjs.plugins.add('gjs-aeo', gjsAeo);
// }
