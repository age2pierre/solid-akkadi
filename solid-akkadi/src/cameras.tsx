import { ArcRotateCamera, Vector3 } from '@babylonjs/core'
import {
  children,
  createEffect,
  createUniqueId,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { createAttachChildEffect } from './effects'
import { type Vec3 } from './types'

/**
 * @category Cameras
 */
export type PolarCameraProp = ParentProps & {
  target?: Vec3
  up?: Vec3
  radius?: number
  azimuth?: number // alpha
  altitude?: number // beta
  name?: string
}

/**
 * The PolarCamera function creates a camera in a 3D scene with polar coordinates, allowing for control
 * of the camera's position and orientation.
 *
 * @category Cameras
 */
export function PolarCamera(inputProps: PolarCameraProp) {
  const { scene } = useBabylon()
  const resolved = children(() => inputProps.children)

  const props = mergeProps(
    {
      target: [0, 0, 0] as Vec3,
      up: [0, 1, 0] as Vec3,
      radius: 10,
      azimuth: 0,
      altitude: Math.PI / 4,
      name: `PolarCamera_${createUniqueId()}`,
    },
    inputProps,
  )

  const [tx, ty, tz] = untrack(() => props.target)
  const camera = new ArcRotateCamera(
    untrack(() => props.name),
    untrack(() => props.azimuth),
    untrack(() => props.altitude),
    untrack(() => props.radius),
    new Vector3(tx, ty, tz),
    scene,
  )
  scene.activeCamera = camera

  createEffect(() => {
    const [x, y, z] = props.target
    Vector3.FromFloatsToRef(x, y, z, camera.target)
  })
  createEffect(() => {
    const [x, y, z] = props.up
    Vector3.FromFloatsToRef(x, y, z, camera.upVector)
  })
  createEffect(() => {
    camera.radius = props.radius
  })
  createEffect(() => {
    camera.alpha = props.azimuth
  })
  createEffect(() => {
    camera.beta = props.altitude
  })
  createEffect(() => {
    camera.name = props.name
  })
  createAttachChildEffect(resolved, () => camera)

  onCleanup(() => {
    scene.removeCamera(camera)
  })

  return <>{camera}</>
}
