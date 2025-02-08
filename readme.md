# nodejs-template

一个 Node.js 项目快速起手模板。

## 构建过程

```bash
# commitlint
pnpm install --save-dev @commitlint/cli @commitlint/config-conventional
# commitizen
pnpm install --save-dev commitizen cz-git
# eslint & lefthook（ts 版的 eslint 配置文件需要 jiti 支持）
pnpm install --save-dev eslint jiti @antfu/eslint-config lefthook
```

安装了 `commitizen` & `cz-git` 之后，
需要在 `package.json` 中添加如下配置：

```json
{
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
```
