import type { PackageInfo } from '../monorepo/packages'
import path from 'node:path'
import bumpp from 'bumpp'

export async function bumpVersion(pkg: PackageInfo, tag: string | boolean = false) {
  return bumpp({
    tag,
    files: [path.posix.join(pkg.path, 'package.json')],
    commit: tag && typeof tag === 'string' ? `chore: release ${tag}` : undefined,
  })
}
