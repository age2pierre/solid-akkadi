import {
  type Mesh,
  MeshBuilder as CoreMeshBuilder,
  type Scene,
} from '@babylonjs/core'
import {
  createMemo,
  createUniqueId,
  type JSX,
  mergeProps,
  onCleanup,
  type ParentProps,
} from 'solid-js'
import { type ConditionalPick, type Replace } from 'type-fest'

import { useBabylon } from './babylon'
import { BjsNodeProvider } from './contexts'
import {
  createParentingEffect,
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
 * Creates a parametric shape. Attaches itself to the nearest parent Node.
 * Can take a material component as a child.
 *
 * @category Meshes
 */

export function MeshBuilder<
  K extends Replace<keyof MeshBuilderWithSameSignature, 'Create', ''>,
>(inputProps: MeshBuilderProps<K>): JSX.Element {
  const { scene } = useBabylon()
  const props = mergeProps({ opts: {} }, inputProps)

  const meshInstance = createMemo(() => {
    return CoreMeshBuilder[`Create${props.kind}`](
      props.name ?? `${props.kind}_${createUniqueId()}`,
      props.opts,
      scene,
    )
  })

  // Attach self to parent
  createParentingEffect(() => meshInstance())
  // Apply own transforms
  createTransformsEffect(props, () => meshInstance())

  onCleanup(() => {
    scene.removeMesh(meshInstance(), true)
  })

  // Provide contexts for children (e.g., materials)
  const _providers = (
    <BjsNodeProvider
      node={meshInstance}
      transformNode={meshInstance}
      abstractMesh={meshInstance}
    >
      {props.children}
    </BjsNodeProvider>
  )

  return <>{meshInstance()}</>
}
