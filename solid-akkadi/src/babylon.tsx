import {
  type AssetContainer,
  Color3,
  Engine,
  Scene,
  SceneLoader,
} from '@babylonjs/core'
import { createContext, type ParentProps, untrack, useContext } from 'solid-js'

import { type AssetName } from './MeshAsset'

/**
 * @category Core
 */
export type BabylonCtx = {
  engine: Engine
  scene: Scene
  getAsset: (asset: AssetName) => Promise<AssetContainer>
}

const BabylonContext = createContext<BabylonCtx>()

/**
 * Utility function to retrieve the graphics context.
 * Can only be used inside <Canvas /> throws otherwise.
 *
 * @category Core
 */
export function useBabylon() {
  const ctx = useContext(BabylonContext)
  if (!ctx) {
    throw new Error('useBabylon can only be used inside <Canvas/>')
  }
  return ctx
}

/**
 * @category Core
 */
export type CanvasProps = ParentProps & {
  class?: string
  assetUrlMapper?: (assetName: AssetName) => string
}

/**
 * @category Core
 */
export function Canvas(props: CanvasProps) {
  const canvasRef = (
    <canvas class={props.class} />
  ) as unknown as HTMLCanvasElement
  const engine = new Engine(canvasRef, true)
  const scene = new Scene(engine)
  const assetStore = new Map<string, Promise<AssetContainer>>()

  // change scene default
  scene.clearColor = Color3.Gray().toColor4()
  SceneLoader.ShowLoadingScreen = false

  engine.runRenderLoop(function () {
    scene.render()
  })

  function getAsset(asset: AssetName): Promise<AssetContainer> {
    const storedAsset = assetStore.get(asset)
    if (storedAsset) {
      return storedAsset
    }
    const url = untrack(() => props.assetUrlMapper)?.(asset) ?? asset
    console.log('loading asset ' + url)
    const containerPromise = SceneLoader.LoadAssetContainerAsync(
      url,
      undefined,
      scene,
    )
    assetStore.set(asset, containerPromise)
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
