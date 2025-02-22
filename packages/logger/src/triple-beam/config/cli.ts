import type { Configs } from '../type'

export const cli: typeof Configs.cli = {
  levels: {
    ERROR: 0,
    WARN: 1,
    HELP: 2,
    DATA: 3,
    INFO: 4,
    DEBUG: 5,
    PROMPT: 6,
    VERBOSE: 7,
    INPUT: 8,
    SILLY: 9,
  },
  colors: {
    ERROR: 'red',
    WARN: 'yellow',
    HELP: 'cyan',
    DATA: 'grey',
    INFO: 'green',
    DEBUG: 'blue',
    PROMPT: 'grey',
    VERBOSE: 'cyan',
    INPUT: 'grey',
    SILLY: 'magenta',
  },
}

export default cli
