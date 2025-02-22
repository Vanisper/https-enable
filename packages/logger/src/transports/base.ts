import type { TransformableInfo } from '../format'
import type { LogEntry } from '../type'
import type { TransportBaseOptions, TransportErrorCallback } from './type'
import os from 'node:os'
import { ColorStringRE } from '@https-enable/utils'
import { levels } from '../format'
import { configs } from '../triple-beam'

export abstract class Transport<T extends TransportBaseOptions> {
  public level?: LogEntry['level']
  protected eol?: string
  protected name?: string
  protected levels: Record<string, number>

  protected options: T

  constructor(options: T) {
    this.options = options

    this.name = options.name
    this.level = options.level
    this.levels = options.levels || levels(configs.npm).levels
    this.eol = typeof options.eol === 'string' ? options.eol : os.EOL
  }

  // 判断是否满足日志级别要求
  protected shouldLog(level: string, force = false) {
    level = level.replace(ColorStringRE, '')

    const levels = Object.keys(this.levels).reverse()
    return force || levels.indexOf(level) >= levels.indexOf(this.level || 'INFO')
  }

  // 使用局部format
  protected selfFormat(options?: { level: LogEntry['level'], message: string }) {
    if (this.options.format && options) {
      return this.options.format.transform(options)
    }
  }

  // 日志输出抽象定义
  public abstract log(info: TransformableInfo, callback?: TransportErrorCallback, options?: { level: LogEntry['level'], message: string }, force?: boolean): void
}
