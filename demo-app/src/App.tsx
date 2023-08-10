import { AssetStore, Canvas, inspectorVisible } from 'solid-akkadi'
import { createSignal, Match, Switch } from 'solid-js'

import { default as classes } from './app.module.css'
import { DemoAssets } from './DemoAssets'
import { DemoCharacter } from './DemoCharacter'
import { DemoRapier } from './DemoRapier'
import { DemoSimpleMeshes } from './DemoSimpleMeshes'

const [demo_index, setDemoIndex] = createSignal(0)

export const CONTAINER_ID = 'demos-app-container'

const DEMOS = [DemoSimpleMeshes, DemoAssets, DemoRapier, DemoCharacter] as const

export default function App() {
  return (
    <div class={classes.container} id={CONTAINER_ID}>
      <Canvas class={classes.babylonCanvas}>
        <AssetStore
          assetUrlMapper={(asset) => {
            const meta_url = import.meta.url
            const url = new URL(`../assets/${asset}`, meta_url)
            return url.href
          }}
        >
          <Switch fallback={null}>
            {/* eslint-disable-next-line solid/prefer-for */}
            {DEMOS.map((demo, i) => (
              <Match when={demo_index() === i}>{demo()}</Match>
            ))}
          </Switch>
        </AssetStore>
      </Canvas>
      <div class={classes.menu}>
        {/* eslint-disable-next-line solid/prefer-for */}
        {DEMOS.map((_, i) => (
          <button
            classList={{
              [classes.menuItem]: true,
              [classes.selected]: demo_index() === i,
            }}
            onClick={() => {
              setDemoIndex(i)
            }}
          />
        ))}
      </div>
      <div class={classes.tooltip}>
        <div>{(inspectorVisible() ? 'hide ' : 'show ') + 'inspector:'}</div>
        <div>{'alt+i'}</div>
        <div>{'material editor:'}</div>
        <div>{'alt+m'}</div>
      </div>
    </div>
  )
}
