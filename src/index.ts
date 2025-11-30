import '../../setup/custom-elements-guard';
import grapesjs, { Editor } from 'grapesjs';
// import loadBlocks from './blocks'; // To be dynamically imported
// import loadCommands from './commands'; // To be dynamically imported
// import loadComponents from './components'; // To be dynamically imported
import { AssetManagerConfig } from 'grapesjs';
// import gcsAssetManager from './plugins/gcs-asset-manager'; // To be dynamically imported
// import from './components/funnel-components'; // Consolidated funnel components (commented out - no default export)
import initFunnelComponents from './components/initFunnelComponents.js';
import initChatComponents from './components/chat-components'; // Chat components

// Add this single declaration so TypeScript recognizes the CommonJS `require` used below.
declare const require: any;

// ===== 1. GrapesJS Plugin Definition =====
const plugin = (editor: Editor, opts: Record<string, any> = {}) => {
  // Merge default and passed options
  const options = {
    i18n: {},
    tailwindPlayCdn: 'https://cdn.tailwindcss.com/3.3.0',
    plugins: [
      // Plugins can be added here dynamically
    ],
    config: { theme: { extend: {} }, content: [], corePlugins: { preflight: false } },
    cover: `.object-cover { filter: sepia(1) hue-rotate(190deg) opacity(.46) grayscale(.7) !important; }`,
    changeThemeText: 'Change Theme',
    openCategory: 'Blog',
    ...opts,
  };

  // Initialize consolidated funnel components
  initFunnelComponents(editor);

  // Initialize chat components
  initChatComponents(editor);

  // Helper to safely invoke a module's default export (or the module itself if it's a function)
  const invokeDefault = (mod: any, ...args: any[]) => {
    const fnCandidate = (mod && typeof mod === 'object' && 'default' in mod) ? (mod as any).default : mod;
    if (typeof fnCandidate === 'function') {
      try {
        return fnCandidate(...args);
      } catch (err) {
        console.error('Failed executing module default export:', err);
      }
    } else {
      console.warn('Module does not export a callable default/function:', mod);
    }
    return undefined;
  };

  // Initialize GCS Asset Manager dynamically
  import('./plugins/gcs-asset-manager.js')
    .then(mod => invokeDefault(mod, editor, options as AssetManagerConfig))
    .catch(err => console.error('Failed to load GCS Asset Manager:', err));

  // Register blocks, components, and commands dynamically
  import('./blocks/index.js')
    .then(mod => invokeDefault(mod, editor, options))
    .catch(err => console.error('Failed to load blocks:', err));

  import('./components/index.js')
    .then(mod => invokeDefault(mod, editor, options))
    .catch(err => console.error('Failed to load components:', err));

  import('./commands.js')
    .then(mod => invokeDefault(mod, editor, options))
    .catch(err => console.error('Failed to load commands:', err));

  // Load the OpenAI plugin synchronously so it reliably registers buttons (avoid dynamic import flakiness)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const gjsOpenaiModule = require('./plugins/gjs-openai.ts');
    const gjsOpenai = (gjsOpenaiModule && gjsOpenaiModule.default) ? gjsOpenaiModule.default : gjsOpenaiModule;
    if (typeof gjsOpenai === 'function') {
      const apiKey = (window as any).OPENAI_API_KEY || '';
      gjsOpenai(editor, { apiKey, proxyUrl: (window as any).OPENAI_PROXY || '' });
    } else {
      console.info('gjs-openai module loaded but has no callable export');
    }
  } catch (err) {
    console.info('gjs-openai plugin not present or failed to load', err);
  }

  // Safely register grapesjs-component-code-editor if present (UMD or ESM build)
  try {
    // First try to require the package (for bundlers/node env)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const componentCodeEditor = require('grapesjs-component-code-editor');
    if (typeof componentCodeEditor === 'function') {
      componentCodeEditor(editor);
    } else if (componentCodeEditor && typeof componentCodeEditor.default === 'function') {
      componentCodeEditor.default(editor);
    }
  } catch (e) {
    // If require fails (e.g., running in browser), try to use a global UMD export when available.
    try {
      const winComp = (window as any)['grapesjs-component-code-editor'] || (window as any)['grapesjsComponentCodeEditor'] || (window as any)['grapesjs-component-code-editor'];
      if (typeof winComp === 'function') {
        winComp(editor);
      } else if (winComp && typeof winComp.default === 'function') {
        winComp.default(editor);
      }
    } catch (_err) {
      // Non-fatal: plugin is optional and may not be present in all environments.
      // eslint-disable-next-line no-console
      console.info('grapesjs-component-code-editor not available, skipping registration');
    }
  }

  // Tailwind CSS injection into iframe
  const appendTailwindCss = async (frame: any) => {
    const iframe = frame.view.getEl();
    if (!iframe) return;
    const { tailwindPlayCdn, plugins, config, cover } = options;
    const init = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.tailwind = iframe.contentWindow.tailwind || {};
        iframe.contentWindow.tailwind.config = config;
      }
    };
    const script = document.createElement('script');
    script.src = tailwindPlayCdn + (plugins.length ? `?plugins=${plugins.join()} ` : '');
    script.onload = init;
    const cssStyle = document.createElement('style');
    cssStyle.innerHTML = cover;
    const interval = setInterval(() => {
      const doc = iframe.contentDocument;
      if (doc?.readyState === 'complete' && doc.head) {
        doc.head.appendChild(script);
        doc.head.appendChild(cssStyle);
        clearInterval(interval);
      }
    }, 100);
  };

  // Watch for new frames and inject Tailwind
  (editor.Canvas.getModel() as any).on('change:frames', (_m: any, framesCollection: any) => {
    framesCollection.models?.forEach((frame: any) => {
      frame.once?.('loaded', () => appendTailwindCss(frame));
    });
  });

  // Safe asset manager command
  editor.Commands.add('show-assets', {
    run: (ed) => {
      const am = ed.AssetManager;
      let container = document.querySelector('.gjs-am-container') || document.querySelector('.gjs-am-assets-cont');
      if (container) {
        (container as HTMLElement).style.display = 'block';
      } else if (typeof am.render === 'function') {
        am.render();
        container = document.querySelector('.gjs-am-container') || document.querySelector('.gjs-am-assets-cont');
        container && ((container as HTMLElement).style.display = 'block');
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
