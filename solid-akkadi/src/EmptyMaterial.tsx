import { Material } from '@babylonjs/core'

import { useBabylon } from './babylon'

/**
 * The function returns an empty material from the Babylon.js scene or creates a new one if it doesn't
 * exist.
 * @category Materials
 */
export function EmptyMaterial() {
  const { scene } = useBabylon()
  const material =
    scene.getMaterialByName('EmptyMaterial') ??
    new Material('EmptyMaterial', scene)
  return <>{material}</>
}
