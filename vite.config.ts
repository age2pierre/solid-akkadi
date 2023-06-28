import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import inspect from 'vite-plugin-inspect'

export default defineConfig(async (mode) => ({
  plugins: [solidPlugin({}), inspect()],
}))
