import {
  type ActionEvent,
  ActionManager,
  ExecuteCodeAction,
  type IAction,
} from '@babylonjs/core'
import {
  children,
  createEffect,
  type JSX,
  mergeProps,
  type ParentProps,
} from 'solid-js'

import { useBabylon } from './babylon'
import { createMemoChildMeshes } from './effects'
import { capitalize } from './utils'

/**
 * @category Meshes
 */
export type MeshControllerProps = ParentProps & {
  /** sets mesh visibility between 0 and 1 (default is 1 opaque) */
  visiblity?: number
  onPick?: (evt: ActionEvent) => void
  onLeftPick?: (evt: ActionEvent) => void
  onRightPick?: (evt: ActionEvent) => void
  onCenterPick?: (evt: ActionEvent) => void
  onPickDown?: (evt: ActionEvent) => void
  onDoublePick?: (evt: ActionEvent) => void
  onPickUp?: (evt: ActionEvent) => void
  onPickOut?: (evt: ActionEvent) => void
  onLongPress?: (evt: ActionEvent) => void
  onPointerOver?: (evt: ActionEvent) => void
  onPointerOut?: (evt: ActionEvent) => void
}

/**
 * Takes mesh children (recursively) and add mouse event capabilities, etc...
 *
 * @category Meshes
 */
export function MeshController(inputProps: MeshControllerProps): JSX.Element {
  const { scene } = useBabylon()
  const props = mergeProps({ visibility: 1 }, inputProps)
  const resolved = children(() => inputProps.children)
  const actionMap = new Map<MouseEvent, IAction>()

  // helper to create the different mouse interaction effect
  function createMouseEffect(kind: MouseEvent): void {
    createEffect(() => {
      for (const child of childMeshes()) {
        child.actionManager = child.actionManager ?? new ActionManager(scene)
      }
      const prevAction = actionMap.get(kind)
      if (prevAction) {
        for (const child of childMeshes()) {
          child.actionManager?.unregisterAction(prevAction)
        }
      }
      const callBack = props[kind]
      if (callBack) {
        const action = new ExecuteCodeAction(
          {
            trigger: ActionManager[`${capitalize(kind)}Trigger`],
          },
          callBack,
        )
        for (const child of childMeshes()) {
          child.actionManager?.registerAction(action)
        }
        actionMap.set(kind, action)
      } else {
        actionMap.delete(kind)
      }
    })
  }

  const childMeshes = createMemoChildMeshes(resolved)

  createEffect(() => {
    for (const child of childMeshes()) {
      child.visibility = props.visibility
    }
  })

  createMouseEffect('onPick')
  createMouseEffect('onLeftPick')
  createMouseEffect('onRightPick')
  createMouseEffect('onCenterPick')
  createMouseEffect('onPickDown')
  createMouseEffect('onDoublePick')
  createMouseEffect('onPickUp')
  createMouseEffect('onPickOut')
  createMouseEffect('onLongPress')
  createMouseEffect('onPointerOver')
  createMouseEffect('onPointerOut')

  return <>{resolved()}</>
}

type MouseEvent =
  | 'onPick'
  | 'onLeftPick'
  | 'onRightPick'
  | 'onCenterPick'
  | 'onPickDown'
  | 'onDoublePick'
  | 'onPickUp'
  | 'onPickOut'
  | 'onLongPress'
  | 'onPointerOver'
  | 'onPointerOut'
