import { createEffect, createSignal, onCleanup } from 'solid-js'
import { useBabylon } from './useBabylon'
import { KeyboardEventTypes } from '@babylonjs/core'

const [debug, set_debug] = createSignal(false)

export const toggle_debug = () => {
  set_debug((val) => !val)
}

export const BabylonInspector = () => {
  const { scene, engine } = useBabylon()

  createEffect(() => {
    if (debug()) {
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
      toggle_debug()
      engine.getRenderingCanvas()?.focus()
    }
  })

  onCleanup(() => {
    scene.onKeyboardObservable.remove(debug_observer)
  })

  return null
}
