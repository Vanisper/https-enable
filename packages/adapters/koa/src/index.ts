import type { ServerOptions } from '@https-enable/core'
import type { Certificate } from '@https-enable/mkcert'
import type Koa from 'koa'
import { HttpsAdapter } from '@https-enable/core'

type KoaApp = Koa<Koa.DefaultState, Koa.DefaultContext>
type Callback = ReturnType<KoaApp['callback']>

export class KoaHttpsAdapter extends HttpsAdapter<Callback> {
  constructor(app: KoaApp) {
    super()
    this.app = app.callback()
  }

  init?: () => Promise<Callback>
  createMiddleware?: (options: ServerOptions) => any
  onCertRenewed?: (certificate: Certificate) => any
}
