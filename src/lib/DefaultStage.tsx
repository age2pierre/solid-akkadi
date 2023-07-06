import type { Component } from 'solid-js'
import { onCleanup, untrack } from 'solid-js'
import { useBabylon } from './useBabylon'
import type { IEnvironmentHelperOptions } from '@babylonjs/core'

export const DefaultStage: Component<{
  options?: Partial<IEnvironmentHelperOptions>
}> = (props) => {
  const { scene } = useBabylon()

  scene.createDefaultCamera(true, true, true)
  const environementHelper = scene.createDefaultEnvironment(
    untrack(() => props.options),
  )

  onCleanup(() => {
    environementHelper?.dispose()
  })

  return null
}
