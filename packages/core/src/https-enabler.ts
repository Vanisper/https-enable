import type { Certificate } from '@https-enable/mkcert'
import type { Prettify } from '@https-enable/types'
import type { HttpsEnablerEvents } from './emitter'
import type { HttpsAdapter } from './https-adapter'
import type { AppType, CertificateManagerOptions, MiddlewareType, ServerOptions } from './type'
import { EventEmitter } from 'node:events'
import { CertificateManager } from './certificate-manager'

export class HttpsEnabler<
  App extends AppType,
  Middleware = MiddlewareType,
> extends EventEmitter<HttpsEnablerEvents> {
  public adapter: HttpsAdapter<App, Middleware>
  private options: Prettify<ServerOptions &
    {
      /**
       * http 301 重定向至 https
       */
      redirect?: boolean
    }>

  private certificateOptions: CertificateManagerOptions

  private certManager: CertificateManager

  constructor(config: {
    adapter: typeof HttpsEnabler.prototype.adapter
    options: typeof HttpsEnabler.prototype.options
    certificateOptions: typeof HttpsEnabler.prototype.certificateOptions
  }) {
    super()
    this.adapter = config.adapter
    this.options = config.options
    this.certificateOptions = config.certificateOptions

    this.certManager = new CertificateManager(this.certificateOptions)

    // 证书更新监听
    this.certManager.on('cert-renewed', async (newCert) => {
      this.emit('cert-renewed', newCert)
      // 通知适配器证书更新（如热重载）
      await this.adapter.serverInstance?.refresh(newCert)
      this.adapter.onCertRenewed?.(newCert)
    })
  }

  public async init() {
    // 初始化证书
    await this.certManager.initialize().catch(err => this.emit('error', err))
  }

  /**
   * 生成框架特定的中间件
   */
  public middleware() {
    return this.adapter.createMiddleware(this.options)
  }

  public refresh(options: Certificate) {
    if (!this.adapter.serverInstance)
      return

    return this.adapter.serverInstance.refresh(options)
  }

  public kill() {
    if (!this.adapter.serverInstance)
      return

    return this.adapter.serverInstance.kill()
  }

  /**
   * 启动 HTTPS 服务
   */
  public async startServer(app?: App) {
    // 确保证书已就绪
    await this.certManager.ensureValidCert()
    // 如果适配器有自定义服务启动逻辑，优先使用
    if (typeof this.adapter.createServer === 'function' && this.certManager.currentCert) {
      const options = { ...this.options, ...this.certManager.currentCert }
      await this.adapter.createServer(options, app)
      return options
    }
    else {
      throw new TypeError('Unsupported framework: default server logic requires an app with listen()')
    }
  }
}
