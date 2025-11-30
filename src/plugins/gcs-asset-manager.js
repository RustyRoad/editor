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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export default (function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    // Guard against multiple initializations
    if (editor._gcsAssetManagerInitialized) {
        console.warn('GCS Asset Manager Plugin: Attempting to initialize plugin more than once. Skipping subsequent initializations.');
        return;
    }
    editor._gcsAssetManagerInitialized = true;
    console.log('GCS Asset Manager Plugin: Initializing...');
    var options = __assign({
        // Default options
        uploadEndpoint: '/api/v1/assets/upload/image',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        headers: {},
        credentials: 'include',
    }, opts);
    // Use the documented AssetManager uploadFile config for custom upload logic
    var amConfig = editor.AssetManager.getConfig();
    amConfig.uploadFile = function (e) {
        // e can be a DragEvent or an InputEvent
        var files = null;
        if ('dataTransfer' in e && e.dataTransfer) {
            files = e.dataTransfer.files;
        }
        else if ('target' in e && e.target) {
            // e.target is EventTarget, but we need to check if it's an HTMLInputElement
            var input = e.target;
            if (input && input.files) {
                files = input.files;
            }
        }
        if (!files || !files.length)
            return;
        var file = files[0];
        // Validate file type
        if (options.allowedFileTypes && !options.allowedFileTypes.includes(file.type)) {
            editor.trigger('asset:upload:error', "File type ".concat(file.type, " not allowed"));
            return;
        }
        // Validate file size
        if (options.maxFileSize && file.size > options.maxFileSize) {
            editor.trigger('asset:upload:error', "File size exceeds ".concat(options.maxFileSize / 1024 / 1024, "MB limit"));
            return;
        }
        var formData = new FormData();
        formData.append('file', file);
        editor.trigger('asset:upload:start');
        fetch(options.uploadEndpoint || '', {
            method: 'POST',
            body: formData,
            headers: options.headers || {},
            credentials: options.credentials || 'include'
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
            if (!data.original_url || !data.variants) {
                throw new Error('Invalid response format');
            }
            // Compose asset objects for GrapesJS
            var assets = __spreadArray([
                {
                    src: data.original_url,
                    type: file.type,
                    name: file.name,
                    width: 'original',
                    height: 'original',
                    variants: data.variants
                }
            ], data.variants.map(function (variant) { return ({
                src: variant.url,
                type: file.type,
                name: "".concat(file.name, "-").concat(variant.width, "w"),
                width: variant.width,
                height: 'auto'
            }); }), true);
            // GrapesJS expects { data: [...] }
            var response = { data: assets };
            editor.trigger('asset:upload:response', response);
            editor.trigger('asset:upload:end', response);
            // === NEW: Immediately insert image with srcset into the editor ===
            // Find the selected component, or create a new image if none is selected
            var selected = editor.getSelected();
            var imageComponent = null;
            if (selected) {
                if (typeof selected.is === 'function' && selected.is('image')) {
                    // If selected is an image, update it in place
                    imageComponent = selected;
                    editor.select(imageComponent);
                }
                else {
                    // Replace the selected component with a new image at the same position
                    var parent_1 = selected.parent();
                    if (parent_1) {
                        var index = selected.index();
                        // Remove the old component
                        parent_1.remove(selected);
                        // Add the new image at the same index
                        var added = parent_1.append({
                            type: 'image',
                            src: data.original_url
                        }, { at: index });
                        imageComponent = Array.isArray(added) ? added[0] : added;
                        if (imageComponent) {
                            editor.select(imageComponent);
                        }
                    }
                    else {
                        // Fallback: just add a new image to the canvas root
                        var added = editor.Components.addComponent({
                            type: 'image',
                            src: data.original_url
                        });
                        imageComponent = Array.isArray(added) ? added[0] : added;
                        if (imageComponent) {
                            editor.select(imageComponent);
                        }
                    }
                }
            }
            else {
                // Nothing selected, just add a new image to the canvas root
                var added = editor.Components.addComponent({
                    type: 'image',
                    src: data.original_url
                });
                imageComponent = Array.isArray(added) ? added[0] : added;
                if (imageComponent) {
                    editor.select(imageComponent);
                }
            }
            // Build srcset string from variants
            var srcset = data.variants
                .map(function (v) { return "".concat(v.url, " ").concat(v.width, "w"); })
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
            .catch(function (err) {
            editor.trigger('asset:upload:error', err.message);
            editor.trigger('asset:upload:end');
        });
    };
    // Set the upload endpoint in config so the UI shows the upload button
    amConfig.upload = false; // disables default upload, uses uploadFile instead
});
