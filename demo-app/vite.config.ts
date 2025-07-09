import postcssNesting from 'postcss-nesting'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import inspect from 'vite-plugin-inspect'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(async () => ({
  base: '/solid-akkadi/',
  plugins: [
    solidPlugin({}),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint {src,scripts}/**/*.{ts,tsx} ./scripts/**/*.ts',
        useFlatConfig: true,
      },
    }),
    inspect(),
  ],
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
}))
