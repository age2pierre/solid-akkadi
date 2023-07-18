import {
  ArcRotateCamera,
  type EnvironmentHelper,
  type IEnvironmentHelperOptions,
} from '@babylonjs/core'
import { createEffect, mergeProps, onCleanup, untrack } from 'solid-js'

import { useBabylon } from './babylon'

/** Adds an hemispheric light, a skybox and a ground mesh */
export function DefaultEnvironment(props: {
  options?: Partial<IEnvironmentHelperOptions>
}) {
  const { scene } = useBabylon()
  let environementHelper: EnvironmentHelper | null = null
  scene.createDefaultLight()
  const optsBgColor = untrack(() => props.options?.skyboxColor)
  if (optsBgColor) {
    scene.clearColor = optsBgColor.toColor4()
  }

  const observer = scene.onReadyObservable.addOnce(() => {
    environementHelper = scene.createDefaultEnvironment({
      skyboxSize: 100,
      ...untrack(() => props.options),
    })
  })

  onCleanup(() => {
    observer?.remove()
    environementHelper?.dispose()
  })

  createEffect(() => {
    environementHelper?.updateOptions(props.options ?? {})
  })

  return <></>
}

/** Adds a default arc rotate camera controllable by mouse */
export function DefaultCamera(_props: {
  alpha?: number
  beta?: number
  radius?: number
}) {
  const { scene } = useBabylon()
  scene.createDefaultCamera(true, true, true)
  const props = mergeProps(
    {
      alpha: 0,
      beta: 0,
      radius: 5,
    },
    _props,
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
