import type { CertificatePath, CreateOptions } from './type'

import { createCertificate, readCertificate } from './common'
import logger from './logger'
import { verifyCertificate } from './verify'

export default async function initSSLCertificate(options: CreateOptions, pathOptions?: CertificatePath) {
  const pem = readCertificate(pathOptions)
  if (pem !== null) {
    const verifyRes = await verifyCertificate(pem.key, pem.cert)

    if (!verifyRes.match) {
      logger.error(`➜  ${verifyRes.message}`)
      logger.warn('➜  证书和密钥失效，正在重新生成证书和密钥……')
      const httpsOptions = await createCertificate(options)
      logger.info('➜  证书和密钥已更新')

      return httpsOptions
    }

    logger.info(`➜  ${verifyRes.message}`)
    return pem
  }

  logger.warn('➜  证书和密钥不存在，正在生成证书和密钥……')
  const httpsOptions = await createCertificate(options)
  logger.info('➜  证书和密钥已生成')

  return httpsOptions
}

export { initSSLCertificate }

export * from './common'
export * from './logger'
export * from './verify'
