import { SpotLight as CoreSpotLight, Vector3 } from '@babylonjs/core'
import { createEffect, createUniqueId, mergeProps, untrack } from 'solid-js'

import { useBabylon } from './babylon'
import { type CommonLightProps, createCommonLightEffect } from './light-effects'
import { type Vec3 } from './math'

/**
 * A spot light is defined by a position, a direction, an angle, and an exponent.
 * These values define a cone of light starting from the position, emitting toward the direction.
 * The angle, in radians, defines the size (field of illumination) of the spotlight's conical beam,
 * and the exponent defines the speed of the decay of the light with distance (reach).
 *
 * @category Lights
 */

export function SpotLight(inputProps: SpotLightProps) {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      position: [0, 0, 0] as const,
      direction: [0, -1, 0] as Vec3,
      name: `SpotLight_${createUniqueId()}`,
      angle: Math.PI / 2,
      exponent: 0.5,
    },
    inputProps,
  )

  const light = new CoreSpotLight(
    untrack(() => props.name),
    untrack(() => {
      const [x, y, z] = props.position
      return new Vector3(x, y, z)
    }),
    untrack(() => {
      const [x, y, z] = props.direction
      return new Vector3(x, y, z)
    }),
    untrack(() => props.angle),
    untrack(() => props.exponent),
    scene,
  )

  createEffect(() => {
    light.exponent = props.exponent
  })
  createEffect(() => {
    light.angle = props.angle
  })
  createEffect(() => {
    const [x, y, z] = props.position
    light.position.set(x, y, z)
  })
  createEffect(() => {
    const [x, y, z] = props.direction
    light.direction.set(x, y, z)
  })
  createCommonLightEffect(light, props)

  return <>{light}</>
}
/**
 * @category Lights
 */

export type SpotLightProps = {
  position?: Vec3
  direction?: Vec3
  angle?: number
  exponent?: number
} & CommonLightProps
