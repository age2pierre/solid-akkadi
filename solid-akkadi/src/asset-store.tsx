import { type AssetContainer, SceneLoader } from '@babylonjs/core'
import { createContext, type ParentProps, untrack, useContext } from 'solid-js'

import { useBabylon } from './babylon'
import { type AssetName } from './MeshAsset'

/**
 * @category Meshes
 */
export type AssetStoreCtx = {
  getAsset: (asset: AssetName) => Promise<AssetContainer>
}

const AssetStoreContext = createContext<AssetStoreCtx>()

/**
 * Retrieve the asset store context, can only be used inside <AssetStore /> throws otherwise.
 * @category Meshes
 */
export function useAssetStore() {
  const ctx = useContext(AssetStoreContext)
  if (!ctx) {
    throw new Error('useAssetStore can only be used inside <AssetStore />')
  }
  return ctx
}

/**
 * @category Meshes
 */
export type AssetStoreProps = ParentProps & {
  assetUrlMapper?: (assetName: AssetName) => string
}

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
    <AssetStoreContext.Provider
      value={{
        getAsset,
      }}
    >
      {props.children}
    </AssetStoreContext.Provider>
  )
}
