import { TransformNode, Vector3 } from '@babylonjs/core'
import {
  createSignal,
  createUniqueId,
  type JSX,
  mergeProps,
  type ParentProps,
  Show,
  untrack,
} from 'solid-js'
import { Portal } from 'solid-js/web'

import { useBabylon } from './babylon'
import {
  createFrameEffect,
  createTransformsEffect,
  type TransformsProps,
} from './effects'
import { type Vec2 } from './math'

export type HtmlProps = ParentProps &
  TransformsProps & {
    name?: string
    /** The id of the element to mount to, default to document.body otherwise */
    mountId?: string
  }

/**
 * Takes html element as children and display them as an overlay.
 * The elements are positionned inside an div positonned as absolute.
 *
 */
export function Html(inputProps: HtmlProps): JSX.Element {
  const { scene, engine } = useBabylon()

  const props = mergeProps(
    {
      name: `Html_${createUniqueId()}`,
    },
    inputProps,
  )

  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )

  createTransformsEffect(props, () => node)

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
            ? (document.getElementById(props.mountId) ?? undefined)
            : undefined
        }
      >
        <Show when={screenCoord()}>
          {(val) => (
            <div
              style={{
                position: 'absolute',

                'z-index': 'auto',
                left: `${val()[0]}px`,
                top: `${val()[1]}px`,
              }}
            >
              {inputProps.children}
            </div>
          )}
        </Show>
      </Portal>
    </>
  )
}
