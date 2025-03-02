import type { Certificate } from '@https-enable/mkcert'
import type { AppType, MiddlewareType, SamePortOptions, ServerInstance, ServerOptions } from './type'
import { samePortSSL } from './same-port-ssl'

export abstract class HttpsAdapter<App extends AppType, Middleware = MiddlewareType> {
  public serverInstance: ServerInstance | null = null

  constructor(public app?: App | null) {}

  /**
   * 创建框架特定的中间件
   */
  abstract createMiddleware?: (options: ServerOptions) => Middleware

  /**
   * 重置证书时通知
   */
  abstract onCertRenewed?: (certificate: Certificate) => any

  /** 特殊后端框架可以使用这个自定义返回 app */
  abstract init?: () => Promise<App>

  /**
   * 启动 HTTPS 服务（可选，部分框架需要自定义逻辑）
   */
  async createServer(options: SamePortOptions, app?: App) {
    let tempApp = app ?? this.app
    if (this.init && typeof this.init === 'function') {
      tempApp = await this.init()
    }
    if (!tempApp && !this.app) {
      throw new Error('`app` is no found')
    }
    this.serverInstance = await samePortSSL((tempApp ?? this.app)!, options)
    return this.serverInstance
  }
}
