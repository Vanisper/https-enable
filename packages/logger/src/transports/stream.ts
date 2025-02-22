import type { StreamTransportOptions, TransportInstanceLog } from './type'
import { isStream } from '@https-enable/utils'
import { MESSAGE } from '../triple-beam'
import { Transport } from './base'

export class StreamTransport extends Transport<StreamTransportOptions> {
  stream: NodeJS.WritableStream
  isObjectMode: boolean

  constructor(options: StreamTransportOptions = {}) {
    super(options)

    if (!options.stream || !isStream(options.stream)) {
      throw new Error('options.stream is required.')
    }

    this.name = options.name || 'console'

    // We need to listen for drain events when write() returns false. This can
    // make node mad at times.
    this.stream = options.stream
    this.isObjectMode = options.stream._writableState?.objectMode || false

    // 确保不会触发 EventEmitter 内存泄漏警告
    this.stream.setMaxListeners(Infinity)
  }

  log: TransportInstanceLog = (info, callback, options, force) => {
    if (!force && !this.shouldLog(info.level))
      return callback?.()

    const handleComplete = (error?: Error | null) => {
      if (error)
        return callback?.(error)

      callback?.()
    }

    try {
      info = this.selfFormat(options) || info

      let payload: any
      if (this.isObjectMode)
        payload = { ...info }
      else
        payload = `${info[MESSAGE]}${this.eol}`

      // 处理背压和异步写入
      const canWrite = this.stream.write(payload, (error) => {
        handleComplete(error || undefined)
      })

      if (!canWrite) {
        this.stream.once('drain', () => handleComplete())
      }
    }
    catch (error) {
      handleComplete(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
