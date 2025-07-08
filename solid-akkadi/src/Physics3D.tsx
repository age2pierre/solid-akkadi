import { type Collider } from '@dimforge/rapier3d-compat'
import {
  createEffect,
  type JSX,
  lazy,
  onCleanup,
  type ParentProps,
  Suspense,
} from 'solid-js'

import { useBabylon } from './babylon'
import { type Vec3 } from './math'
import { rapier3DContext } from './rapier-3d'
import { clamp } from './utils'

/**
 * Create the context in which to add simulated bodies.
 * Async component that loads the physics library
 *
 * @category Physic3d
 */

export function Physics3D(props: Physics3DProps): JSX.Element {
  return (
    <Suspense fallback={<></>}>
      <PhysicsImpl gravity={props.gravity}>{props.children}</PhysicsImpl>
    </Suspense>
  )
}
/**
 * @category Physic3d
 */

export type Physics3DProps = ParentProps & {
  /** the direction of gravity, [0, -9.81, 0] by default */
  gravity?: Vec3
}
const PhysicsImpl = lazy(async () => {
  const rapier = await import('@dimforge/rapier3d-compat')
  await rapier.init()
  return {
    default: (inputProps: Physics3DProps): JSX.Element => {
      const { scene, engine } = useBabylon()
      const world = new rapier.World({ x: 0, y: -9.81, z: 0 })
      const eventQueue = new rapier.EventQueue(false)
      const eventMap = new Map<
        number,
        {
          onStart?: (collided: Collider) => void
          onEnd?: (collided: Collider) => void
        }
      >()

      const observer = scene.onAfterRenderObservable.add(() => {
        const deltaMs = engine.getDeltaTime()
        const clampedDelta = clamp(deltaMs / 1000, 0, 0.2)
        world.timestep = clampedDelta
        world.step(eventQueue)

        eventQueue.drainCollisionEvents((h1, h2, started) => {
          const c1 = world.getCollider(h1)
          const c2 = world.getCollider(h2)

          const e1 = eventMap.get(h1)
          const e2 = eventMap.get(h2)

          if (started) {
            e1?.onStart?.(c2)
            e2?.onStart?.(c1)
          } else {
            e1?.onEnd?.(c2)
            e2?.onEnd?.(c1)
          }
        })
      })

      onCleanup(() => {
        scene.onAfterRenderObservable.remove(observer)
      })

      createEffect(() => {
        const [x, y, z] = inputProps.gravity ?? [0, -9.81, 0]
        world.gravity = {
          x,
          y,
          z,
        }
      })

      return (
        <rapier3DContext.Provider
          value={{
            rapier,
            world,
            registerCollisionEvent: (collider, onStart, onEnd) => {
              collider.setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
              eventMap.set(collider.handle, { onEnd, onStart })
              return () => {
                eventMap.delete(collider.handle)
              }
            },
            cleanupCollisionEvent: (collider) => {
              eventMap.delete(collider.handle)
            },
          }}
        >
          {inputProps.children}
        </rapier3DContext.Provider>
      )
    },
  }
})
