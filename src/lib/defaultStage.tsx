import { createEffect, onCleanup, untrack } from 'solid-js'
import { useBabylon } from './useBabylon'
import {
  ArcRotateCamera,
  type IEnvironmentHelperOptions,
} from '@babylonjs/core'

export function DefaultEnvironment(props: {
  options?: Partial<IEnvironmentHelperOptions>
}) {
  const { scene } = useBabylon()
  scene.createDefaultLight()
  const environementHelper = scene.createDefaultEnvironment(
    untrack(() => props.options),
  )

  onCleanup(() => {
    environementHelper?.dispose()
  })

  createEffect(() => {
    environementHelper?.updateOptions(props.options ?? {})
  })

  return null
}

export function DefaultCamera(props: {
  alpha?: number
  beta?: number
  radius?: number
}) {
  const { scene } = useBabylon()
  scene.createDefaultCamera(true, true, true)

  if (scene.activeCamera instanceof ArcRotateCamera) {
    scene.activeCamera.alpha = untrack(() => props.alpha) ?? 0
    scene.activeCamera.beta = untrack(() => props.beta) ?? 0
    scene.activeCamera.radius = untrack(() => props.radius) ?? 5
  }
  return null
}
