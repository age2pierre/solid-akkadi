import {
  type EnvironmentHelper,
  type IEnvironmentHelperOptions,
} from '@babylonjs/core'
import { createEffect, type JSX, onCleanup, untrack } from 'solid-js'

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
export function DefaultEnvironment(
  inputProps: DefaultEnvironementProps,
): JSX.Element {
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
    observer.remove()
    environementHelper?.dispose()
  })

  createEffect(() => {
    environementHelper?.updateOptions(inputProps.options ?? {})
  })

  return <></>
}
