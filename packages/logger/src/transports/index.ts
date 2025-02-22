import { ConsoleTransport } from './console'
import { StreamTransport } from './stream'

const transports = {
  Console: ConsoleTransport,
  Stream: StreamTransport,
}

export default transports

export { transports }
