import stringify from 'safe-stable-stringify'
import { MESSAGE } from '../../triple-beam'
import format from '../format'

export interface JsonOptions {
  /**
   * A function that influences how the `info` is stringified.
   */
  replacer?: (this: any, key: string, value: any) => any
  /**
   * The number of white space used to format the json.
   */
  space?: number

  // The following options come from safe-stable-stringify
  // https://github.com/BridgeAR/safe-stable-stringify/blob/main/index.d.ts

  /**
   * If `true`, bigint values are converted to a number. Otherwise, they are ignored.
   * This option is ignored by default as Logform stringifies BigInt in the default replacer.
   * @default true
   */
  bigint?: boolean
  /**
   * Defines the value for circular references.
   * Set to `undefined`, circular properties are not serialized (array entries are replaced with null).
   * Set to `Error`, to throw on circular references.
   * @default "[Circular]"
   */
  circularValue?: string | null | TypeErrorConstructor | ErrorConstructor
  /**
   * If `true`, guarantee a deterministic key order instead of relying on the insertion order.
   * @default true
   */
  deterministic?: boolean
  /**
   * Maximum number of entries to serialize per object (at least one).
   * The serialized output contains information about how many entries have not been serialized.
   * Ignored properties are counted as well (e.g., properties with symbol values).
   * Using the array replacer overrules this option.
   * @default Infinity
   */
  maximumBreadth?: number
  /**
   * Maximum number of object nesting levels (at least 1) that will be serialized.
   * Objects at the maximum level are serialized as `"[Object]"` and arrays as `"[Array]"`.
   * @default Infinity
   */
  maximumDepth?: number
}

/*
 * function replacer (key, value)
 * Handles proper stringification of Buffer and bigint output.
 */
function replacer(key: string, value: any): any {
  // safe-stable-stringify does support BigInt, however, it doesn't wrap the value in quotes.
  // Leading to a loss in fidelity if the resulting string is parsed.
  // It would also be a breaking change for logform.
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}

/*
 * function json (info)
 * Returns a new instance of the JSON format that turns a log `info`
 * object into pure JSON. This was previously exposed as { json: true }
 * to transports in `winston < 3.0.0`.
 */
export default format<JsonOptions>((info, opts = {}) => {
  const jsonStringify = stringify.configure(opts)
  info[MESSAGE] = jsonStringify(info, opts.replacer || replacer, opts.space)
  return info
})
