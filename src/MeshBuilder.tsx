import type { Mesh, Scene } from '@babylonjs/core'
import { MeshBuilder as CoreMeshBuilder } from '@babylonjs/core'
import {
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  untrack,
} from 'solid-js'
import { useAkkadi } from './context'
import type { ConditionalPick, Replace } from 'type-fest'

type MeshBuilderWithSameSignature = ConditionalPick<
  typeof CoreMeshBuilder,
  (name: string, opts: object, scene: Scene) => Mesh
>

export function MeshBuilder<
  K extends Replace<keyof MeshBuilderWithSameSignature, 'Create', ''>,
>(props: {
  kind: K
  name?: string
  opts: Parameters<MeshBuilderWithSameSignature[`Create${K}`]>[1]
  visible?: boolean
}) {
  const { scene } = useAkkadi()

  const _props = mergeProps({ opts: {}, visible: true }, props)

  const mesh_instance = createMemo(() =>
    CoreMeshBuilder[`Create${props.kind}`](
      _props.name ?? createUniqueId(),
      _props.opts,
      scene,
    ),
  )

  onCleanup(() => {
    scene.removeMesh(mesh_instance())
  })

  createEffect(() => {
    untrack(mesh_instance).visibility = _props.visible ? 1 : 0
  })

  return <>{mesh_instance()}</>
}
