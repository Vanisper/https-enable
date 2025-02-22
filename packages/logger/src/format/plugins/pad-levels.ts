import type { TransformFunction } from '../type'
import { configs, LEVEL, MESSAGE } from '../../triple-beam'

export interface PadLevelsOptions {
  /**
   * Log levels. Defaults to `configs.npm.levels` from [triple-beam](https://github.com/winstonjs/triple-beam)
   * module.
   */
  levels?: Record<string, number>
  filler?: string
}

class Padder {
  paddings: Record<string, string>
  options: PadLevelsOptions

  constructor(opts: PadLevelsOptions = { levels: configs.npm.levels }) {
    this.paddings = Padder.paddingForLevels(opts.levels || configs.npm.levels, opts.filler)
    this.options = opts
  }

  /**
   * Returns the maximum length of keys in the specified `levels` Object.
   * @param levels Set of all levels to calculate longest level against.
   * @returns Maximum length of the longest level string.
   */
  static getLongestLevel(levels: Record<string, any>) {
    const lvls = Object.keys(levels).map(level => level.length)
    return Math.max(...lvls)
  }

  /**
   * Returns the padding for the specified `level` assuming that the
   * maximum length of all levels it's associated with is `maxLength`.
   * @param level Level to calculate padding for.
   * @param filler Repeatable text to use for padding.
   * @param maxLength Length of the longest level
   * @returns Padding string for the `level`
   */
  static paddingForLevel(level: string, filler: string, maxLength: number) {
    const targetLen = maxLength + 1 - level.length
    const rep = Math.floor(targetLen / filler.length)
    const padding = `${filler}${filler.repeat(rep)}`
    return padding.slice(0, targetLen)
  }

  /**
   * Returns an object with the string paddings for the given `levels`
   * using the specified `filler`.
   * @param levels Set of all levels to calculate padding for.
   * @param filler Repeatable text to use for padding.
   * @returns Mapping of level to desired padding.
   */
  static paddingForLevels(levels: Record<string, any>, filler: string = ' ') {
    const maxLength = Padder.getLongestLevel(levels)
    return Object.keys(levels).reduce((acc, level) => {
      acc[level] = Padder.paddingForLevel(level, filler, maxLength)
      return acc
    }, {} as Record<string, string>)
  }

  /**
   * Prepends the padding onto the `message` based on the `LEVEL` of
   * the `info`. This is based on the behavior of `winston@2` which also
   * prepended the level onto the message.
   *
   * See: https://github.com/winstonjs/winston/blob/2.x/lib/winston/logger.js#L198-L201
   *
   * @param info Logform info object
   * @param opts Options passed along to this instance.
   * @returns Modified logform info object.
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  transform: TransformFunction<PadLevelsOptions> = (info, opts = {}) => {
    const level = info[LEVEL]
    const paddings = level ? this.paddings[level] : ''
    info.message = `${paddings}${info.message}`
    if (info[MESSAGE]) {
      info[MESSAGE] = `${paddings}${info[MESSAGE]}`
    }

    return info
  }
}

/*
 * function padLevels (info)
 * Returns a new instance of the padLevels Format which pads
 * levels to be the same length. This was previously exposed as
 * { padLevels: true } to transports in `winston < 3.0.0`.
 */
export default (opts: PadLevelsOptions) => new Padder(opts)

export { Padder }
