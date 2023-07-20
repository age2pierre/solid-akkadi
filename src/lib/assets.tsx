import { AbstractMesh, Node } from '@babylonjs/core'
import { createMemo, createResource, onCleanup } from 'solid-js'

import type metadata from '../assets/metadata'
import { useBabylon } from './babylon'
import { includes } from './utils'

export type AssetMetadata = typeof metadata
export type AssetFileName = keyof AssetMetadata

/** Load an assets from a common store, instantiate in the scene as a whole or partially by filtering by names */
export function MeshAsset<F extends AssetFileName>(props: {
  assetFile: F
  namesToInstantiate?: Array<AssetMetadata[F]['meshes'][number]>
}) {
  const { scene, getAsset } = useBabylon()

  const [instancedRoots] = createResource(
    () => props.assetFile,
    async (file) => {
      const container = await getAsset(file)
      const entries = container.instantiateModelsToScene(undefined, undefined, {
        predicate: (entity) => {
          if (!props.namesToInstantiate) return true
          return (
            entity instanceof Node &&
            includes(props.namesToInstantiate, entity.name)
          )
        },
      })
      return entries.rootNodes
    },
  )

  const meshInstances = createMemo(() => {
    return instancedRoots() ?? []
  })

  onCleanup(() => {
    for (const entry of instancedRoots() ?? []) {
      if (entry instanceof AbstractMesh) {
        scene.removeMesh(entry, true)
      } else {
        console.warn(
          `MeshAsset onCleanUp entry node ${entry.getClassName()} not handled`,
        )
      }
    }
  })

  return <>{meshInstances()}</>
}
