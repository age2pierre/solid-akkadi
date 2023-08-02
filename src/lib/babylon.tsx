import {
  type AssetContainer,
  Color3,
  Engine,
  Scene,
  SceneLoader,
} from '@babylonjs/core'
import {
  createContext,
  onCleanup,
  type ParentProps,
  useContext,
} from 'solid-js'

import { type AssetFileName } from './assets'

export type BabylonCtx = {
  engine: Engine
  scene: Scene
  getAsset: (file: AssetFileName) => Promise<AssetContainer>
}

const BabylonContext = createContext<BabylonCtx>()

/**
 * utility function to retrieve the graphics context.
 * Can only be used inside <Canvas /> throws otherwise.
 */
export function useBabylon() {
  const ctx = useContext(BabylonContext)
  if (!ctx) {
    throw new Error('useBabylon can only be used inside <Canvas/>')
  }
  return ctx
}

export type CanvasProps = ParentProps & {
  class?: string
}

export function Canvas(props: CanvasProps) {
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
    const storedAsset = assetStore.get(file)
    if (storedAsset) {
      return storedAsset
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

export type RenderLoopObservable =
  | 'onBeforeAnimations'
  | 'onAfterAnimations'
  | 'onBeforePhysics'
  | 'onAfterPhysics'
  | 'onBeforeRender'
  | 'onBeforeRenderTargetsRender'
  | 'onAfterRenderTargetsRender'
  // | 'onBeforeCameraRender'
  | 'onBeforeActiveMeshesEvaluation'
  | 'onAfterActiveMeshesEvaluation'
  | 'onBeforeParticlesRendering'
  | 'onAfterParticlesRendering'
  | 'onBeforeRenderTargetsRender'
  | 'onAfterRenderTargetsRender'
  | 'onBeforeDrawPhase'
  | 'onAfterDrawPhase'
  // | 'onAfterCameraRender'
  | 'onAfterRender'

/**
 * utility function, subscribe and unsubscribe to an oberservable before each render.
 * The callback gets the delta time in millisecond since hte last frame.
 */
export function createFrameEffect(
  callback: (delta_ms: number) => void,
  obs: RenderLoopObservable = 'onBeforeRender',
) {
  const { scene, engine } = useBabylon()
  const observer = scene[`${obs}Observable`].add(() => {
    const delta_ms = engine.getDeltaTime()
    callback(delta_ms)
  })
  onCleanup(() => {
    scene[`${obs}Observable`].remove(observer)
  })
}
