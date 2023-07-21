import { Color3 } from '@babylonjs/core'
import { type ReadonlyTuple, type Split } from 'type-fest'
import { type ObjectEntry } from 'type-fest/source/entry'

import { type Vec3 } from './types'

/** same as String.split() but with better typing */
export function split<S extends string, D extends string>(
  string: S,
  separator: D,
): Split<S, D> {
  return string.split(separator) as Split<S, D>
}

/** same as Object.entries() but with better typing */
export function entries<T extends object>(obj: T): Array<ObjectEntry<T>> {
  return Object.entries(obj) as Array<ObjectEntry<T>>
}

/** same as Array.includes() but with better typing */
export function includes<T extends U, U>(
  coll: ReadonlyArray<T>,
  el: U,
): el is T {
  return coll.includes(el as T)
}

/** same as Object.fromEntries() but with better typing */
export function fromEntries<K extends string, T>(
  entries: Iterable<readonly [K, T]>,
): { [k in K]: T } {
  return Object.fromEntries(entries) as { [k in K]: T }
}

/** same as Object.keys() but with better typing */
export function keys<T extends object>(o: T): Array<keyof T> {
  return Object.keys(o) as Array<keyof T>
}

/** creates an array with [0 .. arraySize] */
export function range(arraySize: number): number[] {
  return [...Array(arraySize).keys()]
}

/** not nullish typeguard */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

/** compiler errors if invoked, console warns at runtime if ever reached */
export function exhaustiveCheck(_param: never): void {
  const trace = new Error().stack
  console.error(
    `exhaustiveCheck : case ${_param} is not handled, trace: ${trace}`,
  )
  return
}

/** lower case the first letter of a string */
export function uncapitalize<S extends string>(str: S): Uncapitalize<S> {
  return [str.at(0)?.toLocaleLowerCase(), str.slice(1)].join(
    '',
  ) as Uncapitalize<S>
}

/** upper case the first letter of a string */
export function capitalize<S extends string>(str: S): Capitalize<S> {
  return [str.at(0)?.toLocaleUpperCase(), str.slice(1)].join(
    '',
  ) as Capitalize<S>
}

/** map an object by its entries (tuples key/value) */
export function mapByEntries<T extends object, MappedK extends string, MappedV>(
  obj: T,
  mapper: (entry: ObjectEntry<T>) => [MappedK, MappedV],
): { [k in MappedK]: MappedV } {
  return fromEntries(entries(obj).map(mapper))
}

/**
 * zip([a,a,..,a],[b,b,..,b]) === [[a,b],[a,b],..,[a,b]]
 */
export function zip<T extends ReadonlyArray<unknown>[]>(
  ...args: T
): { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[] {
  const minLength = Math.min(...args.map((arr) => arr.length))
  return range(minLength).map((i) => args.map((arr) => arr[i])) as any
}

/** convert a hex string to a vector of 3 numbers */
export function fromHexToVec3(hexStr: string): Vec3 {
  const c3 = Color3.FromHexString(hexStr)
  return [c3.r, c3.g, c3.b] as const
}

/** returns a floor (min) or ceiling (max) value if not in between */
export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num
}

/** chunk([a,b,c,d,e], 2) === [[a,b],[c,d],[e]] */
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
