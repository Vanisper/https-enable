import type { PackageInfo } from '../monorepo/packages'
import chalk from 'chalk'
import cli from './cli-utilities'

/**
 *
 * @param packages
 * @param changedPackages TODO: 此处是从git中检测已经修改过的包 <https://github.com/changesets/changesets/blob/main/packages/git/src/index.ts#L258>
 */
export async function selectPackages(packages: PackageInfo[], changedPackages: string[] = []) {
  const unchangedPackagesNames = packages
    .map(item => item.name)
    .filter(name => !changedPackages.includes(name))
  const defaultChoiceList = [
    { name: 'changed packages', choices: changedPackages },
    { name: 'unchanged packages', choices: unchangedPackagesNames },
  ].filter(({ choices }) => choices.length !== 0)

  const res = await cli.askCheckboxPlus(
    `Which packages would you like to include?`,
    defaultChoiceList,
    (x) => {
      // this removes changed packages and unchanged packages from the list
      // of packages shown after selection
      if (Array.isArray(x)) {
        return x
          .filter(
            x => x !== 'changed packages' && x !== 'unchanged packages',
          )
          .map(x => chalk.cyan(x))
          .join(', ')
      }
      return x
    },
  )
  return packages.filter(p => res?.includes(p.name))
}
