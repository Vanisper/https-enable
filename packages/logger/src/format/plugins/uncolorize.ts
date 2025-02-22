import { MESSAGE } from '../../triple-beam'
import format from '../format'

export interface UncolorizeOptions {
  /**
   * Disables the uncolorize format for `info.level` if set to `false`.
   */
  level?: boolean
  /**
   * Disables the uncolorize format for `info.message` if set to `false`.
   */
  message?: boolean
  /**
   * Disables the uncolorize format for `info[MESSAGE]` if set to `false`.
   */
  raw?: boolean
}

function stripColors(str: string) {
  // eslint-disable-next-line no-control-regex
  return (`${str}`).replace(/\x1B\[\d+m/g, '')
}

/*
 * function uncolorize (info)
 * Returns a new instance of the uncolorize Format that strips colors
 * from `info` objects. This was previously exposed as { stripColors: true }
 * to transports in `winston < 3.0.0`.
 */
export default format<UncolorizeOptions>((info, opts = {}) => {
  if (opts.level !== false) {
    info.level = stripColors(info.level)
  }

  if (opts.message !== false) {
    info.message = stripColors(String(info.message))
  }

  if (opts.raw !== false && info[MESSAGE]) {
    info[MESSAGE] = stripColors(String(info[MESSAGE]))
  }

  return info
})
