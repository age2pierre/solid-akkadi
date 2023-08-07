import { AbstractMesh, Node, TransformNode } from '@babylonjs/core'
import {
  children,
  createEffect,
  createMemo,
  createResource,
  createUniqueId,
  mergeProps,
  onCleanup,
  type ParentProps,
  untrack,
} from 'solid-js'

import { useBabylon } from './babylon'
import {
  createAttachChildEffect,
  createAttachMaterialEffect,
  createTransformsEffect,
  type TransformsProps,
} from './effects'
import { type Vec3 } from './types'
import { includes } from './utils'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace SolidAkkadi {
    /**
     * To be extended by user app, should satisfies Record<string, FileMetadata>
     * @category Meshes
     *  */
    export interface AssetRecord {}
  }
}

/**
 * @category Meshes
 */
export type AssetName = keyof SolidAkkadi.AssetRecord

/**
 * @category Meshes
 */
export type FileMetadata = {
  file_extension: string
  meshes: string[]
  animationGroups: string[]
  materials: string[]
  skeletons: string[]
  cameras: string[]
  textures: string[]
}

/**
 * @category Meshes
 */
export type MeshAssetProps<F extends AssetName> = TransformsProps &
  ParentProps & {
    name?: string
    assetFile: F
    namesToInstantiate?: Array<SolidAkkadi.AssetRecord[F]['meshes'][number]>
  }

/**
 * Load an assets from a common store, instantiate in the scene as a whole or partially by filtering by names
 *
 * @category Meshes
 */
export function MeshAsset<F extends AssetName>(inputProps: MeshAssetProps<F>) {
  const { scene, getAsset } = useBabylon()

  const [instancedRoots] = createResource(
    () => inputProps.assetFile,
    async (file) => {
      const container = await getAsset(file)
      const entries = container.instantiateModelsToScene(undefined, undefined, {
        predicate: (entity) => {
          if (!inputProps.namesToInstantiate) return true
          return (
            entity instanceof Node &&
            includes(inputProps.namesToInstantiate, entity.name)
          )
        },
        doNotInstantiate: false,
      })
      return entries.rootNodes
    },
  )

  const resolved = children(() => inputProps.children)
  const _props = mergeProps(
    { name: `MeshAsset_${createUniqueId()}`, scale: [1, 1, 1] as Vec3 },
    inputProps,
  )
  const nodes = createMemo(() => {
    const roots = instancedRoots() ?? []
    const name = _props.name
    roots.forEach((root, i) => (root.name = i === 0 ? name : `${name}_${i}`))
    return roots
  })

  createEffect(() => {
    nodes()
      .filter((node): node is TransformNode => node instanceof TransformNode)
      .forEach((tfNode) => {
        createTransformsEffect(inputProps, () => tfNode)
      })
    nodes()
      .filter((node): node is AbstractMesh => node instanceof AbstractMesh)
      .forEach((mesh) => {
        createAttachMaterialEffect(resolved, () => mesh)
      })
    if (nodes().length === 1) {
      createAttachChildEffect(resolved, () => nodes()[0])
    } else if (nodes().length > 1) {
      console.warn(
        `${untrack(() => _props.name)} has multiple roots (${
          nodes().length
        }), you cannot attach children to it`,
      )
    }
  })

  onCleanup(() => {
    for (const entry of nodes()) {
      if (entry instanceof AbstractMesh) {
        scene.removeMesh(entry, true)
      } else {
        console.warn(
          `MeshAsset onCleanUp entry node ${entry.getClassName()} not handled`,
        )
      }
    }
  })

  return <>{nodes()}</>
}
