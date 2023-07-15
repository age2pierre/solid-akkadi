import type { AssetContainer } from '@babylonjs/core'
import { Color3, Engine, Scene, SceneLoader } from '@babylonjs/core'
import { createContext, useContext } from 'solid-js'
import type { AssetFileName } from './assets'

export type BabylonCtx = {
  engine: Engine
  scene: Scene
  getAsset: (file: AssetFileName) => Promise<AssetContainer>
}

export const BabylonContext = createContext<BabylonCtx>()

export function useBabylon() {
  const ctx = useContext(BabylonContext)
  if (!ctx) {
    throw new Error('useBabylon can only be used inside <Canvas/>')
  }
  return ctx
}

export function createGlobalContext(canvas: HTMLCanvasElement): BabylonCtx {
  const engine = new Engine(canvas, true)
  const scene = new Scene(engine)
  const assetStore = new Map<AssetFileName, Promise<AssetContainer>>()
  scene.clearColor = Color3.Black().toColor4()

  SceneLoader.ShowLoadingScreen = false

  engine.runRenderLoop(function () {
    scene.render()
  })

  return {
    engine,
    scene,
    getAsset(file) {
      if (assetStore.has(file)) {
        return assetStore.get(file)!
      }
      const url = new URL(`../assets/${file}`, import.meta.url).href
      const containerPromise = SceneLoader.LoadAssetContainerAsync(
        url,
        undefined,
        scene,
      )
      assetStore.set(file, containerPromise)
      return containerPromise
    },
  }
}
