import type { Prettify } from '@https-enable/types'
import type { TransportInstance } from './transports/type'
import type { LoggerOptions, LogLevel, LogLevelKey, LogOptions } from './type'
import { ColorStringRE } from '@https-enable/utils'
import format, { levels } from './format'
import { transports as Transports } from './transports'
import { configs, LEVEL } from './triple-beam'

export default class Logger {
  private level: LogLevelKey
  private levels: LogLevel | Record<string, number>
  private silent: boolean
  private transports: TransportInstance[] = []
  /**
   * 是否是隐式log
   * @description 隐式 log 全局兜底
   * @default false
   */
  private isImplicit: boolean
  format: ReturnType<typeof Logger.createLogFormat>

  constructor(options: Prettify<LoggerOptions> = {}) {
    this.level = options.level || 'INFO'
    this.levels = options.levels || levels(configs.npm).levels

    this.silent = options.silent || false
    this.isImplicit = options.isImplicit || false

    this.format = options.format || Logger.createLogFormat(false)

    // Add all transports we have been provided.
    if (options.transports) {
      this.transports = Array.isArray(options.transports) ? options.transports : [options.transports]
    }
  }

  static createLogFormat(colorize = false, label?: string) {
    const colorizer = format.colorize()
    const appLabel = !!label && format.label({ label, message: true })
    const timestamp = format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })
    const logFormat = format.printf((info) => {
      const levelWithoutColor = info.level.replace(ColorStringRE, '')

      const space = ' '.repeat(6 - levelWithoutColor.length)

      return `${info.timestamp ? info.timestamp.padEnd(info.timestamp.length + 1) : ''}${info.level}${space} ${info.message || ''}`
    })

    return colorize
      ? appLabel ? format.combine(colorizer, appLabel, timestamp, logFormat) : format.combine(colorizer, timestamp, logFormat)
      : appLabel ? format.combine(appLabel, timestamp, logFormat) : format.combine(timestamp, logFormat)
  }

  updateLogFormat = (colorize = false) => {
    this.format = Logger.createLogFormat(colorize)
  }

  private log(level: LogLevelKey, message: string, options: Prettify<LogOptions> = {}, callback?: (error?: Error) => void) {
    if (options.force || this.shouldLog(level)) {
      const isImplicit = options.isImplicit ?? this.isImplicit
      const isSilent = options.silent ?? this.silent

      if (!options.force && isImplicit && !isSilent) {
        // TODO: 相关的隐式log，需要通过外部环境变量启用
        // 此处暂时不显示
        return callback?.()
      }
      else if (options.force || !isSilent) {
        const transformInfo = this.format.transform({ level, message })

        // [LEVEL] is only soft guaranteed to be set here since we are a proper
        // stream. It is likely that `info` came in through `.log(info)` or
        // `.info(info)`. If it is not defined, however, define it.
        // This LEVEL symbol is provided by `triple-beam` and also used in:
        // - logform
        // - winston-transport
        // - abstract-winston-transport
        if (!transformInfo[LEVEL]) {
          transformInfo[LEVEL] = transformInfo.level
        }

        // Remark: really not sure what to do here, but this has been reported as
        // very confusing by pre winston@2.0.0 users as quite confusing when using
        // custom levels.
        if (!Object.keys(this.levels).includes(level)) {
          console.error('[winston] Unknown logger level: %s', level)
          console.error('[winston] levels: %j', this.levels)
        }

        // Remark: not sure if we should simply error here.
        if (!this.transports || (Array.isArray(this.transports) ? !this.transports.length : !this.transports)) {
          console.error(
            '[winston] Attempt to write logs with no transports, which can increase memory usage: %j',
            transformInfo,
          )
        }

        // Here we write to the `format` pipe-chain, which on `readable` above will
        // push the formatted `info` Object onto the buffer for this instance. We trap
        // (and re-throw) any errors generated by the user-provided format, but also
        // guarantee that the streams callback is invoked so that we can continue flowing.
        try {
          this.transports.forEach((transport) => {
            !transport.level && (transport.level = this.level)
            transport.log(transformInfo, callback, { level, message }, options.force)
          })
        }
        finally {
          callback?.()
        }
        return
      }
      return callback?.()
    }
  }

  private shouldLog(level: string) {
    const levels = Object.keys(this.levels).reverse()
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  debug(message: string = '', options: Prettify<LogOptions> = {}) {
    this.log('DEBUG', message, options)
  }

  info(message: string = '', options: Prettify<LogOptions> = {}) {
    this.log('INFO', message, options)
  }

  warn(message: string = '', options: Prettify<LogOptions> = {}) {
    this.log('WARN', message, options)
  }

  error(message: string = '', options: Prettify<LogOptions> = {}) {
    this.log('ERROR', message, options)
  }
}

export { format, Logger, Transports }
