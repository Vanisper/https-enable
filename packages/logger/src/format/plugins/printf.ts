import type { TransformableInfo, TransformFunction } from '../type'
import { MESSAGE } from '../../triple-beam'

type TemplateFn = (info: TransformableInfo) => any

class Printf {
  template: TemplateFn

  constructor(templateFn: TemplateFn) {
    this.template = templateFn
  }

  transform: TransformFunction = (info) => {
    info[MESSAGE] = this.template(info)
    return info
  }
}

/*
 * function printf (templateFn)
 * Returns a new instance of the printf Format that creates an
 * intermediate prototype to store the template string-based formatter
 * function.
 */
export default (templateFn: TemplateFn) => new Printf(templateFn)

export { Printf }
