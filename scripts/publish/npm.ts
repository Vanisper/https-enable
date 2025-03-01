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
