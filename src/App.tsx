import { createSignal, Match, Switch } from 'solid-js'

import { default as classes } from './app.module.css'
import { DemoAssets } from './DemoAssets'
import { DemoRapier } from './DemoRapier'
import { DemoSimpleMeshes } from './DemoSimpleMeshes'
import { Canvas } from './lib/babylon'
import { inspectorVisible } from './lib/BabylonInspector'
import { range } from './lib/utils'

const [demo_index, setDemoIndex] = createSignal(0)

export const CONTAINER_ID = 'demos-app-container'

export default function App() {
  return (
    <div class={classes.container} id={CONTAINER_ID}>
      <Canvas class={classes.babylonCanvas}>
        <Switch fallback={null}>
          <Match when={demo_index() === 0}>
            <DemoSimpleMeshes />
          </Match>
          <Match when={demo_index() === 1}>
            <DemoAssets />
          </Match>
          <Match when={demo_index() === 2}>
            <DemoRapier />
          </Match>
        </Switch>
      </Canvas>
      <div class={classes.menu}>
        {/* eslint-disable-next-line solid/prefer-for */}
        {range(3).map((i) => (
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
