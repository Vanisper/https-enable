import { ansiRegStr } from './constants'

export function ansiRegex({ onlyFirst = false } = {}) {
  return new RegExp(ansiRegStr, onlyFirst ? undefined : 'g')
}

// See: https://github.com/chalk/strip-ansi/blob/main/index.js
// See: https://github.com/nodejs/node/blob/main/lib/internal/util/inspect.js#L2471~L2478
const regex = ansiRegex()
export function stripAnsi(string: string) {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``)
  }

  // Even though the regex is global, we don't need to reset the `.lastIndex`
  // because unlike `.exec()` and `.test()`, `.replace()` does it automatically
  // and doing it manually has a performance penalty.
  return string.replace(regex, '')
}
