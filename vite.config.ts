import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import inspect from 'vite-plugin-inspect'
import checker from 'vite-plugin-checker'
import { splitVendorChunkPlugin } from 'vite'

export default defineConfig(async (mode) => ({
  base: '/solid-akkadi/',
  plugins: [
    splitVendorChunkPlugin(),
    solidPlugin({}),
    checker({
      typescript: true,
      // eslint: {
      //   lintCommand: 'eslint .',
      // },
    }),
    inspect(),
  ],
}))
