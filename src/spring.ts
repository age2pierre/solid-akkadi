import { batch, createEffect, createSignal, onCleanup, untrack } from 'solid-js'
import { useAkkadi } from './context'
import type { Observer, Scene } from '@babylonjs/core'

export function stepper(
  value: number,
  velocity: number,
  dest_value: number,
  stiffness = 170,
  damping = 20,
  second_per_frame = 1 / 60,
  precision = 0.1,
): {
  value: number
  velocity: number
} {
  // Spring stiffness, in kg / s^2
  const Fspring = -stiffness * (value - dest_value)

  // Damping, in kg / s
  const Fdamper = -damping * velocity

  // usually we put mass here, but you could simply adjust stiffness and damping accordingly
  // const a = (Fspring + Fdamper) / mass
  const acc = Fspring + Fdamper

  const updated_velocity = velocity + acc * second_per_frame
  const updated_value = value + updated_velocity * second_per_frame

  if (
    Math.abs(updated_velocity) < precision &&
    Math.abs(updated_value - dest_value) < precision
  ) {
    return {
      value: dest_value,
      velocity: 0,
    }
  }

  return {
    value: updated_value,
    velocity: updated_velocity,
  }
}

export function createSpringSignal(
  initVal: number,
  opts: {
    init_velocity?: number
    stiffness?: number
    damping?: number
    precision?: number
  } = {},
) {
  const [value, set_value] = createSignal(initVal)
  const [velocity, set_velocity] = createSignal(opts.init_velocity ?? 0)
  const [target_value, set_target_value] = createSignal(initVal)

  const { scene, engine } = useAkkadi()

  let observer: Observer<Scene> | null = null

  onCleanup(() => {
    scene.onBeforeRenderObservable.remove(observer)
  })

  createEffect(() => {
    const target = target_value()

    if (observer == null && target !== untrack(value)) {
      observer = scene.onBeforeRenderObservable.add(() => {
        const delta_ms = engine.getDeltaTime()
        const current_velocity = untrack(velocity)
        const current_value = untrack(value)
        const { value: next_value, velocity: next_velocity } = stepper(
          current_value,
          current_velocity,
          target,
          opts.stiffness,
          opts.damping,
          delta_ms / 1000,
          opts.precision,
        )
        batch(() => {
          set_value(next_value)
          set_velocity(next_velocity)
        })
        if (next_velocity == 0) {
          scene.onBeforeRenderObservable.remove(observer)
          observer = null
        }
      })
    }
  })
  return [value, set_target_value, velocity] as const
}

export const PRESETS = {
  noWobble: { stiffness: 170, damping: 26 },
  gentle: { stiffness: 120, damping: 14 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 210, damping: 20 },
}
