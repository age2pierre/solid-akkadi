import { TransformNode, Vector3 } from '@babylonjs/core'
import {
  createSignal,
  createUniqueId,
  mergeProps,
  type ParentProps,
  Show,
  untrack,
} from 'solid-js'
import { Portal } from 'solid-js/web'

import { createFrameEffect, useBabylon } from './babylon'
import { type Vec2 } from './types'

export function Html(_props: ParentProps<{ name?: string; mountId?: string }>) {
  const { scene, engine } = useBabylon()

  const props = mergeProps(
    {
      name: `Html_${createUniqueId()}`,
    },
    _props,
  )

  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )

  const [screenCoord, setScreenCoord] = createSignal<Vec2 | undefined>(
    undefined,
  )

  createFrameEffect(() => {
    const canvasRect = engine.getRenderingCanvasClientRect()
    if (scene.activeCamera && canvasRect) {
      const coord = Vector3.Project(
        node.position,
        node.getWorldMatrix(),
        scene.getTransformMatrix(),
        scene.activeCamera.viewport,
      )
      setScreenCoord([coord.x * canvasRect.width, coord.y * canvasRect.height])
    } else {
      setScreenCoord(undefined)
    }
  })

  return (
    <>
      {node}
      <Portal
        mount={
          props.mountId
            ? document.getElementById(props.mountId) ?? undefined
            : undefined
        }
      >
        <Show when={screenCoord() !== undefined}>
          <div
            style={{
              position: 'absolute',
              'z-index': 'auto',
              left: `${screenCoord()![0]}px`,
              top: `${screenCoord()![1]}px`,
            }}
          >
            {_props.children}
          </div>
        </Show>
      </Portal>
    </>
  )
}
