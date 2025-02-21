import type { MapArray, MapTuple } from '@https-enable/types'

export interface IsStreamOptions {
  /**
   * When this option is `true`, the method returns `false` if the stream has already been closed.
   * @default true
   */
  checkOpen?: boolean
}

export function isStream(stream: any, { checkOpen = true }: IsStreamOptions = {}) {
  return stream !== null
    && typeof stream === 'object'
    && !!(stream.writable || stream.readable || !checkOpen || (stream.writable === undefined && stream.readable === undefined))
    && typeof stream.pipe === 'function'
}

export function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}

export function numEnum<T extends string>(arr: Array<T>): MapArray<T>
export function numEnum<const T extends readonly string[]>(arr: T): MapTuple<T>
export function numEnum(arr: any[]): any {
  return arr.reduce((acc, key, index) => {
    acc[key] = index
    return acc
  }, {})
}
