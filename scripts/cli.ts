import type { VersionBumpResults } from 'bumpp'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { x } from 'tinyexec'
import { generateChangelog } from './changelog'
import { squashLastNCommits } from './git-utils'
import { gitCommit } from './git-utils/commit'
import GitTagParser from './git-utils/tags'
import { detectMonorepo } from './monorepo/detect'
import { findPackages } from './monorepo/packages'
import { prefix } from './utils/cli-utilities'
import { selectPackages } from './utils/enquirer'
import { createFile } from './utils/file'
import logger from './utils/logger'
import { bumpVersion } from './version/bump'

async function main() {
  console.log(chalk.blue('Checking monorepo structure...'))
  const monorepo = await detectMonorepo()
  if (!monorepo) {
    console.log(chalk.red('Not a pnpm monorepo project'))
    return process.exit(1)
  }

  const allPackages = await findPackages(monorepo)
  const publishable = allPackages.filter(p => !p.private)
  const selected = await selectPackages(publishable)

  // Bump versions
  const { confirm_dump } = await enquirer.prompt<{ confirm_dump: boolean }>({
    type: 'confirm',
    name: 'confirm_dump',
    prefix,
    message: 'Ready to dump version?',
  })
  if (confirm_dump !== true) {
    return logger.info(`You have canceled dump version`)
  }

  const bumpCache: Record<string, VersionBumpResults> = {}
  for (const pkg of selected) {
    logger.info(`Bumping version for ${chalk.bold(pkg.name)} ...`)
    const res = await bumpVersion(pkg, `${pkg.name}@%s`)
    bumpCache[pkg.name] = res
    // 创建当前更新日志
    const parser = new GitTagParser()
    await parser.fetchTags()
    const lastTag = parser.lastTag
    if (lastTag && lastTag === res.tag) {
      const prevTag = (await parser.getPreviousTag(lastTag, true))?.tag ?? parser.firstTag
      const commits = await parser.getCommitsBetweenTags(lastTag, prevTag, true)
      const changelog = generateChangelog(commits, lastTag)
      const changelogPath = createFile(path.join(pkg.path, 'changelog.md'), changelog, { prepend: true })
      await x('npx', ['eslint', '--fix', changelogPath])
      await gitCommit([changelogPath], `chore(changelog): ${lastTag}`)
      await squashLastNCommits(2)
    }
  }
  if (selected.length) {
    await squashLastNCommits(selected.length)
  }

  // Publish
  // const { confirm } = await enquirer.prompt({
  //   type: 'confirm',
  //   name: 'confirm',
  //   message: 'Ready to publish packages?',
  // })

  // if (confirm) {
  //   for (const pkg of selected) {
  //     console.log(chalk.blue(`Publishing ${pkg.name}...`))
  //     await publishPackage(pkg)
  //   }
  // }
}

main().catch(console.error)
