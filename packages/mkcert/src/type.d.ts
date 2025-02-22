import type { Prettify } from '@https-enable/types'
import type { CertificateAuthorityOptions } from 'mkcert'

export { Prettify }

type CertFile = 'key' | 'cert'

export type Certificate = Record<CertFile, string>
export type CertificatePath = Prettify<Record<CertFile, string>> | { base: string }

export interface VerifyResult {
  match: boolean
  message: string
}

export interface VerifyOptions {
  host: string
  port: number | string
  rejectUnauthorized?: boolean
}

export type CreateOptions = Prettify<CertificateAuthorityOptions & { domains: string[] | string }>
