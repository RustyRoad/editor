# Rusty Road Editor

This is a WYSIWYG editor for the [Rusty Road](https://github.com/RustyRoad/RustyRoad) web framework.

It is an optional feature of the framework, and can be used to create and edit pages in a visual way.

## Installation

Run the following command in your Rusty Road project directory:

```bash
rustyroad feature add grapesjs
```

## Usage

This will generate an edit page for each page in your project. You can access it by going to `/edit/<page-name>`.

## Development

This is a grapesjs plugin, and is built using the [tailwind version](https://github.com/Ju99ernaut/grapesjs-tailwind).

To build the plugin, run the following command:

```bash
npm run build
```
This will launch the editor, which is only good for development purposes.


## Publishing

To publish the plugin, run the following command:

```bash
npm run publish
```

This will build the plugin, and then publish it to npm.
Ensure to update the version number in `package.json` before publishing as well as in the rustyroad project to load the latest version.

<!-- Note -->
## Note
The changes you publish will be available immediately in your editor as the editor loads the plugin from unpkg.

Only the javascript file is published, if you make changes to the javascript in the html file, you will need to copy them to the editor file.

## License

[MIT](https://choosealicense.com/licenses/mit/)
```