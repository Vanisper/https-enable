import path from 'node:path'
import { parse as errorParse } from 'error-stack-parser-es/lite'
import picomatch from 'picomatch'
import { isWindows } from './common'
import { WindowsDiskRE, WindowsSlashRE } from './constant'

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
 * 处理绝对路径
 */
export function parseAbsolute(pathStr?: string | null) {
  if (!pathStr)
    return pathStr
  pathStr = slash(pathStr)
  return isWindows && pathStr.startsWith('/') && pathStr.slice(1).match(WindowsDiskRE)
    ? pathStr.slice(1)
    : pathStr
}

/**
 * 获取调用方文件路径
 */
export function getCallerPath(depth = 2) {
  const error = new Error('get-caller-path')
  const stacks = errorParse(error)
  const filesList = Array.from(new Set(stacks.map(i => i.file || null)))

  /**
   * 匹配 https,http,file 协议的路径，提取文件名，允许带行、列号
   * @description `^((?:file|https?):\/\/)?` 匹配协议
   * @description `(.*?)` 非贪婪匹配任意字符，直到遇到可选的冒号和数字（行号、列号）
   * @description `(?<file>.*?)` 可通过 `match.groups.file` 获取该分组的值
   * @description `(?::\d+)?(?::\d+)?` 匹配可选的 `:行号和:列号` 部分，最多两个
   */
  const linePattern = /^((?:file|https?):\/\/)?(?<file>.*?)(?::\d+)?(?::\d+)?$/

  // 目标堆栈层级
  const targetIndex = depth
  const targetLine = filesList[targetIndex] || filesList.at(-1)

  const match = targetLine?.match(linePattern)?.groups?.file

  return parseAbsolute(match) || null

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
