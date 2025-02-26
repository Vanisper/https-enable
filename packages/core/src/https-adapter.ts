import type { Certificate } from '@https-enable/mkcert'
import type { AppType, MiddlewareType, SamePortOptions, ServerInstance, ServerOptions } from './type'
import { samePortSSL } from './same-port-ssl'

export abstract class HttpsAdapter<App extends AppType, Middleware = MiddlewareType> {
  public serverInstance: ServerInstance | null = null
  public app: App

  constructor(app: App) {
    this.app = app
  }

  /**
   * 创建框架特定的中间件
   */
  abstract createMiddleware: (options: ServerOptions) => Middleware

  /**
   * 重置证书时通知
   */
  abstract onCertRenewed?: (certificate: Certificate) => any

  /**
   * 启动 HTTPS 服务（可选，部分框架需要自定义逻辑）
   */
  async createServer(options: SamePortOptions, app?: App) {
    this.serverInstance = await samePortSSL(app ?? this.app, options)
    return this.serverInstance
  }
}
