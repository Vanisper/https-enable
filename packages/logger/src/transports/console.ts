import type { ConsoleTransportOptions, TransportInstanceLog } from './type'
import { MESSAGE } from '../triple-beam'
import { Transport } from './base'

export class ConsoleTransport extends Transport<ConsoleTransportOptions> {
  constructor(options: ConsoleTransportOptions = {}) {
    super(options)

    this.name = options.name || 'console'
  }

  log: TransportInstanceLog = (info, callback, options, force) => {
    info = this.selfFormat(options) || info

    const data = { ...info }
    if (!force && !this.shouldLog(data.level))
      return callback?.()

    // eslint-disable-next-line no-console
    console.log(`${data[MESSAGE]}`)
    callback?.()
  }
}
