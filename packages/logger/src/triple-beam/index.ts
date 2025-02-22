import { cli, npm, syslog } from './config'

export const configs = { cli, npm, syslog }

export const LEVEL = Symbol.for('level')
export const MESSAGE = Symbol.for('message')
export const SPLAT = Symbol.for('splat')
