import type { TransformableInfo } from '../type'
import format from '../format'

export interface MetadataOptions {
  /**
   * The name of the key used for the metadata object. Defaults to `metadata`.
   */
  key?: string
  /**
   * An array of keys that should not be added to the metadata object.
   */
  fillExcept?: string[]
  /**
   * An array of keys that will be added to the metadata object.
   */
  fillWith?: string[]
}

function fillExcept(info: TransformableInfo, fillExceptKeys: string[], metadataKey: string) {
  const savedKeys = fillExceptKeys.reduce((acc, key) => {
    acc[key] = info[key]
    delete info[key]
    return acc
  }, {} as TransformableInfo)

  const metadata = Object.keys(info).reduce((acc, key) => {
    acc[key] = info[key]
    delete info[key]
    return acc
  }, {} as TransformableInfo)

  Object.assign(info, savedKeys, {
    [metadataKey]: metadata,
  })

  return info
}

function fillWith(info: TransformableInfo, fillWithKeys: string[], metadataKey: string) {
  info[metadataKey] = fillWithKeys.reduce((acc, key) => {
    acc[key] = info[key]
    delete info[key]
    return acc
  }, {} as TransformableInfo)

  return info
}

/**
 * Adds in a "metadata" object to collect extraneous data, similar to the metadata
 * object in winston 2.x.
 */
export default format<MetadataOptions>((info, opts = {}) => {
  const metadataKey = opts.key || 'metadata'

  let fillExceptKeys: string[] = []
  if (!opts.fillExcept && !opts.fillWith) {
    fillExceptKeys.push('level')
    fillExceptKeys.push('message')
  }

  if (opts.fillExcept) {
    fillExceptKeys = opts.fillExcept
  }

  if (fillExceptKeys.length > 0) {
    return fillExcept(info, fillExceptKeys, metadataKey)
  }

  if (opts.fillWith) {
    return fillWith(info, opts.fillWith, metadataKey)
  }

  return info
})
