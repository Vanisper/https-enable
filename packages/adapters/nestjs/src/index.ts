import type { ServerOptions } from '@https-enable/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { HttpsAdapter } from '@https-enable/core'

type ExpressApp = ReturnType<ReturnType<NestExpressApplication['getHttpAdapter']>['getInstance']>
export class NestJsExpressHttpsAdapter extends HttpsAdapter<ExpressApp> {
  constructor(public nestApp: NestExpressApplication) {
    super()
  }

  init = async () => {
    await this.nestApp.init()
    return this.nestApp.getHttpAdapter().getInstance()
  }

  createMiddleware?: (options: ServerOptions) => any
  onCertRenewed?: any
}

type FastifyApp = ReturnType<ReturnType<NestFastifyApplication['getHttpAdapter']>['getInstance']>['routing']
export class NestJsFastifyHttpsAdapter extends HttpsAdapter<FastifyApp, any> {
  constructor(public nestApp: NestFastifyApplication) {
    super()
  }

  init = async () => {
    await this.nestApp.init()
    const fastifyApp = this.nestApp.getHttpAdapter().getInstance()
    await fastifyApp.ready()
    return fastifyApp.routing
  }

  createMiddleware?: (options: ServerOptions) => any
  onCertRenewed?: any
}
