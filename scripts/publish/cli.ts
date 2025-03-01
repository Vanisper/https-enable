/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable unused-imports/no-unused-vars */
import type { PackageInfo } from '../monorepo/packages'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { Command } from 'commander'
import { x } from 'tinyexec'
import { detectMonorepo } from '../monorepo/detect'
import { findPackages } from '../monorepo/packages'
import { buildDependencyGraph, getPublishOrder, parsePkg } from './dependencies'

const execOptions = { throwOnError: true }

const program = new Command()

program
  .command('publish')
  .description('Publish packages in dependency order')
  .action(async () => {
    const packages = await getPackages() // 获取所有包的依赖关系
    const order = getPublishOrder(packages) // 计算发布顺序

    for (const pkg of order) {
      await publishPackage(pkg) // 发布包
    }
  })

program
  .command('check-deps')
  .description('Check dependencies between packages')
  .action(async () => {
    const packages = await getPackages()
    checkDependencies(packages) // 检查依赖关系
  })

program.parse(process.argv)

// 获取所有包的信息并构建依赖图
async function getPackages() {
  console.log(chalk.blue('Checking monorepo structure...'))
  const monorepo = await detectMonorepo()
  if (!monorepo) {
    console.log(chalk.red('Not a pnpm monorepo project'))
    return process.exit(1)
  }

  const allPackages = await findPackages(monorepo)
  const publishable = allPackages.filter(p => !p.private)

  return publishable
}

// 发布包到 NPM
async function publishPackage(pkg: PackageInfo) {
  const packagePath = path.resolve(pkg.path)
  const packageJsonPath = path.join(packagePath, 'package.json')

  // 确保包的 manifest 存在
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red(`No package.json found in package ${pkg.name}`))
    return
  }

  // 使用 fs.readFileSync 来读取 package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  // 检查版本号，确保包未发布过或者是一个新的版本
  if (packageJson.private) {
    console.log(chalk.yellow(`Skipping private package ${pkg.name}`))
    return
  }

  const version = packageJson.version
  console.log(chalk.blue(`Publishing package ${pkg.name} (version: ${version})`))

  // 在发布前进行版本检查
  const existingTags = await getExistingTags(pkg.name)

  if (existingTags.includes(version)) {
    console.log(chalk.yellow(`Version ${version} of ${pkg.name} already published. Skipping...`))
    return
  }

  // const pkgDeps = parsePkg(pkg)
  // for (let index = 0; index < pkgDeps.dependencies.length; index++) {
  //   const element = pkgDeps.dependencies[index]
  //   if (element) {
  //     const version = pkg.manifest?.dependencies?.[element] as string | undefined
  //     if (version && version.startsWith('workspace:')) {
  //       const latestVersion = await getLatestVersion(element)
  //       pkg.manifest.dependencies[element] = latestVersion
  //     }
  //   }
  // }
  // for (let index = 0; index < pkgDeps.devDependencies.length; index++) {
  //   const element = pkgDeps.devDependencies[index]
  //   if (element) {
  //     const version = pkg.manifest?.devDependencies?.[element] as string | undefined
  //     if (version && version.startsWith('workspace:')) {
  //       const latestVersion = await getLatestVersion(element)
  //       pkg.manifest.devDependencies[element] = latestVersion
  //     }
  //   }
  // }
  // for (let index = 0; index < pkgDeps.peerDependencies.length; index++) {
  //   const element = pkgDeps.peerDependencies[index]
  //   if (element) {
  //     const version = pkg.manifest?.peerDependencies?.[element] as string | undefined
  //     if (version && version.startsWith('workspace:')) {
  //       const latestVersion = await getLatestVersion(element)
  //       pkg.manifest.peerDependencies[element] = latestVersion
  //     }
  //   }
  // }

  // 执行 npm publish 命令
  try {
    console.log(chalk.green(`Publishing ${pkg.name}...`))
    await x(`pnpm`, ['publish', '--json', '--access', 'public', '--tag', 'latest', '--no-git-checks'], { ...execOptions, nodeOptions: { cwd: pkg.path } })
    console.log(chalk.green(`Successfully published ${pkg.name}@${version}`))
  }
  catch (error) {
    console.error(chalk.red(`Failed to publish ${pkg.name}@${version}`))
    throw error
  }
}

/**
 * 获取包的最新版本号
 * @param packageName - 包名
 * @returns 最新版本号
 */
async function getLatestVersion(packageName: string): Promise<string> {
  const result = await x('npm', ['view', packageName, 'version'], execOptions)
  return result.stdout.trim()
}

/**
 * 更新依赖包的版本号，确保它们指向最新的版本
 * @param packageName - 被依赖的包名
 * @param latestVersion - 最新版本
 * @param allPackages - 所有包的列表
 */
async function updateDependentPackages(packageName: string, latestVersion: string, allPackages: PackageInfo[]) {
  // 遍历所有包，检查它们是否依赖于该包
  for (const pkg of allPackages) {
    const manifest = pkg.manifest
    const dependencies = manifest.dependencies || {}

    // 如果当前包依赖于 target package，更新其版本号
    if (dependencies[packageName]) {
      console.log(`Updating ${pkg.name} to depend on ${packageName}@${latestVersion}...`)

      // 更新 package.json 中的版本号
      dependencies[packageName] = latestVersion
      manifest.dependencies = dependencies

      // 写入 package.json 文件
      fs.writeFileSync(path.join(pkg.path, 'package.json'), JSON.stringify(manifest, null, 2))

      console.log(`${pkg.name} now depends on ${packageName}@${latestVersion}`)
    }
  }
}

// 获取已发布的标签（版本）信息
async function getExistingTags(packageName: string): Promise<string[]> {
  try {
    const result = await x('npm', ['show', packageName, '--json'], execOptions)
    const packageInfo = JSON.parse(result.stdout)
    return packageInfo.versions || []
  }
  catch (error) {
    console.error(chalk.red(`Failed to fetch existing versions for ${packageName}:`), error)
    return []
  }
}

// 检查依赖关系
// 检查包之间的依赖关系，区分开发时依赖和运行时依赖
function checkDependencies(packages: PackageInfo[]) {
  const graph = buildDependencyGraph(packages)

  console.log(chalk.blue('Checking package dependencies...'))

  // 遍历每个包，打印其依赖的包和开发时依赖的包
  packages.forEach((pkg) => {
    const { dependencies, devDependencies, peerDependencies } = graph[pkg.name] ?? {}

    // 检查运行时依赖
    if (dependencies && dependencies.length > 0) {
      console.log(chalk.green(`Package ${pkg.name} has runtime dependencies:`))
      dependencies.forEach((dep) => {
        console.log(chalk.green(`  - ${dep}`))
      })
    }

    // 检查开发时依赖
    if (devDependencies && devDependencies.length > 0) {
      console.log(chalk.yellow(`Package ${pkg.name} has development dependencies:`))
      devDependencies.forEach((dep) => {
        console.log(chalk.yellow(`  - ${dep}`))
      })
    }

    // 检查开发时依赖
    if (peerDependencies && peerDependencies.length > 0) {
      console.log(chalk.blue(`Package ${pkg.name} has peer dependencies:`))
      peerDependencies.forEach((dep) => {
        console.log(chalk.blue(`  - ${dep}`))
      })
    }

    // 如果没有任何依赖
    if (dependencies?.length === 0 && devDependencies?.length === 0 && peerDependencies?.length === 0) {
      console.log(chalk.red(`Package ${pkg.name} has no dependencies`))
    }
  })
}
