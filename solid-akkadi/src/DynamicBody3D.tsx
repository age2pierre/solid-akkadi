import { Quaternion, TransformNode, Vector3 } from '@babylonjs/core'
import {
  type Collider,
  type ColliderDesc,
  type RigidBody,
  type RigidBodyDesc,
} from '@dimforge/rapier3d-compat'
import {
  children,
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { createAttachChildEffect, createFrameEffect } from './effects'
import { type Vec3 } from './math'
import { useRapier3D } from './rapier-3d'

/**
 * Create a BJS transform node whose position and rotation is controlled by the physics simulation.
 * Meshes and other node can be added as children.
 *
 * @category Physic3d
 */

export function DynamicBody3D(inputProps: DynamicBody3DProps) {
  const { scene } = useBabylon()
  const { world, rapier, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier3D()

  const props = mergeProps(
    {
      position: [0, 0, 0] as Vec3,
      rotation: [0, 0, 0] as Vec3,
      name: `DynamicBody_${createUniqueId()}`,
      bodyDesc: rapier.RigidBodyDesc.dynamic(),
    },
    inputProps,
  )
  const resolved = children(() => inputProps.children)
  // create the transformNode
  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )
  // update tranform node name
  createEffect(() => {
    node.name = props.name
  })
  // create rigid body, removes body and its colliders when updating
  const body = createMemo<RigidBody, RigidBody>((prev) => {
    const _bodyDesc = props.bodyDesc
    if (_bodyDesc.status !== rapier.RigidBodyType.Dynamic) {
      console.error('DynamicBody: provided bodyDesc is not a dynamic body')
    }
    if (prev != undefined) {
      const { x, y, z } = prev.translation()
      _bodyDesc.setTranslation(x, y, z)
      _bodyDesc.setRotation(prev.rotation())
      world.removeRigidBody(prev)
    }
    return world.createRigidBody(_bodyDesc)
  })
  // create collider, also recreating it when the body is updated
  const collider = createMemo(() => {
    return world.createCollider(props.colliderDesc, body())
  })
  createEffect(() => {
    cleanupCollisionEvent(collider())
    collider().setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL)
    registerCollisionEvent(collider(), props.onStartCollide, props.onEndCollide)
  })
  // update the positon/rotation of the transformNode according to those of the rigid body
  const absoluteQuatRot = new Quaternion()
  const absoluteRot = new Vector3()
  const absolutePos = new Vector3()
  const nodeRot = new Vector3()
  createFrameEffect(() => {
    const { x, y, z } = untrack(() => body()).translation()
    const { w: rw, x: rx, y: ry, z: rz } = untrack(() => body()).rotation()
    if (node.parent) {
      absoluteQuatRot.set(rx, ry, rz, rw).toEulerAnglesToRef(absoluteRot)
      absoluteRot.subtractToRef(
        Quaternion.FromRotationMatrix(
          node.parent.getWorldMatrix().getRotationMatrix(),
        ).toEulerAngles(),
        nodeRot,
      )
      if (node.rotationQuaternion) {
        Quaternion.FromEulerVectorToRef(nodeRot, node.rotationQuaternion)
      } else {
        node.rotationQuaternion = Quaternion.FromEulerVector(nodeRot)
      }
      absolutePos.set(x, y, z)
      node.setAbsolutePosition(absolutePos)
    } else {
      node.position.set(x, y, z)
      if (node.rotationQuaternion) {
        node.rotationQuaternion.set(rx, ry, rz, rw)
      } else {
        node.rotationQuaternion = new Quaternion(rx, ry, rz, rw)
      }
    }
  })
  // react to position/rotation changes by teleport the rigidbody
  createEffect(() => {
    const [x, y, z] = props.position
    body().setTranslation({ x, y, z }, true)
  })
  createEffect(() => {
    body().setRotation(Quaternion.FromEulerAngles(...props.rotation), true)
  })
  // attach children to the transformnode
  createAttachChildEffect(resolved, () => node)

  onCleanup(() => {
    node.parent = null
    scene.removeTransformNode(node)
    world.removeRigidBody(body())
  })

  return <>{node}</>
}
/**
 * @category Physic3d
 */

export type DynamicBody3DProps = ParentProps & {
  /** initial position, changing this value after init will teleport object */
  position?: Vec3
  /** initial rotation, changing this value after init will teleport object */
  rotation?: Vec3
  bodyDesc?: RigidBodyDesc
  /** the shape of the body to simulate, keep it simple sphere,cuboid,capsule... avoid trimesh */
  colliderDesc: ColliderDesc
  /** name of the BJS transform node, displayed in the inspector hierarchy */
  name?: string
  onStartCollide?: (target: Collider) => void
  onEndCollide?: (target: Collider) => void
}
