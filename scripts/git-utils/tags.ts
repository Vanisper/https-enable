import { x } from 'tinyexec'

const execOptions = { throwOnError: true }

export interface Tag {
  /* 标签 */
  tag: string
  /* 提交id */
  id: string
  /* 作者 */
  author: string
  /* 日期 */
  date?: Date
  /* sha值 */
  sha: string
  /* 上一个tag */
  pre?: Tag
}

export type ParsedCommit = {
  id?: string
  sha?: string // 提交的哈希值，例如 "a1b2c3d"
  date?: Date
  author?: string
} & CommitInfo

interface CommitInfo {
  /* commit类型，例如 "feat" 或 "fix" */
  type?: string
  /* commit作用域 ｜ 文件或者模块 */
  scope?: string
  /* git-emoji */
  emoji?: string
  /* commit主要内容 */
  subject?: string
  /* 任务单号 */
  ticket?: string
  /** 提交的完整消息 */
  raw?: string
}

// 解析commit信息
function getCommitMsgInfo(data?: string): CommitInfo | null {
  if (!data)
    return null

  const headerPattern = /^(?<type>\w*)(?:\((?<scope>.*)\))?!?:\s(?:(?<emoji>:\w*:|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF\uDE00-\uDEFF]|[\u2600-\u2B55])\s)?(?<subject>(?:(?!#).)*(?!\s).)(?:\s\(?(?<ticket>#\d*)\)?)?$/ // chore(scope): :emoji: test #123

  const match = data.trim().match(headerPattern)
  const matchGroups = match?.groups

  if (!matchGroups || matchGroups.subject === undefined || matchGroups.type === undefined)
    return null

  return {
    type: matchGroups.type.trim(),
    subject: matchGroups.subject.trim(),
    scope: matchGroups.scope?.trim(),
    emoji: matchGroups.emoji?.trim(),
    ticket: matchGroups.ticket?.trim(),
    raw: data.trim(),
  }
}

export function parseCommit(commitLine: string): ParsedCommit {
  // 找到第一个%
  const firstSpaceIndex = commitLine.indexOf('%')
  if (firstSpaceIndex === -1) {
    throw new Error('无效的提交记录格式')
  }

  // 提取哈希值和消息
  const temp = commitLine.slice(commitLine.indexOf('%') + 1, commitLine.lastIndexOf('%')) || ''

  const searchParams = new URLSearchParams(temp)
  const commitInfo = Object.fromEntries(searchParams.entries())

  const infos = {
    id: commitInfo.id,
    sha: commitInfo.sha,
    date: commitInfo.data ? new Date(commitInfo.data) : undefined,
    author: commitInfo.author,
  }

  const message = commitInfo.raw
  const commitRes = getCommitMsgInfo(message)
  if (message && commitRes) {
    return { ...infos, ...commitRes }
  }
  else {
    // 如果消息不符合格式，将整个消息作为 subject，type 设为 "other"
    return {
      ...infos,
      type: 'other',
      subject: message,
      raw: message,
    }
  }
}

export class GitTagParser {
  private tags: string[] = []
  constructor() {}

  getTags() {
    return this.tags
  }

  get firstTag() {
    return this.tags.at(-1)
  }

  /** 当前最新的 tag */
  get lastTag() {
    return this.tags.at(0)
  }

  // 获取所有标签并按提交日期排序
  async fetchTags(remote: boolean = false): Promise<string[]> {
    const cmds = remote
      ? ['ls-remote', '--tags', '--refs', '--sort=creatordate']
      : ['tag', '-l', '--sort=creatordate']

    const tagsResult = await x('git', [...cmds], execOptions)
    const tags = remote
      ? tagsResult.stdout
        .split('\n')
        .map(line => line.split('\t')[1]?.replace('refs/tags/', '').trim())
        .filter(tag => tag) as string[]
      : tagsResult.stdout
          .split('\n')
          .map(line => line.trim())
          .filter(tag => tag)

    this.tags = tags.reverse() // 按日期倒序排列
    return this.tags
  }

  /**
   * 获取两个标签之间的提交
   * @param tag1 新的 tag
   * @param tag2 旧的 tag
   */
  async getCommitsBetweenTags(tag1: string, tag2?: string): Promise<string[]>
  async getCommitsBetweenTags(tag1: string, tag2?: string, isParse?: false): Promise<string[]>
  async getCommitsBetweenTags(tag1: string, tag2?: string, isParse?: true): Promise<ParsedCommit[]>
  async getCommitsBetweenTags(tag1: string, tag2?: string, isParse?: boolean): Promise<string[] | ParsedCommit[]> {
    if (!this.tags.length) {
      throw new Error('No tags available. Please fetch tags first.')
    }

    const tag1Index = this.tags.indexOf(tag1)
    const tag2Index = tag2 === undefined ? undefined : this.tags.indexOf(tag2)

    if (tag1Index === -1 || (tag2 !== undefined && tag2Index === -1)) {
      throw new Error(`One or both tags ${tag1} or ${tag2} do not exist.`)
    }

    const range = tag2 === undefined ? tag1 : `${tag2}..${tag1}`
    const commitsResult = await x('git', [
      'log',
      '--oneline',
      '--pretty=format:"%id=%H&author=%an&raw=%s&date=%ad&sha=%h%"',
      range,
    ], execOptions)
    const commitList = commitsResult.stdout
      .split('\n')
      .map(line => line.trim())
      .filter(commit => commit)

    return isParse === true ? commitList.map(parseCommit) : commitList
  }

  // 分析并按标签的 "文件夹" 结构进行分组
  groupTagsByFolderStructure(): { [folder: string | 'root']: string[] } {
    const folderGroups: { [folder: string]: string[] } = {}

    this.tags.forEach((tag) => {
      const folderName = this.extractFolderName(tag)
      if (!folderGroups[folderName]) {
        folderGroups[folderName] = []
      }
      folderGroups[folderName].push(tag)
    })

    return folderGroups
  }

  // 提取标签名称的“文件夹”部分
  private extractFolderName(tag: string): string {
    const parts = tag.split('/')
    // 返回“文件夹”部分
    return parts.length > 1 ? parts[0]! : 'root' // 如果标签有斜杠，认为是文件夹，取斜杠前的部分；否则归类为根目录
  }

  // 获取标签的创建时间
  async getTagDate(tag: string): Promise<Date> {
    const result = await x('git', ['log', '-1', '--format=%cd', tag], execOptions)
    return new Date(result.stdout.trim())
  }

  async getPreviousTag(tag: string, same = false, pre = false): Promise<Tag | undefined> {
    const currentTagIndex = this.tags.indexOf(tag)
    let prevTag: string | undefined
    if (same === true) {
      const tagList = this.groupTagsByScopeWithVersions(true)
      const tagInfo = this.extractScopeProjectVersion(tag)
      const scope = tag.startsWith('@') ? `@${tagInfo.scope}` : tagInfo.scope
      const project = tagInfo.project
      const sameList = tagList[scope]?.[project]
      if (sameList && sameList.includes(tag)) {
        for (let index = currentTagIndex; index < this.tags.length; index++) {
          const element = this.tags[index]
          if (element && element !== this.tags[currentTagIndex] && sameList.includes(element)) {
            prevTag = element
            break
          }
        }
      }
    }
    else {
      prevTag = this.tags[currentTagIndex + 1]
    }

    if (prevTag) {
      return this.getTagInfo(prevTag, pre, same)
    }

    return undefined
  }

  /**
   * 获取标签的信息
   * @param tag
   * @param pre 默认 false，避免递归
   */
  async getTagInfo(tag: string, pre = false, same = false): Promise<Tag> {
    const result = await x('git', ['show', tag, '-q', '--pretty=format:"%id=%H&author=%an&date=%ad&sha=%h%"'], execOptions)
    const data = result.stdout.trim()
    const temp = data?.slice(data.indexOf('%') + 1, data.lastIndexOf('%')) || ''

    const searchParams = new URLSearchParams(temp)
    const tagInfo = Object.fromEntries(searchParams.entries())

    const tagResult: Tag = {
      tag,
      id: tagInfo.id || '',
      author: tagInfo.author || '',
      date: tagInfo.date ? new Date(tagInfo.date) : undefined,
      sha: tagInfo.sha || '',
    }

    // 获取上一个标签
    pre && (tagResult.pre = await this.getPreviousTag(tag, same, pre))

    return tagResult
  }

  // 按照组名（@）分组并归纳版本号
  groupTagsByScopeWithVersions(full = false): { [scope: string]: { [project: string]: string[] } } {
    const scopeGroups: { [scope: string]: { [project: string]: string[] } } = {}

    this.tags.forEach((tag) => {
      const { scope: _scope, project: _project, version: _version } = this.extractScopeProjectVersion(tag)
      const scope = full && tag.startsWith('@') ? `@${_scope}` : _scope
      const project = _project
      const version = full ? tag : _version

      // 确保组名存在
      if (!scopeGroups[scope]) {
        scopeGroups[scope] = {}
      }

      // 确保项目存在
      if (!scopeGroups[scope][project]) {
        scopeGroups[scope][project] = []
      }

      // 将版本号加入到项目下
      if (!scopeGroups[scope][project].includes(version)) {
        scopeGroups[scope][project].push(version)
      }
    })

    // 按版本号排序
    Object.keys(scopeGroups).forEach((scope) => {
      Object.keys(scopeGroups[scope]!).forEach((project) => {
        scopeGroups[scope]![project]!.sort((a, b) => this.compareVersions(a, b))
      })
    })

    return scopeGroups
  }

  // 提取标签中的 scope、project 和 version
  extractScopeProjectVersion(tag: string): { scope: string, project: string, version: string } {
    let scope = ''
    let project = ''
    let version = ''

    // 检查标签是否是 @scope/project@version 格式
    const match = tag.match(/^@([^/]+)\/([^@]+)@(.+)$/)
    if (match) {
      scope = match[1]! // 组名部分
      project = match[2]! // 项目名部分
      version = match[3]! // 版本号部分
    }
    else {
      // 如果没有 @scope/project@version 格式，假设是版本标签
      const simpleVersionMatch = tag.match(/^v?(\d+\.\d+\.\d.*)$/)
      if (simpleVersionMatch) {
        version = simpleVersionMatch[1]!
        project = tag // 使用 tag 作为项目名
        scope = 'root' // 默认 scope 为 root
      }
      else {
        throw new Error(`Invalid tag format: ${tag}`)
      }
    }

    return { scope, project, version }
  }

  // 比较版本号，返回排序顺序
  private compareVersions(versionA: string, versionB: string): number {
    const aParts = versionA.split('.').map(v => Number.parseInt(v, 10))
    const bParts = versionB.split('.').map(v => Number.parseInt(v, 10))

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const a = aParts[i] || 0
      const b = bParts[i] || 0
      if (a !== b)
        return a - b
    }

    return 0
  }
}

export default GitTagParser
