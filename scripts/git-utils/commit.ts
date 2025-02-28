import { x } from 'tinyexec'

const execOptions = { throwOnError: true }

// 提交函数
export async function gitCommit(files: string[] = [], commitMsg: string) {
  try {
    // 1. 添加文件到暂存区
    if (files.length > 0) {
      console.log('Staging files...')
      await x('git', ['add', ...files], execOptions)
    }
    else {
    //   console.log('No files specified. Staging all changes...')
    //   await x('git', ['add', '.'], execOptions)
      return
    }

    // 2. 提交
    console.log(`Committing with message: ${commitMsg}`)
    await x('git', ['commit', '-m', commitMsg], execOptions)

    console.log('Commit successful!')
  }
  catch (error) {
    console.error(`Error during commit:`, error)
  }
}
