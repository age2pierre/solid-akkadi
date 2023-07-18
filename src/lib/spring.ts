// adapted from https://github.com/gvergnaud/rx-ease
import type { Observer, Scene } from '@babylonjs/core'
import type { Accessor, Setter } from 'solid-js'
import {
  batch,
  createEffect,
  createSignal,
  on,
  onCleanup,
  untrack,
} from 'solid-js'
import type { ReadonlyTuple } from 'type-fest'

import { useBabylon } from './babylon'
import { mapByEntries, zip } from './utils'

const DEFAULT = {
  stiffness: 170,
  damping: 20,
  second_per_frame: 1 / 60,
  precision: 0.1,
}

export function stepper(
  value: number,
  velocity: number,
  dest_value: number,
  stiffness = DEFAULT.stiffness,
  damping = DEFAULT.damping,
  second_per_frame = DEFAULT.second_per_frame,
  precision = DEFAULT.precision,
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

type SpringOpts = {
  init_velocity?: number
  stiffness?: number
  damping?: number
  precision?: number
}

export function createSpringSignal(
  initVal: number,
  opts: SpringOpts = {},
): readonly [
  value: Accessor<number>,
  set_value: Setter<number>,
  velocity: Accessor<number>,
] {
  const [value, set_value] = createSignal(initVal)
  const [velocity, set_velocity] = createSignal(opts.init_velocity ?? 0)
  const [target_value, set_target_value] = createSignal(initVal)

  const { scene, engine } = useBabylon()

  let observer: Observer<Scene> | null = null

  onCleanup(() => {
    scene.onBeforeRenderObservable.remove(observer)
  })

  createEffect(
    on(target_value, () => {
      if (observer == null) {
        observer = scene.onBeforeRenderObservable.add(() => {
          const delta_ms = engine.getDeltaTime()
          const current_velocity = untrack(velocity)
          const current_value = untrack(value)
          const { value: next_value, velocity: next_velocity } = stepper(
            current_value,
            current_velocity,
            untrack(target_value),
            opts.stiffness,
            opts.damping,
            delta_ms / 1000,
            opts.precision,
          )
          batch(() => {
            set_value(next_value)
            set_velocity(next_velocity)
          })
          if (next_velocity === 0) {
            scene.onBeforeRenderObservable.remove(observer)
            observer = null
          }
        })
      }
    }),
  )
  return [value, set_target_value, velocity] as const
}

export function createSpringSignals<L extends number>(
  initVals: ReadonlyTuple<number, L>,
  opts: {
    init_velocity?: number | ReadonlyTuple<number, L>
    stiffness?: number | ReadonlyTuple<number, L>
    damping?: number | ReadonlyTuple<number, L>
    precision?: number | ReadonlyTuple<number, L>
  } = {},
): readonly [
  values: Accessor<ReadonlyTuple<number, L>>,
  set_target_values: Setter<ReadonlyTuple<number, L>>,
  velocities: Accessor<ReadonlyTuple<number, L>>,
] {
  const _opts = mapByEntries(
    {
      init_velocities: opts.init_velocity ?? 0,
      stiffness: opts.stiffness ?? DEFAULT.stiffness,
      damping: opts.damping ?? DEFAULT.damping,
      precision: opts.precision ?? DEFAULT.precision,
    },
    ([k, v]) => [
      k,
      typeof v === 'number'
        ? (new Array<number>((initVals as number[]).length).fill(
            v,
          ) as ReadonlyTuple<number, L>)
        : v,
    ],
  )

  const [values, set_values] = createSignal(initVals)
  const [velocities, set_velocities] = createSignal(_opts.init_velocities)
  const [target_values, set_target_values] = createSignal(initVals)

  const { scene, engine } = useBabylon()

  let observer: Observer<Scene> | null = null

  onCleanup(() => {
    scene.onBeforeRenderObservable.remove(observer)
  })

  createEffect(
    on(target_values, () => {
      if (observer == null) {
        observer = scene.onBeforeRenderObservable.add(() => {
          const delta_ms = engine.getDeltaTime()
          const current_velocities = untrack(velocities)
          const current_values = untrack(values)
          const delta_s = delta_ms / 1000
          const next = zip(
            current_values as number[],
            current_velocities as number[],
            untrack(target_values) as number[],
            _opts.stiffness as number[],
            _opts.damping as number[],
            _opts.precision as number[],
          ).map(
            ([
              current_value,
              current_velocity,
              target_i,
              stiff_i,
              damp_i,
              prec_i,
            ]) =>
              stepper(
                current_value,
                current_velocity ?? 0,
                target_i,
                stiff_i,
                damp_i,
                delta_s,
                prec_i,
              ),
          )
          const next_values = next.map((n) => n.value)
          const next_velocities = next.map((n) => n.velocity)
          batch(() => {
            set_values(() => next_values as ReadonlyTuple<number, L>)
            set_velocities(() => next_velocities as ReadonlyTuple<number, L>)
          })
          if (next_velocities.every((nv) => nv === 0)) {
            scene.onBeforeRenderObservable.remove(observer)
            observer = null
          }
        })
      }
    }),
  )
  return [values, set_target_values, velocities] as const
}

export const PRESETS = {
  noWobble: { stiffness: 170, damping: 26 },
  gentle: { stiffness: 120, damping: 14 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 210, damping: 20 },
} as const satisfies Record<string, SpringOpts>
