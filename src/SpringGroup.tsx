import { AbstractMesh, TransformNode, Vector3 } from '@babylonjs/core'
import {
  children,
  createEffect,
  createUniqueId,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './lib/babylon'
import { createAttachChildEffect } from './lib/Group'
import { createSpringSignals, type SpringOpts } from './lib/spring'

type SpringGroupProps = ParentProps & {
  /** not reactive */
  opts?: SpringOpts
  name?: string
}
export function SpringGroup(inputProps: SpringGroupProps) {
  const { scene } = useBabylon()
  const resolved = children(() => inputProps.children)

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

  const node = new AbstractMesh(
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

  createAttachChildEffect(resolved, () => anchor)

  onCleanup(() => {
    observer?.remove()
  })
  return <>{node}</>
}
