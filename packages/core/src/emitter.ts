import type { Certificate } from '@https-enable/mkcert'

export interface CertificateEvents {
  'cert-renewed': [Certificate]
}

export type HttpsEnablerEvents = {
  error: [any]
} & CertificateEvents
