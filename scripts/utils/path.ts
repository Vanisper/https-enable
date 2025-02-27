import path from 'node:path'
import process from 'node:process'

export const WindowsSlashRE = /\\/g

export const isWindows
  = typeof process !== 'undefined' && process.platform === 'win32'

export function slash(p: string): string {
  return p.replace(WindowsSlashRE, '/')
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}
