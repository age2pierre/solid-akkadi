import { KeyboardEventTypes, NodeMaterial } from '@babylonjs/core'
import {
  createEffect,
  createSignal,
  createUniqueId,
  type JSX,
  lazy,
  onCleanup,
  Suspense} from 'solid-js'

import { useBabylon } from './babylon'

const [inspectorVisible, setInspectorVisibility] = createSignal(false)

export function toggleInspectorVisibility(): void {
  setInspectorVisibility((val) => !val)
}

export { inspectorVisible }

/**
 * Listens to alt+i keyboard events to toggle babylon inspector visibility.
 * Listens to alt+m keyboard events to show babylon node material editor.
 * Asynchronosly load necessary ESM modules.
 */
export function BabylonInspector(): JSX.Element {
  return (
    <Suspense fallback={<></>}>
      <BabylonInspectorImpl />
    </Suspense>
  )
}

const BabylonInspectorImpl = lazy(async () => {
  await import('@babylonjs/core/Debug/debugLayer')
  await import('@babylonjs/inspector')
  const { NodeEditor: nodeEditor } = await import('@babylonjs/node-editor')

  return {
    default(): JSX.Element {
      const { scene, engine } = useBabylon()

      createEffect(() => {
        if (inspectorVisible()) {
          void scene.debugLayer.show()
        } else {
          scene.debugLayer.hide()
        }
      })

      const debugObserver = scene.onKeyboardObservable.add((kbInfo) => {
        if (
          kbInfo.event.altKey &&
          kbInfo.event.key === 'i' &&
          kbInfo.type === KeyboardEventTypes.KEYDOWN
        ) {
          toggleInspectorVisibility()
          engine.getRenderingCanvas()?.focus()
        }
        if (
          kbInfo.event.altKey &&
          kbInfo.event.key === 'm' &&
          kbInfo.type === KeyboardEventTypes.KEYDOWN
        ) {
          const material = new NodeMaterial(
            `NodeMaterial_temp_${createUniqueId()}`,
          )
          nodeEditor.Show({
            nodeMaterial: material,
          })
          scene.removeMaterial(material)
        }
      })

      onCleanup(() => {
        scene.onKeyboardObservable.remove(debugObserver)
      })

      return <></>
    },
  }
})
