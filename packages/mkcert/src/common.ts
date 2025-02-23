import type { Certificate, CertificatePath, CreateOptions } from './type'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createCA, createCert } from 'mkcert'

import logger from './logger'

export const defaultCertificateBasePath = path.join(process.cwd(), 'cert')

export function processCertPath(certPath: CertificatePath) {
  if ('base' in certPath) {
    // 处理 base 路径格式
    const basePath = certPath.base
    return {
      keyPath: path.join(basePath, 'key.pem'),
      certPath: path.join(basePath, 'cert.pem'),
    }
  }
  else {
    // 处理显式路径格式
    return {
      keyPath: certPath.key,
      certPath: certPath.cert,
    }
  }
}

export function readCertificate(options: CertificatePath = { base: defaultCertificateBasePath }) {
  try {
    const { keyPath, certPath } = processCertPath(options)
    return {
      key: fs.readFileSync(keyPath, { encoding: 'utf-8' }),
      cert: fs.readFileSync(certPath, { encoding: 'utf-8' }),
    }
  }
  catch (error) {
    logger.error(`${error}`)
    return null
  }
}

/**
 * 在项目根目录下创建一个 mkcert 目录，用于存放生成的证书和密钥文件
 */
export function saveCertificate(cert: string, key: string, options: CertificatePath = { base: defaultCertificateBasePath }) {
  const { keyPath, certPath } = processCertPath(options)
  const CERTS_DIR = path.dirname(certPath)

  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true })
  }

  fs.writeFileSync(keyPath, key, { encoding: 'utf-8' })
  fs.writeFileSync(certPath, cert, { encoding: 'utf-8' })

  logger.info(`Certificate saved to ${path.resolve(certPath)}`)

  return { keyPath, certPath }
}

export async function createCertificate(_options: CreateOptions, pathOptions?: CertificatePath): Promise<Certificate> {
  const { force, ...options } = _options
  return new Promise((resolve, reject) => {
    createCA(options)
      .then((ca) => {
        createCert({
          ca: { key: ca.key, cert: ca.cert },
          domains: Array.isArray(options.domains) ? options.domains : options.domains ? [options.domains] : [],
          validity: options.validity,
        })
          .then((cert) => {
            saveCertificate(cert.cert, cert.key, pathOptions)
            resolve(cert)
          })
          .catch(reject)
      })
      .catch(reject)
  })
}
