import type { Configs } from '../type'

export const syslog: typeof Configs.syslog = {
  levels: {
    EMERG: 0,
    ALERT: 1,
    CRIT: 2,
    ERROR: 3,
    WARNING: 4,
    NOTICE: 5,
    INFO: 6,
    DEBUG: 7,
  },
  colors: {
    EMERG: 'red',
    ALERT: 'yellow',
    CRIT: 'red',
    ERROR: 'red',
    WARNING: 'red',
    NOTICE: 'yellow',
    INFO: 'green',
    DEBUG: 'blue',
  },
}

export default syslog
