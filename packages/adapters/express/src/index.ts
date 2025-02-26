/* eslint-disable unused-imports/no-unused-vars */
import type { ServerOptions } from '@https-enable/core'
import type { Certificate } from '@https-enable/mkcert'
import type { Application, RequestHandler } from 'express'
import { HttpsAdapter } from '@https-enable/core'

export class ExpressHttpsAdapter extends HttpsAdapter<Application, RequestHandler> {
  constructor(app: Application) {
    super(app)
  }

  createMiddleware: (options: ServerOptions) => RequestHandler
    = (options) => {
      return (req, res, next) => {
        if (req.secure) {
          next()
        }
        else {
          res.redirect(`https://${req.headers.host || req.url}`)
        }
      }
    }

  onCertRenewed?: ((certificate: Certificate) => any) | undefined
}
