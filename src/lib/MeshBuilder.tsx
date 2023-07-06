import type { ActionEvent, Mesh, Scene } from '@babylonjs/core'
import {
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
  untrack,
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
    visible?: boolean
  }>,
) => {
  const { scene } = useBabylon()

  const props = mergeProps({ opts: {}, visible: true }, _props)
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

  createEffect(() => {
    untrack(mesh_instance).visibility = props.visible ? 1 : 0
  })

  return <>{mesh_instance()}</>
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

export function registerMeshMouseEvent(
  mesh: Mesh,
  type: MouseEvent,
  cb: (evt: ActionEvent) => void,
) {
  const { scene } = useBabylon()

  if (!mesh.actionManager) {
    mesh.actionManager = new ActionManager(scene)
  }

  const action = new ExecuteCodeAction(
    {
      trigger: ActionManager[`${type}Trigger`],
    },
    cb,
  )
  mesh.actionManager.registerAction(action)

  const unregister = () => {
    if (action) {
      mesh.actionManager?.unregisterAction(action)
    }
  }

  onCleanup(() => {
    unregister()
  })

  return unregister
}
