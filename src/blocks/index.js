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
import loadTailwindBlocks from './tailwind';
import loadChatBlocks from './chat';
function doRegisterBlocks(editor, opts, openBlock) {
    if (opts === void 0) { opts = {}; }
    var mergedOpts = openBlock ? __assign(__assign({}, opts), { openBlock: openBlock }) : opts;
    loadTailwindBlocks(editor, mergedOpts);
    loadChatBlocks(editor, mergedOpts);
}
export { doRegisterBlocks as registerBlocks };
