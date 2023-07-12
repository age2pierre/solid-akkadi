import { createEffect, createMemo, createResource, onCleanup } from 'solid-js'
import type metadata from '../assets/metadata'
import { useBabylon } from './useBabylon'
import { AbstractMesh, SceneLoader, TransformNode } from '@babylonjs/core'

export type AssetMetadata = typeof metadata
export type AssetFileName = keyof AssetMetadata

export function MeshAsset(props: { fileName: AssetFileName }) {
  const { scene } = useBabylon()

  const [instancedRoots] = createResource(
    () => props.fileName,
    async (file) => {
      const url = new URL(`../assets/${file}`, import.meta.url).href
      const container = await SceneLoader.LoadAssetContainerAsync(
        url,
        undefined,
        scene,
        // undefined,
        // metadata[file].file_extension,
      )
      const entries = container.instantiateModelsToScene()

      return entries.rootNodes
    },
  )

  const meshInstances = createMemo(() => {
    return instancedRoots() ?? []
  })

  // const tf = new TransformNode('mesh_asset_container', scene)

  // createEffect(() => {
  //   for (const entry of instancedRoots() ?? []) {
  //     entry.parent = tf
  //   }
  // })

  onCleanup(() => {
    for (const entry of instancedRoots() ?? []) {
      // entry.parent = null
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
