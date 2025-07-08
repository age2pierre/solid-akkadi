// adapted from https://github.com/gvergnaud/rx-ease
import { type Observer, type Scene } from '@babylonjs/core'
import {
  type Accessor,
  batch,
  createEffect,
  createSignal,
  on,
  onCleanup,
  type Setter,
  untrack,
} from 'solid-js'
import { type ReadonlyTuple } from 'type-fest'

import { useBabylon } from './babylon'
import { mapByEntries, zip } from './utils'

const DEFAULT = {
  stiffness: 170,
  damping: 26,
  secondPerFrame: 1 / 60,
  precision: 0.01,
}

function stepper(
  value: number,
  velocity: number,
  destValue: number,
  stiffness = DEFAULT.stiffness,
  damping = DEFAULT.damping,
  secondPerFrame = DEFAULT.secondPerFrame,
  precision = DEFAULT.precision,
): {
  value: number
  velocity: number
} {
  // Spring stiffness, in kg / s^2
  const fSpring = -stiffness * (value - destValue)

  // Damping, in kg / s
  const fDamper = -damping * velocity

  // usually we put mass here, but you could simply adjust stiffness and damping accordingly
  // const a = (Fspring + Fdamper) / mass
  const acc = fSpring + fDamper

  const updatedVelocity = velocity + acc * secondPerFrame
  const updatedValue = value + updatedVelocity * secondPerFrame

  if (
    Math.abs(updatedVelocity) < precision &&
    Math.abs(updatedValue - destValue) < precision
  ) {
    return {
      value: destValue,
      velocity: 0,
    }
  }

  return {
    value: updatedValue,
    velocity: updatedVelocity,
  }
}

/**
 * @category SpringAnimation
 */
export type SpringOpts = {
  initVelocity?: number
  /** describe how the spring resists deformation */
  stiffness?: number
  /** describe how the resistance to the spring movement */
  damping?: number
  /** once the velocity and value are under this threshold, the simualtion is stopped */
  precision?: number
}

/**
 * Creates a signal whose value is updated by a spring simulations.
 * The simulation is run on every frame until the spring comes to a rest.
 * You can set the target value to reach at any time, when the spring is moving or at rest.
 * This allows for the creation of natural motion when interrupting an animation.
 *
 * @category SpringAnimation
 */
export function createSpringSignal(
  initVal: number,
  opts: SpringOpts = {},
): readonly [
  value: Accessor<number>,
  set_value: Setter<number>,
  velocity: Accessor<number>,
] {
  const [value, setValue] = createSignal(initVal)
  const [velocity, setVelocity] = createSignal(opts.initVelocity ?? 0)
  const [targetValue, setTargetValue] = createSignal(initVal)

  const { scene, engine } = useBabylon()

  let observer: Observer<Scene> | null = null

  onCleanup(() => {
    scene.onBeforeRenderObservable.remove(observer)
  })

  createEffect(
    on(targetValue, () => {
      observer =
        observer ??
        scene.onBeforeRenderObservable.add(() => {
          const deltaMs = engine.getDeltaTime()
          const currentVelocity = untrack(velocity)
          const currentValue = untrack(value)
          const { value: nexValue, velocity: nextVelocity } = stepper(
            currentValue,
            currentVelocity,
            untrack(targetValue),
            opts.stiffness,
            opts.damping,
            deltaMs / 1000,
            opts.precision,
          )
          batch(() => {
            setValue(nexValue)
            setVelocity(nextVelocity)
          })
          if (nextVelocity === 0) {
            scene.onBeforeRenderObservable.remove(observer)
            observer = null
          }
        })
    }),
  )
  return [value, setTargetValue, velocity] as const
}

/**
 * Similar to its singular version createSpringSignal, but takes an array of values.
 * They can share their options or be set indepently.
 *
 * @category SpringAnimation
 */
export function createSpringSignals<L extends number>(
  initVals: ReadonlyTuple<number, L>,
  opts: {
    initVelocity?: number | ReadonlyTuple<number, L>
    stiffness?: number | ReadonlyTuple<number, L>
    damping?: number | ReadonlyTuple<number, L>
    precision?: number | ReadonlyTuple<number, L>
  } = {},
): readonly [
  values: Accessor<ReadonlyTuple<number, L>>,
  set_target_values: Setter<ReadonlyTuple<number, L>>,
  velocities: Accessor<ReadonlyTuple<number, L>>,
] {
  const mappedOpts = mapByEntries(
    {
      initVelocities: opts.initVelocity ?? 0,
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

  const [values, setValues] = createSignal(initVals)
  const [velocities, setVelocities] = createSignal(mappedOpts.initVelocities)
  const [targetValues, setTargetValues] = createSignal(initVals)

  const { scene, engine } = useBabylon()

  let observer: Observer<Scene> | null = null

  onCleanup(() => {
    scene.onBeforeRenderObservable.remove(observer)
  })

  createEffect(
    on(targetValues, () => {
      observer =
        observer ??
        scene.onBeforeRenderObservable.add(() => {
          const deltaMs = engine.getDeltaTime()
          const currentVelocities = untrack(velocities)
          const currentValues = untrack(values)
          const deltaSecond = deltaMs / 1000
          const next = zip(
            currentValues as number[],
            currentVelocities as number[],
            untrack(targetValues) as number[],
            mappedOpts.stiffness as number[],
            mappedOpts.damping as number[],
            mappedOpts.precision as number[],
          ).map(
            ([currentValue, currentVelocity, targetN, stiffN, dampN, precN]) =>
              stepper(
                currentValue,
                currentVelocity,
                targetN,
                stiffN,
                dampN,
                deltaSecond,
                precN,
              ),
          )
          const nextValues = next.map((n) => n.value)
          const nextVelocities = next.map((n) => n.velocity)
          batch(() => {
            setValues(() => nextValues as ReadonlyTuple<number, L>)
            setVelocities(() => nextVelocities as ReadonlyTuple<number, L>)
          })
          if (nextVelocities.every((nv) => nv === 0)) {
            scene.onBeforeRenderObservable.remove(observer)
            observer = null
          }
        })
    }),
  )
  return [values, setTargetValues, velocities] as const
}

/**
 * Some presets to use as option for createSpringSignal(s)
 *
 * @category SpringAnimation
 */
export const SPRING_PRESETS = {
  noWobble: { stiffness: 170, damping: 26 },
  gentle: { stiffness: 120, damping: 14 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 210, damping: 20 },
  slow: { stiffness: 280, damping: 60 },
  molasses: { stiffness: 280, damping: 120 },
} as const satisfies Record<string, SpringOpts>
