import type { LEVEL, MESSAGE, SPLAT } from '../triple-beam'

export interface TransformableInfo {
  level: string
  message?: string
  [LEVEL]?: string
  [MESSAGE]?: any
  [SPLAT]?: any
  [key: string | symbol]: any
}

export type TransformFunction<T extends Record<any, any> = Record<any, any>> = (info: TransformableInfo, opts?: T) => TransformableInfo

export class FormatClass<T extends Record<any, any> = Record<any, any>> {
  constructor(options: T = {} as T)
  options?: T
  transform: TransformFunction<T>
}

export interface FormatWrap<T extends Record<any, any>> {
  (opts?: T): FormatClass<T>
  Format: typeof FormatClass<T>
};

export interface format<T extends Record<any, any> = Record<any, any>> {
  <P extends T>(transform: TransformFunction<P>): FormatWrap<P>
  Format: typeof FormatClass<T>
  align: typeof import('./plugins/align').default
  cli: typeof import('./plugins/cli').default
  combine: typeof import('./plugins/combine').default
  colorize: typeof import('./plugins/colorize').default
  errors: typeof import('./plugins/errors').default
  json: typeof import('./plugins/json').default
  label: typeof import('./plugins/label').default
  logstash: typeof import('./plugins/logstash').default
  metadata: typeof import('./plugins/metadata').default
  ms: typeof import('./plugins/ms').default
  padLevels: typeof import('./plugins/pad-levels').default
  prettyPrint: typeof import('./plugins/pretty-print').default
  printf: typeof import('./plugins/printf').default
  simple: typeof import('./plugins/simple').default
  splat: typeof import('./plugins/splat').default
  timestamp: typeof import('./plugins/timestamp').default
  uncolorize: typeof import('./plugins/uncolorize').default
};

export type { ColorizeOptions, ColorMap } from './plugins/colorize'
