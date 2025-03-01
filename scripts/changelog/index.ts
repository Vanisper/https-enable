import type { ParsedCommit, Tag } from '../git-utils/tags'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { x } from 'tinyexec'
import { gitCommit } from '../git-utils/commit'
import { GitTagParser } from '../git-utils/tags'
import { detectMonorepo } from '../monorepo/detect'
import { findPackages } from '../monorepo/packages'
import { createFile } from '../utils/file'

/* eslint-disable unused-imports/no-unused-vars */
const commitTypes = [
  { value: 'feat', name: '🚀 Features: 新功能', emoji: '🚀' },
  { value: 'perf', name: '🔥 Performance: 性能优化', emoji: '🔥' },
  { value: 'fix', name: '🩹 Fixes: 缺陷修复', emoji: '🩹' },
  { value: 'refactor', name: '💅 Refactors: 代码重构', emoji: '💅' },
  { value: 'docs', name: '📖 Documentation: 文档', emoji: '📖' },
  { value: 'build', name: '📦 Build: 构建工具', emoji: '📦' },
  { value: 'types', name: '🌊 Types: 类型定义', emoji: '🌊' },
  { value: 'chore', name: '🏡 Chore: 简修处理', emoji: '🏡' },
  { value: 'examples', name: '🏀 Examples: 例子展示', emoji: '🏀' },
  { value: 'test', name: '✅ Tests: 测试用例', emoji: '✅' },
  { value: 'style', name: '🎨 Styles: 代码风格', emoji: '🎨' },
  { value: 'ci', name: '🤖 CI: 持续集成', emoji: '🤖' },
  { value: 'init', name: '🎉 Init: 项目初始化', emoji: '🎉' },
]

// 根据提交类型生成 changelog
export function generateChangelog(commits: ParsedCommit[], title = 'Changelog'): string {
  // 按时间排序
  const sortedCommits = commits.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))

  const changelog: string[] = [`## ${title}`]

  // 根据类型分类
  commitTypes.forEach(({ value, name, emoji }, index) => {
    const filteredCommits = sortedCommits.filter(commit => commit.type === value)

    if (filteredCommits.length > 0) {
      changelog.push(`\n### ${name}\n`)
      filteredCommits.forEach((commit) => {
        let sha = commit.sha ? `(${commit.sha})` : undefined
        sha = sha?.padStart(sha.length + 1, ' ') || ''

        let author = commit.author ? `- by @${commit.author}` : undefined
        author = author?.padStart(author.length + 1, ' ') || ''

        changelog.push(`- ${commit.raw}${author}${sha}`)
      })
    }
  })

  changelog.length && changelog.push(`${changelog.pop()}\n`) // 在最后添加换行

  return changelog.join('\n')
}

function getAllTags(tag: Tag): Tag[] {
  const tags: Tag[] = [tag] // 初始化一个包含当前标签的数组
  // 如果有 `pre` 标签，递归调用
  if (tag.pre) {
    tags.push(...getAllTags(tag.pre)) // 合并结果
  }
  return tags
}

/**
 * 重建整个项目的 changelog
 */
export async function resetChangelog() {
  const parser = new GitTagParser()
  await parser.fetchTags()

  console.log(chalk.blue('Checking monorepo structure...'))
  const monorepo = await detectMonorepo()
  if (!monorepo) {
    console.log(chalk.red('Not a pnpm monorepo project'))
    return process.exit(1)
  }

  const allPackages = await findPackages(monorepo)
  const publishable = allPackages.filter(p => !p.private)

  for (const pkg of publishable) {
    const currTag = `${pkg.name}@${pkg.version}`
    const prevTag = await parser.getPreviousTag(currTag, true, true)
    if (prevTag) {
      const tagsInfo = getAllTags(prevTag).reverse()
      const tags = [...tagsInfo.map(item => item.tag), currTag]

      const changelogs: string[] = []
      for (let index = 0; index < tags.length; index++) {
        const currentTag = tags[index]!
        const prevTag = tags[index - 1]
        const commits = await parser.getCommitsBetweenTags(currentTag, prevTag, true)
        changelogs.push(generateChangelog(commits, currentTag))
      }
      // TODO: 可以选择拆分更新日志至细分文件
      const changelogPath = createFile(path.join(pkg.path, 'changelog.md'), changelogs.reverse().join('\n'), true)
      await x('npx', ['eslint', '--fix', changelogPath])
      const commitMsg = `chore(changelog): ${pkg.name}@{${parser.extractScopeProjectVersion(tagsInfo[0]!.tag).version}..${pkg.version}}`
      await gitCommit([changelogPath], commitMsg)
    }
  }
}
