import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, vi } from 'vitest'
import { defaultCertificateBasePath, defineCertificate, processCertPath, verifyCertificateByTLS } from '../src'
import logger from '../src/logger'

export const CACHE_PATH = 'test-cache/mkcert'

export async function mkcertCheck(...args: Parameters<typeof defineCertificate>) {
  const [_, pathOptions] = args

  const { keyPath, certPath } = processCertPath(pathOptions ?? { base: defaultCertificateBasePath })
  const files = [keyPath, certPath]
  // 执行证书生成
  const { cert, key } = await defineCertificate(...args)

  // 验证文件存在性
  files.forEach((file) => {
    const filePath = resolve(file)
    expect(existsSync(filePath), `${filePath} 文件未生成`).toBe(true)
  })

  // 验证证书基础格式
  const certContent = readFileSync(resolve(certPath), 'utf-8')
  expect(certContent).toMatch(/-----BEGIN CERTIFICATE-----/)
  expect(certContent).toMatch(/-----END CERTIFICATE-----/)
  expect(certContent).toBe(cert)

  // 验证密钥基础格式
  const keyContent = readFileSync(resolve(keyPath), 'utf-8')
  expect(keyContent).toMatch(/-----BEGIN RSA PRIVATE KEY-----/)
  expect(keyContent).toMatch(/-----END RSA PRIVATE KEY-----/)
  expect(keyContent).toBe(key)

  return { cert, key }
}

export async function certificateByTLSCheck(...args: Parameters<typeof verifyCertificateByTLS>) {
  vi.spyOn(logger, 'info')
  vi.spyOn(logger, 'error')
  // 调用被测函数
  verifyCertificateByTLS(...args)
  const rejectUnauthorized = args[0].rejectUnauthorized
  const host = args[0].host
  const port = args[0].port

  // 等待异步操作完成，验证日志
  await vi.waitFor(() => {
    try {
      expect(logger.info).toHaveBeenCalledWith('证书有效')
    }
    catch {
      try {
        expect(logger.error).toHaveBeenCalledWith('Error: certificate has expired')
        expect(rejectUnauthorized).toBeOneOf([undefined, true])
      }
      catch {
        expect(logger.error).toHaveBeenCalledWith(`Error: connect ECONNREFUSED ${host}:${port}`)
      }
    }
  })
}
