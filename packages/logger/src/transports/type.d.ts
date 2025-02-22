import type stream from 'node:stream'
import type { FormatClass } from '../format'
import type { LogEntry, LogLevel } from '../type'
import type { Transport } from './base'

export interface TransportErrorCallback {
  (error?: Error): void
}

export type TransportInstance<T extends TransportBaseOptions = object> = InstanceType<typeof Transport<T>>

export type TransportInstanceLog<T extends TransportBaseOptions = object> = TransportInstance<T>['log']

export interface TransportBaseOptions {
  name?: string
  level?: LogEntry['level']
  levels?: Record<keyof LogLevel, number>
  format?: FormatClass
  eol?: string
}

export interface ConsoleTransportOptions extends TransportBaseOptions {
}

export interface WritableStream extends stream.Writable {
  _writableState?: stream.StreamOptions<WritableStream>
}

export interface StreamTransportOptions extends TransportBaseOptions {
  stream?: WritableStream
}
