import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { defineCertificate } from '../../src'

// 证书生成路径
const CACHE_PATH = 'test-cache/mkcert'
const CERT_FILES = [
  'cert.pem', // 域名证书
  'key.pem', // 域名密钥
]

describe('证书生成校验', () => {
  // 每次测试后清理生成的文件
  afterEach(() => {
    rmSync(CACHE_PATH, { recursive: true, force: true })
  })

  it('应生成完整的证书文件', async () => {
    // 执行证书生成
    const { cert, key } = await defineCertificate(
      { validity: 0, force: true },
      { base: CACHE_PATH },
    )

    // 验证文件存在性
    CERT_FILES.forEach((filename) => {
      const filePath = resolve(CACHE_PATH, filename)
      expect(existsSync(filePath), `${filename} 文件未生成`).toBe(true)
    })

    // 验证证书基础格式
    const certContent = readFileSync(resolve(CACHE_PATH, 'cert.pem'), 'utf-8')
    expect(certContent).toMatch(/-----BEGIN CERTIFICATE-----/)
    expect(certContent).toMatch(/-----END CERTIFICATE-----/)
    expect(certContent).toBe(cert)

    // 验证密钥基础格式
    const keyContent = readFileSync(resolve(CACHE_PATH, 'key.pem'), 'utf-8')
    expect(keyContent).toMatch(/-----BEGIN RSA PRIVATE KEY-----/)
    expect(keyContent).toMatch(/-----END RSA PRIVATE KEY-----/)
    expect(keyContent).toBe(key)
  })

  it('应生成有效 SHA256 指纹', async () => {
    await defineCertificate(
      { validity: 0, force: true },
      { base: CACHE_PATH },
    )

    // 计算证书指纹
    const certBuffer = readFileSync(resolve(CACHE_PATH, 'cert.pem'))
    const fingerprint = createHash('sha256')
      .update(certBuffer)
      .digest('hex')
      .toUpperCase()

    // 验证指纹格式（示例正则）
    expect(fingerprint).toMatch(/^[0-9A-F]{64}$/)
  })
})
