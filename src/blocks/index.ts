import loadTailwindBlocks from './tailwind'
import loadChatBlocks from './chat'

/**
 * Minimal type for the GrapesJS editor instance used by the blocks module.
 * xpanded as needed; kept intentionally permissive to avoid breaking changes.
 */
interface Editor {
	// common GrapesJS editor pieces can be added as needed
	BlockManager?: any;
	// allow other properties/methods
	[key: string]: any;
}

/** Options passed into block loaders. Kept a generic record for flexibility. */
interface BlocksOptions {
	[key: string]: any;
}

/** Callback used to open a block by id/name. */
type OpenBlock = (id: string) => void;

function doRegisterBlocks(editor: Editor, opts: BlocksOptions = {}, openBlock?: OpenBlock): void {
	const mergedOpts = openBlock ? { ...opts, openBlock } : opts;
	loadTailwindBlocks(editor, mergedOpts);
	loadChatBlocks(editor, mergedOpts);
}

export { doRegisterBlocks as registerBlocks };
