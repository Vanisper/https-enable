// https://github.com/changesets/changesets/blob/main/packages/cli/src/utils/cli-utilities.ts
import process from 'node:process'
import enquirer from 'enquirer'
import terminalSize from 'terminal-size'
import { error, success } from './logger'
import symbols from './symbols'

// those types are not exported from `enquirer` so we extract them here
// so we can make type assertions using them because `enquirer` types do no support `prefix` right now
type PromptOptions = Extract<Parameters<typeof enquirer.prompt>[0], { type: string }>
type ArrayPromptOptions = Extract<
  PromptOptions,
  {
    type:
      | 'autocomplete'
      | 'editable'
      | 'form'
      | 'multiselect'
      | 'select'
      | 'survey'
      | 'list'
      | 'scale'
  }
>

interface Choice {
  name: string
  message?: string
  value?: unknown
  hint?: string
  role?: string
  enabled?: boolean
  disabled?: boolean | string
}

export const prefix = '🍒 '
const limit = Math.max(terminalSize().rows - 5, 10)
function cancelFlow() {
  success('Cancelled... 👋 ')
  return process.exit()
}

/* Notes on using inquirer:
 * Each question needs a key, as inquirer is assembling an object behind-the-scenes.
 * At each call, the entire responses object is returned, so we need a unique
 * identifier for the name every time. This is why we are using serial IDs
 */
const serialId: () => number = (function () {
  let id = 0
  return () => id++
})()

async function askCheckboxPlus<C extends (string | Choice)[]>(
  message: string,
  choices: C,
  format?: (value: string) => string | Promise<string>,
) {
  const name = `CheckboxPlus-${serialId()}`

  return enquirer.prompt<Record<string, string[]>>({
    type: 'autocomplete',
    name,
    message,
    prefix,
    multiple: true,
    choices,
    format,
    limit,
    onCancel: cancelFlow,
    symbols: {
      indicator: symbols.radioOff,
      checked: symbols.radioOn,
    },
    indicator(state: any, choice: Choice) {
      return choice.enabled ? state.symbols.checked : state.symbols.indicator
    },
  } as ArrayPromptOptions)
    .then(responses => responses[name])
    .catch((err: unknown) => {
      error(err)
    })
}

export default { askCheckboxPlus }
