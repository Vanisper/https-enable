import type { Configs } from '../type'

export const npm: typeof Configs.npm = {
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    HTTP: 3,
    VERBOSE: 4,
    DEBUG: 5,
    SILLY: 6,
  },
  colors: {
    ERROR: 'red',
    WARN: 'yellow',
    INFO: 'green',
    HTTP: 'green',
    VERBOSE: 'cyan',
    DEBUG: 'blue',
    SILLY: 'magenta',
  },
}

export default npm
