import { AssetStore, Canvas, inspectorVisible } from 'solid-akkadi'
import { createSignal, type JSX, Match, Switch } from 'solid-js'

import { DemoAssets } from './DemoAssets'
import { DemoCharacter } from './DemoCharacter'
import { DemoRapier } from './DemoRapier'
import { DemoSimpleMeshes } from './DemoSimpleMeshes'

const [demoIndex, setDemoIndex] = createSignal(0)

export const CONTAINER_ID = 'demos-app-container'

const DEMOS = [DemoSimpleMeshes, DemoAssets, DemoRapier, DemoCharacter] as const

export default function App(): JSX.Element {
  return (
    <div class="h-screen w-screen overflow-hidden" id={CONTAINER_ID}>
      <Canvas class="absolute inset-0 h-full w-full">
        <AssetStore
          assetUrlMapper={(asset) => {
            const metaUrl = import.meta.url
            const url = new URL(`../assets/${asset}`, metaUrl)
            return url.href
          }}
        >
          <Switch fallback={null}>
            {/* eslint-disable-next-line solid/prefer-for */}
            {DEMOS.map((demo, i) => (
              <Match when={demoIndex() === i}>{demo()}</Match>
            ))}
          </Switch>
        </AssetStore>
      </Canvas>
      <div class="absolute bottom-0 left-0 m-5 flex flex-wrap content-start justify-start gap-4 rounded-lg bg-neutral-800/50 p-4">
        {/* eslint-disable-next-line solid/prefer-for */}
        {DEMOS.map((_, i) => (
          <button
            class="h-8 w-8 rounded-full border-0"
            classList={{
              'bg-red-400': demoIndex() === i,
              'bg-yellow-200': demoIndex() !== i,
            }}
            onClick={() => {
              setDemoIndex(i)
            }}
          />
        ))}
      </div>
      <div class="absolute bottom-0 right-0 m-5 grid grid-cols-[auto_auto] gap-x-2.5 bg-neutral-800 p-2.5 font-mono text-gray-100">
        <div>{(inspectorVisible() ? 'hide ' : 'show ') + 'inspector:'}</div>
        <div>{'alt+i'}</div>
        <div>{'material editor:'}</div>
        <div>{'alt+m'}</div>
        <div class="col-span-2">
          <a
            href="https://age2pierre.github.io/solid-akkadi/doc/"
            class="text-gray-400 visited:text-gray-500 hover:text-gray-200 active:text-orange-200"
          >
            API doc 🔗
          </a>
        </div>
      </div>
    </div>
  )
}
