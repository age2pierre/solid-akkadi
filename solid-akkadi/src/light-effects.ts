import { type Light } from '@babylonjs/core'
import { createEffect, mergeProps } from 'solid-js'
import { type SetRequired } from 'type-fest'

import { type Vec3 } from './math'

/**
 * @category Lights
 */
export type CommonLightProps = {
  name?: string
  intensity?: number
  color?: Vec3
}

/**
 * The function creates a reactive effect by setting
 * the name, intensity, and color of a given light.
 *
 * @category Lights
 */
export function createCommonLightEffect(
  light: Light,
  _props: SetRequired<CommonLightProps, 'name'>,
) {
  const props = mergeProps(
    {
      intensity: 0.7,
      color: [255, 255, 255] as Vec3,
    },
    _props,
  )

  createEffect(() => {
    light.name = props.name
  })
  createEffect(() => {
    light.intensity = props.intensity
  })
  createEffect(() => {
    const [r, g, b] = props.color
    light.diffuse.r = r
    light.diffuse.g = g
    light.diffuse.b = b
  })
}
