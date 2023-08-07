import {
  ArcRotateCamera,
  type EnvironmentHelper,
  type IEnvironmentHelperOptions,
} from '@babylonjs/core'
import { createEffect, mergeProps, onCleanup, untrack } from 'solid-js'

import { useBabylon } from './babylon'

/**
 * @category DefaultStaging
 */
export type DefaultEnvironementProps = {
  options?: Partial<IEnvironmentHelperOptions>
}

/**
 * Adds an hemispheric light, a skybox and a ground mesh
 * @category DefaultStaging
 */
export function DefaultEnvironment(inputProps: DefaultEnvironementProps) {
  const { scene } = useBabylon()
  let environementHelper: EnvironmentHelper | null = null
  scene.createDefaultLight()

  // set clear color same color as skybox to diminish flashing effect
  const optsBgColor = untrack(() => inputProps.options?.skyboxColor)
  if (optsBgColor) {
    scene.clearColor = optsBgColor.toColor4()
  }

  const observer = scene.onReadyObservable.addOnce(() => {
    environementHelper = scene.createDefaultEnvironment({
      skyboxSize: 100,
      ...untrack(() => inputProps.options),
    })
  })

  onCleanup(() => {
    observer?.remove()
    environementHelper?.dispose()
  })

  createEffect(() => {
    environementHelper?.updateOptions(inputProps.options ?? {})
  })

  return <></>
}

/**
 * @category DefaultStaging
 */
export type DefaultCameraProps = {
  alpha?: number
  beta?: number
  radius?: number
}

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
