import { PointLight as CorePointLight, Vector3 } from '@babylonjs/core'
import { createEffect, createUniqueId, mergeProps, untrack } from 'solid-js'

import { useBabylon } from './babylon'
import { type CommonLightProps, createCommonLightEffect } from './light-effects'
import { type Vec3 } from './math'

/**
 * This light is emitted from everywhere in the specified direction, and has an infinite range.
 *
 * @category Lights
 */

export function PointLight(inputProps: PointLightProps) {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      position: [0, 0, 0] as const,
      name: `PointLight_${createUniqueId()}`,
    },
    inputProps,
  )

  const light = new CorePointLight(
    untrack(() => props.name),
    untrack(() => {
      const [x, y, z] = props.position
      return new Vector3(x, y, z)
    }),
    scene,
  )

  createEffect(() => {
    const [x, y, z] = props.position
    light.position.set(x, y, z)
  })
  createCommonLightEffect(light, props)

  return <>{light}</>
}
/**
 * @category Lights
 */

export type PointLightProps = {
  position?: Vec3
} & CommonLightProps
