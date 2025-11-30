declare module '../components/payment-handler' {
  export const initializeStripeElements: any;
  export const handlePaymentSubmit: any;
}

// Ambient module declarations for editor dynamic JS modules so TS doesn't error.
// These can be incrementally replaced with real type definitions as files are migrated to TS.
// NOTE: Module specifiers must match the exact import strings used in code (e.g. './locale/en.js').
declare module './locale/en.js' {
  const en: Record<string, any>;
  export default en;
}

declare module './blocks/index.js' {
  const initBlocks: (editor: any, options?: any) => void;
  export default initBlocks;
}

declare module './commands.js' {
  const initCommands: (editor: any, options?: any) => void;
  export default initCommands;
}

declare module './plugins/gcs-asset-manager.js' {
  import { AssetManagerConfig } from 'grapesjs';
  const gcsAssetManager: (editor: any, options?: AssetManagerConfig) => void;
  export default gcsAssetManager;
}

declare module './plugins/gjs-openai.js' {
  const gjsOpenai: (editor: any, opts?: { apiKey?: string; proxyUrl?: string }) => void;
  export default gjsOpenai;
}

// Extensionless imports used in some TS files (e.g., gjs-openai.ts)
declare module '../blocks' {
  const registerBlocks: (editor: any, opts?: any, openBlock?: any) => void;
  export default registerBlocks;
}


