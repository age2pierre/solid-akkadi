import { TransformNode } from '@babylonjs/core'
import {
  children,
  createEffect,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import {
  createAttachChildEffect,
  createTransformsEffect,
  type TransformsProps,
} from './effects'

/**
 * @category Core
 */
export type GroupProps = ParentProps & TransformsProps & { name?: string }

/**
 * The `Group` function creates a transform node in a Babylon.js scene and attaches its children to it,
 * updating its transforms based on the provided props.
 *
 * @category Core
 */
export function Group(inputProps: GroupProps): JSX.Element {
  const { scene } = useBabylon()
  const resolved = children(() => inputProps.children)

  const props = mergeProps(
    {
      name: `Group_${createUniqueId()}`,
    },
    inputProps,
  )
  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )
  createEffect(() => {
    node.name = props.name
  })
  // set to every direct child the transform node as parent
  createAttachChildEffect(resolved, () => node)

  // updates tranforms of transformNode
  createTransformsEffect(props, () => node)

  onCleanup(() => {
    node.parent = null
    scene.removeTransformNode(node)
  })
  return <>{node}</>
}
