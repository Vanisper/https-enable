import type colors from '@colors/colors/safe.js'
import type { MapTuple, Prettify, Zip } from '@https-enable/types'

/**
 * 简易日志级别
 * @description 供外部使用
 */
export const SimpleLevelTuple = ['ERROR', 'WARN', 'INFO', 'DEBUG'] as const
export type SimpleLevelColor = Zip<typeof SimpleLevelTuple, ['cyan', 'green', 'yellow', 'red']>

const CliLevelTuple = ['ERROR', 'WARN', 'HELP', 'DATA', 'INFO', 'DEBUG', 'PROMPT', 'VERBOSE', 'INPUT', 'SILLY'] as const
const NpmLevelTuple = ['ERROR', 'WARN', 'INFO', 'HTTP', 'VERBOSE', 'DEBUG', 'SILLY'] as const
const SyslogLevelTuple = ['EMERG', 'ALERT', 'CRIT', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'] as const

export type LevelKeys<T extends ReadonlyArray<string>> = T[number]
export type LevelKeysa = LevelKeys<typeof CliLevelTuple>

export type ColorKeys = Prettify<keyof Omit<typeof colors, 'enabled' | 'enable' | 'disable' | 'setTheme'>>

interface BaseConfig<T extends ReadonlyArray<string>> {
  levels: Prettify<MapTuple<T>>
  colors: Prettify<Record<T[number], ColorKeys>>
}

export declare namespace Configs {
  const cli: Prettify<BaseConfig<typeof CliLevelTuple>>
  const npm: Prettify<BaseConfig<typeof NpmLevelTuple>>
  const syslog: Prettify<BaseConfig<typeof SyslogLevelTuple>>
}
