import fs from 'node:fs'
import path from 'node:path'

export function createFile(_path: string, content: string, cover = false): string {
  const targetPath = path.isAbsolute(_path) ? _path : path.posix.resolve(_path)
  const dir = path.dirname(targetPath)
  fs.mkdirSync(dir, { recursive: true })
  if (cover)
    fs.writeFileSync(targetPath, content, { encoding: 'utf-8' })
  else
    fs.appendFileSync(targetPath, `\n${content}`, { encoding: 'utf-8' })

  return targetPath
}
