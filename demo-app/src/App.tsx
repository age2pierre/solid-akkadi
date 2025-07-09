import { AssetStore, Canvas, inspectorVisible } from 'solid-akkadi'
import { createSignal, type JSX, Match, Switch } from 'solid-js'

import { default as classes } from './app.module.css'
import { DemoAssets } from './DemoAssets'
import { DemoCharacter } from './DemoCharacter'
import { DemoRapier } from './DemoRapier'
import { DemoSimpleMeshes } from './DemoSimpleMeshes'

const [demoIndex, setDemoIndex] = createSignal(0)

export const CONTAINER_ID = 'demos-app-container'

const DEMOS = [DemoSimpleMeshes, DemoAssets, DemoRapier, DemoCharacter] as const

export default function App(): JSX.Element {
  return (
    <div class={classes.container} id={CONTAINER_ID}>
      <Canvas class={classes.babylonCanvas}>
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
      <div class={classes.menu}>
        {/* eslint-disable-next-line solid/prefer-for */}
        {DEMOS.map((_, i) => (
          <button
            classList={{
              [classes.menuItem]: true,
              [classes.selected]: demoIndex() === i,
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
        <div style={{ 'grid-column': '1 / span 2' }}>
          <a href="https://age2pierre.github.io/solid-akkadi/doc/">
            API doc 🔗
          </a>
        </div>
      </div>
    </div>
  )
}
