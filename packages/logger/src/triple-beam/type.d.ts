import type colors from '@colors/colors/safe.js'
import type { MapTuple, Prettify, Zip } from '@https-enable/types'
import type { CliLevelTuple, NpmLevelTuple, SyslogLevelTuple } from '.'

export type SimpleLevelColor = Zip<typeof SimpleLevelTuple, ['cyan', 'green', 'yellow', 'red']>

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
