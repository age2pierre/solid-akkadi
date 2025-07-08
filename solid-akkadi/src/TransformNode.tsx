import { TransformNode as CoreTransformNode } from '@babylonjs/core'
import {
  createEffect,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { BjsNodeProvider } from './contexts'
import {
  createParentingEffect,
  createTransformsEffect,
  type TransformsProps,
} from './effects'

/**
 * @category Core
 */
export type TransformNodeProps = ParentProps & TransformsProps & { name?: string }

/**
 * Creates a TransformNode, which can be used to group and transform other nodes.
 * It attaches itself to the nearest parent Node and provides a new transform context for its children.
 *
 * @category Core
 */
export function TransformNode(inputProps: TransformNodeProps): JSX.Element {
  const { scene } = useBabylon()
  const props = mergeProps({ name: `Group_${createUniqueId()}` }, inputProps)

  const node = new CoreTransformNode(
    untrack(() => props.name),
    scene,
  )

  // Update name reactively
  createEffect(() => {
    node.name = props.name
  })

  // Attach self to parent using context
  createParentingEffect(() => node)

  // Apply own transforms
  createTransformsEffect(props, () => node)

  onCleanup(() => {
    scene.removeTransformNode(node)
  })

  const _providers = (
    <BjsNodeProvider node={() => node} transformNode={() => node}>
      {props.children}
    </BjsNodeProvider>
  )
  return <>{node}</>
}
