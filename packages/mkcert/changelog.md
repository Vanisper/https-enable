## @https-enable/mkcert@0.0.1-beta.9

### 🩹 Fixes: 缺陷修复

- fix(scripts): 🩹 publish 使用 pnpm，并跳过 git 检查 - by @Vanisper (25bae47)

### 🏡 Chore: 简修处理

- chore(changelog): @https-enable/adapter-express@0.0.1-beta.9 - by @Vanisper (5537fe3)

## @https-enable/mkcert@0.0.1-beta.8

### 🏡 Chore: 简修处理

- chore: release v0.0.1-beta.8 - by @Vanisper (d07a5db)

## @https-enable/mkcert@0.0.1-beta.7

### 🚀 Features: 新功能

- feat(scripts): 🚀 新增实现 publish 脚本 - by @Vanisper (4e3b1ac)
- feat: 🚀 添加 Changesets 配置文件和相应脚本 - by @Vanisper (9ff6fb0)
- feat(scripts): 🚀 新增 `resetChangelog` 工具函数的实现 - by @Vanisper (98c11a0)

### 🏡 Chore: 简修处理

- chore(changelog): @https-enable/adapter-express@0.0.1-beta.7 - by @Vanisper (7965195)
- chore(changelog): @https-enable/adapter-express@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (a542435)
- chore(changelog): @https-enable/utils@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (dded152)
- chore(changelog): @https-enable/types@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (465c7d4)
- chore(changelog): @https-enable/tsconfig@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (793b72d)
- chore(changelog): @https-enable/mkcert@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (f8bc8ea)
- chore(changelog): @https-enable/logger@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (c6e3ec8)
- chore(changelog): @https-enable/colors@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (88c5e79)
- chore(changelog): @https-enable/core@{0.0.1-beta.2..0.0.1-beta.6} - by @Vanisper (e2aa24b)

## @https-enable/mkcert@0.0.1-beta.6

### 🚀 Features: 新功能

- feat(scripts): 🚀 实现自动化更新日志生成 - by @Vanisper (1f744d1)

### 🏡 Chore: 简修处理

- chore(changelog): @https-enable/adapter-express@0.0.1-beta.6 - by @Vanisper (ded906f)
- chore: 🏡 移除 Changesets 配置文件和相关脚本 - by @Vanisper (180bb02)

### 🤖 CI: 持续集成

- ci: 🤖 新增一个测试工作流 - by @Vanisper (613b270)

## @https-enable/mkcert@0.0.1-beta.5

### 🩹 Fixes: 缺陷修复

- fix(workflow): 🩹 更新 GitHub Actions 触发条件，以支持新的标签格式 - by @Vanisper (9793afc)

### 🏡 Chore: 简修处理

- chore: release @https-enable/adapter-express@0.0.1-beta.5 - by @Vanisper (678ac0c)

## @https-enable/mkcert@0.0.1-beta.4

### 🩹 Fixes: 缺陷修复

- fix(workflow): 🩹 更新 GitHub Actions 触发条件，以支持更精确的标签格式 - by @Vanisper (f814ac9)
- fix(workflow): 🩹 修正 GitHub Actions 触发条件，以支持带有斜杠的标签格式 - by @Vanisper (9856edc)

### 🏡 Chore: 简修处理

- chore: release @https-enable/adapter-express@0.0.1-beta.4 - by @Vanisper (896961a)

## @https-enable/mkcert@0.0.1-beta.3

### 🏡 Chore: 简修处理

- chore: release @https-enable/adapter-express@0.0.1-beta.3 - by @Vanisper (71bd511)

## @https-enable/mkcert@0.0.1-beta.2

### 🚀 Features: 新功能

