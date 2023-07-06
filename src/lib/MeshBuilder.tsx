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
    onPick?: () => void
  }>,
) {
  const { scene } = useBabylon()
  const props = mergeProps({ visible: true }, _props)
  const resolved = children(() => _props.children)
  const actionMap = new Map<MouseEvent, IAction>()

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

  createEffect(() => {
    if (!childMesh().actionManager) {
      childMesh().actionManager = new ActionManager(scene)
    }
    const prevAction = actionMap.get('OnPick')
    if (prevAction) {
      childMesh().actionManager?.unregisterAction(prevAction)
    }
    const callBack = props.onPick
    if (callBack) {
      const action = new ExecuteCodeAction(
        {
          trigger: ActionManager[`OnPickTrigger`],
        },
        callBack,
      )
      childMesh().actionManager?.registerAction(action)
      actionMap.set('OnPick', action)
    } else {
      actionMap.delete('OnPick')
    }
  })

  return <>{resolved()}</>
}

type MouseEvent =
  | 'OnPick'
  | 'OnLeftPick'
  | 'OnRightPick'
  | 'OnCenterPick'
  | 'OnPickDown'
  | 'OnDoublePick'
  | 'OnPickUp'
  | 'OnPickOut'
  | 'OnLongPress'
  | 'OnPointerOver'
  | 'OnPointerOut'
