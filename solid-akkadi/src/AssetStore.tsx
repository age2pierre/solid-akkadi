import { type AssetContainer, SceneLoader } from '@babylonjs/core'
import { type ParentProps, untrack } from 'solid-js'

import { assetStoreContext } from './asset-store'
import { useBabylon } from './babylon'
import { type AssetName } from './MeshAsset'

/**
 * The `AssetStore` component is a component that provides a way to load and store assets in a
 * map.
 *
 * @category Meshes
 */

export function AssetStore(props: AssetStoreProps) {
  const { scene } = useBabylon()

  const assetStore = new Map<string, Promise<AssetContainer>>()

  function getAsset(asset: AssetName): Promise<AssetContainer> {
    const storedAsset = assetStore.get(asset)
    if (storedAsset) {
      return storedAsset
    }
    const url = untrack(() => props.assetUrlMapper)?.(asset) ?? asset
    console.debug(`AssetStore: loading asset ${url} ...`)
    const containerPromise = SceneLoader.LoadAssetContainerAsync(
      url,
      undefined,
      scene,
    )
    assetStore.set(asset, containerPromise)
    return containerPromise
  }

  return (
    <assetStoreContext.Provider
      value={{
        getAsset,
      }}
    >
      {props.children}
    </assetStoreContext.Provider>
  )
}
/**
 * @category Meshes
 */

export type AssetStoreProps = ParentProps & {
  assetUrlMapper?: (assetName: AssetName) => string
}
