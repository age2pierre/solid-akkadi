import { TransformNode, Vector3 } from '@babylonjs/core'
import {
  createEffect,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import { createParentingEffect } from './effects'
import { createSpringSignals, type SpringOpts } from './spring-signals'

/**
 * @category SpringAnimation
 */
export type SpringGroupProps = ParentProps & {
  /** not reactive */
  opts?: SpringOpts
  name?: string
}

/**
 * @category SpringAnimation
 */
export function SpringGroup(inputProps: SpringGroupProps): JSX.Element {
  const { scene } = useBabylon()

  const props = mergeProps(
    {
      name: `SpringGroup_${createUniqueId()}`,
    },
    inputProps,
  )

  const [pos, setPos] = createSpringSignals<3>(
    [0, 0, 0],
    untrack(() => inputProps.opts),
  )

  const node = new TransformNode(
    untrack(() => props.name),
    scene,
  )
  const anchor = new TransformNode(untrack(() => props.name) + '_anchor', scene)

  const vector = new Vector3()
  createEffect(() => {
    const [x, y, z] = pos()
    Vector3.FromFloatsToRef(x, y, z, vector)
    anchor.setAbsolutePosition(vector)
  })

  const observer = node.onAfterWorldMatrixUpdateObservable.add(() => {
    const { x, y, z } = node.getAbsolutePosition()
    setPos([x, y, z])
  })

  createParentingEffect(() => anchor)

  onCleanup(() => {
    observer.remove()
  })
  return <>{node}</>
}
