import {
  HemisphericLight as CoreHemisphericLight,
  Vector3,
} from '@babylonjs/core'
import {
  createEffect,
  createUniqueId,
  type JSX,
  mergeProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { type CommonLightProps, createCommonLightEffect } from './light-effects'
import { type Vec3 } from './math'

/**
 * The HemisphericLight simulates the ambient environment light,
 * so the passed direction is the light reflection direction,
 * not the incoming direction.
 *
 * @category Lights
 */

export function HemisphericLight(
  inputProps: HemisphericLightProps,
): JSX.Element {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      direction: [0, 1, 0] as const,
      name: `HemisphericLight_${createUniqueId()}`,
    },
    inputProps,
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

  createCommonLightEffect(light, props)

  return <>{light}</>
}
/**
 * @category Lights
 */

export type HemisphericLightProps = {
  direction?: Vec3
} & CommonLightProps
