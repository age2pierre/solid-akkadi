import {
  type AbstractMesh,
  Color3,
  Mesh,
  type Observer,
  Quaternion,
  StandardMaterial,
  TransformNode,
  UtilityLayerRenderer,
  Vector3,
  VertexBuffer,
  VertexData,
} from '@babylonjs/core'
import {
  type Collider,
  type ColliderDesc,
  type default as Rapier3d,
  type KinematicCharacterController,
  type RigidBody,
  type RigidBodyDesc,
  type World,
} from '@dimforge/rapier3d-compat'
import {
  children,
  createContext,
  createEffect,
  createMemo,
  createUniqueId,
  lazy,
  mergeProps,
  onCleanup,
  type ParentProps,
  Suspense,
  untrack,
  useContext,
} from 'solid-js'

import { createFrameEffect, useBabylon } from './babylon'
import { createAttachChildEffect } from './Group'
import { createMemoChildMeshes } from './meshes'
import { type Vec3 } from './types'
import { clamp, isNotNullish, range } from './utils'

type RapierCtx = {
  rapier: typeof Rapier3d
  world: World
  characterController: KinematicCharacterController
  registerCollisionEvent: (
    collider: Collider,
    onStart?: (target: Collider) => void,
    onEnd?: (target: Collider) => void,
  ) => void
  cleanupCollisionEvent: (collider: Collider) => void
}

const RapierContext = createContext<RapierCtx>()

export function useRapier() {
  const ctx = useContext(RapierContext)
  if (!ctx) {
    throw new Error('useRapier can only be used inside <Physics/>')
  }
  return ctx
}

export function Physics(props: ParentProps<{ gravity?: Vec3 }>) {
  return (
    <Suspense fallback={<></>}>
      <PhysicsImpl gravity={props.gravity}>{props.children}</PhysicsImpl>
    </Suspense>
  )
}

const PhysicsImpl = lazy(async () => {
  const rapier = await import('@dimforge/rapier3d-compat')
  await rapier.init()
  return {
    default: (props: ParentProps<{ gravity?: Vec3 }>) => {
      const { scene, engine } = useBabylon()
      const world = new rapier.World({ x: 0, y: 0, z: 0 })
      const characterController = world.createCharacterController(0.01)
      const eventQueue = new rapier.EventQueue(false)
      const eventMap = new Map<
        number,
        {
          onStart?: (collided: Collider) => void
          onEnd?: (collided: Collider) => void
        }
      >()

      const observer = scene.onAfterRenderObservable.add(() => {
        const delta_ms = engine.getDeltaTime()
        const clampedDelta = clamp(delta_ms / 1000, 0, 0.2)
        world.timestep = clampedDelta
        world.step(eventQueue)

        eventQueue.drainCollisionEvents((h1, h2, started) => {
          const c1 = world.getCollider(h1)
          const c2 = world.getCollider(h2)

          const e1 = eventMap.get(h1)
          const e2 = eventMap.get(h2)

          if (started) {
            e1?.onStart?.(c2)
            e2?.onStart?.(c1)
          } else {
            e1?.onEnd?.(c2)
            e2?.onEnd?.(c1)
          }
        })
      })

      onCleanup(() => {
        scene.onAfterRenderObservable.remove(observer)
      })

      createEffect(() => {
        const [x, y, z] = props.gravity ?? [0, 0, 0]
        world.gravity = {
          x,
          y,
          z,
        }
      })

      return (
        <RapierContext.Provider
          value={{
            rapier,
            world,
            characterController,
            registerCollisionEvent: (collider, onStart, onEnd) => {
              collider.setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
              eventMap.set(collider.handle, { onEnd, onStart })
              return () => {
                eventMap.delete(collider.handle)
              }
            },
            cleanupCollisionEvent: (collider) => {
              eventMap.delete(collider.handle)
            },
          }}
        >
          {props.children}
        </RapierContext.Provider>
      )
    },
  }
})

