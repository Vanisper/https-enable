import process from 'node:process'

export const isWindows
  = typeof process !== 'undefined' && process.platform === 'win32'

// 串烧命名转小驼峰
export function camelCase(name: string) {
  return name.replace(/-(\w)/g, (_, c) => c.toUpperCase())
}
