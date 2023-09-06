import { PBRMetallicRoughnessMaterial } from '@babylonjs/core'
import { createEffect, createUniqueId, mergeProps, untrack } from 'solid-js'

import { useBabylon } from './babylon'
import { type Vec3 } from './math'

/**
 * The `PBRMaterial` function creates a PBR material with customizable properties and returns it as a
 * JSX element.
 *
 * @category Materials
 */

export function PBRMaterial(inputProps: PBRMaterialProps) {
  const { scene } = useBabylon()

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
  return <>{material}</>
}
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
