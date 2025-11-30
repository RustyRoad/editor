// @ts-nocheck
import { EditorBuiltInEvents, Editor, EditorConfig, AssetEvent, AssetManagerConfig, Asset, AssetOpenOptions, AssetProps, Assets, Component } from 'grapesjs';

// Extend AssetManagerConfig from grapesjs to include custom properties used in this plugin
export interface GcsAssetManagerConfig extends AssetManagerConfig {
  uploadEndpoint?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}
// Augment the GrapesJS Editor interface to include our custom property
declare module 'grapesjs' {
  interface Editor {
    _gcsAssetManagerInitialized?: boolean;
  }
}

export default (editor: Editor, opts: EditorConfig = {}) => {
  // Guard against multiple initializations
  if (editor._gcsAssetManagerInitialized) {
    console.warn('GCS Asset Manager Plugin: Attempting to initialize plugin more than once. Skipping subsequent initializations.');
    return;
  }
  editor._gcsAssetManagerInitialized = true;

  console.log('GCS Asset Manager Plugin: Initializing...');
  const options: GcsAssetManagerConfig = {
    ...{
      // Default options
      uploadEndpoint: '/api/v1/assets/upload/image',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      headers: {},
      credentials: 'include',
    },
    ...opts
  };

  // Use the documented AssetManager uploadFile config for custom upload logic
  const amConfig = editor.AssetManager.getConfig();
  amConfig.uploadFile = (e: DragEvent | Event) => {
    // e can be a DragEvent or an InputEvent
    let files: FileList | null = null;
    if ('dataTransfer' in e && e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if ('target' in e && e.target) {
      // e.target is EventTarget, but we need to check if it's an HTMLInputElement
      const input = e.target as HTMLInputElement | null;
      if (input && input.files) {
        files = input.files;
      }
    }
    if (!files || !files.length) return;

    const file = files[0];

    // Validate file type
    if (options.allowedFileTypes && !options.allowedFileTypes.includes(file.type)) {
      editor.trigger('asset:upload:error', `File type ${file.type} not allowed`);
      return;
    }
    // Validate file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      editor.trigger('asset:upload:error', `File size exceeds ${options.maxFileSize / 1024 / 1024}MB limit`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    editor.trigger('asset:upload:start');

    fetch(options.uploadEndpoint || '', {
      method: 'POST',
      body: formData,
      headers: options.headers || {},
      credentials: options.credentials as RequestCredentials || 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (!data.original_url || !data.variants) {
          throw new Error('Invalid response format');
        }
        // Compose asset objects for GrapesJS
        const assets = [
          {
            src: data.original_url,
            type: file.type,
            name: file.name,
            width: 'original',
            height: 'original',
            variants: data.variants
          },
          ...data.variants.map((variant: { url: string; width: number }) => ({
            src: variant.url,
            type: file.type,
            name: `${file.name}-${variant.width}w`,
            width: variant.width,
            height: 'auto'
          }))
        ];
        // GrapesJS expects { data: [...] }
        const response = { data: assets };
        editor.trigger('asset:upload:response', response);
        editor.trigger('asset:upload:end', response);

        // === NEW: Immediately insert image with srcset into the editor ===
        // Find the selected component, or create a new image if none is selected
        const selected = editor.getSelected();
        let imageComponent: Component | null = null;
        if (selected) {
          if (typeof selected.is === 'function' && selected.is('image')) {
            // If selected is an image, update it in place
            imageComponent = selected;
            editor.select(imageComponent);
          } else {
            // Replace the selected component with a new image at the same position
            const parent = selected.parent();
            if (parent) {
              const index = selected.index();
              // Remove the old component
              parent.remove(selected);
              // Add the new image at the same index
              const added = parent.append(
                {
                  type: 'image',
                  src: data.original_url
                },
                { at: index }
              );
              imageComponent = Array.isArray(added) ? added[0] : added;
              if (imageComponent) {
                editor.select(imageComponent);
              }
            } else {
              // Fallback: just add a new image to the canvas root
              const added = editor.Components.addComponent({
                type: 'image',
                src: data.original_url
              });
              imageComponent = Array.isArray(added) ? added[0] : added;
              if (imageComponent) {
                editor.select(imageComponent);
              }
            }
          }
        } else {
          // Nothing selected, just add a new image to the canvas root
          const added = editor.Components.addComponent({
            type: 'image',
            src: data.original_url
          });
          imageComponent = Array.isArray(added) ? added[0] : added;
          if (imageComponent) {
            editor.select(imageComponent);
          }
        }

        // Build srcset string from variants
        const srcset = data.variants
          .map((v: { url: string; width: number }) => `${v.url} ${v.width}w`)
          .join(', ');

        // Set src and srcset attributes
        if (imageComponent && typeof imageComponent.addAttributes === 'function') {
          imageComponent.addAttributes({
            src: data.original_url,
            srcset: srcset
          });
        }

        // Optionally, set sizes attribute for responsive images
        // imageComponent.addAttributes({ sizes: '(max-width: 600px) 480px, 800px' });

        // Optionally, close the asset manager modal if open
        if (editor.AssetManager.isOpen && editor.AssetManager.isOpen()) {
          editor.AssetManager.close();
        }
      })
      .catch(err => {
        editor.trigger('asset:upload:error', err.message);
        editor.trigger('asset:upload:end');
      });
  };

  // Set the upload endpoint in config so the UI shows the upload button
  amConfig.upload = false; // disables default upload, uses uploadFile instead


};