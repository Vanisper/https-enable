import type { ColorKeys } from '../../triple-beam/type'
import type { TransformFunction } from '../type'
import { styleText } from '@https-enable/colors'
import { LEVEL, MESSAGE } from '../../triple-beam'

export type ColorMap = Record<string, string | string[]>
export interface ColorizeOptions {
  /**
   * If set to `true` the color will be applied to the `level`.
   */
  level?: boolean
  /**
   * If set to `true` the color will be applied to the `message` and `level`.
   */
  all?: boolean
  /**
   * If set to `true` the color will be applied to the `message`.
   */
  message?: boolean
  /**
   * An object containing the colors for the log levels. For example: `{ info: 'blue', error: 'red' }`.
   */
  colors?: Record<string, ColorKeys>
}

/**
 * 颜色处理器类
 */
export class Colorizer {
  static allColors: Record<string, ColorKeys[] | ColorKeys> = {}
  options: ColorizeOptions

  constructor(opts: ColorizeOptions = {}) {
    if (opts.colors) {
      this.addColors(opts.colors)
    }
    this.options = opts
  }

  /**
   * 添加颜色配置到静态属性
   */
  static addColors(colors: ColorMap) {
    const nextColors = Object.entries(colors).reduce((acc, [level, spec]) => {
      acc[level] = typeof spec === 'string' ? spec.split(/\s+/) : spec
      return acc
    }, {} as Record<string, string[]>)

    Colorizer.allColors = { ...Colorizer.allColors, ...nextColors as Record<string, ColorKeys[]> }
    return Colorizer.allColors
  }

  /**
   * 实例方法添加颜色配置
   */
  addColors(colors: ColorMap) {
    return Colorizer.addColors(colors)
  }

  /**
   * 执行颜色处理的核心方法
   */
  private colorize(lookup: string, level: string, message?: string): string {
    if (typeof message === 'undefined') {
      message = level
    }

    const colorSpec = Colorizer.allColors[lookup]
    if (!colorSpec) {
      return String(message)
    }

    return styleText(colorSpec, message)
  }

  /**
   * 转换日志信息的入口方法
   */
  transform: TransformFunction<ColorizeOptions> = (info, opts) => {
    const options = { ...this.options, ...opts }
    const levelKey = info[LEVEL] || info.level

    // 处理完整消息
    if (options.all && typeof info[MESSAGE] === 'string') {
      info[MESSAGE] = this.colorize(levelKey, info.level, info[MESSAGE])
    }

    // 处理级别字段
    if (options.level || options.all || !options.message) {
      info.level = this.colorize(levelKey, info.level)
    }

    // 处理消息字段
    if (options.all || options.message) {
      info.message = this.colorize(levelKey, info.level, info.message)
    }

    return info
  }
}

export default (opts: ColorizeOptions = {}) => new Colorizer(opts)

export { Colorizer as Format }
