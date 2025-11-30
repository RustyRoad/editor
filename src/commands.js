//import purify from './purifycss'
var themeList = [
    { name: 'slate', color: '#64748b' },
    { name: 'gray', color: '#6b7280' },
    { name: 'zinc', color: '#71717a' },
    { name: 'neutral', color: '#737373' },
    { name: 'stone', color: '#78716c' },
    { name: 'red', color: '#ef4444' },
    { name: 'orange', color: '#f97316' },
    { name: 'amber', color: '#f59e0b' },
    { name: 'yellow', color: '#eab308' },
    { name: 'lime', color: '#84cc16' },
    { name: 'green', color: '#22c55e' },
    { name: 'emerald', color: '#10b981' },
    { name: 'teal', color: '#14b8a6' },
    { name: 'cyan', color: '#06b6d4' },
    { name: 'sky', color: '#0ea5e9' },
    { name: 'blue', color: '#3b82f6' },
    { name: 'indigo', color: '#6366f1' },
    { name: 'violet', color: '#8b5cf6' },
    { name: 'purple', color: '#a855f7' },
    { name: 'fuchsia', color: '#d946ef' },
    { name: 'pink', color: '#ec4899' },
    { name: 'rose', color: '#f43f5e' },
];
var colorRegex = new RegExp(/(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emarald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d\d\d)/, "g");
var getUpdateThemeModal = function (editor) {
    var md = editor.Modal;
    var pfx = editor.getConfig().stylePrefix;
    var container = document.createElement('div');
    var containerBody = document.createElement('div');
    containerBody.style.padding = '40px 0px';
    containerBody.style.display = 'flex';
    containerBody.style.justifyContent = 'center';
    containerBody.style.flexWrap = 'wrap';
    var selectedTheme;
    themeList.forEach(function (theme) {
        var btnColor = document.createElement('button');
        btnColor.className = 'change-theme-button';
        btnColor.style.backgroundColor = theme.color;
        btnColor.onclick = function () { return (selectedTheme = theme); };
        containerBody.appendChild(btnColor);
    });
    var containerFooter = document.createElement('div');
    var btnEdit = document.createElement('button');
    btnEdit.innerHTML = 'Update';
    btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import';
    btnEdit.style.float = 'right';
    btnEdit.onclick = function () {
        updateThemeColor(editor, selectedTheme.name);
        md.close();
    };
    // box-shadow: 0 0 0 2pt #c5c5c575
    containerFooter.appendChild(btnEdit);
    container.appendChild(containerBody);
    container.appendChild(containerFooter);
    return container;
};
var getAllComponents = function (model, result) {
    if (result === void 0) { result = []; }
    result.push(model);
    model.components().each(function (mod) { return getAllComponents(mod, result); });
    return result;
};
var updateThemeColor = function (editor, color) {
    var wrapper = editor.DomComponents.getWrapper();
    var componentsAll = getAllComponents(wrapper, []);
    componentsAll.forEach(function (c) {
        var cl = c.getAttributes().class;
        if (typeof cl === "string" && cl.match(colorRegex)) {
            c.setClass(cl.replace(colorRegex, "$1-".concat(color, "-$3")));
        }
    });
};
// Replace the anonymous default export with a named export
export function registerEditorCommands(editor, opts) {
    if (opts === void 0) { opts = {}; }
    var cm = editor.Commands;
    cm.add('open-update-theme', {
        run: function (editorParam, sender) {
            // prefer the passed editor if provided, otherwise use the outer-scoped editor
            var ed = editorParam || editor;
            (sender === null || sender === void 0 ? void 0 : sender.set) && sender.set('active', 0);
            var md = ed.Modal;
            md.setTitle(opts.changeThemeText || 'Change theme');
            var container = getUpdateThemeModal(ed);
            md.setContent(container);
            md.open();
        },
    });
    //cm.add('get-tailwindCss', {
    //    run(editor, sender, options = {}) {
    //        sender?.set && sender.set('active', 0)
    //        const {
    //            html = editor.getHtml(),
    //            css,
    //            purifyOpts = {},
    //            callback = pcss => console.log(pcss)
    //        } = options
    //        if (!css) {
    //            fetch(opts.tailwindCssUrl)
    //                .then(res => res.text())
    //                .then(tcss => {
    //                    purify(html, tcss, purifyOpts, callback)
    //                })
    //        } else {
    //            purify(html, css, purifyOpts, clb)
    //        }
    //    }
    //})
    cm.add('get-tailwindCss', {
        run: function (editorParam, sender, options) {
            if (options === void 0) { options = {}; }
            var ed = editorParam || editor;
            try {
                (sender === null || sender === void 0 ? void 0 : sender.set) && sender.set('active', 0);
            }
            catch (e) {
                console.error("Error setting sender active state:", e);
            }
            var _a = options.callback, callback = _a === void 0 ? function (twcss) { return console.log(twcss); } : _a;
            var twcss = opts.cover || '';
            var doc = ed.Canvas.getDocument();
            if (!doc)
                return;
            doc.head.querySelectorAll('style').forEach(function (el) {
                el.innerText.includes('tailwind') && (twcss += el.innerText);
            });
            callback(twcss);
        }
    });
    cm.add('export-html-to-console', {
        run: function (editorParam) {
            var ed = editorParam || editor;
            var html = ed.getHtml();
            console.log('--- Editor HTML ---');
            console.log(html);
            console.log('-------------------');
        }
    });
}
// Export the named function as the default only if you want a single default export.
// If another module already provides a default, avoid adding the next line.
// export default registerEditorCommands;
