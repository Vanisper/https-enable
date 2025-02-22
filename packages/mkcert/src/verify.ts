import type { Certificate, Prettify, VerifyOptions } from './type'
import crypto from 'node:crypto'
import tls from 'node:tls'
import dayjs from 'dayjs'
import forge from 'node-forge'
import logger from './logger'

export function verifyCertificateByTLS(options: Prettify<VerifyOptions & Certificate>) {
  const secureContext = tls.createSecureContext({ key: options.key, cert: options.cert })
  const tlsOptions: tls.ConnectionOptions = {
    host: options.host,
    port: Number(options.port),
    secureContext,
    rejectUnauthorized: options.rejectUnauthorized || false,
  }

  const socket = tls.connect(tlsOptions, () => {
    logger.info('证书有效')
    socket.end()
  })

  socket.on('error', (err) => {
    logger.error('证书无效或连接错误', err)
  })
}

export function verifyCertificateValidityByTLS(options: Prettify<VerifyOptions>) {
  const tlsOptions: tls.ConnectionOptions = {
    host: options.host,
    port: Number(options.port),
    rejectUnauthorized: options.rejectUnauthorized || false,
  }

  const socket = tls.connect(tlsOptions, () => {
    const cert = socket.getPeerCertificate()
    if (cert.valid_from && cert.valid_to) {
      const validFrom = new Date(cert.valid_from).getTime()
      const validTo = new Date(cert.valid_to).getTime()
      const now = Date.now()

      if (now > validFrom && now < validTo)
        logger.info('证书有效')
      else
        logger.warn('证书无效：不在有效期内')
    }
    else {
      logger.warn('证书无效：无法获取证书有效期信息')
    }
    socket.end()
  })

  socket.on('error', (err) => {
    logger.error('连接错误', err)
  })
}

export async function verifyCertificate(keyPem: string, certPem: string) {
  const cert = forge.pki.certificateFromPem(certPem)
  const privateKey = forge.pki.privateKeyFromPem(keyPem)
  const publicKey = cert.publicKey as forge.pki.rsa.PublicKey

  const certModulus = publicKey.n.toString(16)
  const keyModulus = privateKey.n.toString(16)

  const certModulusMd5 = crypto
    .createHash('md5')
    .update(certModulus)
    .digest('hex')
  const keyModulusMd5 = crypto
    .createHash('md5')
    .update(keyModulus)
    .digest('hex')

  const matchs: boolean[] = []
  const messages: string[] = []

  if (certModulusMd5 === keyModulusMd5) {
    matchs.push(true)
    messages.push('证书和私钥匹配')
  }
  else {
    matchs.push(false)
    messages.push('证书和私钥不匹配')
  }

  const now = new Date()
  const validFrom = cert.validity.notBefore
  const validTo = cert.validity.notAfter

  if (now > validFrom && now < validTo) {
    matchs.push(true)
    messages.push(
      `证书在有效期内，有效期：${dayjs(validFrom).format('YYYY-MM-DD HH:mm:ss')} ~ ${dayjs(validTo).format('YYYY-MM-DD HH:mm:ss')}`,
    )
  }
  else {
    matchs.push(false)
    messages.push(
      `证书不在有效期内，有效期：${dayjs(validFrom).format('YYYY-MM-DD HH:mm:ss')} - ${dayjs(validTo).format('YYYY-MM-DD HH:mm:ss')}`,
    )
  }

  const match = matchs.every(m => m)
  const message = messages.join(', ')
  return { match, message }
}
