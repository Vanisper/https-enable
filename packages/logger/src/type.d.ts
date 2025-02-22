import type { MapTuple } from '@https-enable/types'
import type { FormatClass } from './format'
import type { TransportInstance } from './transports/type'
import type { SimpleLevelColor } from './triple-beam/type'
import { SimpleLevelTuple } from './triple-beam/type'

const LevelTuple = SimpleLevelTuple

export type LogLevel = MapTuple<typeof LevelTuple>

export type LogLevelColor = SimpleLevelColor

export type LogLevelKey = keyof LogLevel

export interface LoggerOptions {
  level?: LogLevelKey
  levels?: Record<LogLevelKey, number>
  /** 静音 */
  silent?: boolean
  /** 是否是隐式log */
  isImplicit?: boolean
  format?: FormatClass
  transports?: TransportInstance[] | TransportInstance
}

export interface LogEntry {
  level: LogLevelKey
  message: string
  [optionName: string]: any
}

export interface LogOptions {
  /** 是否强制输出 | 无视 level 和 isImplicit 和 silent */
  force?: boolean
  /**
   * 是否是隐式log
   * @description 优先级最高，只有为undefined时才会遵从父级配置
   */
  isImplicit?: boolean
  /** 静音 */
  silent?: boolean
}
