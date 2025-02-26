import type { Certificate, CertificatePath, CreateOptions, Prettify, VerifyOptions } from '@https-enable/mkcert'
import type { MakeOnlyRequired } from '@https-enable/types'
import type http from 'node:http'
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

export type AppType = http.RequestListener<typeof http.IncomingMessage, typeof http.ServerResponse>
export type MiddlewareType = any

export type { ServerInstance }
