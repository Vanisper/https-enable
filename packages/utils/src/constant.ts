export const WindowsSlashRE = /\\/g

/**
 * windows 盘符
 * @description 匹配 `x:/` 或 `x:\\` 开头的文本
 * @description 最好先将 windows下的路径转换为 posix 风格，否则由于字符串斜杠转义问题，可能会导致正则匹配失败
 */
export const WindowsDiskRE = /^[a-z]?:(?:\/|\\\\)/i
