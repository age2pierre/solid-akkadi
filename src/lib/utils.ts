import type { FixedLengthArray, ReadonlyTuple, Split } from 'type-fest'
import type { ObjectEntry } from 'type-fest/source/entry'
import type { Vec3 } from './types'
import { Color3 } from '@babylonjs/core'

export function split<S extends string, D extends string>(
  string: S,
  separator: D,
): Split<S, D> {
  return string.split(separator) as any
}

export function entries<T extends object>(obj: T): Array<ObjectEntry<T>> {
  return Object.entries(obj) as any
}

export function fromEntries<K extends string, T>(
  entries: Iterable<readonly [K, T]>,
): { [k in K]: T } {
  return Object.fromEntries(entries) as any
}

export function keys<T extends object>(o: T): Array<keyof T> {
  return Object.keys(o) as any
}

export function range(arraySize: number): number[] {
  return [...Array(arraySize).keys()]
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

export function exhaustiveCheck(_param: never): void {
  const trace = new Error().stack
  console.error(
    `exhaustiveCheck : case ${_param} is not handled, trace: ${trace}`,
  )
  return
}

export function uncapitalize<S extends string>(str: S): Uncapitalize<S> {
  return [str.at(0)?.toLocaleLowerCase(), str.slice(1)].join(
    '',
  ) as Uncapitalize<S>
}

export function capitalize<S extends string>(str: S): Capitalize<S> {
  return [str.at(0)?.toLocaleUpperCase(), str.slice(1)].join(
    '',
  ) as Capitalize<S>
}

export function mapByEntries<T extends object, MappedK extends string, MappedV>(
  obj: T,
  mapper: (entry: ObjectEntry<T>) => [MappedK, MappedV],
): { [k in MappedK]: MappedV } {
  return fromEntries(entries(obj).map(mapper))
}

export function zip<A, B, C, D, E, F, L extends number>(
  a: ReadonlyTuple<A, L>,
  b: ReadonlyTuple<B, L>,
  c: ReadonlyTuple<C, L>,
  d: ReadonlyTuple<D, L>,
  e: ReadonlyTuple<E, L>,
  f: ReadonlyTuple<F, L>,
): FixedLengthArray<[A, B, C, D, E, F], L>
export function zip<A, B, C, D, E, L extends number>(
  a: ReadonlyTuple<A, L>,
  b: ReadonlyTuple<B, L>,
  c: ReadonlyTuple<C, L>,
  d: ReadonlyTuple<D, L>,
  e: ReadonlyTuple<E, L>,
): FixedLengthArray<[A, B, C, D, E], L>
export function zip<A, B, C, D, L extends number>(
  a: ReadonlyTuple<A, L>,
  b: ReadonlyTuple<B, L>,
  c: ReadonlyTuple<C, L>,
  d: ReadonlyTuple<D, L>,
): FixedLengthArray<[A, B, C, D], L>
export function zip<A, B, C, L extends number>(
  a: ReadonlyTuple<A, L>,
  b: ReadonlyTuple<B, L>,
  c: ReadonlyTuple<C, L>,
): FixedLengthArray<[A, B, C], L>
export function zip<A, B, L extends number>(
  a: ReadonlyTuple<A, L>,
  b: ReadonlyTuple<B, L>,
): FixedLengthArray<[A, B], L>
export function zip<A, L extends number>(
  a: ReadonlyTuple<A, L>,
  ...b: ReadonlyTuple<unknown, L>[]
): FixedLengthArray<[A, ...unknown[]], L> {
  return (a as A[]).map(
    (e, i) => [e, ...b.flatMap((c) => (c as unknown[])[i])] as const,
  ) as any as FixedLengthArray<[A, ...unknown[]], L>
}

export function fromHexToVec3(hexStr: string): Vec3 {
  const c3 = Color3.FromHexString(hexStr)
  return [c3.r, c3.g, c3.b] as const
}

export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num
}
