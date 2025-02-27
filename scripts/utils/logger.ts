import chalk from 'chalk'

type text = string | unknown

export function info(...msg: text[]) {
  console.log(chalk.blue(...msg))
}

export function success(...msg: text[]) {
  console.log(chalk.green(...msg))
}

export function error(...msg: text[]) {
  console.log(chalk.red(...msg))
}

export default { info, success, error }
