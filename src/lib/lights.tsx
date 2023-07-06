import {
  HemisphericLight as CoreHemisphericLight,
  Vector3,
} from '@babylonjs/core'
import { useBabylon } from './useBabylon'
import { createEffect, createUniqueId, mergeProps, untrack } from 'solid-js'
import type { Vec3 } from './types'

export function HemisphericLight(_props: {
  direction?: Vec3
  name?: string
  intensity?: number
}) {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      direction: [0, 1, 0] as const,
      name: createUniqueId(),
      intensity: 0.7,
    },
    _props,
  )

  const light = new CoreHemisphericLight(
    untrack(() => props.name),
    untrack(() => {
      const [x, y, z] = props.direction
      return new Vector3(x, y, z)
    }),
    scene,
  )

  createEffect(() => {
    const [x, y, z] = props.direction
    light.direction.set(x, y, z)
  })

  createEffect(() => {
    light.intensity = props.intensity
  })

  return light as any
}
