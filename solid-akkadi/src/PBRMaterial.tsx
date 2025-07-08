import { PBRMetallicRoughnessMaterial } from '@babylonjs/core'
import {
  createEffect,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { useAbstractMeshContext } from './contexts'
import { type Vec3 } from './math'

/**
 * @category Materials
 */
export type PBRMaterialProps = {
  name?: string
  baseColor?: Vec3
  alpha?: number
  roughness?: number
  metallic?: number
  wireframe?: boolean
}

/**
 * Creates a PBR material and attaches it to the nearest parent AbstractMesh.
 *
 * @category Materials
 */
export function PBRMaterial(inputProps: PBRMaterialProps): JSX.Element {
  const { scene } = useBabylon()
  const parentMesh = useAbstractMeshContext()

  const props = mergeProps(
    {
      name: `PBRMaterial_${createUniqueId()}`,
      baseColor: [1, 1, 1] as Vec3,
      alpha: 1,
      roughness: 1,
      metallic: 0,
      wireframe: false,
    },
    inputProps,
  )
  const material = new PBRMetallicRoughnessMaterial(
    untrack(() => props.name),
    scene,
  )

  // --- Reactive property updates ---
  createEffect(() => {
    material.name = props.name
  })
  createEffect(() => {
    const [r, g, b] = props.baseColor
    material.baseColor.r = r
    material.baseColor.g = g
    material.baseColor.b = b
  })
  createEffect(() => {
    material.roughness = props.roughness
  })
  createEffect(() => {
    material.metallic = props.metallic
  })
  createEffect(() => {
    material.alpha = props.alpha
  })
  createEffect(() => {
    material.wireframe = props.wireframe
  })

  // --- Attach to parent mesh via context ---
  createEffect(() => {
    const mesh = parentMesh()
    if (!mesh) return
    mesh.material = material
  })

  onCleanup(() => {
    const mesh = untrack(() => parentMesh())
    if (mesh?.material === material) {
      mesh.material = null
    }
    material.dispose()
  })

  return <>{material}</>
}
