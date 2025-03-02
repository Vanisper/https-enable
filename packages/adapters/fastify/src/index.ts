import type { ServerOptions } from '@https-enable/core'
import type { Certificate } from '@https-enable/mkcert'
import type { FastifyInstance } from 'fastify'
import { HttpsAdapter } from '@https-enable/core'

type FastifyApp = FastifyInstance['routing']

export class FastifyHttpsAdapter extends HttpsAdapter<FastifyApp> {
  constructor(public fastifyInstance: FastifyInstance) {
    super()
  }

  init = async () => {
    await this.fastifyInstance.ready()
    return this.fastifyInstance.routing
  }

  createMiddleware?: ((options: ServerOptions) => any) | undefined
  onCertRenewed?: ((certificate: Certificate) => any) | undefined
}
