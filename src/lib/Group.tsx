import { Node, TransformNode } from '@babylonjs/core'
import {
  type Accessor,
  children,
  type ChildrenReturn,
  createEffect,
  createUniqueId,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { type Vec3 } from './types'

export type TransformsProps = {
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
}

export type GroupProps = TransformsProps & { name?: string }
export function Group(_props: ParentProps<GroupProps>) {
  const { scene } = useBabylon()
  const resolved = children(() => _props.children)

  const props = mergeProps(
    {
      name: `Group_${createUniqueId()}`,
    },
    _props,
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
  props
  onCleanup(() => {
    node.parent = null
    scene.removeTransformNode(node)
  })
  return <>{node}</>
}

export function createTransformsEffect(
  _props: TransformsProps,
  node: Accessor<TransformNode>,
) {
  const props = mergeProps(
    {
      position: [0, 0, 0] as const,
      scale: [1, 1, 1] as const,
      rotation: [0, 0, 0] as const,
    },
    _props,
  )
  createEffect(() => {
    const [x, y, z] = props.position
    node().position.x = x
    node().position.y = y
    node().position.z = z
  })
  createEffect(() => {
    const [sx, sy, sz] = props.scale
    node().scaling.x = sx
    node().scaling.y = sy
    node().scaling.z = sz
  })
  createEffect(() => {
    const [rx, ry, rz] = props.rotation
    node().rotation.x = rx
    node().rotation.y = ry
    node().rotation.z = rz
  })
}

export function createAttachChildEffect(
  resolved: ChildrenReturn,
  node: Accessor<Node>,
) {
  createEffect(() => {
    resolved.toArray().forEach((child) => {
      if (child && child instanceof Node) {
        child.parent = node()
      }
    })
  })
}
