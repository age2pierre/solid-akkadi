import { Engine, Scene, SceneLoader } from '@babylonjs/core'
import { createContext, useContext } from 'solid-js'

export type BabylonCtx = {
  engine: Engine
  scene: Scene
}

export const BabylonContext = createContext<BabylonCtx>()

export function useBabylon() {
  const ctx = useContext(BabylonContext)
  if (!ctx) {
    throw new Error('useBabylon can only be used inside <Canvas/>')
  }
  return ctx
}

export function createGlobalContext(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true)
  const scene = new Scene(engine)

  SceneLoader.ShowLoadingScreen = false

  engine.runRenderLoop(function () {
    scene.render()
  })

  return {
    engine,
    scene,
  }
}
