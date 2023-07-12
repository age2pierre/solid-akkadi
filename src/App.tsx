import { DemoSimpleMeshes } from './DemoSimpleMeshes'
import { Canvas } from './lib/Canvas'
import { DemoAssets } from './DemoAssets'
import { Match, Switch, createSignal } from 'solid-js'

import { default as classes } from './app.module.css'
import { inspectorVisible } from './lib/BabylonInspector'

const [demo_index, setDemoIndex] = createSignal(0)

export default function App() {
  return (
    <div class={classes.container}>
      <Canvas class={classes.babylonCanvas}>
        <Switch fallback={null}>
          <Match when={demo_index() === 0}>
            <DemoSimpleMeshes />
          </Match>
          <Match when={demo_index() === 1}>
            <DemoAssets />
          </Match>
        </Switch>
      </Canvas>
      <div class={classes.menu}>
        <button
          classList={{
            [classes.menuItem]: true,
            [classes.selected]: demo_index() === 0,
          }}
          onClick={() => {
            setDemoIndex(0)
          }}
        />
        <button
          classList={{
            [classes.menuItem]: true,
            [classes.selected]: demo_index() === 1,
          }}
          onClick={() => {
            setDemoIndex(1)
          }}
        />
      </div>
      <div class={classes.tooltip}>
        {(inspectorVisible() ? 'hide ' : 'show ') + 'inspector: alt+i'}
      </div>
    </div>
  )
}
