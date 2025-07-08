import { Color3 } from '@babylonjs/core'
import { type ReadonlyTuple, type Split } from 'type-fest'
import { type ObjectEntry } from 'type-fest/source/entry'

import { type Vec3 } from './math'

/**
 * Same as String.split() but with better typing
 * @category Utils
 * */
export function split<S extends string, D extends string>(
  string: S,
  separator: D,
): Split<S, D> {
  return string.split(separator) as Split<S, D>
}

/**
 * Same as Object.entries() but with better typing
 * @category Utils
 * */
export function entries<T extends object>(obj: T): Array<ObjectEntry<T>> {
  return Object.entries(obj) as Array<ObjectEntry<T>>
}

/**
 * Same as Array.includes() but with better typing
 * @category Utils
 * */
export function includes<T extends U, U>(coll: readonly T[], el: U): el is T {
  return coll.includes(el as T)
}

/**
 * Same as Object.fromEntries() but with better typing
 * @category Utils
 * */
export function fromEntries<K extends string, T>(
  entries: Iterable<readonly [K, T]>,
): Record<K, T> {
  return Object.fromEntries(entries) as Record<K, T>
}

/**
 * Same as Object.keys() but with better typing
 * @category Utils
 * */
export function keys<T extends object>(o: T): Array<keyof T> {
  return Object.keys(o) as Array<keyof T>
}

/**
 * Creates an array with [0 .. arraySize]
 * @category Utils
 * */
export function range(arraySize: number): number[] {
  return [...Array(arraySize).keys()]
}

/**
 * Not nullish typeguard
 * @category Utils
 * */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

/**
 * Compiler errors if invoked, console warns at runtime if ever reached
 * @category Utils
 * */
export function exhaustiveCheck(_param: never): void {
  const trace = new Error().stack
  console.error(
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `exhaustiveCheck : case ${_param} is not handled, trace: ${trace}`,
  )
  return
}

/**
 * Lower case the first letter of a string
 * @category Utils
 * */
export function uncapitalize<S extends string>(str: S): Uncapitalize<S> {
  return [str.at(0)?.toLocaleLowerCase(), str.slice(1)].join(
    '',
  ) as Uncapitalize<S>
}

/**
 * Upper case the first letter of a string
 * @category Utils
 * */
export function capitalize<S extends string>(str: S): Capitalize<S> {
  return [str.at(0)?.toLocaleUpperCase(), str.slice(1)].join(
    '',
  ) as Capitalize<S>
}

/**
 * Map an object by its entries (tuples key/value)
 * @category Utils
 * */
export function mapByEntries<T extends object, MappedK extends string, MappedV>(
  obj: T,
  mapper: (entry: ObjectEntry<T>) => [MappedK, MappedV],
): Record<MappedK, MappedV> {
  return fromEntries(entries(obj).map(mapper))
}

/**
 * zip([a,a,..,a],[b,b,..,b]) === [[a,b],[a,b],..,[a,b]]
 * @category Utils
 */
export function zip<T extends Array<readonly unknown[]>>(
  ...args: T
): Array<{ [K in keyof T]: T[K] extends Array<infer V> ? V : never }> {
  const minLength = Math.min(...args.map((arr) => arr.length))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return range(minLength).map((i) => args.map((arr) => arr[i])) as any
}

/**
 * Convert a hex string to a vector of 3 numbers
 * @category Utils
 * */
export function fromHexToVec3(hexStr: string): Vec3 {
  const c3 = Color3.FromHexString(hexStr)
  return [c3.r, c3.g, c3.b] as const
}

/**
 * Returns a floor (min) or ceiling (max) value if not in between
 * @category Utils
 * */
export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num
}

/**
 * chunk([a,b,c,d,e], 2) === [[a,b],[c,d],[e]]
 * @category Utils
 * */
export function chunk<T, L extends number>(
  arr: T[],
  size: L,
): Array<ReadonlyTuple<T, L>> {
  if (!arr.length) {
    return []
  }
  return [...[arr.slice(0, size)], ...chunk(arr.slice(size), size)] as Array<
    ReadonlyTuple<T, L>
  >
}
