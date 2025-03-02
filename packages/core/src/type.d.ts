import type { Certificate, CertificatePath, CreateOptions, Prettify, VerifyOptions } from '@https-enable/mkcert'
import type { MakeOnlyRequired } from '@https-enable/types'
import type http from 'node:http'
import type http2 from 'node:http2'
import type https from 'node:https'
import type { ServerInstance } from './same-port-ssl'

export type CertificateManagerOptions = Prettify<MakeOnlyRequired<CreateOptions, 'validity' | 'domains'> & CertificatePath & { cache?: boolean }>

export type ServerOptions = Prettify<VerifyOptions>
export type SamePortOptions = Prettify<ServerOptions & Certificate &
  {
  /**
   * http 301 重定向至 https
   * @default false
   */
    redirect?: boolean
  }>

export type RawServerBase = http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer

/**
 * The default request type based on the server type. Utilizes generic constraining.
 */
export type RawRequestDefaultExpression<
  RawServer extends RawServerBase = RawServerDefault,
> = RawServer extends http.Server | https.Server ? http.IncomingMessage
  : RawServer extends http2.Http2Server | http2.Http2SecureServer ? http2.Http2ServerRequest
    : never

/**
 * The default reply type based on the server type. Utilizes generic constraining.
 */
export type RawReplyDefaultExpression<
  RawServer extends RawServerBase = RawServerDefault,
> = RawServer extends http.Server | https.Server ? http.ServerResponse
  : RawServer extends http2.Http2Server | http2.Http2SecureServer ? http2.Http2ServerResponse
    : never

export type AppType = http.RequestListener<typeof http.IncomingMessage, typeof http.ServerResponse> | ((req: RawRequestDefaultExpression<RawServerBase>, res: RawReplyDefaultExpression<RawServerBase>) => any)
export type MiddlewareType = any

export type { ServerInstance }
