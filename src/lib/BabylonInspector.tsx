import { KeyboardEventTypes } from '@babylonjs/core'
import { createEffect, createSignal, lazy, onCleanup, Suspense } from 'solid-js'

import { useBabylon } from './babylon'

const [inspectorVisible, setInspectorVisibility] = createSignal(false)

export function toggleInspectorVisibility() {
  setInspectorVisibility((val) => !val)
}

export { inspectorVisible }

/** Listens to alt+i keyboard events to toggle babylon inspector visibility  */
export function BabylonInspector() {
  return (
    <Suspense fallback={<></>}>
      <BabylonInspectorImpl />
    </Suspense>
  )
}

const BabylonInspectorImpl = lazy(async () => {
  await import('@babylonjs/core/Debug/debugLayer')
  await import('@babylonjs/inspector')

  return {
    default: () => {
      const { scene, engine } = useBabylon()

      createEffect(() => {
        if (inspectorVisible()) {
          scene.debugLayer.show()
        } else {
          scene.debugLayer.hide()
        }
      })

      const debug_observer = scene.onKeyboardObservable.add((kb_info) => {
        if (
          kb_info.event.altKey &&
          kb_info.event.key === 'i' &&
          kb_info.type === KeyboardEventTypes.KEYDOWN
        ) {
          toggleInspectorVisibility()
          engine.getRenderingCanvas()?.focus()
        }
      })

      onCleanup(() => {
        scene.onKeyboardObservable.remove(debug_observer)
      })

      return <></>
    },
  }
})
