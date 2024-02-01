import { Color3, NullEngine, Scene, SceneLoader } from '@babylonjs/core'
import { onMount, type Ref } from 'solid-js'

import { babylonContext } from './babylon'
import { type CanvasProps } from './Canvas'

export function NullCanvas(props: CanvasProps & { ref: Ref<Scene> }) {
  const engine = new NullEngine()
  const scene = new Scene(engine)

  // change scene default
  scene.clearColor = Color3.Gray().toColor4()
  SceneLoader.ShowLoadingScreen = false

  onMount(() => {
    if (typeof props.ref === 'function') {
      props.ref(scene)
    }
  })

  return (
    <babylonContext.Provider
      value={{
        engine,
        scene,
      }}
    >
      {props.children}
    </babylonContext.Provider>
  )
}
