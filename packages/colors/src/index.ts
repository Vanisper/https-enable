import type { FormatKeys } from './type'
import { styles } from './styles'

/**
 * 递归应用 ANSI 转义序列的核心函数
 * @param formats - 待应用的样式数组
 * @param text - 当前层级的文本
 * @returns 嵌套应用样式的字符串
 * @deprecated 使用数组的 reduce 更简洁
 */
// eslint-disable-next-line unused-imports/no-unused-vars
function applyStylesRecursive(formats: FormatKeys[], text: string): string {
  // 终止条件：所有样式应用完成
  if (formats.length === 0)
    return text

  // 取出当前层级的样式（保持应用顺序）
  const [currentFormat, ...remainingFormats] = formats

  // 类型安全校验
  const style = currentFormat && styles[currentFormat]
  if (!style) {
    throw new Error(`Invalid style format: ${currentFormat}`)
  }

  // 递归应用后续样式
  const innerText = applyStylesRecursive(remainingFormats, text)

  // 包裹当前层级的样式
  return `${style.open}${innerText}${style.close}`
}

/**
 * 给文本添加 ANSI 转义序列样式（递归版本）
 * @param format - 单个样式或样式数组
 * @param text - 需要格式化的文本
 * @returns 带有 ANSI 转义序列的格式化文本
 */
export function styleText(format: FormatKeys | FormatKeys[], text: string): string {
  const formats = Array.isArray(format) ? format : [format]

  /**
   * 颜色样式的表现结果是就近原则的，
   * 所以这里需要对数组逆序一下，
   * 以保证后续的样式设置的权重更高
   * 但是如果是使用递归的做法，由于递归本身存在反向的特点，所以不用逆向数组
   */
  return formats.reverse()
    .reduce((str, style) =>
      `${styles[style].open}${str}${styles[style].close}`, text)
}

export * from './common'
export * from './constants'
export * from './styles'
