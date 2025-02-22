import Logger, { Transports } from '@https-enable/logger'

export { Logger }

function createLogFormat(colorize = false) {
  return Logger.createLogFormat(colorize, 'mkcert')
}

export default new Logger({
  format: createLogFormat(),
  transports: [
    new Transports.Console({
      format: createLogFormat(true),
    }),
  ],
})