- feat(scripts): 🚀 添加合并 commit 时自动合并相应 tags 的功能 - by @Vanisper (55e589e)
- feat(scripts): 🚀 添加 scripts 包及相关功能 - by @Vanisper (bf7b2d8)
- feat(adapter-express): 🚀 新增 Express 适配器 - by @Vanisper (7fc56e3)
- feat(core): 🚀 核心包新增证书管理器和 HTTPS 适配器抽象类，支持同端口 SSL 服务 - by @Vanisper (6a1c27e)
- feat(mkcert): 🚀 在 createCertificate 函数中新增缓存选项，优化证书保存逻辑 - by @Vanisper (1b0052f)
- feat(types): 🚀 新增类型工具，支持将指定 Key 变为可选或必选 - by @Vanisper (9714aff)
- feat(core): 🚀 新增 `@https-enable/core` 包的创建 - by @Vanisper (209d230)
- feat(mkcert): 🚀 在创建证书时支持强制生成选项 - by @Vanisper (ba08820)
- feat(utils): 🚀 更新 isNil 函数，支持检查空字符串 - by @Vanisper (e7ccd3b)
- feat(utils): 🚀 新增 isNil 函数，用于检查值是否为 undefined 或 null - by @Vanisper (987047e)
- feat(mkcert): 🚀 新增定义证书的函数，支持可选参数并添加警告日志 - by @Vanisper (d445ccc)
- feat(colors): 🚀 在 `index.ts` 中新增导出全量类型 - by @Vanisper (b32d00c)
- feat(colors): 🚀 新增 `@https-enable/colors`，实现 `ansi-color` 的基本功能 - by @Vanisper (4d4ee95)
- feat(mkcert): 🚀 新增 mkcert 包的构建配置和证书处理功能 - by @Vanisper (8087783)
- feat(logger): 🚀 在 `createLogFormat` 方法中新增可选标签参数 - by @Vanisper (ac429c8)
- feat(logger): 🚀 新增实现 `@https-enable/logger` 日志库 - by @Vanisper (d932c98)
- feat(types): 🚀 新增 `Zip` 和 `UppercaseUnion` 类型，增强元组和数组处理功能 - by @Vanisper (c9c3600)
- feat(types): 🚀 新增 `PickElements` 和 `OmitElements` 类型，增强数组元素选择/剔除功能 - by @Vanisper (3a97432)
- feat(utils): 🚀 新增 `strEnum` 和 `numEnum` 函数，增强枚举类型处理功能 - by @Vanisper (bd25d2e)
- feat(types): 🚀 新增类型定义 `EnumToRecord`、`IsTuple`、`MapTuple` 和 `MapArray`，增强类型系统 - by @Vanisper (25f97e2)
- feat(utils): 🚀 新增 `ColorStringRE` 正则表达式，用于匹配颜色字符串 - by @Vanisper (9974a50)
- feat(utils): 🚀 新增 `isStream` 工具函数及其选项接口，增强流对象检测功能 - by @Vanisper (b461577)
- feat(utils): 🚀 新增 `camelCase` 函数，实现串烧命名转小驼峰 - by @Vanisper (d1590a4)
- feat(utils): 🚀 拓展 `importGlob`，新增 as 参数的实现 - by @Vanisper (dfad88b)
- feat: 🚀 实现子包`@https-enable/types`；重构子包包名，更新相关导包路径 - by @Vanisper (3e85cd1)
- feat: 🚀 添加 utils 包，实现 importGlob 工具函数 - by @Vanisper (4dc1a8c)
- feat: 🚀 添加 mkcert 包，包含基本配置和 tsconfig 继承 - by @Vanisper (080768f)
- feat: 🚀 创建 `tsconfig` 项目，统一管理配置 tsconfig 基础配置 - by @Vanisper (c4e53f0)

### 🩹 Fixes: 缺陷修复

- fix(scripts): 🩹 修复合并提交时标签添加逻辑，确保正确使用最后合并提交的哈希 - by @Vanisper (ebb6321)
- fix(scripts): 🩹 添加删除旧标签的功能，以保证合并提交 tags 时不留存旧的 tags - by @Vanisper (ca6b36a)
- fix(mkcert): 🩹 优化健全证书路径解析函数 - by @Vanisper (f8c395f)
- fix(core): 🩹 修改各class的私有属性为protected，以便于构建时生成类型标注 - by @Vanisper (a017029)
- fix(mkcert): 🩹 优化证书验证中的错误处理，简化逻辑 - by @Vanisper (544c3da)
- fix(mkcert): 🩹 修复证书保存路径日志输出，确保输出绝对路径 - by @Vanisper (f251287)
- fix(mkcert): 🩹 修复自定义证书缓存路径未正确读取的问题 - by @Vanisper (df484cc)
- fix(logger): 🩹 修复将常量变量在类型文件中定义的问题 - by @Vanisper (17b85e5)
- fix(logger): 🩹 修复类型导入，调整 `SimpleLevelTuple` 的导入方式 - by @Vanisper (d138658)
- fix(types): 🩹 更新 `MapTuple` 类型定义，使用 `ReadonlyArray<string>` 替代 `readonly string[]` - by @Vanisper (edc41f0)
- fix(utils): 🩹 修复 `getCallerPath` 函数，确保在目标堆栈层级不存在时返回最后一行 - by @Vanisper (8c57dab)
- fix(utils): 🩹 更新 `callerId` 注释，明确调用方绝对路径的说明 - by @Vanisper (b090b76)
- fix(utils): 🩹 优化 `getCallerPath` 功能函数 - by @Vanisper (1d98177)

