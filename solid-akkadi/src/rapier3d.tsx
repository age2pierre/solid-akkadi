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

import { useBabylon } from './babylon'
import {
  createAttachChildEffect,
  createFrameEffect,
  createMemoChildMeshes,
} from './effects'
import { type Vec3 } from './math'
import { clamp, isNotNullish, range } from './utils'

/**
 * @category Physic3d
 */
export type Rapier3dCtx = {
  rapier: typeof Rapier3d
  world: World
  registerCollisionEvent: (
    collider: Collider,
    onStart?: (target: Collider) => void,
    onEnd?: (target: Collider) => void,
  ) => void
  cleanupCollisionEvent: (collider: Collider) => void
}

const RapierContext = createContext<Rapier3dCtx>()

/**
 * Utility function to retrieve the physics context.
 * Can only be used inside <Physics /> throws otherwise
 *
 * @category Physic3d
 */
export function useRapier3d() {
  const ctx = useContext(RapierContext)
  if (!ctx) {
    throw new Error('useRapier can only be used inside <Physics/>')
  }
  return ctx
}

/**
 * @category Physic3d
 */
export type PhysicsProps = ParentProps & {
  /** the direction of gravity, [0, -9.81, 0] by default */
  gravity?: Vec3
}

/**
 * Create the context in which to add simulated bodies.
 * Async component that loads the physics library
 *
 * @category Physic3d
 */
export function Physics(props: PhysicsProps) {
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
    default: (inputProps: PhysicsProps) => {
      const { scene, engine } = useBabylon()
      const world = new rapier.World({ x: 0, y: -9.81, z: 0 })
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
        const [x, y, z] = inputProps.gravity ?? [0, -9.81, 0]
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
          {inputProps.children}
        </RapierContext.Provider>
      )
    },
  }
})

/**
 * @category Physic3d
 */
export type DynamicBodyProps = ParentProps & {
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

/**
 * Create a BJS transform node whose position and rotation is controlled by the physics simulation.
 * Meshes and other node can be added as children.
 *
 * @category Physic3d
 */
export function DynamicBody(inputProps: DynamicBodyProps) {
  const { scene } = useBabylon()
  const { world, rapier, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier3d()

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
export type StaticBodyProps = ParentProps & {
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

/**
 * Does not appear in the BJS scene hierarchy,
 * but any meshes added as children will automatically be added as a fixed body to the physics simulation.
 *
 * @category Physic3d
 */
export function StaticBody(inputProps: StaticBodyProps) {
  const { world, rapier, registerCollisionEvent, cleanupCollisionEvent } =
    useRapier3d()
  const props = mergeProps(
    {
      bodyDesc: rapier.RigidBodyDesc.fixed(),
      colliderDescMapper: (col: ColliderDesc) => col,
    },
    inputProps,
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

/**
 * Shows the different colliders as wireframed overlays
 *
 * @category Physic3d
 * */
export function DebugRapier() {
  const { world } = useRapier3d()
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

/**
 * @category Physic3d
 */
export type CharacterControllerProps = ParentProps & {
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
 * @category Physic3d
 *
 * Appears in the BJS tree hieararchy as a transform node whose position is controller by a Rapier CharacterController
 * The Kinematic Character Controller will emit the proper ray-casts and shape-casts to adjust the user-defined trajectory based on obstacles.
 * The well-known move-and-slide operation is the main feature of a character controller.
 */
export function CharacterController(inputProps: CharacterControllerProps) {
  const { scene } = useBabylon()
  const { rapier, world } = useRapier3d()
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