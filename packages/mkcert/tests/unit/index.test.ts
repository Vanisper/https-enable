import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultCertificateBasePath, defineCertificate, processCertPath } from '../../src'

// 证书生成路径
const CACHE_PATH = 'test-cache/mkcert'

async function mkcertCheck(...args: Parameters<typeof defineCertificate>) {
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
}

describe('证书生成校验', () => {
  // 每次测试后清理生成的文件
  afterEach(() => {
    rmSync(CACHE_PATH, { recursive: true, force: true })
  })

  it('应生成完整的证书文件', async () => {
    // 测试没有任何传参
    await mkcertCheck(undefined, { base: CACHE_PATH })

    // 接上次测试，测试证书过期的表现
    await mkcertCheck({ validity: 0 }, { base: CACHE_PATH })

    // 自定义路径
    const certPath = resolve(process.cwd(), 'a')
    const keyPath = resolve(process.cwd(), 'b')
    await mkcertCheck({ validity: 1, force: true }, { cert: certPath, key: keyPath }) // INFO: 第一次测试强制生成以及生成一个有效期为一天的证书
    await mkcertCheck({ validity: 0 }, { cert: certPath, key: keyPath }) // INFO: 接上次测试，有效证书则不再生成
    rmSync(certPath, { recursive: true, force: true })
    rmSync(keyPath, { recursive: true, force: true })
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
