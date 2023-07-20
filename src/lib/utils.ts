import { Color3 } from '@babylonjs/core'
import { type ReadonlyTuple, type Split } from 'type-fest'
import { type ObjectEntry } from 'type-fest/source/entry'

import { type Vec3 } from './types'

export function split<S extends string, D extends string>(
  string: S,
  separator: D,
): Split<S, D> {
  return string.split(separator) as Split<S, D>
}

export function entries<T extends object>(obj: T): Array<ObjectEntry<T>> {
  return Object.entries(obj) as Array<ObjectEntry<T>>
}

export function includes<T extends U, U>(
  coll: ReadonlyArray<T>,
  el: U,
): el is T {
  return coll.includes(el as T)
}

export function fromEntries<K extends string, T>(
  entries: Iterable<readonly [K, T]>,
): { [k in K]: T } {
  return Object.fromEntries(entries) as { [k in K]: T }
}

export function keys<T extends object>(o: T): Array<keyof T> {
  return Object.keys(o) as Array<keyof T>
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

export function zip<T extends ReadonlyArray<unknown>[]>(
  ...args: T
): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[] {
  const minLength = Math.min(...args.map((arr) => arr.length))
  return range(minLength).map((i) => args.map((arr) => arr[i])) as any
}

export function fromHexToVec3(hexStr: string): Vec3 {
  const c3 = Color3.FromHexString(hexStr)
  return [c3.r, c3.g, c3.b] as const
}

export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num
}

export function chunk<T, L extends number>(
  arr: Array<T>,
  size: L,
): Array<ReadonlyTuple<T, L>> {
  if (!arr.length) {
    return []
  }
  return [...[arr.slice(0, size)], ...chunk(arr.slice(size), size)] as Array<
    ReadonlyTuple<T, L>
  >
}
