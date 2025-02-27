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

  const commitCount = await getUnpushedCommitCount()
  const actualSquashCount = calculateActualSquashCount(n, commitCount, options?.force)

  // 获取需要合并的提交的标签
  const commitHashes = await getCommitHashes(actualSquashCount)
  const tags = await getLocalUnpushedTags(commitHashes)

  const lastCommitHash = await performSquash(actualSquashCount, options?.message, options?.filter)

  if (lastCommitHash) {
    // 为合并后的提交打上标签
    await addTagsToCommit(lastCommitHash, commitHashes, tags)
  }

  return lastCommitHash
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

    const result = await x('git', ['rev-list', '--count', `${currentBranch}@{u}..HEAD`], execOptions)
    return Number.parseInt(result.stdout.trim(), 10)
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
    const commitMessage = message || `${await getOriginalCommitMessages(count, filter)}`

    // 回退 HEAD 但保留工作目录
    await x('git', ['reset', '--soft', `HEAD~${count}`], execOptions)

    // 创建新提交
    await x('git', ['commit', ...buildMessageArgs(commitMessage)], execOptions)
    // 获取最后的合并提交哈希
    const lastCommitHash = await x('git', ['rev-parse', 'HEAD'], execOptions)
    return lastCommitHash.stdout.trim()
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
  const msg = msgList.filter(filter).join('\n')

  return msg
}

function buildMessageArgs(message: string): string[] {
  const tempFile = createTempFile(message)
  return ['-F', tempFile]
}

function createTempFile(content: string): string {
  const tempPath = path.join(os.tmpdir(), `git-commit-${Date.now()}.txt`)
  fs.writeFileSync(tempPath, content, 'utf-8')

  process.once('exit', () => {
    try {
      fs.unlinkSync(tempPath)
    }
    catch { }
  })
  return tempPath
}

// 获取需要合并的提交的 Hash 值
async function getCommitHashes(count: number): Promise<string[]> {
  const result = await x('git', ['log', '--format=%H', `-n ${count}`, 'HEAD'], execOptions)
  return result.stdout.split('\n').filter(hash => hash)
}

// 获取本地未推送到远程的标签
async function getLocalUnpushedTags(commits: string[] = []): Promise<Record<string, string[]>> {
  const tagsForCommits: Record<string, string[]> = {}

  // 获取本地所有标签
  const localTagsResult = await x('git', ['tag', '-l'], execOptions)
  const localTags = new Set(localTagsResult.stdout.split('\n').filter(tag => tag))

  // 获取远程所有标签
  const remoteTagsResult = await x('git', ['ls-remote', '--tags', '--refs'], execOptions)
  const remoteTags = new Set(remoteTagsResult.stdout.split('\n').map(line => line.split('\t')[1]?.replace('refs/tags/', '')).filter(tag => tag))

  // 找出那些存在于本地但没有推送到远程的标签
  const unpushedLocalTags = [...localTags].filter(tag => !remoteTags.has(tag))

  // 为每个提交检查它是否有未推送的标签
  for (const commit of commits) {
    const result = await x('git', ['tag', '--points-at', commit], execOptions)
    const tags = result.stdout.split('\n').filter(tag => tag)

    // 过滤出那些本地未推送的标签
    const unpushedTags = tags.filter(tag => unpushedLocalTags.includes(tag))
    tagsForCommits[commit] = unpushedTags
  }

  return tagsForCommits
}

// 为合并后的提交添加标签
async function addTagsToCommit(lastCommitHash: string, commits: string[], tagsForCommits: Record<string, string[]>): Promise<void> {
  if (!lastCommitHash)
    return

  for (const commit of commits) {
    const tags = tagsForCommits[commit] || []
    // 删除旧的标签
    await deleteOldTags(tags)
    for (const tag of tags) {
      try {
        console.log(`Adding tag '${tag}' to the merged commit ${lastCommitHash}`)
        await x('git', ['tag', tag, lastCommitHash], execOptions)
      }
      catch (error) {
        console.error(`Failed to tag commit ${commit} with tag ${tag}: ${error}`)
      }
    }
  }
}

// 删除旧的标签
async function deleteOldTags(tags: string[]) {
  for (const tag of tags) {
    console.log(`Deleting tag '${tag}'`)
    await x('git', ['tag', '-d', tag], execOptions)
  }
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
