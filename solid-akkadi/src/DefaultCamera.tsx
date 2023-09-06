import { ArcRotateCamera } from '@babylonjs/core'
import { createEffect, mergeProps } from 'solid-js'

import { useBabylon } from './babylon'

/**
 * Adds a default arc rotate camera controllable by mouse
 *
 * @category DefaultStaging
 */

export function DefaultCamera(inputProps: DefaultCameraProps) {
  const { scene } = useBabylon()
  scene.createDefaultCamera(true, true, true)
  const props = mergeProps(
    {
      alpha: 0,
      beta: 0,
      radius: 5,
    },
    inputProps,
  )
  createEffect(() => {
    if (scene.activeCamera instanceof ArcRotateCamera) {
      scene.activeCamera.alpha = props.alpha
      scene.activeCamera.beta = props.beta
      scene.activeCamera.radius = props.radius
    } else {
      console.error(
        'DefaultCamera: scene.activeCamera is not an instance of ArcRotateCamera, could not update props',
      )
    }
  })
  return <>{scene.activeCamera}</>
}
/**
 * @category DefaultStaging
 */

export type DefaultCameraProps = {
  alpha?: number
  beta?: number
  radius?: number
}
