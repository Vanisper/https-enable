import type { Prettify } from '@https-enable/types'

// ================= 类型定义层 =================
export interface StyleEntry { open: string, close: string }

// 基础颜色类型（支持是否包含亮色）
type ColorDefinition<HasBright extends boolean = true> = {
  normal: { fg: number, bg: number }
} & (HasBright extends true ? { bright: { fg: number, bg: number } } : unknown)

// 颜色配置模板
export interface ColorScheme {
  black: ColorDefinition<false> // 示例：黑色没有亮色
  red: Prettify<ColorDefinition>
  green: Prettify<ColorDefinition>
  yellow: Prettify<ColorDefinition>
  blue: Prettify<ColorDefinition>
  magenta: Prettify<ColorDefinition>
  cyan: Prettify<ColorDefinition>
  white: Prettify<ColorDefinition>
  gray: ColorDefinition<false>
  grey: ColorDefinition<false>
}

// ================= 生成工具类型 =================
export type ColorName = Prettify<keyof ColorScheme>
// 判断颜色是否包含亮色版本
type HasBright<T extends ColorName> = 'bright' extends keyof ColorScheme[T] ? true : false

// 生成颜色键名（自动处理亮色）
type ColorKeys<T extends ColorName> =
  T | (HasBright<T> extends true ? `bright${Capitalize<T>}` : never)

// 生成背景色键名（自动处理亮色）
type BackgroundKeys<T extends ColorName> =
  `bg${Capitalize<T>}` | (HasBright<T> extends true ? `bgBright${Capitalize<T>}` : never)

// 联合所有可能的键名
export type AllColorKeys = Prettify<{
  [K in ColorName]: ColorKeys<K> | BackgroundKeys<K>;
}[ColorName]>

export interface StyleType {
  reset: StyleEntry
  // 基础样式
  bold: StyleEntry
  dim: StyleEntry
  italic: StyleEntry
  underline: StyleEntry
  blink: StyleEntry
  inverse: StyleEntry
  hidden: StyleEntry
  strikethrough: StyleEntry
  doubleunderline: StyleEntry
  framed: StyleEntry
  overlined: StyleEntry
}

export type ColorType = {
  // 动态颜色类型
  [K in AllColorKeys]: StyleEntry;
}

export type FormatKeys = Prettify<keyof StyleType | AllColorKeys>
