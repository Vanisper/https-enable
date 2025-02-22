import type { TransformFunction } from '../type'
import type { ColorizeOptions } from './colorize'
import type { PadLevelsOptions } from './pad-levels'
import { configs, MESSAGE } from '../../triple-beam'
import { Colorizer } from './colorize'
import { Padder } from './pad-levels'

type CliFormatOptions = ColorizeOptions & PadLevelsOptions

/**
 * Cli format class that handles initial state for a separate
 * Colorizer and Padder instance.
 */
class CliFormat {
  colorizer: Colorizer
  padder: Padder
  options: CliFormatOptions

  constructor(opts: CliFormatOptions = {}) {
    if (!opts.levels) {
      opts.levels = configs.cli.levels
    }

    this.colorizer = new Colorizer(opts)
    this.padder = new Padder(opts)
    this.options = opts
  }

  /*
   * function transform (info, opts)
   * Attempts to both:
   * 1. Pad the { level }
   * 2. Colorize the { level, message }
   * of the given `logform` info object depending on the `opts`.
   */
  transform: TransformFunction<CliFormatOptions> = (info, opts) => {
    this.colorizer.transform(this.padder.transform(info, opts), opts)

    info[MESSAGE] = `${info.level}:${info.message}`
    return info
  }
}

/*
 * function cli (opts)
 * Returns a new instance of the CLI format that turns a log
 * `info` object into the same format previously available
 * in `winston.cli()` in `winston < 3.0.0`.
 */
export default (opts: CliFormatOptions) => new CliFormat(opts)

//
// Attach the CliFormat for registration purposes
//
export { CliFormat as Format }
