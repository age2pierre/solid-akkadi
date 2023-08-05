import postcssNesting from 'postcss-nesting'
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
    inspect(),
  ],
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
}))
