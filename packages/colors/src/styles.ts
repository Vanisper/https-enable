import type { Prettify } from '@https-enable/types'
import type { AllColorKeys, ColorName, ColorScheme, ColorType, StyleType } from './type'

const defaultFG = 39
const defaultBG = 49

// ================= 颜色代码配置 =================
const colors: ColorScheme = {
  black: {
    normal: { fg: 30, bg: 40 },
  },
  red: {
    normal: { fg: 31, bg: 41 },
    bright: { fg: 91, bg: 101 },
  },
  green: {
    normal: { fg: 32, bg: 42 },
    bright: { fg: 92, bg: 102 },
  },
  yellow: {
    normal: { fg: 33, bg: 43 },
    bright: { fg: 93, bg: 103 },
  },
  blue: {
    normal: { fg: 34, bg: 44 },
    bright: { fg: 94, bg: 104 },
  },
  magenta: {
    normal: { fg: 35, bg: 45 },
    bright: { fg: 95, bg: 105 },
  },
  cyan: {
    normal: { fg: 36, bg: 46 },
    bright: { fg: 96, bg: 106 },
  },
  white: {
    normal: { fg: 37, bg: 47 },
    bright: { fg: 97, bg: 107 },
  },
  gray: {
    normal: { fg: 90, bg: 100 },
  },
  grey: {
    normal: { fg: 90, bg: 100 },
  },
}

// ================= 样式生成器 =================
function createEntry(code: number, resetCode: number) {
  return {
    open: `\u001B[${code}m`,
    close: `\u001B[${resetCode}m`,
  }
}

// 类型安全的颜色生成器
function buildColorStyles(): ColorType {
  return Object.entries(colors).reduce((acc, [name, variants]) => {
    const colorName = name as ColorName
    const capitalized = colorName[0]?.toUpperCase() + colorName.slice(1)

    // 前景色
    acc[colorName] = createEntry(variants.normal.fg, defaultFG)
    if ('bright' in variants) {
      const brightKey = `bright${capitalized}` as AllColorKeys
      acc[brightKey] = createEntry(variants.bright.fg, defaultFG)
    }

    // 背景色
    const bgKey = `bg${capitalized}` as AllColorKeys
    acc[bgKey] = createEntry(variants.normal.bg, defaultBG)
    if ('bright' in variants) {
      const bgBrightKey = `bgBright${capitalized}` as AllColorKeys
      acc[bgBrightKey] = createEntry(variants.bright.bg, defaultBG)
    }

    return acc
  }, {} as ColorType) // 关键类型断言
}

// See: https://github.com/nodejs/node/blob/main/lib/internal/util/inspect.js#L407~L454
// See: https://en.wikipedia.org/wiki/ANSI_escape_code#graphics
// See: https://github.com/mintty/mintty/wiki/Tips#text-attributes-and-rendering
export const styles: Prettify<StyleType & ColorType> = {
  // 基础样式
  reset: createEntry(0, 0),
  bold: createEntry(1, 22),
  dim: createEntry(2, 22),
  italic: createEntry(3, 23),
  underline: createEntry(4, 24),
  blink: createEntry(5, 25),
  // Swap foreground and background colors
  inverse: createEntry(7, 27),
  hidden: createEntry(8, 28),
  strikethrough: createEntry(9, 29),
  doubleunderline: createEntry(21, 24),
  framed: createEntry(51, 54),
  overlined: createEntry(53, 55),

  // 动态生成颜色样式
  ...buildColorStyles(),
}

export default styles
