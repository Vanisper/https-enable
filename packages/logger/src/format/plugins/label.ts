import format from '../format'

export interface LabelOptions {
  /**
   * A label to be added before the message.
   */
  label?: string
  /**
   * If set to `true` the `label` will be added to `info.message`. If set to `false` the `label`
   * will be added as `info.label`.
   */
  message?: boolean
}

/*
 * function label (info)
 * Returns a new instance of the label Format which adds the specified
 * `opts.label` before the message. This was previously exposed as
 * { label: 'my label' } to transports in `winston < 3.0.0`.
 */
export default format<LabelOptions>((info, opts = {}) => {
  if (opts.message) {
    info.message = `[${opts.label}] ${info.message}`
    return info
  }

  info.label = opts.label
  return info
})
