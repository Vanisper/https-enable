import path from 'node:path'
import { parse as errorParse } from 'error-stack-parser-es/lite'
import picomatch from 'picomatch'
import { isWindows } from './common'
import { WindowsSlashRE } from './constant'

export function slash(p: string): string {
  return p.replace(WindowsSlashRE, '/')
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

export function getCommonBase(globsResolved: string[]): null | string {
  const bases = globsResolved
    .filter(g => g[0] !== '!')
    .map((glob) => {
      let { base } = picomatch.scan(glob)
      // `scan('a/foo.js')` returns `base: 'a/foo.js'`
      if (path.posix.basename(base).includes('.'))
        base = path.posix.dirname(base)

      return base
    })

  if (!bases.length)
    return null

  let commonAncestor = ''
  const dirS = bases[0]!.split('/')
  for (let i = 0; i < dirS.length; i++) {
    const candidate = dirS.slice(0, i + 1).join('/')
    if (bases.every(base => base.startsWith(candidate)))
      commonAncestor = candidate
    else break
  }
  if (!commonAncestor)
    commonAncestor = '/'

  return commonAncestor
}

/**
 * 获取调用方文件路径
 */
export function getCallerPath(depth = 3) {
  const error = new Error('get-caller-path')
  const stacks = errorParse(error)
  // 目标堆栈层级
  const targetIndex = depth
  const targetLine = stacks.at(-1 * targetIndex)
  return targetLine?.file || null

  // const stack = error.stack?.split('\n') || []

  // // 根据环境选择解析策略
  // const isNode = typeof process !== 'undefined' && process.versions?.node
  // const linePattern = isNode
  //   ? /\((?<file>.*?):\d+:\d+\)/
  //   // eslint-disable-next-line regexp/no-super-linear-backtracking
  //   : /(http|https|file):\/\/.*?\/(?<file>[^:]+):\d+:\d+/

  // // 动态计算目标堆栈层级（基础深度 + 调用层级）
  // const targetIndex = 2 + depth
  // const targetLine = stack[targetIndex] || ''

  // const match = targetLine.match(linePattern)
  // return match?.groups?.file || null
}