### 📖 Documentation: 文档

- docs: 📖 更新readme - by @Vanisper (1e52023)
- docs: 📖 更新 README，更新待办任务状态 - by @Vanisper (f2031ef)
- docs(readme): 📖 更新功能实现列表 - by @Vanisper (03b6772)

### 🏡 Chore: 简修处理

- chore: release @https-enable/adapter-express@0.0.1-beta.2 - by @Vanisper (2286304)
- chore: release v0.0.1-beta.1 - by @Vanisper (ffbd333)
- chore: 🏡 更新 utils 包的发布配置 - by @Vanisper (e238363)
- chore: 🏡 配置各包 private 的状态 - by @Vanisper (0fd3108)
- chore: 🏡 changesets 配置文件的 access 字段更新为 public - by @Vanisper (e13c7ef)
- chore: 🏡 提交 Changesets 配置文件 - by @Vanisper (9e18001)
- chore: 🏡 集成 `@changesets/cli` - by @Vanisper (d058f5e)
- chore(core): 🏡 移除对@https-enable/utils的依赖 - by @Vanisper (9af4649)
- chore: 🏡 新增npm包发布配置和文件字段；使用`bumpp`进行包版本号管理 - by @Vanisper (21f262b)
- chore(mkcert): 🏡 显式导出 mkcert/logger - by @Vanisper (e23006e)
- chore(mkcert): 🏡 提取默认证书基础路径为常量，简化证书路径处理 - by @Vanisper (7f5985d)
- chore(mkcert): 🏡 使用 isNil 函数简化有效性和域名检查逻辑 - by @Vanisper (ee228fd)
- chore(package): 🏡 在 `package.json` 中新增 `dev` 和 `build` 脚本指令 - by @Vanisper (690ba47)
- chore(logger): 🏡 将颜色依赖库从 `@colors/colors` 更新为 `@https-enable/colors`，完全自主实现 - by @Vanisper (366d884)
- chore(mkcert): 🏡 在构建配置中新增外部依赖 `@https-enable/types` - by @Vanisper (a6b9390)
- chore(workspace): 🏡 格式化文件，修复 `pnpm-workspace.yaml` 文件末尾缺少换行符 - by @Vanisper (0355171)
- chore(utils): 🏡 更新构建配置，新增外部依赖 `@https-enable/types` - by @Vanisper (3215a0e)
- chore(utils): 🏡 去除冗余代码 - by @Vanisper (022b1e1)
- chore: 🏡 修改 VSCode 设置，`organizeImports` 设置为 never - by @Vanisper (3a81a3e)
- chore: 🏡 更新 mkcert 包版本至 0.0.0 - by @Vanisper (dd665a7)
- chore: 🏡 添加清理依赖的脚本至 package.json - by @Vanisper (e1423d7)
- chore: 🏡 添加 tsconfig 依赖至根项目并更新根项目 tsconfig 配置，简化项目结构 - by @Vanisper (e888bad)
- chore: 🏡 添加基本的 pnpm 工作区配置 - by @Vanisper (746ba3e)
- chore: 🏡 重命名项目为 https-enable，并更新 README 以反映项目的功能实现与计划任务 - by @Vanisper (ab61721)

### 🏀 Examples: 例子展示

- examples(express-demo): 🏀 新增 Express 示例 - by @Vanisper (74b8230)

### ✅ Tests: 测试用例

- test(mkcert): ✅ 公用测试代码模块化整理，添加证书有效性校验测试用例 - by @Vanisper (c1a2f7e)
- test(mkcert): ✅ 重构证书生成测试，增强测试用例 - by @Vanisper (141e8b4)
- test: ✅ 集成 vitest，实现项目测试的能力；添加 `mkcert` 证书生成测试用例 - by @Vanisper (464495a)

### 🤖 CI: 持续集成

- ci: 🤖 在测试工作流中添加构建所有项目的步骤 - by @Vanisper (735eb56)
- ci: 🤖 单元测试工作流更新依赖安装方式 - by @Vanisper (3402182)
- ci: 🤖 添加 GitHub Actions 工作流以部署测试覆盖率到 GitHub Pages - by @Vanisper (b7f63b1)
