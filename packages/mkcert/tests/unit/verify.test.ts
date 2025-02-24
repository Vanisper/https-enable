import https from 'node:https'
import tls from 'node:tls'
import axios from 'axios'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { verifyCertificateValidityByTLS } from '../../src'
import logger from '../../src/logger'
import { CACHE_PATH, certificateByTLSCheck, mkcertCheck } from '../common'

describe('tLS 证书集成测试', async () => {
  let server: https.Server | undefined
  const serverOptions = { host: '127.0.0.1', port: 2333 }
  const certOps = await mkcertCheck({ domains: serverOptions.host, validity: 0, force: true }, { base: CACHE_PATH })
  /** false 则时允许无效证书 */
  let rejectUnauthorized: boolean | undefined

  beforeAll(async () => {
    // 启动 HTTPS 服务器
    server = https.createServer(certOps, (req, res) => {
      res.writeHead(200)
      res.write('hello, ')
      res.end('world!')
    })

    // 使用 0 端口让系统自动分配可用端口
    serverOptions.port = await new Promise<number>((resolve) => {
      server?.listen(0, () => {
        resolve((server?.address() as any).port)
      })
    })
    const url = `https://${serverOptions.host}:${serverOptions.port}`
    logger.info(`server running in: ${url}`)

    // 判断 server 是否启动
    const agent = new https.Agent({
      rejectUnauthorized,
    })

    await axios.get(url, { httpsAgent: agent })
      .then((res) => {
        expect(res.data).toBe('hello, world!')
      })
      .catch((error) => {
        expect(rejectUnauthorized).toBeOneOf([undefined, true])
        expect(error.toString()).toBe('Error: certificate has expired')
      })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  afterAll((_done) => {
    // 清理资源
    server?.close((_args) => {
      logger.info(`server is over: https://${serverOptions.host}:${serverOptions.port}`)
    })
  })

  it('附带证书验证有效性', async () => {
    const mockTlsConnect = vi.spyOn(tls, 'connect')
    const mockCreateSecureContext = vi.spyOn(tls, 'createSecureContext')

    await certificateByTLSCheck({ ...serverOptions, ...certOps, rejectUnauthorized })

    // 验证 TLS 配置
    expect(mockCreateSecureContext).toHaveBeenCalledWith(certOps)
    // 验证连接参数
    expect(mockTlsConnect).toHaveBeenCalledWith({
      ...serverOptions,
      rejectUnauthorized,
      secureContext: mockCreateSecureContext.mock.results.at(-1)?.value,
    }, expect.any(Function))
  })

  it('绕过证书的情况', async () => {
    rejectUnauthorized = false
    await certificateByTLSCheck({ ...serverOptions, ...certOps, rejectUnauthorized })
  })

  it('不带证书验证', async () => {
    vi.spyOn(logger, 'info')
    vi.spyOn(logger, 'warn')
    vi.spyOn(logger, 'error')
    rejectUnauthorized = false
    verifyCertificateValidityByTLS({ ...serverOptions, rejectUnauthorized })
    await vi.waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith('证书无效：不在有效期内')
    })

    rejectUnauthorized = true
    verifyCertificateValidityByTLS({ ...serverOptions, rejectUnauthorized })
    await vi.waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Error: certificate has expired')
    })
  })
})
