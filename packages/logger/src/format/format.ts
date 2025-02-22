import type { format as FormatFunc, TransformFunction } from './type'

/*
 * Displays a helpful message and the source of
 * the format when it is invalid.
 */
class InvalidFormatError extends Error {
  // eslint-disable-next-line ts/no-unsafe-function-type
  constructor(formatFn: Function) {
    super(`Format functions must be synchronous taking two arguments: (info, opts)
Found: ${formatFn.toString().split('\n')[0]}\n`)
    Error.captureStackTrace(this, InvalidFormatError)
  }
}

/*
 * function format (formatFn)
 * Returns a create function for the `formatFn`.
 */
const format = function<T extends Record<any, any>>(formatFn: TransformFunction<T>) {
  if (formatFn.length > 2) {
    throw new InvalidFormatError(formatFn)
  }

  /*
   * function Format (options)
   * Base prototype which calls a `_format`
   * function and pushes the result.
   */
  class Format {
    options?: T

    constructor(options: T = {} as T) {
      this.options = options
    }

    transform = formatFn
  }

  //
  // Create a function which returns new instances of
  // Format for simple syntax like:
  //
  // require('winston').formats.json();
  //
  function createFormatWrap(opts?: T) {
    return new Format(opts)
  }

  //
  // Expose the Format through the create function
  // for testability.
  //
  createFormatWrap.Format = Format

  return createFormatWrap
}

export default format as unknown as FormatFunc
