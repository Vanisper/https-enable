import { LEVEL, MESSAGE } from '../../triple-beam'
import format from '../format'

export interface ErrorsOptions {
  /**
   * If `true`, the `Error` object's `stack` property will be appended to the `info` object.
   */
  stack?: boolean
  /**
   * If `true`, the `Error` object's `cause` property will be appended to the `info` object.
   */
  cause?: boolean
}

/*
 * function errors (info)
 * If the `message` property of the `info` object is an instance of `Error`,
 * replace the `Error` object its own `message` property.
 *
 * Optionally, the Error's `stack` and/or `cause` properties can also be appended to the `info` object.
 */
export default format<ErrorsOptions>((einfo, { stack, cause } = {}) => {
  if (einfo instanceof Error) {
    const info = {
      ...einfo,
      level: einfo.level,
      [LEVEL]: einfo[LEVEL] || einfo.level,
      message: einfo.message,
      [MESSAGE]: einfo[MESSAGE] || einfo.message,
    }

    stack && (info.stack = einfo.stack)
    cause && (info.cause = einfo.cause)
    return info
  }

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore
  if (!(einfo.message instanceof Error))
    return einfo

  // Assign all enumerable properties and the
  // message property from the error provided.
  const err = einfo.message
  Object.assign(einfo, err)
  einfo.message = err.message
  einfo[MESSAGE] = err.message

  // Assign the stack and/or cause if requested.
  stack && (einfo.stack = err.stack)
  cause && (einfo.cause = err.cause)

  return einfo
})
