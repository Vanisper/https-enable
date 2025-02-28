import type { ParsedCommit } from '../git-utils/tags'

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
