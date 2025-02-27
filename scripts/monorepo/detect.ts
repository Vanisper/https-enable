/* eslint-disable unused-imports/no-unused-vars */
import fs from 'node:fs/promises'
import path from 'node:path'
import { findUp } from 'find-up'
import { parse } from 'yaml'

export interface MonorepoInfo {
  root: string
  packages: string[]
}

export async function detectMonorepo(): Promise<MonorepoInfo | null> {
  const workspaceFile = await findUp('pnpm-workspace.yaml')
  if (!workspaceFile)
    return null

  try {
    const content = await fs.readFile(workspaceFile, 'utf8')
    const { packages = [] } = await parse(content)
    return {
      root: path.dirname(workspaceFile),
      packages: Array.isArray(packages) ? packages : [packages],
    }
  }
  catch (error) {
    throw new Error('Failed to parse pnpm-workspace.yaml')
  }
}
