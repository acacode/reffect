const packageJson = require('./package.json')
const resolve = require('@rollup/plugin-node-resolve')
const terser = require('rollup-plugin-terser').terser
const typescript = require('@rollup/plugin-typescript')

const deps = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
]

const inputOutputConfig = (outputFormat, commonOutput = {}) => ({
  input: 'index.ts',
  output: {
    file: `rym.${outputFormat}.js`,
    format: outputFormat,
    sourcemap: true,
    ...commonOutput,
  },
})

const production = plugins => ([
  ...plugins,
  terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
      arguments: true,
      unsafe_Function: true,
      module: true,
    },
  }),
])

module.exports = [
  // Common JS builds
  {
    ...inputOutputConfig('cjs'),
    external: deps,
    plugins: production([typescript({ exclude: 'node_modules/**' })]),
  },
  // EcmaScript builds
  {
    ...inputOutputConfig('es'),
    external: deps,
    plugins: production([typescript({ exclude: 'node_modules/**' })]),
  },
  // UMD builds
  {
    ...inputOutputConfig('umd', { name: 'rym' }),
    external: deps,
    plugins: production([
      resolve({ jsnext: true }),
      typescript({ exclude: 'node_modules/**' }),
    ]),
  },
]