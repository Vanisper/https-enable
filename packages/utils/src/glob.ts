/* eslint-disable unused-imports/no-unused-vars */
import type { GeneralImportGlobOptions, ProjectOptions } from '../types/importGlob'
import path from 'node:path'
import process from 'node:process'
import { escapePath, glob as globby } from 'tinyglobby'
import { getCallerPath, getCommonBase, normalizePath, slash } from './path'

export const importGlob = async function<T, O extends (GeneralImportGlobOptions & ProjectOptions)>(pattern: string | string[], options?: O) {
  const {
    eager = false,
    import: importName,
    query,
    exhaustive = false,
    // ProjectOptions
    root: rootPath = process.cwd(),
    callerId = getCallerPath(),
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
  const imports: (O extends { eager: true } ? true : false) extends true
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
    if (eager) {
      const module = await dynamicImport(importPath, dir)
      imports[file] = importKey
        ? module[importKey]
        : module
    }
    else {
      imports[file] = async () => {
        const module = await dynamicImport(importPath, dir)
        return importKey
          ? module[importKey]
          : module
      }
    }
  }

  return imports
}

/**
 * 动态导入函数
 * @param modulePath 函数导入路径
 * @param dir 如果指定此参数，则将会与第一个参数拼接
 */
async function dynamicImport(modulePath: string, dir?: string) {
  let targetPath = modulePath
  if (dir && !path.isAbsolute(modulePath) && path.isAbsolute(dir)) {
    targetPath = path.join(dir, targetPath)
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
