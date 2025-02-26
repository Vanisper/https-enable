import type { Certificate, CertificatePath, CreateOptions } from '@https-enable/mkcert'
import type { Prettify } from '@https-enable/types'
import type { CertificateEvents } from './emitter'
import type { CertificateManagerOptions } from './type'
import { EventEmitter } from 'node:events'
import { createCertificate, readCertificate, verifyCertificate } from '@https-enable/mkcert'

const defaultCA = {
  organization: '',
  countryCode: '',
  state: '',
  locality: '',
  force: false,
}

export class CertificateManager extends EventEmitter<CertificateEvents> {
  private options: Prettify<CreateOptions & { cache?: boolean }>
  private pathOptions: CertificatePath
  public currentCert: Certificate | null

  constructor(options: CertificateManagerOptions) {
    super()

    if ('base' in options) {
      const { base, ...rest } = options
      this.pathOptions = { base }
      this.options = {
        ...defaultCA,
        ...rest,
      }
    }
    else {
      const { cert, key, ...rest } = options
      this.pathOptions = { cert: options.cert, key: options.key }
      this.options = {
        ...defaultCA,
        ...rest,
      }
    }
    this.currentCert = this.loadExistingCert()
  }

  /**
   * 初始化证书（生成或加载现有）
   */
  async initialize(force?: boolean) {
    const verifyRes = await this.validCert()

    if ((force ?? this.options.force) || !verifyRes?.match)
      return await this.generateNewCert(this.options.cache)

    return this.currentCert
  }

  async validCert() {
    if (!this.currentCert)
      return null

    return await verifyCertificate(this.currentCert.key, this.currentCert.cert)
  }

  /**
   * 确保当前证书有效
   * @description 无效证书则自动重新创建
   */
  async ensureValidCert() {
    const verifyRes = await this.validCert()
    if (!verifyRes?.match) {
      await this.generateNewCert(this.options.cache)
    }
  }

  private async generateNewCert(isCache?: boolean) {
    this.currentCert = await createCertificate(this.options, this.pathOptions, isCache)

    // 触发 cert-renewed 事件
    this.emit('cert-renewed', { ...this.currentCert })
    return this.currentCert
  }

  // 加载证书
  private loadExistingCert() {
    return readCertificate(this.pathOptions)
  }
}
