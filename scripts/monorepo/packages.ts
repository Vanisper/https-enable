import type { MonorepoInfo } from './detect'
import fs from 'node:fs'
import path from 'node:path'
import { glob as globby } from 'tinyglobby'
import { normalizePath } from '../utils/path'

export interface PackageInfo {
  path: string
  name: string
  version?: string
  private: boolean
  manifest: Record<string, any>
}

export async function findPackages(monorepo: MonorepoInfo): Promise<PackageInfo[]> {
  const patterns = monorepo.packages.map(p =>
    normalizePath(path.join(monorepo.root, p, 'package.json')),
  )

  const results = await globby(patterns, {
    absolute: true,
    cwd: monorepo.root,
    expandDirectories: false,
    ignore: ['**/node_modules/**'],
  })

  return Promise.all(
    results.map(async (pkgPath) => {
      const content = fs.readFileSync(pkgPath, 'utf8')
      const manifest = JSON.parse(content)
      return {
        path: path.dirname(pkgPath),
        name: manifest.name,
        version: manifest.version,
        private: !!manifest.private,
        manifest,
      }
    }),
  )
}
