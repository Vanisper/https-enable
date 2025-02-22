import type { TransformableInfo, TransformFunction } from '../type'
import util from 'node:util'
import { SPLAT } from '../../triple-beam'

/**
 * 捕获给定字符串中的格式（即 %s 字符串）的数量。
 * 基于 `util.format`，参见 Node.js 源代码：
 * https://github.com/nodejs/node/blob/b1c8f15c5f169e021f7c46eb7b219de95fe97603/lib/util.js#L201-L230
 */
const formatRegExp = /%[scdjifoO%]/g

/**
 * 捕获格式字符串中转义的 % 符号的数量（即 %s 字符串）。
 */
const escapedPercent = /%%/g

class Splatter {
  constructor() {}

  /**
   * 检查 tokens <= splat.length，将 { splat, meta } 分配到 `info` 中，并写入此实例。
   *
   * @param info Logform 信息消息。
   * @param tokens 一组字符串插值标记。
   * @returns 修改后的信息消息
   * @private
   */
  private _splat(info: TransformableInfo, tokens: string[]) {
    const msg = info.message || ''
    const splat = info[SPLAT] || info.splat || []
    const percents = msg.match(escapedPercent)
    const escapes = percents ? percents.length : 0

    // 预期的 splat 是标记的数量减去转义的数量
    // 例如：
    // - { expectedSplat: 3 } '%d %s %j'
    // - { expectedSplat: 5 } '[%s] %d%% %d%% %s %j'
    //
    // 任何 "meta" 都将是预期 splat 大小之外的参数，无论类型如何。例如：
    //
    // logger.log('info', '%d%% %s %j', 100, 'wow', { such: 'js' }, { thisIsMeta: true });
    // 将导致 splat 为四（4），但预期只有三（3）。因此：
    //
    // extraSplat = 3 - 4 = -1
    // metas = [100, 'wow', { such: 'js' }, { thisIsMeta: true }].splice(-1, -1 * -1);
    // splat = [100, 'wow', { such: 'js' }]
    const expectedSplat = tokens.length - escapes
    const extraSplat = expectedSplat - splat.length
    const metas = extraSplat < 0 ? splat.splice(extraSplat, -1 * extraSplat) : []

    // 现在 { splat } 已经与任何潜在的 { meta } 分开。我们
    // 可以将其分配给 `info` 对象并将其写入我们的格式流。
    // 如果额外的 metas 不是对象或缺少可枚举属性
    // 你将会遇到麻烦。
    const metalen = metas.length
    if (metalen) {
      for (let i = 0; i < metalen; i++) {
        Object.assign(info, metas[i])
      }
    }

    info.message = util.format(msg, ...splat)
    return info
  }

  /**
   * 使用 `util.format` 完成 `info.message` 提供的 `info` 消息。
   * 如果没有标记，则 `info` 是不可变的。
   *
   * @param info Logform 信息消息。
   * @returns 修改后的信息消息
   */
  transform: TransformFunction = (info) => {
    const msg = info.message || ''
    const splat = info[SPLAT] || info.splat

    // 如果 splat 未定义，则无需处理任何内容
    if (!splat || !splat.length) {
      return info
    }

    // 提取标记，如果没有可用的标记，则默认为空数组以
    // 确保预期结果的一致性
    const tokens = msg.match(formatRegExp)

    // 此条件将处理具有 info[SPLAT]
    // 但没有标记存在的输入
    if (!tokens && (splat || splat.length)) {
      const metas = splat.length > 1 ? splat.splice(0) : splat

      // 现在 { splat } 已经与任何潜在的 { meta } 分开。我们
      // 可以将其分配给 `info` 对象并将其写入我们的格式流。
      // 如果额外的 metas 不是对象或缺少可枚举属性
      // 你将会遇到麻烦。
      const metalen = metas.length
      if (metalen) {
        for (let i = 0; i < metalen; i++) {
          Object.assign(info, metas[i])
        }
      }

      return info
    }

    if (tokens) {
      return this._splat(info, tokens)
    }

    return info
  }
}

/*
 * function splat (info)
 * 返回一个新的 splat 格式 TransformStream 实例
 * 它从 `info` 对象执行字符串插值。这之前
 * 在 `winston < 3.0.0` 中隐式暴露。
 */
export default () => new Splatter()
