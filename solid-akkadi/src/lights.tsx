import {
  DirectionalLight as CoreDirectionalLight,
  HemisphericLight as CoreHemisphericLight,
  type Light,
  PointLight as CorePointLight,
  SpotLight as CoreSpotLight,
  Vector3,
} from '@babylonjs/core'
import { createEffect, createUniqueId, mergeProps, untrack } from 'solid-js'
import { type SetRequired } from 'type-fest'

import { useBabylon } from './babylon'
import { type Vec3 } from './types'

type CommonLightProps = {
  name?: string
  intensity?: number
  color?: Vec3
}

function createCommonLightEffect(
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

export type HemisphericLightProps = {
  direction?: Vec3
} & CommonLightProps

/**
 * The HemisphericLight simulates the ambient environment light,
 * so the passed direction is the light reflection direction,
 * not the incoming direction.
 * */
export function HemisphericLight(inputProps: HemisphericLightProps) {
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

export type DirectionalLightProps = {
  direction?: Vec3
} & CommonLightProps

/**
 * The light is emitted from everywhere in the specified direction, and has an infinite range.
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

export type PointLightProps = {
  position?: Vec3
} & CommonLightProps

/**
 * The light is emitted from everywhere in the specified direction, and has an infinite range.
 * */
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

export type SpotLightProps = {
  position?: Vec3
  direction?: Vec3
  angle?: number
  exponent?: number
} & CommonLightProps

/**
 * A spot light is defined by a position, a direction, an angle, and an exponent.
 * These values define a cone of light starting from the position, emitting toward the direction.
 * The angle, in radians, defines the size (field of illumination) of the spotlight's conical beam,
 * and the exponent defines the speed of the decay of the light with distance (reach).
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
