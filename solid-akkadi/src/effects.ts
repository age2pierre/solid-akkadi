import {
  AbstractMesh,
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
  type ResolvedJSXElement,
} from 'solid-js'

import { useBabylon } from './babylon'
import { useNodeContext } from './contexts'
import { type Vec3 } from './math'

export type TransformsProps = {
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
}

export function createTransformsEffect(
  _props: TransformsProps,
  node: Accessor<TransformNode | undefined>,
): void {
  const props = mergeProps(
    {
      position: [0, 0, 0] as const,
      scale: [1, 1, 1] as const,
      rotation: [0, 0, 0] as const,
    },
    _props,
  )
  createEffect(() => {
    const n = node()
    if (!n) return
    const [x, y, z] = props.position
    n.position.set(x, y, z)
  })
  createEffect(() => {
    const n = node()
    if (!n) return
    const [sx, sy, sz] = props.scale
    n.scaling.set(sx, sy, sz)
  })
  createEffect(() => {
    const n = node()
    if (!n) return
    const [rx, ry, rz] = props.rotation
    const rotationQuaternion = n.rotationQuaternion
    if (rotationQuaternion) {
      Quaternion.FromEulerAnglesToRef(rx, ry, rz, rotationQuaternion)
    } else {
      n.rotationQuaternion = Quaternion.FromEulerAngles(rx, ry, rz)
    }
  })
}

/**
 * Creates an effect that attaches a child node to a parent from the context.
 *
 * @category Effects
 */
export function createParentingEffect(node: Accessor<Node>): void {
  const parentNode = useNodeContext()
  createEffect(() => {
    const child = node()
    // The parent from context can be undefined (if it's a root node)
    const parent = parentNode()
    child.parent = parent
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
    function getMeshes(child: ResolvedJSXElement): AbstractMesh[] {
      if (child instanceof AbstractMesh) {
        return [child, ...child.getChildMeshes(false)]
      }
      if (child instanceof Node) {
        return child.getChildMeshes(false)
      }
      return []
    }
    if (onPrev) {
      onPrev(prev)
    }
    const resolvedChild = resolved()
    if (Array.isArray(resolvedChild)) {
      return resolvedChild.flatMap(getMeshes)
    }
    return getMeshes(resolvedChild)
  }, [])
  return childMeshes
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
): void {
  const { scene, engine } = useBabylon()
  const observer = scene[`${obs}Observable`].add(() => {
    const deltaMs = engine.getDeltaTime()
    callback(deltaMs)
  })
  onCleanup(() => {
    scene[`${obs}Observable`].remove(observer)
  })
}
