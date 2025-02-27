/* eslint-disable unused-imports/no-unused-vars */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { x } from 'tinyexec'

const execOptions = { throwOnError: true }

interface SquashOptions {
  message?: string
  force?: boolean
  filter?: (line: string) => unknown
}
// chore: release
/**
 * 合并本地最新的 N 个 Git 提交
 * @param n 需要合并的提交数量
 * @param options 配置选项
 * @param options.message 合并后的提交信息（默认自动生成）
 * @param options.force 当本地提交数不足时强制合并全部（默认 false）
 */
export async function squashLastNCommits(n: number, options?: SquashOptions) {
  validateInput(n)
  checkGitRepository()
  // checkWorkingDirectoryClean();

  const commitCount = await getUnpushedCommitCount()
  const actualSquashCount = calculateActualSquashCount(n, commitCount, options?.force)
  return await performSquash(actualSquashCount, options?.message, options?.filter)
}

// 以下为内部工具函数
function validateInput(n: number): void {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid input: n must be positive integer (received ${n})`)
  }
}

async function checkGitRepository(): Promise<void> {
  try {
    await x('git', ['rev-parse', '--is-inside-work-tree'], execOptions)
  }
  catch (error) {
    console.log(error)
    throw new Error('Not a git repository')
  }
}

async function getUnpushedCommitCount() {
  try {
    const currentBranch = (await x('git', ['rev-parse', '--abbrev-ref', 'HEAD'], execOptions)).stdout.trim()

    const upstreamExists = (await x(
      'git',
      ['rev-parse', '--abbrev-ref', `${currentBranch}@{u}`],
      execOptions,
    )).stdout.trim()

    if (!upstreamExists) {
      throw new Error(
        `Current branch '${currentBranch}' has no upstream. `
        + 'Use --set-upstream-to to track remote branch.',
      )
    }

    try {
      const result = await x('git', ['rev-list', '--count', `${currentBranch}@{u}..HEAD`], execOptions)

      return Number.parseInt(result.stdout.trim(), 10)
    }
    catch {
      throw new Error('Failed to count local commits')
    }
  }
  catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Unknown error: ${error}`)
  }
}

function calculateActualSquashCount(
  requested: number,
  available: number,
  force = false,
): number {
  // if (available === 0) throw new Error('No commits to squash');

  const actual = Math.min(requested, available)
  if (!force && actual < requested) {
    throw new Error(
      `Cannot squash ${requested} commits (only ${available} available). `
      + 'Use force option to proceed with available commits.',
    )
  }
  return actual
}

async function performSquash(count: number, message?: string, filter?: SquashOptions['filter']) {
  if (typeof count !== 'number' || count <= 0) {
    return false
  }

  try {
    // 生成默认提交信息
    const commitMessage = message
      || `${await getOriginalCommitMessages(count, filter)}`

    // 回退 HEAD 但保留工作目录
    await x('git', ['reset', '--soft', `HEAD~${count}`], execOptions)

    // 创建新提交
    // 使用参数数组格式避免 shell 解析问题
    await x('git', [
      'commit',
      ...buildMessageArgs(commitMessage),
    ], execOptions)
    return true
  }
  catch (error) {
    throw new Error(`Squash failed: ${error instanceof Error ? error.message : error}`)
  }
}

async function getOriginalCommitMessages(count: number, filter = (line: string) => (typeof line === 'string') as unknown): Promise<string> {
  if (typeof count !== 'number' || count <= 0) {
    return ''
  }

  const res = await x(
    'git',
    ['log', '--format=%B', '-n', `${count}`, 'HEAD'],
    execOptions,
  )

  const msgList = res.stdout.split('\n')

  const temp = msgList.filter(item => item)

  const msg = msgList.filter(filter).join('\n')

  console.log(temp, count, JSON.stringify(msg))
  return msg
}

// 构建跨平台兼容的提交信息参数
function buildMessageArgs(message: string): string[] {
  // 方法 1：直接传递（适用于简单消息）
  // return ['-m', message];

  // 方法 2：使用临时文件（推荐用于复杂格式）
  const tempFile = createTempFile(message)
  return ['-F', tempFile]
}

// 创建临时文件处理复杂消息
function createTempFile(content: string): string {
  const tempPath = path.join(os.tmpdir(), `git-commit-${Date.now()}.txt`)
  fs.writeFileSync(tempPath, content, 'utf-8')

  // 注册退出清理钩子
  process.once('exit', () => {
    try {
      fs.unlinkSync(tempPath)
    }
    catch { }
  })
  return tempPath
}

async function checkWorkingDirectoryClean(): Promise<void> {
  try {
    await x('git', ['diff-index', '--quiet', 'HEAD', '--'], execOptions)
  }
  catch {
    throw new Error('Working directory contains uncommitted changes')
  }
}

async function getCommitCount(): Promise<number> {
  try {
    const result = await x('git', ['rev-list', '--count', 'HEAD'], execOptions)
    return Number.parseInt(result.stdout.trim(), 10)
  }
  catch {
    throw new Error('Failed to count commits')
  }
}
