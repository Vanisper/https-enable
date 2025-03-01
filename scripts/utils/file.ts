import fs from 'node:fs'
import path from 'node:path'

export interface CreateFileOptions {
  /** 是否覆盖现有文件 */
  cover?: boolean
  /** 是否将内容添加到文件开头 */
  prepend?: boolean
  /** 文本编码格式 */
  encoding?: BufferEncoding
  /** 是否自动在内容末尾添加换行 */
  appendNewline?: boolean
}

export function createFile(
  filePath: string,
  content: string,
  options: CreateFileOptions = {},
): string {
  const {
    cover = false,
    prepend = false,
    encoding = 'utf-8',
    appendNewline = true,
  } = options

  // 参数校验
  if (cover && prepend) {
    throw new Error('Options "cover" and "prepend" cannot be used simultaneously')
  }

  // 统一处理路径格式
  const targetPath = path.resolve(filePath)
  const targetDir = path.dirname(targetPath)

  // 创建目录（递归创建）
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // 处理内容格式
  const processedContent = appendNewline
    ? `${content.trim()}\n`
    : content.trim()

  // 核心操作逻辑
  if (cover) {
    writeFile(targetPath, processedContent, encoding)
  }
  else if (prepend) {
    prependToFile(targetPath, processedContent, encoding)
  }
  else {
    appendToFile(targetPath, processedContent, encoding)
  }

  return targetPath
}

/* ======== 内部工具函数 ======== */

function writeFile(path: string, content: string, encoding: BufferEncoding) {
  fs.writeFileSync(path, content, { encoding })
}

function appendToFile(path: string, content: string, encoding: BufferEncoding) {
  const separator = fs.existsSync(path) ? '\n' : ''
  fs.appendFileSync(path, `${separator}${content}`, { encoding })
}

function prependToFile(path: string, content: string, encoding: BufferEncoding) {
  if (fs.existsSync(path)) {
    const originalContent = fs.readFileSync(path, { encoding })
    fs.writeFileSync(path, `${content}\n${originalContent}`, { encoding })
  }
  else {
    writeFile(path, content, encoding)
  }
}
