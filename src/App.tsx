import { createSignal, Match, Switch } from 'solid-js'

import { default as classes } from './app.module.css'
import { DemoAssets } from './DemoAssets'
import { DemoRapier } from './DemoRapier'
import { DemoSimpleMeshes } from './DemoSimpleMeshes'
import { Canvas } from './lib/babylon'
import { inspectorVisible } from './lib/BabylonInspector'

const [demo_index, setDemoIndex] = createSignal(0)

export const CONTAINER_ID = 'demos-app-container'

const DEMOS = [DemoSimpleMeshes, DemoAssets, DemoRapier] as const

export default function App() {
  return (
    <div class={classes.container} id={CONTAINER_ID}>
      <Canvas class={classes.babylonCanvas}>
        <Switch fallback={null}>
          {/* eslint-disable-next-line solid/prefer-for */}
          {DEMOS.map((demo, i) => (
            <Match when={demo_index() === i}>{demo()}</Match>
          ))}
        </Switch>
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
        {(inspectorVisible() ? 'hide ' : 'show ') + 'inspector: alt+i'}
      </div>
    </div>
  )
}
