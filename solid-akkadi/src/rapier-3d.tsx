import {
  type Collider,
  type default as Rapier3d,
  type World,
} from '@dimforge/rapier3d-compat'
import { createContext, useContext } from 'solid-js'

/**
 * @category Physic3d
 */
export type Rapier3DContext = {
  rapier: typeof Rapier3d
  world: World
  registerCollisionEvent: (
    collider: Collider,
    onStart?: (target: Collider) => void,
    onEnd?: (target: Collider) => void,
  ) => void
  cleanupCollisionEvent: (collider: Collider) => void
}

export const Rapier3DContext = createContext<Rapier3DContext>()

/**
 * Utility function to retrieve the physics context.
 * Can only be used inside <Physics /> throws otherwise
 *
 * @category Physic3d
 */
export function useRapier3D() {
  const ctx = useContext(Rapier3DContext)
  if (!ctx) {
    throw new Error('useRapier can only be used inside <Physics/>')
  }
  return ctx
}
