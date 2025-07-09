import { Color3, Engine, Scene } from '@babylonjs/core'
import { type JSX, type ParentProps } from 'solid-js'

import { babylonContext } from './babylon'
import { BjsNodeProvider } from './contexts'

/**
 * The `Canvas` function creates a canvas element and sets up a Babylon.js engine and scene for
 * rendering 3D graphics.
 *
 * @category Core
 */

export function Canvas(props: CanvasProps): JSX.Element {
  const canvasRef = (
    <canvas class={props.class} />
  ) as unknown as HTMLCanvasElement
  const engine = new Engine(canvasRef, true)
  const scene = new Scene(engine)

  // change scene default
  scene.clearColor = Color3.Gray().toColor4()
  engine.hideLoadingUI()

  engine.runRenderLoop(function () {
    scene.render()
  })

  new ResizeObserver((entries) => {
    if (entries[0]?.target !== canvasRef) return
    engine.resize()
  }).observe(canvasRef)

  return (
    <babylonContext.Provider
      value={{
        engine,
        scene,
      }}
    >
      {canvasRef}
      <div id="inspector-root" style={{ 'z-index': 99 }} />
      <template id="babylon-children">
        <BjsNodeProvider
          node={() => null}
          transformNode={() => null}
          abstractMesh={() => null}
          light={() => null}
        >
          {props.children}
        </BjsNodeProvider>
      </template>
    </babylonContext.Provider>
  )
}
/**
 * @category Core
 */

export type CanvasProps = ParentProps & {
  class?: string
}
