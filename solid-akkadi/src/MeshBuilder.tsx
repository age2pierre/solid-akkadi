import {
  type Mesh,
  MeshBuilder as CoreMeshBuilder,
  type Scene,
} from '@babylonjs/core'
import {
  children,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  type ParentProps,
} from 'solid-js'
import { type ConditionalPick, type Replace } from 'type-fest'

import { useBabylon } from './babylon'
import {
  createAttachChildEffect,
  createAttachMaterialEffect,
  createTransformsEffect,
  type TransformsProps,
} from './effects'

type MeshBuilderWithSameSignature = ConditionalPick<
  typeof CoreMeshBuilder,
  (name: string, opts: object, scene: Scene) => Mesh
>
/**
 * @category Meshes
 */

export type MeshBuilderProps<
  K extends Replace<keyof MeshBuilderWithSameSignature, 'Create', ''>,
> = ParentProps &
  TransformsProps & {
    kind: K
    name?: string
    opts: Parameters<MeshBuilderWithSameSignature[`Create${K}`]>[1]
  }
/**
 * Creates a parametric shape.
 * Can take material as a child.
 *
 * @category Meshes
 */

export function MeshBuilder<
  K extends Replace<keyof MeshBuilderWithSameSignature, 'Create', ''>,
>(inputProps: MeshBuilderProps<K>) {
  const { scene } = useBabylon()

  const props = mergeProps({ opts: {} }, inputProps)
  const resolved = children(() => inputProps.children)

  const meshInstance = createMemo(() => {
    return CoreMeshBuilder[`Create${props.kind}`](
      props.name ?? `${inputProps.kind}_${createUniqueId()}`,
      props.opts,
      scene,
    )
  })

  createTransformsEffect(props, meshInstance)
  createAttachChildEffect(resolved, meshInstance)
  createAttachMaterialEffect(resolved, meshInstance)

  onCleanup(() => {
    meshInstance().parent = null
    scene.removeMesh(meshInstance(), true)
  })

  return <>{meshInstance()}</>
}
