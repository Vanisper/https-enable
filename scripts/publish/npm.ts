import type { PackageInfo } from '../monorepo/packages'
import { execa } from 'execa'

export async function publishPackage(pkg: PackageInfo) {
  const { exitCode } = await execa('pnpm', ['publish', '--access', 'public'], {
    cwd: pkg.path,
    stdio: 'inherit',
  })
  return exitCode === 0
}
