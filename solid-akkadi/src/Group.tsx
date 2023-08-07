import { TransformNode } from '@babylonjs/core'
import {
  children,
  createEffect,
  createUniqueId,
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
 * @category Core
 */
export function Group(inputProps: GroupProps) {
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