export function DynamicBody(
  _props: ParentProps<{
    /** changing this value after init will teleport object */
    position?: Vec3
    rotation?: Vec3
    bodyDesc?: RigidBodyDesc
    colliderDesc: ColliderDesc
    name?: string
    onStartCollide?: (target: Collider) => void
    onEndCollide?: (target: Collider) => void
  }>,
) {
  const { scene } = useBabylon()
  const { world, rapier, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier()

  const props = mergeProps(
    {
      position: [0, 0, 0] as Vec3,
      rotation: [0, 0, 0] as Vec3,
      name: `DynamicBody_${createUniqueId()}`,
      bodyDesc: rapier.RigidBodyDesc.dynamic(),
    },
    _props,
  )
  const resolved = children(() => _props.children)
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
  createFrameEffect(() => {
    const { x, y, z } = untrack(() => body()).translation()
    const { w: rw, x: rx, y: ry, z: rz } = untrack(() => body()).rotation()
    absoluteQuatRot.set(rx, ry, rz, rw).toEulerAnglesToRef(absoluteRot)
    absolutePos.set(x, y, z)
    if (node.parent) {
      absoluteRot.subtractToRef(
        Quaternion.FromRotationMatrix(
          node.parent.getWorldMatrix().getRotationMatrix(),
        ).toEulerAngles(),
        node.rotation,
      )
      node.setAbsolutePosition(absolutePos)
    } else {
      node.rotation = absoluteRot
      node.position = absolutePos
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

export type StaticBodyProps = {
  bodyDesc?: RigidBodyDesc
  /**
   * A callback can be provided to modify the auto generated collider
   * */
  colliderDescMapper?: (collider: ColliderDesc) => ColliderDesc
  onStartCollide?: (target: Rapier3d.Collider) => void
  onEndCollide?: (target: Rapier3d.Collider) => void
}

type StaticMeshEntry = {
  mesh: AbstractMesh
  collider?: Collider
  observer?: Observer<TransformNode> | null
}

export function StaticBody(_props: ParentProps<StaticBodyProps>) {
  const { world, rapier, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier()
  const props = mergeProps(
    {
      bodyDesc: rapier.RigidBodyDesc.fixed(),
      colliderDescMapper: (col: ColliderDesc) => col,
    },
    _props,
  )
  const body = createMemo<RigidBody, RigidBody>((prev) => {
    const _bodyDesc = props.bodyDesc
    if (_bodyDesc.status !== rapier.RigidBodyType.Fixed) {
      console.error('StaticBody: provided bodyDesc is not a fixed body')
    }
    if (prev != undefined) {
      world.removeRigidBody(prev)
    }
    return world.createRigidBody(_bodyDesc)
  })

  const resolved = children(() => _props.children)
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
      const observer = mesh.onAfterWorldMatrixUpdateObservable.add(
        updateColliderTransforms,
      )
      updateColliderTransforms()
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

/**
 * Shows on overlay the different colliders has wireframes
 * */
export function DebugRapier() {
  const { world } = useRapier()
  const debugMesh = new Mesh(
    'RapierDebugMesh',
    UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene,
  )
  const material = new StandardMaterial(
    'DebugRapierMaterial',
    UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene,
  )
  material.wireframe = true
  material.emissiveColor = Color3.White()
  debugMesh.material = material

  createFrameEffect(() => {
    const buffers = world.debugRender()
    const indicesNb = buffers.vertices.length / 3
    if (debugMesh.getTotalIndices() !== indicesNb) {
      const vertexData = new VertexData()
      vertexData.positions = buffers.vertices
      vertexData.indices = range(indicesNb)
      vertexData.colors = buffers.colors
      vertexData.applyToMesh(debugMesh, true)
    } else {
      debugMesh.updateVerticesData(VertexBuffer.PositionKind, buffers.vertices)
      debugMesh.updateVerticesData(VertexBuffer.ColorKind, buffers.colors)
    }
  })

  onCleanup(() => {
    UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene.removeMesh(
      debugMesh,
      true,
    )
  })
  return <></>
}
