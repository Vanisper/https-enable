/* eslint-disable unused-imports/no-unused-vars */
import type { ImportGlobOptions, KnownAsTypeMap, ProjectOptions } from '../types/importGlob'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { escapePath, glob as globby } from 'tinyglobby'
import { getCallerPath, getCommonBase, normalizePath, slash } from './path'

const forceDefaultAs = ['raw', 'url']
const allowImportExt = ['.js', '.ts', '.mjs', '.mts', '.cjs', '.cts']

export const importGlob = async function<
  Eager extends boolean,
  As extends keyof KnownAsTypeMap | string,
  T = As extends keyof KnownAsTypeMap ? KnownAsTypeMap[As] : unknown,
>(pattern: string | string[], options?: ImportGlobOptions<Eager, As> & ProjectOptions) {
  const {
    eager = false,
    import: importName,
    query,
    as,
    exhaustive = false,
    // ProjectOptions
    root: rootPath = process.cwd(),
    callerId = getCallerPath(),
    fallback = false,
  } = options || {}

  if (!callerId) {
    throw new Error('CallerId is null')
  }

  const id = slash(callerId)
  const root = slash(rootPath)
  const dir = path.dirname(id)

  const patterns = Array.isArray(pattern) ? pattern : [pattern]
  const globsResolved = patterns.map(glob => toAbsoluteGlob(glob, root, id))
  const cwd = getCommonBase(globsResolved) ?? root

  const isRelative = patterns.every(i => '.!'.includes(i[0] || ''))

  // 1. 文件匹配
  const files = (await globby(globsResolved, {
    absolute: true,
    cwd,
    dot: exhaustive,
    expandDirectories: false,
    ignore: exhaustive ? [] : ['**/node_modules/**'],
  })).filter(file => file !== id).sort()

  // 2. 路径处理
  const resolvePaths = (file: string) => {
    if (!dir) {
      if (isRelative) {
        throw new Error(
          'In virtual modules, all globs must start with \'/\'',
        )
      }
      const filePath = `/${path.relative(root, file)}`
      return { filePath, importPath: filePath }
    }

    let importPath = path.relative(dir, file)

    if (importPath[0] !== '.')
      importPath = `./${importPath}`

    let filePath: string
    if (isRelative) {
      filePath = importPath
    }
    else {
      filePath = path.relative(root, file)
      if (filePath[0] !== '.')
        filePath = `/${filePath}`
    }

    return { filePath, importPath }
  }

  // 3. 构建导入映射
  const imports: (Eager extends true ? true : false) extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>> = {}

  for (const file of files) {
    const paths = resolvePaths(file)
    const importPath = paths.importPath

    // TODO: 处理查询参数，暂时没有此场景
    // if (query && query !== '?raw') {
    //   const queryString = typeof query === 'string'
    //     ? query
    //     : new URLSearchParams(query as Record<string, string>).toString()

    //   importPath += `?${queryString}`
    // }

    const importKey
      = importName && importName !== '*'
        ? importName
        : undefined

    // 4. 处理不同导入模式
    const targetType = as && forceDefaultAs.includes(as) ? as : undefined
    try {
      if (eager) {
        const module = await dynamicImport(importPath, { dir, as })
        imports[file] = importKey && !targetType
          ? module[importKey]
          : module
      }
      else {
        imports[file] = async () => {
          const module = await dynamicImport(importPath, { dir, as })
          return importKey && !targetType
            ? module[importKey]
            : module
        }
      }
    }
    catch (error) {
      const ext = path.extname(file)
      if (fallback && ext && !allowImportExt.includes(ext)) {
        imports[file] = fs.readFileSync(file, 'utf-8') as unknown as T
      }
      else {
        throw error
      }
    }
  }

  return imports
}

/**
 * 动态导入函数
 * @param modulePath 函数导入路径
 * @param options
 * @param options.dir 如果指定此参数，则将会与第一个参数拼接
 * @param options.as
 */
async function dynamicImport(modulePath: string, options: { dir?: string, as?: string } = {}) {
  let targetPath = modulePath
  if (options.dir && !path.isAbsolute(modulePath) && path.isAbsolute(options.dir)) {
    targetPath = path.join(options.dir, targetPath)
  }

  const targetType = options.as && forceDefaultAs.includes(options.as) ? options.as : undefined
  if (options.as && targetType) {
    if (targetType === 'url') {
      return slash(targetPath)
    }
    else if (targetType === 'raw') {
      return fs.readFileSync(targetPath, 'utf-8')
    }
  }
  return await import(targetPath)
}

/**
 * 将相对路径的 glob 模式转换为绝对路径的 glob 模式
 * @param glob - glob 模式（可能包含相对路径或绝对路径）
 * @param root - 根目录
 * @param importer - 导入文件路径（可选）
 * @returns 转换后的绝对路径 glob 模式
 */
export function toAbsoluteGlob(
  glob: string,
  root: string,
  importer: string | undefined,
): string {
  // 处理 glob 的前缀（如 '!'）
  let prefix = ''
  if (glob.startsWith('!')) {
    prefix = '!'
    glob = glob.slice(1)
  }

  // 检查 glob 是否为空
  if (!glob) {
    throw new Error('Glob pattern cannot be empty')
  }

  // 确保 root 是有效的绝对路径
  if (!path.isAbsolute(root)) {
    throw new Error('Root path must be an absolute path')
  }

  // 处理 glob 的特殊模式
  if (glob.startsWith('**')) {
    return prefix + glob // 直接返回 glob，保留前缀
  }

  // 获取基准目录
  const baseDir = importer ? globSafePath(path.dirname(importer)) : root

  // 根据 glob 的开头字符决定如何解析路径
  if (glob.startsWith('/')) {
    // 如果 glob 以 '/' 开头，基于 root 解析
    return prefix + path.posix.join(root, glob.slice(1))
  }
  else if (glob.startsWith('./')) {
    // 如果 glob 以 './' 开头，基于基准目录解析
    return prefix + path.posix.join(baseDir, glob.slice(2))
  }
  else if (glob.startsWith('../')) {
    // 如果 glob 以 '../' 开头，基于基准目录解析
    return prefix + path.posix.join(baseDir, glob)
  }
  else {
    // 其他情况（如直接是文件名），基于基准目录解析
    return prefix + path.posix.join(baseDir, glob)
  }
}

export function globSafePath(path: string) {
  // slash path to ensure \ is converted to / as \ could lead to a double escape scenario
  return escapePath(normalizePath(path))
}
