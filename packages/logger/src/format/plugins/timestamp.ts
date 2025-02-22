import fecha from 'fecha'
import format from '../format'

export interface TimestampOptions {
  /**
   * Either the format as a string accepted by the [fecha](https://github.com/taylorhakes/fecha)
   * module or a function that returns a formatted date. If no format is provided `new
   * Date().toISOString()` will be used.
   */
  format?: string | (() => string)
  /**
   * The name of an alias for the timestamp property, that will be added to the `info` object.
   */
  alias?: string
}

/*
 * function timestamp (info)
 * Returns a new instance of the timestamp Format which adds a timestamp
 * to the info. It was previously available in winston < 3.0.0 as:
 *
 * - { timestamp: true }             // `new Date.toISOString()`
 * - { timestamp: function:String }  // Value returned by `timestamp()`
 */
export default format<TimestampOptions>((info, opts = {}) => {
  if (opts.format) {
    info.timestamp = typeof opts.format === 'function'
      ? opts.format()
      : fecha.format(new Date(), opts.format)
  }

  if (!info.timestamp) {
    info.timestamp = new Date().toISOString()
  }

  if (opts.alias) {
    info[opts.alias] = info.timestamp
  }

  return info
})
