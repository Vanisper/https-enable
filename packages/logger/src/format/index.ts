import { camelCase, importGlob } from '@https-enable/utils'
import format from './format'
import levels from './levels'

import align from './plugins/align'
import cli from './plugins/cli'
import colorize from './plugins/colorize'
import combine from './plugins/combine'
import errors from './plugins/errors'
import json from './plugins/json'
import label from './plugins/label'
import logstash from './plugins/logstash'
import metadata from './plugins/metadata'
import ms from './plugins/ms'
import padLevels from './plugins/pad-levels'
import prettyPrint from './plugins/pretty-print'
import printf from './plugins/printf'
import simple from './plugins/simple'
import splat from './plugins/splat'
import timestamp from './plugins/timestamp'
import uncolorize from './plugins/uncolorize'

/*
 * @api private
 * method {function} exposeFormat
 * 以惰性加载的 getter 方式在主格式对象上暴露子格式。
 */
function exposeFormat(name: string, requireFormat: () => any) {
  Object.defineProperty(format, name, {
    get() {
      return requireFormat()
    },
    configurable: true,
  })
}

exposeFormat('align', () => align)
exposeFormat('cli', () => cli)
exposeFormat('colorize', () => colorize)
exposeFormat('combine', () => combine)
exposeFormat('errors', () => errors)
exposeFormat('json', () => json)
exposeFormat('label', () => label)
exposeFormat('logstash', () => logstash)
exposeFormat('metadata', () => metadata)
exposeFormat('ms', () => ms)
exposeFormat('padLevels', () => padLevels)
exposeFormat('prettyPrint', () => prettyPrint)
exposeFormat('printf', () => printf)
exposeFormat('simple', () => simple)
exposeFormat('splat', () => splat)
exposeFormat('timestamp', () => timestamp)
exposeFormat('uncolorize', () => uncolorize)

/**
 * @deprecated 动态批量引用是异步的，开发使用体验不好，暂时弃用
 */
export async function initFormats() {
  const routeModules = await importGlob('./plugins/*.ts', {
    eager: true,
    import: 'default',
  })
  Object.entries(routeModules).forEach(([key, value]) => {
    const ext = key.split('.').pop()
    const name = key.split('/').pop()?.replace(ext ? `.${ext}` : '', '')
    if (name) {
      exposeFormat(camelCase(name), () => value)
    }
  })
  return format
}

export default format
export { format, levels }

export type * from './type'
