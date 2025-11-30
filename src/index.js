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
import '../../setup/custom-elements-guard';
// import gcsAssetManager from './plugins/gcs-asset-manager'; // To be dynamically imported
// import from './components/funnel-components'; // Consolidated funnel components (commented out - no default export)
import initFunnelComponents from './components/initFunnelComponents.js';
import initChatComponents from './components/chat-components'; // Chat components
// ===== 1. GrapesJS Plugin Definition =====
var plugin = function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    // Merge default and passed options
    var options = __assign({ i18n: {}, tailwindPlayCdn: 'https://cdn.tailwindcss.com/3.3.0', plugins: [
        // Plugins can be added here dynamically
        ], config: { theme: { extend: {} }, content: [], corePlugins: { preflight: false } }, cover: ".object-cover { filter: sepia(1) hue-rotate(190deg) opacity(.46) grayscale(.7) !important; }", changeThemeText: 'Change Theme', openCategory: 'Blog' }, opts);
    // Initialize consolidated funnel components
    initFunnelComponents(editor);
    // Initialize chat components
    initChatComponents(editor);
    // Helper to safely invoke a module's default export (or the module itself if it's a function)
    var invokeDefault = function (mod) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var fnCandidate = (mod && typeof mod === 'object' && 'default' in mod) ? mod.default : mod;
        if (typeof fnCandidate === 'function') {
            try {
                return fnCandidate.apply(void 0, args);
            }
            catch (err) {
                console.error('Failed executing module default export:', err);
            }
        }
        else {
            console.warn('Module does not export a callable default/function:', mod);
        }
        return undefined;
    };
    // Initialize GCS Asset Manager dynamically
    import('./plugins/gcs-asset-manager.js')
        .then(function (mod) { return invokeDefault(mod, editor, options); })
        .catch(function (err) { return console.error('Failed to load GCS Asset Manager:', err); });
    // Register blocks, components, and commands dynamically
    import('./blocks/index.js')
        .then(function (mod) { return invokeDefault(mod, editor, options); })
        .catch(function (err) { return console.error('Failed to load blocks:', err); });
    import('./components/index.js')
        .then(function (mod) { return invokeDefault(mod, editor, options); })
        .catch(function (err) { return console.error('Failed to load components:', err); });
    import('./commands.js')
        .then(function (mod) { return invokeDefault(mod, editor, options); })
        .catch(function (err) { return console.error('Failed to load commands:', err); });
    // Load the OpenAI plugin synchronously so it reliably registers buttons (avoid dynamic import flakiness)
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        var gjsOpenaiModule = require('./plugins/gjs-openai.js');
        var gjsOpenai = (gjsOpenaiModule && gjsOpenaiModule.default) ? gjsOpenaiModule.default : gjsOpenaiModule;
        if (typeof gjsOpenai === 'function') {
            var apiKey = window.OPENAI_API_KEY || '';
            gjsOpenai(editor, { apiKey: apiKey, proxyUrl: window.OPENAI_PROXY || '' });
        }
        else {
            console.info('gjs-openai module loaded but has no callable export');
        }
    }
    catch (err) {
        console.info('gjs-openai plugin not present or failed to load', err);
    }
    // Safely register grapesjs-component-code-editor if present (UMD or ESM build)
    try {
        // First try to require the package (for bundlers/node env)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        var componentCodeEditor = require('grapesjs-component-code-editor');
        if (typeof componentCodeEditor === 'function') {
            componentCodeEditor(editor);
        }
        else if (componentCodeEditor && typeof componentCodeEditor.default === 'function') {
            componentCodeEditor.default(editor);
        }
    }
    catch (e) {
        // If require fails (e.g., running in browser), try to use a global UMD export when available.
        try {
            var winComp = window['grapesjs-component-code-editor'] || window['grapesjsComponentCodeEditor'] || window['grapesjs-component-code-editor'];
            if (typeof winComp === 'function') {
                winComp(editor);
            }
            else if (winComp && typeof winComp.default === 'function') {
                winComp.default(editor);
            }
        }
        catch (_err) {
            // Non-fatal: plugin is optional and may not be present in all environments.
            // eslint-disable-next-line no-console
            console.info('grapesjs-component-code-editor not available, skipping registration');
        }
    }
    // Tailwind CSS injection into iframe
    var appendTailwindCss = function (frame) { return __awaiter(void 0, void 0, void 0, function () {
        var iframe, tailwindPlayCdn, plugins, config, cover, init, script, cssStyle, interval;
        return __generator(this, function (_a) {
            iframe = frame.view.getEl();
            if (!iframe)
                return [2 /*return*/];
            tailwindPlayCdn = options.tailwindPlayCdn, plugins = options.plugins, config = options.config, cover = options.cover;
            init = function () {
                if (iframe.contentWindow) {
                    iframe.contentWindow.tailwind = iframe.contentWindow.tailwind || {};
                    iframe.contentWindow.tailwind.config = config;
                }
            };
            script = document.createElement('script');
            script.src = tailwindPlayCdn + (plugins.length ? "?plugins=".concat(plugins.join(), " ") : '');
            script.onload = init;
            cssStyle = document.createElement('style');
            cssStyle.innerHTML = cover;
            interval = setInterval(function () {
                var doc = iframe.contentDocument;
                if ((doc === null || doc === void 0 ? void 0 : doc.readyState) === 'complete' && doc.head) {
                    doc.head.appendChild(script);
                    doc.head.appendChild(cssStyle);
                    clearInterval(interval);
                }
            }, 100);
            return [2 /*return*/];
        });
    }); };
    // Watch for new frames and inject Tailwind
    editor.Canvas.getModel().on('change:frames', function (_m, framesCollection) {
        var _a;
        (_a = framesCollection.models) === null || _a === void 0 ? void 0 : _a.forEach(function (frame) {
            var _a;
            (_a = frame.once) === null || _a === void 0 ? void 0 : _a.call(frame, 'loaded', function () { return appendTailwindCss(frame); });
        });
    });
    // Safe asset manager command
    editor.Commands.add('show-assets', {
        run: function (ed) {
            var am = ed.AssetManager;
            var container = document.querySelector('.gjs-am-container') || document.querySelector('.gjs-am-assets-cont');
            if (container) {
                container.style.display = 'block';
            }
            else if (typeof am.render === 'function') {
                am.render();
                container = document.querySelector('.gjs-am-container') || document.querySelector('.gjs-am-assets-cont');
                container && (container.style.display = 'block');
            }
            return am;
        }
    });
    // Simple image block
    editor.BlockManager.add('image-block', {
        label: 'Image',
        content: '<div class="gjs-image-container"><img src="https://via.placeholder.com/150" style="width:100%;"/></div>',
        category: options.openCategory,
        attributes: { class: 'fa fa-image' },
        activate: true,
        select: true,
    });
};
// // ===== 2. Initialize GrapesJS =====
// grapesjs.init({
//   container: '#gjs',
//   fromElement: true,
//   height: '100vh',
//   plugins: [plugin],
//   canvas: {
//     styles: [
//       '/static/css/styles.css',
//       'https://js.arcgis.com/4.28/esri/themes/light/main.css',
//       'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
//     ],
//     scripts: [
//       'https://js.arcgis.com/4.28/',
//       'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
//       '/static/js/location-service/dist/index.js',
//       '/static/js/tracker.js',
//       '/static/js/service-modal.js',
//       '/static/js/pricing-table.js',
//     ],
//   },
// });
// Export plugin for external usage if needed
export default plugin;
