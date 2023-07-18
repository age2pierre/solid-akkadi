import {
  PBRMetallicRoughnessMaterial,
  StandardMaterial as BabylonStandardMaterial,
} from '@babylonjs/core'
import {
  type Component,
  createEffect,
  createUniqueId,
  mergeProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { type Vec3 } from './types'

export const StandardMaterial: Component<{
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
    material.name = props.name
  })
  createEffect(() => {
    const [rd, gd, bd] = props.diffuseColor
    material.diffuseColor.r = rd
    material.diffuseColor.g = gd
    material.diffuseColor.b = bd
  })
  createEffect(() => {
    const [rs, gs, bs] = props.specularColor
    material.specularColor.r = rs
    material.specularColor.g = gs
    material.specularColor.b = bs
  })
  createEffect(() => {
    const [ra, ga, ba] = props.ambientColor
    material.ambientColor.r = ra
    material.ambientColor.g = ga
    material.ambientColor.b = ba
  })
  createEffect(() => {
    const [re, ge, be] = props.emissiveColor
    material.emissiveColor.r = re
    material.emissiveColor.g = ge
    material.emissiveColor.b = be
  })
  createEffect(() => {
    material.alpha = props.alpha
  })
  createEffect(() => {
    material.wireframe = props.wireframe
  })
  return <>{material}</>
}

export const PBRMaterial: Component<{
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
