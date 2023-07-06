import { createEffect, createSignal, onCleanup } from 'solid-js'
import { useBabylon } from './useBabylon'
import { KeyboardEventTypes } from '@babylonjs/core'

const [inspectorVisible, setInspectorVisibility] = createSignal(false)

export function toggleInspectorVisibility() {
  setInspectorVisibility((val) => !val)
}

export { inspectorVisible }

export function BabylonInspector() {
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

  return null
}
