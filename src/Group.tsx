import type { Node } from '@babylonjs/core'
import { TransformNode } from '@babylonjs/core'
import type { ParentComponent } from 'solid-js'
import {
  children,
  createEffect,
  createUniqueId,
  mergeProps,
  onCleanup,
} from 'solid-js'
import { useAkkadi } from './context'
import type { Vec3 } from './types'

export const Group: ParentComponent<{
  position?: Vec3
}> = (_props) => {
  const { scene } = useAkkadi()
  const node = new TransformNode(createUniqueId(), scene)
  const props = mergeProps({ position: [0, 0, 0] as Vec3 }, _props)
  const resolved = children(() => _props.children)

  createEffect(() => {
    resolved.toArray().forEach((child) => {
      ;(child as unknown as Node).parent = node
    })
  })

  createEffect(() => {
    const [x, y, z] = props.position
    node.position.x = x
    node.position.y = y
    node.position.z = z
  })

  onCleanup(() => {
    scene.removeTransformNode(node)
  })

  return node as any
}
