import postcssNesting from 'postcss-nesting'
// import typescript from 'rollup-plugin-typescript2'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import checker from 'vite-plugin-checker'
import inspect from 'vite-plugin-inspect'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(async () => ({
  base: '/solid-akkadi/',
  plugins: [
    splitVendorChunkPlugin(),
    solidPlugin({}),
    checker({
      typescript: true,
    }),

    // typescript(),
    inspect(),
  ],
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
}))
