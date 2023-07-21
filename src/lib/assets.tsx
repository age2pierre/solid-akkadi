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

import { type default as metadata } from '../assets/metadata'
import { useBabylon } from './babylon'
import {
  createAttachChildEffect,
  createTransformsEffect,
  type TransformsProps,
} from './Group'
import { createAttachMaterialEffect } from './meshes'
import { type Vec3 } from './types'
import { includes } from './utils'

export type AssetMetadata = typeof metadata
export type AssetFileName = keyof AssetMetadata

export type MeshAssetProps<F extends AssetFileName> = TransformsProps &
  ParentProps & {
    name?: string
    assetFile: F
    namesToInstantiate?: Array<AssetMetadata[F]['meshes'][number]>
  }

/**
 * Load an assets from a common store, instantiate in the scene as a whole or partially by filtering by names
 * */
export function MeshAsset<F extends AssetFileName>(
  inputProps: MeshAssetProps<F>,
) {
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
