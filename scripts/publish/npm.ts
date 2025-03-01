import type prettier from 'prettier'
import type { PackageInfo } from '../monorepo/packages'
import fs from 'node:fs'
import detectIndent from 'detect-indent'
import { execa } from 'execa'

export async function publishPackage(pkg: PackageInfo) {
  const { exitCode } = await execa('pnpm', ['publish', '--access', 'public'], {
    cwd: pkg.path,
    stdio: 'inherit',
  })
  return exitCode === 0
}

export async function updatePackageJson(
  pkgJsonPath: string,
  pkgJson: any,
): Promise<void> {
  const pkgRaw = fs.readFileSync(pkgJsonPath, 'utf-8')
  const indent = detectIndent(pkgRaw).indent || '  '
  const stringified
    = JSON.stringify(pkgJson, null, indent) + (pkgRaw.endsWith('\n') ? '\n' : '')

  return fs.writeFileSync(pkgJsonPath, stringified)
}

export async function updateChangelog(
  changelogPath: string,
  changelog: string,
  name: string,
  prettierInstance: typeof prettier | undefined,
) {
  const templateString = `\n\n${changelog.trim()}\n`

  try {
    if (fs.existsSync(changelogPath)) {
      await prependFile(changelogPath, templateString, name, prettierInstance)
    }
    else {
      await writeFormattedMarkdownFile(
        changelogPath,
        `# ${name}${templateString}`,
        prettierInstance,
      )
    }
  }
  catch (e) {
    console.warn(e)
  }
}

async function prependFile(
  filePath: string,
  data: string,
  name: string,
  prettierInstance: typeof prettier | undefined,
) {
  const fileData = fs.readFileSync(filePath).toString()
  // if the file exists but doesn't have the header, we'll add it in
  if (!fileData) {
    const completelyNewChangelog = `# ${name}${data}`
    await writeFormattedMarkdownFile(
      filePath,
      completelyNewChangelog,
      prettierInstance,
    )
    return
  }
  const newChangelog = fileData.replace('\n', data)

  await writeFormattedMarkdownFile(filePath, newChangelog, prettierInstance)
}
async function writeFormattedMarkdownFile(
  filePath: string,
  content: string,
  prettierInstance: typeof prettier | undefined,
) {
  fs.writeFileSync(
    filePath,
    prettierInstance
      // Prettier v3 returns a promise
      ? await prettierInstance.format(content, {
        ...(await prettierInstance.resolveConfig(filePath)),
        filepath: filePath,
        parser: 'markdown',
      })
      : content,
  )
}
