import { type AssetContainer } from '@babylonjs/core'
import { createContext, useContext } from 'solid-js'

import { type AssetName } from './MeshAsset'

/**
 * @category Meshes
 */
export type AssetStoreCtx = {
  getAsset: (asset: AssetName) => Promise<AssetContainer>
}

export const AssetStoreContext = createContext<AssetStoreCtx>()

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
