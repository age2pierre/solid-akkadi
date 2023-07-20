import { KeyboardEventTypes, NodeMaterial } from '@babylonjs/core'
import {
  createEffect,
  createSignal,
  createUniqueId,
  lazy,
  onCleanup,
  Suspense,
} from 'solid-js'

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
  const { NodeEditor } = await import('@babylonjs/node-editor')

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
        if (
          kb_info.event.altKey &&
          kb_info.event.key === 'm' &&
          kb_info.type === KeyboardEventTypes.KEYDOWN
        ) {
          const material = new NodeMaterial(
            `NodeMaterial_temp_${createUniqueId()}`,
          )
          NodeEditor.Show({
            nodeMaterial: material,
          })
          scene.removeMaterial(material)
        }
      })

      onCleanup(() => {
        scene.onKeyboardObservable.remove(debug_observer)
      })

      return <></>
    },
  }
})
