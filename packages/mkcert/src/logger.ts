import Logger, { Transports } from '@https-enable/logger'

function createLogFormat(colorize = false) {
  return Logger.createLogFormat(colorize, 'mkcert')
}

export const logger = new Logger({
  format: createLogFormat(),
  transports: [
    new Transports.Console({
      format: createLogFormat(true),
    }),
  ],
})

export default logger
