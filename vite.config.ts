import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import inspect from 'vite-plugin-inspect'
import { DOMElements, SVGElements } from 'solid-js/web/dist/dev.cjs'

export default defineConfig(async (mode) => ({
  build:
    process.env.BUILD_MODE === 'lib'
      ? {
          lib: {
            entry: './src/renderer/index.tsx',
            formats: ['es', 'cjs', 'umd'],
            fileName: 'index',
            name: 'SolidAkkadi',
          },
          polyfillDynamicImport: false,
        }
      : {},
  plugins: [
    // for the playground, we need to be able to use the renderer from the src itself
    solidPlugin({
      solid: {
        moduleName: 'solid-js/web',
        generate: 'dynamic',
        renderers: [
          {
            name: 'dom',
            moduleName: 'solid-js/web',
            elements: [...DOMElements.values(), ...SVGElements.values()],
          },
          {
            name: 'universal',
            moduleName: '/src/renderer/index.tsx',
            elements: [],
          },
        ],
      } as any,
    }),
    inspect(),
  ],
}))
