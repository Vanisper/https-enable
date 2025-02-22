import type { format as FormatFunc, TransformableInfo } from '../type'
import format from '../format'

type Format = InstanceType<FormatFunc['Format']>

/*
 * function cascade(formats)
 * Returns a function that invokes the `._format` function in-order
 * for the specified set of `formats`. In this manner we say that Formats
 * are "pipe-like", but not a pure pumpify implementation. Since there is no back
 * pressure we can remove all of the "readable" plumbing in Node streams.
 */
function cascade(formats: Format[]): ((info: TransformableInfo) => TransformableInfo) | undefined {
  if (!formats.every(isValidFormat)) {
    return
  }

  return (info: TransformableInfo) => {
    let obj = info
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i]!
      const temp = format.transform(obj, format.options)
      obj = temp
    }

    return obj
  }
}

/*
 * function isValidFormat(format)
 * If the format does not define a `transform` function throw an error
 * with more detailed usage.
 */
function isValidFormat(fmt: Format): boolean {
  if (typeof fmt.transform !== 'function') {
    throw new TypeError([
      'No transform function found on format. Did you create a format instance?',
      'const myFormat = format(formatFn);',
      'const instance = myFormat();',
    ].join('\n'))
  }

  return true
}

/*
 * function combine (info)
 * Returns a new instance of the combine Format which combines the specified
 * formats into a new format. This is similar to a pipe-chain in transform streams.
 * We choose to combine the prototypes this way because there is no back pressure in
 * an in-memory transform chain.
 */
function combine(...formats: Format[]) {
  const combinedFormat = format(cascade(formats)!)
  const instance = combinedFormat()

  Object.defineProperty(instance, 'Format', {
    value: combinedFormat.Format,
  })
  return instance
}

//
// Export the cascade method for use in cli and other
// combined formats that should not be assumed to be
// singletons.
//
export { cascade }

export default combine
