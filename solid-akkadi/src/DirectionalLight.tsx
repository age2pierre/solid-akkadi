import {
  DirectionalLight as CoreDirectionalLight,
  Vector3,
} from '@babylonjs/core'
import { createEffect, createUniqueId, mergeProps, untrack } from 'solid-js'

import { useBabylon } from './babylon'
import { type CommonLightProps, createCommonLightEffect } from './light-effects'
import { type Vec3 } from './math'

/**
 * This light is emitted from everywhere in the specified direction, and has an infinite range.
 *
 * @category Lights
 * */

export function DirectionalLight(inputProps: DirectionalLightProps) {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      direction: [0, 1, 0] as const,
      name: `DirectionalLight_${createUniqueId()}`,
    },
    inputProps,
  )

  const light = new CoreDirectionalLight(
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
  createCommonLightEffect(light, props)
  return <>{light}</>
}
/**
 * @category Lights
 */

export type DirectionalLightProps = {
  direction?: Vec3
} & CommonLightProps
