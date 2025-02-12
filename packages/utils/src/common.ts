import process from 'node:process'

export const isWindows
  = typeof process !== 'undefined' && process.platform === 'win32'
