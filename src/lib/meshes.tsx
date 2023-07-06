import type { ActionEvent, IAction, Mesh, Scene } from '@babylonjs/core'
import {
  AbstractMesh,
  ActionManager,
  MeshBuilder as CoreMeshBuilder,
  ExecuteCodeAction,
  Material,
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
import { useBabylon } from './useBabylon'
import type { ConditionalPick, Replace } from 'type-fest'
import { capitalize } from './utils'

type MeshBuilderWithSameSignature = ConditionalPick<
  typeof CoreMeshBuilder,
  (name: string, opts: object, scene: Scene) => Mesh
>

export const MeshBuilder = <
  K extends Replace<keyof MeshBuilderWithSameSignature, 'Create', ''>,
>(
  _props: ParentProps<{
    kind: K
    name?: string
    opts: Parameters<MeshBuilderWithSameSignature[`Create${K}`]>[1]
  }>,
) => {
  const { scene } = useBabylon()

  const props = mergeProps({ opts: {} }, _props)
  const resolved = children(() => _props.children)

  const mesh_instance = createMemo(() =>
    CoreMeshBuilder[`Create${_props.kind}`](
      props.name ?? createUniqueId(),
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

export function MeshController(
  _props: ParentProps<{
    visible?: boolean
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
  const props = mergeProps({ visible: true }, _props)
  const resolved = children(() => _props.children)
  const actionMap = new Map<MouseEvent, IAction>()

  function createMouseEffect(kind: MouseEvent) {
    createEffect(() => {
      if (!childMesh().actionManager) {
        childMesh().actionManager = new ActionManager(scene)
      }
      const prevAction = actionMap.get(kind)
      if (prevAction) {
        childMesh().actionManager?.unregisterAction(prevAction)
      }
      const callBack = props[kind]
      if (callBack) {
        const action = new ExecuteCodeAction(
          {
            trigger: ActionManager[`${capitalize(kind)}Trigger`],
          },
          callBack,
        )
        childMesh().actionManager?.registerAction(action)
        actionMap.set(kind, action)
      } else {
        actionMap.delete(kind)
      }
    })
  }

  const childMesh = createMemo(() => {
    const child = resolved()
    if (Array.isArray(child)) {
      throw new Error('MeshController should have only one child mesh')
    }
    if (child instanceof AbstractMesh) {
      return child
    }
    throw new Error('MeshController child is not an AbstractMesh')
  })

  createEffect(() => {
    childMesh().visibility = props.visible ? 1 : 0
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
