import { cli, npm, syslog } from './config'

export const configs = { cli, npm, syslog }

export const LEVEL = Symbol.for('level')
export const MESSAGE = Symbol.for('message')
export const SPLAT = Symbol.for('splat')

/**
 * 简易日志级别
 * @description 供外部使用
 */
export const SimpleLevelTuple = ['ERROR', 'WARN', 'INFO', 'DEBUG'] as const
export const CliLevelTuple = ['ERROR', 'WARN', 'HELP', 'DATA', 'INFO', 'DEBUG', 'PROMPT', 'VERBOSE', 'INPUT', 'SILLY'] as const
export const NpmLevelTuple = ['ERROR', 'WARN', 'INFO', 'HTTP', 'VERBOSE', 'DEBUG', 'SILLY'] as const
export const SyslogLevelTuple = ['EMERG', 'ALERT', 'CRIT', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'] as const
