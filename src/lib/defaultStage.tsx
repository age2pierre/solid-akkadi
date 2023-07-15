import { createEffect, createMemo, mergeProps, onCleanup } from 'solid-js'
import { useBabylon } from './babylon'
import {
  ArcRotateCamera,
  type IEnvironmentHelperOptions,
} from '@babylonjs/core'

/** Adds an hemispheric light, a skybox and a ground mesh */
export function DefaultEnvironment(props: {
  options?: Partial<IEnvironmentHelperOptions>
}) {
  const { scene } = useBabylon()
  scene.createDefaultLight()
  const environementHelper = createMemo(() => {
    const ret = scene.createDefaultEnvironment(props.options)
    if (ret == null) {
      console.error('DefaultEnvironment: environementHelper is null')
    }
    return ret
  })

  onCleanup(() => {
    environementHelper()?.dispose()
  })

  createEffect(() => {
    environementHelper()?.updateOptions(props.options ?? {})
  })

  return <>{environementHelper()?.rootMesh}</>
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
