import { Color3, Engine, Scene, SceneLoader } from '@babylonjs/core'
import { type ParentProps } from 'solid-js'

import { BabylonContext } from './babylon'

/**
 * The `Canvas` function creates a canvas element and sets up a Babylon.js engine and scene for
 * rendering 3D graphics.
 *
 * @category Core
 */

export function Canvas(props: CanvasProps) {
  const canvasRef = (
    <canvas class={props.class} />
  ) as unknown as HTMLCanvasElement
  const engine = new Engine(canvasRef, true)
  const scene = new Scene(engine)

  // change scene default
  scene.clearColor = Color3.Gray().toColor4()
  SceneLoader.ShowLoadingScreen = false

  engine.runRenderLoop(function () {
    scene.render()
  })

  new ResizeObserver((entries) => {
    if (entries[0]?.target !== canvasRef) return
    engine.resize()
  }).observe(canvasRef)

  return (
    <BabylonContext.Provider
      value={{
        engine,
        scene,
      }}
    >
      {canvasRef}
      <template id="babylon-children">{props.children}</template>
    </BabylonContext.Provider>
  )
}
/**
 * @category Core
 */

export type CanvasProps = ParentProps & {
  class?: string
}
