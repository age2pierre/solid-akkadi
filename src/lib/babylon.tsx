import type { AssetContainer } from '@babylonjs/core'
import { Color3, Engine, Scene, SceneLoader } from '@babylonjs/core'
import type { ParentProps } from 'solid-js'
import { createContext, useContext } from 'solid-js'

import type { AssetFileName } from './assets'

export type BabylonCtx = {
  engine: Engine
  scene: Scene
  getAsset: (file: AssetFileName) => Promise<AssetContainer>
}

const BabylonContext = createContext<BabylonCtx>()

export function useBabylon() {
  const ctx = useContext(BabylonContext)
  if (!ctx) {
    throw new Error('useBabylon can only be used inside <Canvas/>')
  }
  return ctx
}

export function Canvas(
  props: ParentProps<{
    class?: string
  }>,
) {
  const canvasRef = (
    <canvas class={props.class} />
  ) as unknown as HTMLCanvasElement
  const engine = new Engine(canvasRef, true)
  const scene = new Scene(engine)
  const assetStore = new Map<AssetFileName, Promise<AssetContainer>>()

  // change scene default
  scene.clearColor = Color3.Gray().toColor4()
  SceneLoader.ShowLoadingScreen = false

  engine.runRenderLoop(function () {
    scene.render()
  })

  function getAsset(file: AssetFileName): Promise<AssetContainer> {
    if (assetStore.has(file)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  }

  new ResizeObserver((entries) => {
    if (entries[0]?.target !== canvasRef) return
    engine.resize()
  }).observe(canvasRef)

  return (
    <BabylonContext.Provider
      value={{
        engine,
        scene,
        getAsset,
      }}
    >
      {canvasRef}
      <template id="babylon-children">{props.children}</template>
    </BabylonContext.Provider>
  )
}
