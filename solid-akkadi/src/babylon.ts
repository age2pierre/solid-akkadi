import { type Engine, type Scene } from '@babylonjs/core'
import { createContext, useContext } from 'solid-js'

/**
 * @category Core
 */
export type BabylonCtx = {
  engine: Engine
  scene: Scene
}

export const babylonContext = createContext<BabylonCtx>()

/**
 * Utility function to retrieve the graphics context.
 * Can only be used inside <Canvas /> throws otherwise.
 *
 * @category Core
 */
export function useBabylon() {
  const ctx = useContext(babylonContext)
  if (!ctx) {
    throw new Error('useBabylon can only be used inside <Canvas/>')
  }
  return ctx
}
