import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    output: {
      exports: 'named',
    },
  },
  failOnWarn: false,
  // 声明隐式外部依赖（消除构建时警告）
  externals: [
    '@https-enable/types',
  ],
})
