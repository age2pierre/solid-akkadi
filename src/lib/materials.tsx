import { PBRMetallicRoughnessMaterial } from '@babylonjs/core'
import {
  type Component,
  createEffect,
  createUniqueId,
  mergeProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { type Vec3 } from './types'

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
