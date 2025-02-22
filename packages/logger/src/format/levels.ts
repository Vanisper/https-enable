import type { Configs } from '../triple-beam/type'
import { Colorizer } from './plugins/colorize'

/*
 * Simple method to register colors with a simpler require
 * path within the module.
 */
export default (config: typeof Configs['npm']) => {
  Colorizer.addColors(config.colors)
  return config
}
