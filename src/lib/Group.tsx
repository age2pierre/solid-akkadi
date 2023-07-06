import { Node } from '@babylonjs/core'
import { TransformNode } from '@babylonjs/core'
import type { ParentProps } from 'solid-js'
import {
  children,
  createEffect,
  createUniqueId,
  mergeProps,
  onCleanup,
  untrack,
} from 'solid-js'
import { useBabylon } from './useBabylon'
import type { Vec3 } from './types'

export function Group(
  _props: ParentProps<{
    position?: Vec3
    rotation?: Vec3
    scale?: Vec3
    /** not reactive */
    name?: string
  }>,
) {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      position: [0, 0, 0] as const,
      scale: [1, 1, 1] as const,
      rotation: [0, 0, 0] as const,
      name: createUniqueId(),
    },
    _props,
  )
  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )
  const resolved = children(() => _props.children)

  createEffect(() => {
    resolved.toArray().forEach((child) => {
      if (child && child instanceof Node) {
        child.parent = node
      }
    })
  })

  createEffect(() => {
    const [x, y, z] = props.position
    node.position.x = x
    node.position.y = y
    node.position.z = z
  })

  createEffect(() => {
    const [sx, sy, sz] = props.scale
    node.scaling.x = sx
    node.scaling.y = sy
    node.scaling.z = sz
  })

  createEffect(() => {
    const [rx, ry, rz] = props.rotation
    node.rotation.x = rx
    node.rotation.y = ry
    node.rotation.z = rz
  })

  onCleanup(() => {
    node.parent = null
    scene.removeTransformNode(node)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node as any
}
