import { TransformNode } from '@babylonjs/core'
import {
  type ColliderDesc,
  type default as Rapier3d,
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
 * @category Physic3d
 */

export type CharacterController3DProps = ParentProps & {
  colliderDesc: ColliderDesc
  controllerMapper?: (
    ctrl: Rapier3d.KinematicCharacterController,
  ) => Rapier3d.KinematicCharacterController
  movement: Vec3
  position: Vec3
  name?: string
  onFrame?: (arg: {
    body: Rapier3d.RigidBody
    collider: Rapier3d.Collider
    controller: Rapier3d.KinematicCharacterController
    delta_ms: number
  }) => void
}
/**
 * Appears in the BJS tree hieararchy as a transform node whose position is controller by a Rapier CharacterController
 * The Kinematic Character Controller will emit the proper ray-casts and shape-casts to adjust the user-defined trajectory based on obstacles.
 * The well-known move-and-slide operation is the main feature of a character controller.
 *
 *  @category Physic3d
 */

export function CharacterController3D(inputProps: CharacterController3DProps) {
  const { scene } = useBabylon()
  const { rapier, world } = useRapier3D()
  const resolved = children(() => inputProps.children)

  const props = mergeProps(
    {
      name: `CharacterController_${createUniqueId()}`,
      controllerMapper: (ctrl: Rapier3d.KinematicCharacterController) => ctrl,
    },
    inputProps,
  )

  const characterController = createMemo(() => {
    return props.controllerMapper(world.createCharacterController(0.05))
  })
  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )
  createAttachChildEffect(resolved, () => node)
  const [px, py, pz] = untrack(() => props.position)
  const body = world.createRigidBody(
    rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(px, py, pz),
  )
  const collider = world.createCollider(
    untrack(() => props.colliderDesc),
    body,
  )
  createFrameEffect((delta_ms) => {
    const [x, y, z] = untrack(() => props.movement)
    const controller = untrack(() => characterController())
    controller.computeColliderMovement(collider, { x, y, z })
    const { x: mx, y: my, z: mz } = controller.computedMovement()
    const { x: bx, y: by, z: bz } = body.translation()
    body.setNextKinematicTranslation({
      x: bx + mx,
      y: by + my,
      z: bz + mz,
    })
    const { x: tx, y: ty, z: tz } = body.translation()
    node.position.set(tx, ty, tz)
    untrack(() => props.onFrame)?.({ body, collider, controller, delta_ms })
  })
  createEffect(() => {
    const [x, y, z] = props.position
    body.setTranslation({ x, y, z }, false)
  })
  onCleanup(() => {
    scene.removeTransformNode(node)
    world.removeRigidBody(body)
  })
  return <>{node}</>
}
