import { createMemo, createResource, onCleanup } from 'solid-js'
import type metadata from '../assets/metadata'
import { useBabylon } from './useBabylon'
import { AbstractMesh } from '@babylonjs/core'

export type AssetMetadata = typeof metadata
export type AssetFileName = keyof AssetMetadata

export function MeshAsset(props: { fileName: AssetFileName }) {
  const { scene, getAsset } = useBabylon()

  const [instancedRoots] = createResource(
    () => props.fileName,
    async (file) => {
      const container = await getAsset(file)
      const entries = container.instantiateModelsToScene()

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
