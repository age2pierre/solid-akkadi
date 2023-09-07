import {
  type AbstractMesh,
  type Observer,
  Quaternion,
  type TransformNode,
  Vector3,
  VertexBuffer,
} from '@babylonjs/core'
import {
  type Collider,
  type ColliderDesc,
  type default as Rapier3d,
  type RigidBody,
  type RigidBodyDesc,
} from '@dimforge/rapier3d-compat'
import {
  children,
  createEffect,
  createMemo,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { createMemoChildMeshes } from './effects'
import { useRapier3D } from './rapier-3d'
import { isNotNullish } from './utils'

/**
 * @category Physic3d
 */
export type StaticBody3DProps = ParentProps & {
  bodyDesc?: RigidBodyDesc
  /**
   * A callback can be provided to modify the auto generated collider
   * */
  colliderDescMapper?: (collider: ColliderDesc) => ColliderDesc
  onStartCollide?: (target: Rapier3d.Collider) => void
  onEndCollide?: (target: Rapier3d.Collider) => void
}

/**
 * Does not appear in the BJS scene hierarchy,
 * but any meshes added as children will automatically be added as a fixed body to the physics simulation.
 *
 * @category Physic3d
 */
export function StaticBody3D(inputProps: StaticBody3DProps) {
  const { world, rapier, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier3D()
  const props = mergeProps(
    {
      bodyDesc: rapier.RigidBodyDesc.fixed(),
      colliderDescMapper: (col: ColliderDesc) => col,
    },
    inputProps,
  )
  const body = createMemo<RigidBody, RigidBody>((prev) => {
    const bodyDesc = props.bodyDesc
    if (bodyDesc.status !== rapier.RigidBodyType.Fixed) {
      console.error('StaticBody: provided bodyDesc is not a fixed body')
    }
    if (prev != undefined) {
      world.removeRigidBody(prev)
    }
    return world.createRigidBody(bodyDesc)
  })

  const resolved = children(() => inputProps.children)
  const childMeshes = createMemoChildMeshes(resolved)

  const worldPos = new Vector3()
  const worldRot = new Quaternion()
  // creating multiple colliders, I found no compound shape in JS API
  const entries = createMemo<StaticMeshEntry[], StaticMeshEntry[]>((prev) => {
    prev.forEach((entry) => {
      entry.observer?.remove()
      if (entry.collider) {
        cleanupCollisionEvent(entry.collider)
      }
    })
    return childMeshes().map((mesh) => {
      const indices = mesh.getIndices()
      const vertices = mesh.getVerticesData(VertexBuffer.PositionKind)
      if (!indices || !vertices) {
        return { mesh }
      }
      const baseColDesc = rapier.ColliderDesc.trimesh(
        Float32Array.from(vertices),
        Uint32Array.from(indices),
      )
      const collider = world.createCollider(
        props.colliderDescMapper(baseColDesc),
        body(),
      )
      collider.setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL)
      registerCollisionEvent(
        collider,
        untrack(() => props.onStartCollide),
        untrack(() => props.onEndCollide),
      )
      const updateColliderTransforms = () => {
        mesh.getWorldMatrix().decompose(undefined, worldRot, worldPos)
        collider.setTranslation(worldPos)
        collider.setRotation(worldRot)
      }
      const observer = mesh.onAfterWorldMatrixUpdateObservable.add(() => {
        updateColliderTransforms()
      })
      // hack, first time the observable onAfterWorldMatrixUpdate is fired
      // the correct world transorm are computed BUT
      // the collider is not "ready" to set position and rotation
      setTimeout(() => {
        updateColliderTransforms()
      })
      return { mesh, collider, observer }
    })
  }, [])

  // handle collision event when event change only
  createEffect(() => {
    untrack(() => entries())
      .map((entry) => entry.collider)
      .filter(isNotNullish)
      .forEach((collider) => {
        cleanupCollisionEvent(collider)
        collider.setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL)
        registerCollisionEvent(
          collider,
          props.onStartCollide,
          props.onEndCollide,
        )
      })
  })

  onCleanup(() => {
    world.removeRigidBody(body())
  })

  return <>{resolved()}</>
}

type StaticMeshEntry = {
  mesh: AbstractMesh
  collider?: Collider
  observer?: Observer<TransformNode> | null
}
