# https-enable

让你的 nodejs 后端项目支持 https

## 功能实现

- [x] 自动生成本地 ssl 证书，基于 [mkcert](https://github.com/Subash/mkcert) 实现
- [x] 证书文件的本地缓存以及自动更新
- [x] 证书的有效性校验
- [x] http 与 https 同端口
- [-] nodejs 后端框架 app 的 https 支持
  - [x] adapter-express
