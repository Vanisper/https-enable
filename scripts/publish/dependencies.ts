import type { PackageInfo } from '../monorepo/packages'

type Graph = Record<string, ReturnType<typeof parsePkg>>

export function parsePkg(pkg: PackageInfo) {
  const dependencies: string[] = []
  const devDependencies: string[] = []
  const peerDependencies: string[] = []

  // 获取运行时依赖（dependencies）
  if (pkg.manifest.dependencies) {
    Object.keys(pkg.manifest.dependencies).forEach((dep) => {
      const version = pkg.manifest.dependencies[dep]
      if (version.startsWith('workspace:')) {
        dependencies.push(dep)
      }
    })
  }

  // 获取开发时依赖（devDependencies）
  if (pkg.manifest.devDependencies) {
    Object.keys(pkg.manifest.devDependencies).forEach((dep) => {
      const version = pkg.manifest.devDependencies[dep]
      if (version.startsWith('workspace:')) {
        devDependencies.push(dep)
      }
    })
  }

  // peerDependencies
  if (pkg.manifest.peerDependencies) {
    Object.keys(pkg.manifest.peerDependencies).forEach((dep) => {
      const version = pkg.manifest.peerDependencies[dep]
      if (version.startsWith('workspace:')) {
        peerDependencies.push(dep)
      }
    })
  }

  return { dependencies, devDependencies, peerDependencies }
}

// 获取包的依赖图，区分开发时依赖和运行时依赖
export function buildDependencyGraph(packages: PackageInfo[]) {
  const graph: Graph = {}

  packages.forEach((pkg) => {
    // 添加到图中
    graph[pkg.name] = parsePkg(pkg)
  })

  return graph
}

// 拓扑排序算法
function topologicalSort(packages: PackageInfo[], graph: Graph) {
  const visited = new Set<string>()
  const order: PackageInfo[] = []

  const packagesNames = packages.map(item => item.name)
  // 先发布没有依赖的包
  function visit(pkgName: string) {
    if (visited.has(pkgName))
      return
    visited.add(pkgName)

    // 先发布运行时依赖（因为它们是生产环境的依赖）
    const pkg = graph[pkgName]
    pkg?.dependencies.forEach(visit)

    // 然后发布开发时依赖（它们不会影响生产环境，但需要优先处理开发环境）
    pkg?.devDependencies.forEach(visit)

    // 最后将当前包添加到发布顺序中
    order.push(packages[packagesNames.indexOf(pkgName)]!)
  }

  // 从所有包开始遍历
  packages.forEach((pkg) => {
    if (!visited.has(pkg.name)) {
      visit(pkg.name)
    }
  })

  return order // 返回发布顺序
}

// 根据依赖关系计算发布顺序
export function getPublishOrder(packages: PackageInfo[]) {
  const graph = buildDependencyGraph(packages)
  return topologicalSort(packages, graph)
}
