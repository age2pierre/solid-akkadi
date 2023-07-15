import {
  StandardMaterial as BabylonStandardMaterial,
  PBRMetallicRoughnessMaterial,
} from '@babylonjs/core'
import {
  mergeProps,
  type Component,
  untrack,
  createUniqueId,
  createEffect,
} from 'solid-js'
import type { Vec3 } from './types'
import { useBabylon } from './useBabylon'

export const StandardMaterial: Component<{
  /** not reactive */
  name?: string
  diffuseColor?: Vec3
  specularColor?: Vec3
  ambientColor?: Vec3
  emissiveColor?: Vec3
  alpha?: number
  wireframe?: boolean
}> = (_props) => {
  const { scene } = useBabylon()

  const props = mergeProps(
    {
      name: `StandardMaterial_${createUniqueId()}`,
      diffuseColor: [1, 1, 1] as Vec3,
      specularColor: [1, 1, 1] as Vec3,
      ambientColor: [0, 0, 0] as Vec3,
      emissiveColor: [0, 0, 0] as Vec3,
      alpha: 1, // opaque
      wireframe: false,
    },
    _props,
  )
  const material = new BabylonStandardMaterial(
    untrack(() => props.name),
    scene,
  )

  createEffect(() => {
    const [rd, gd, bd] = props.diffuseColor
    material.diffuseColor.r = rd
    material.diffuseColor.g = gd
    material.diffuseColor.b = bd
    const [rs, gs, bs] = props.specularColor
    material.specularColor.r = rs
    material.specularColor.g = gs
    material.specularColor.b = bs
    const [ra, ga, ba] = props.ambientColor
    material.ambientColor.r = ra
    material.ambientColor.g = ga
    material.ambientColor.b = ba
    const [re, ge, be] = props.emissiveColor
    material.emissiveColor.r = re
    material.emissiveColor.g = ge
    material.emissiveColor.b = be
    material.alpha = props.alpha
    material.wireframe = props.wireframe
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return material as any
}

export const PBRMaterial: Component<{
  /** not reactive */
  name?: string
  baseColor?: Vec3
  alpha?: number
  roughness?: number
  metallic?: number
  wireframe?: boolean
}> = (_props) => {
  const { scene } = useBabylon()

  const props = mergeProps(
    {
      name: `PBRMaterial_${createUniqueId()}`,
      baseColor: [1, 1, 1] as Vec3,
      alpha: 1, // opaque
      roughness: 1,
      metallic: 0,
      wireframe: false,
    },
    _props,
  )
  const material = new PBRMetallicRoughnessMaterial(
    untrack(() => props.name),
    scene,
  )

  createEffect(() => {
    const [r, g, b] = props.baseColor
    material.baseColor.r = r
    material.baseColor.g = g
    material.baseColor.b = b
    material.roughness = props.roughness
    material.metallic = props.metallic
    material.alpha = props.alpha
    material.wireframe = props.wireframe
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return material as any
}
