import fs   from 'fs'
import path from 'path'

import camelcase from 'camelcase'

import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs    from 'rollup-plugin-commonjs'
import typescript  from 'rollup-plugin-typescript2'
import postcss     from 'rollup-plugin-postcss'

import autoprefixer   from 'autoprefixer'
import postcssModules from 'postcss-modules'

const cssExports = {}

const formatCSSExportDefinition = (name, classNames) => `\
declare namespace ${name} {
	${classNames.map(t => `const ${t}: string`).join('\n\t')}
}
export default ${name}`

function writeCSSExportDefinition(cssPath, classNames) {
	const name = camelcase(path.basename(cssPath, '.css'))
	const definition = formatCSSExportDefinition(name, classNames)
	return new Promise((resolve, reject) => {
		fs.writeFile(`${cssPath}.d.ts`, `${definition}\n`, e => e ? reject(e) : resolve())
	})
}

export default {
	entry: 'src/index.tsx',
	dest: 'dist/bundle.js',
	format: 'iife',
	plugins: [
		postcss({
			plugins: [
				autoprefixer(),
				postcssModules({
					getJSON(id, exportTokens) {
						writeCSSExportDefinition(id, Object.keys(exportTokens)).then(() => console.log(`${id}.d.ts written`))
						cssExports[id] = exportTokens
					}
				}),
			],
			getExport(id) {
				return cssExports[id]
			},
		}),
		typescript(),
		nodeResolve(),
		commonjs({
			namedExports: {
				'node_modules/react/react.js': ['createElement', 'Component'],
				'node_modules/react-dom/index.js': ['render'],
			},
		}),
	],
}
