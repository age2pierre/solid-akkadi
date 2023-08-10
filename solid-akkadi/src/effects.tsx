import {
  AbstractMesh,
  Material,
  Node,
  Quaternion,
  type TransformNode,
} from '@babylonjs/core'
import {
  type Accessor,
  type ChildrenReturn,
  createEffect,
  createMemo,
  mergeProps,
  onCleanup,
} from 'solid-js'
import { type ResolvedJSXElement } from 'solid-js/types/reactive/signal'
import { type ConditionalKeys } from 'type-fest'

import { useBabylon } from './babylon'
import { type Vec3 } from './types'

/**
 * The TransformsProps type is used to define optional position, rotation, and scale properties for a
 * component in a Solid Akkadi app.
 * @property {Vec3} position - A 3D vector representing the position of an object in space. It
 * specifies the x, y, and z coordinates of the object's position.
 * @property {Vec3} rotation - The `rotation` property represents the rotation of an object in
 * three-dimensional space. Each component of the vector represents the rotation around the corresponding axis.
 * @property {Vec3} scale - The `scale` property represents the scaling factor along the x, y, and z
 * axes.
 *
 * @category Effects
 */
export type TransformsProps = {
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
}

/**
 * The `createTransformsEffect` function creates a set of effects that update the position, scale, and
 * rotation of a given transform node.
 *
 * @category Effects
 */
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
    node().position.set(x, y, z)
  })
  createEffect(() => {
    const [sx, sy, sz] = props.scale
    node().scaling.set(sx, sy, sz)
  })
  createEffect(() => {
    const [rx, ry, rz] = props.rotation
    const rotationQuaternion = node().rotationQuaternion
    if (rotationQuaternion) {
      Quaternion.FromEulerAnglesToRef(rx, ry, rz, rotationQuaternion)
    } else {
      node().rotationQuaternion = Quaternion.FromEulerAngles(rx, ry, rz)
    }
  })
}

/**
 * The function creates an effect that attaches child nodes to a parent node.
 *
 * @category Effects
 */
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

/**
 * Utility function to get a memoized array of every child meshes recursively
 * @category Effects
 */
export function createMemoChildMeshes(
  resolved: ChildrenReturn,
  onPrev?: (prev: AbstractMesh[]) => void,
): Accessor<AbstractMesh[]> {
  const childMeshes = createMemo<AbstractMesh[], AbstractMesh[]>((prev) => {
    function getMeshes(child: ResolvedJSXElement) {
      if (child instanceof AbstractMesh) {
        return [child, ...child.getChildMeshes(false)]
      }
      if (child instanceof Node) {
        return child.getChildMeshes(false)
      }
      if (child == undefined) {
        return []
      }
      throw new Error('createMemoChildMeshes child is not an Babylon Node')
    }
    if (onPrev) {
      onPrev(prev)
    }
    const _child = resolved()
    if (Array.isArray(_child)) {
      return _child.flatMap(getMeshes)
    }
    return getMeshes(_child)
  }, [])
  return childMeshes
}

/**
 * Utility function to attach child material component
 *
 * @category Effects
 */
export function createAttachMaterialEffect<
  T extends AbstractMesh = AbstractMesh,
>(
  resolved: ChildrenReturn,
  mesh_instance: Accessor<T>,
  material_slot?: ConditionalKeys<T, Material>,
) {
  createEffect(() => {
    resolved.toArray().forEach((child) => {
      if (child && child instanceof Material) {
        ;(mesh_instance()[material_slot ?? 'material'] as Material) = child
      }
    })
  })
}

/**
 * @category Effects
 */
export type RenderLoopObservable =
  | 'onBeforeAnimations'
  | 'onAfterAnimations'
  | 'onBeforePhysics'
  | 'onAfterPhysics'
  | 'onBeforeRender'
  | 'onBeforeRenderTargetsRender'
  | 'onAfterRenderTargetsRender'
  // | 'onBeforeCameraRender'
  | 'onBeforeActiveMeshesEvaluation'
  | 'onAfterActiveMeshesEvaluation'
  | 'onBeforeParticlesRendering'
  | 'onAfterParticlesRendering'
  | 'onBeforeRenderTargetsRender'
  | 'onAfterRenderTargetsRender'
  | 'onBeforeDrawPhase'
  | 'onAfterDrawPhase'
  // | 'onAfterCameraRender'
  | 'onAfterRender'

/**
 * Utility function, subscribe and unsubscribe to an oberservable before each render.
 * The callback gets the delta time in millisecond since hte last frame.
 *
 * @category Effects
 */
export function createFrameEffect(
  callback: (delta_ms: number) => void,
  obs: RenderLoopObservable = 'onBeforeRender',
) {
  const { scene, engine } = useBabylon()
  const observer = scene[`${obs}Observable`].add(() => {
    const delta_ms = engine.getDeltaTime()
    callback(delta_ms)
  })
  onCleanup(() => {
    scene[`${obs}Observable`].remove(observer)
  })
}
