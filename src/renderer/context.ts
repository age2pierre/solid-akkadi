import { Engine, Scene } from '@babylonjs/core'
import type { Accessor } from 'solid-js'
import { createContext, createEffect, createSignal, useContext } from 'solid-js'

export type GlobalContext = {
  engine: Engine
  scene: Scene
  debug: Accessor<boolean>
  toggle_debug: () => void
}

export const AkkadiGlobalContext = createContext(
  null as unknown as GlobalContext,
)

export function useAkkadi() {
  return useContext(AkkadiGlobalContext)
}

export function createGlobalContext(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true)
  const scene = new Scene(engine)

  // TODO remove these default
  scene.createDefaultCameraOrLight(true, true, true)
  scene.createDefaultEnvironment()

  engine.runRenderLoop(function () {
    scene.render()
  })

  const [debug, set_debug] = createSignal(false)

  createEffect(() => {
    if (debug()) {
      scene.debugLayer.show()
    } else {
      scene.debugLayer.hide()
    }
  })

  return {
    engine,
    scene,
    debug,
    toggle_debug: () => {
      set_debug((val) => !val)
    },
  }
}
