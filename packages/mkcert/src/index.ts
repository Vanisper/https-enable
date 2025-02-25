import type { CertificatePath, CreateOptions } from './type'

import { isNil } from '@https-enable/utils'
import { createCertificate, readCertificate } from './common'
import logger from './logger'
import { verifyCertificate } from './verify'

export async function initSSLCertificate(options: CreateOptions, pathOptions?: CertificatePath) {
  const pem = readCertificate(pathOptions)
  if (pem !== null && !options.force) {
    const verifyRes = await verifyCertificate(pem.key, pem.cert)

    if (!verifyRes.match) {
      logger.error(`➜  ${verifyRes.message}`)
      logger.warn('➜  证书和密钥失效，正在重新生成证书和密钥……')
      const httpsOptions = await createCertificate(options, pathOptions)
      logger.info('➜  证书和密钥已更新')

      return httpsOptions
    }

    logger.info(`➜  ${verifyRes.message}`)
    return pem
  }

  logger.warn(`➜  ${options.force ? '强制生成证书和密钥……' : '证书和密钥不存在，正在生成证书和密钥……'}`)
  const httpsOptions = await createCertificate(options, pathOptions)
  logger.info('➜  证书和密钥已生成')

  return httpsOptions
}

export async function defineCertificate(options?: Pick<CreateOptions, 'validity'> & Partial<Omit<CreateOptions, 'validity'>>, pathOptions?: CertificatePath) {
  const {
    organization = '',
    countryCode = '',
    state = '',
    locality = '',
    validity = 0,
    domains = '0.0.0.0',
    force = false,
  } = options ?? {}

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore
  if (isNil(options?.validity, true)) {
    // "validity" is not defined and will be set to 0.
    logger.warn('\'validity\' is undefined; defaulting to 0.')
  }
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore
  if (isNil(options?.domains, true)) {
    logger.warn('\'domains\' is undefined; defaulting to \'0.0.0.0\'.')
  }

  return await initSSLCertificate({ organization, countryCode, state, locality, validity, domains, force }, pathOptions)
}

export * from './common'
export * from './logger'
export type * from './type'
export * from './verify'
