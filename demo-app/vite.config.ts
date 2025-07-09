import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import inspect from 'vite-plugin-inspect'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(() => ({
  base: '/solid-akkadi/',
  plugins: [
    solidPlugin({}),
    tailwindcss(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint src/**/*.{ts,tsx} ./scripts/**/*.ts',
        useFlatConfig: true,
      },
    }),
    inspect(),
  ],
}))
