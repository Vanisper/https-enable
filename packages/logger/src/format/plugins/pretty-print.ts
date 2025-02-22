import { inspect } from 'node:util'
import { LEVEL, MESSAGE, SPLAT } from '../../triple-beam'
import format from '../format'

export interface PrettyPrintOptions {
  /**
   * A `number` that specifies the maximum depth of the `info` object being stringified by
   * `util.inspect`. Defaults to `2`.
   */
  depth?: number
  /**
   * Colorizes the message if set to `true`. Defaults to `false`.
   */
  colorize?: boolean
}

/*
 * function prettyPrint (info)
 * Returns a new instance of the prettyPrint Format that "prettyPrint"
 * serializes `info` objects. This was previously exposed as
 * { prettyPrint: true } to transports in `winston < 3.0.0`.
 */
export default format<PrettyPrintOptions>((info, opts = {}) => {
  //
  // info[{LEVEL, MESSAGE, SPLAT}] are enumerable here. Since they
  // are internal, we remove them before util.inspect so they
  // are not printed.
  //
  const stripped = { ...info }

  // Remark (indexzero): update this technique in April 2019
  // when node@6 is EOL
  delete stripped[LEVEL]
  delete stripped[MESSAGE]
  delete stripped[SPLAT]

  info[MESSAGE] = inspect(stripped, false, opts.depth || null, opts.colorize)
  return info
})
