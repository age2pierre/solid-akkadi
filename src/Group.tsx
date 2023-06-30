import type { Node } from '@babylonjs/core'
import { TransformNode } from '@babylonjs/core'
import type { ParentComponent } from 'solid-js'
import {
  children,
  createEffect,
  createUniqueId,
  mergeProps,
  onCleanup,
  untrack,
} from 'solid-js'
import { useAkkadi } from './context'
import type { Vec3 } from './types'

export const Group: ParentComponent<{
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
  name?: string
}> = (_props) => {
  const { scene } = useAkkadi()
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
      if (child) {
        ;(child as unknown as Node).parent = node
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

  return node as any
}
