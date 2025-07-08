import {
  DirectionalLight as CoreDirectionalLight,
  Vector3,
} from '@babylonjs/core'
import {
  createEffect,
  createUniqueId,
  type JSX,
  mergeProps,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { BjsNodeProvider } from './contexts'
import { createParentingEffect } from './effects'
import { type CommonLightProps, createCommonLightEffect } from './light-effects'
import { type Vec3 } from './math'

/**
 * This light is emitted from everywhere in the specified direction, and has an infinite range.
 *
 * @category Lights
 * */
export function DirectionalLight(
  inputProps: DirectionalLightProps,
): JSX.Element {
  const { scene } = useBabylon()
  const props = mergeProps(
    {
      direction: [0, 1, 0] as Vec3,
      name: `DirectionalLight_${createUniqueId()}`,
    },
    inputProps,
  )

  const light = new CoreDirectionalLight(
    untrack(() => props.name),
    untrack(() => new Vector3(...props.direction)),
    scene,
  )

  // Attach self to parent (e.g. to be transformed by a Group)
  createParentingEffect(() => light)

  createEffect(() => {
    light.direction.set(...props.direction)
  })
  createCommonLightEffect(light, props)

  return (
    <>
      {light}
      <BjsNodeProvider node={() => light} light={() => light}>
        {/* Lights can have children in BJS, e.g. for creating a gizmo */}
        {inputProps.children}
      </BjsNodeProvider>
    </>
  )
}
/**
 * @category Lights
 */
export type DirectionalLightProps = {
  direction?: Vec3
} & ParentProps &
  CommonLightProps
