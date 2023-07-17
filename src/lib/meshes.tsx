import type { ActionEvent, IAction, Mesh, Scene } from '@babylonjs/core'
import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  Material,
  MeshBuilder as CoreMeshBuilder,
  Node,
} from '@babylonjs/core'
import type { ParentProps } from 'solid-js'
import {
  children,
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
} from 'solid-js'
import type { ResolvedChildren } from 'solid-js/types/reactive/signal'
import type { ConditionalPick, Replace } from 'type-fest'

import { useBabylon } from './babylon'
import { capitalize } from './utils'

type MeshBuilderWithSameSignature = ConditionalPick<
  typeof CoreMeshBuilder,
  (name: string, opts: object, scene: Scene) => Mesh
>

/**
 * Can take material as a child
 */
export function MeshBuilder<
  K extends Replace<keyof MeshBuilderWithSameSignature, 'Create', ''>,
>(
  _props: ParentProps<{
    kind: K
    name?: string
    opts: Parameters<MeshBuilderWithSameSignature[`Create${K}`]>[1]
  }>,
) {
  const { scene } = useBabylon()

  const props = mergeProps({ opts: {} }, _props)
  const resolved = children(() => _props.children)

  const mesh_instance = createMemo(() =>
    CoreMeshBuilder[`Create${props.kind}`](
      props.name ?? `${_props.kind}_${createUniqueId()}`,
      props.opts,
      scene,
    ),
  )

  createEffect(() => {
    resolved.toArray().forEach((child) => {
      if (child && child instanceof Material) {
        mesh_instance().material = child
      }
    })
  })

  onCleanup(() => {
    mesh_instance().parent = null
    scene.removeMesh(mesh_instance(), true)
  })

  return <>{mesh_instance()}</>
}

/**
 * Takes mesh children (recursively) and add mouse event capabilities, etc...
 */
export function MeshController(
  _props: ParentProps<{
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
  }>,
) {
  const { scene } = useBabylon()
  const props = mergeProps({ visibility: 1 }, _props)
  const resolved = children(() => _props.children)
  const actionMap = new Map<MouseEvent, IAction>()

  // helper to create the different mouse interaction effect
  function createMouseEffect(kind: MouseEvent) {
    createEffect(() => {
      for (const child of childMeshes()) {
        if (!child.actionManager) {
          child.actionManager = new ActionManager(scene)
        }
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

  const childMeshes = createMemo(() => {
    function getMeshes(child: ResolvedChildren) {
      if (child instanceof AbstractMesh) {
        return [child, ...child.getChildMeshes()]
      }
      if (child instanceof Node) {
        return child.getChildMeshes()
      }
      throw new Error('MeshController child is not an Babylon Node')
    }
    const _child = resolved()
    if (Array.isArray(_child)) {
      return _child.flatMap(getMeshes)
    }
    return getMeshes(_child)
  })

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
