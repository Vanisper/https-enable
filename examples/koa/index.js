/* eslint-disable no-console */
import { KoaHttpsAdapter } from '@https-enable/adapter-koa'
import { HttpsEnabler } from '@https-enable/core'
import Koa from 'koa'

const app = new Koa()

const HOST = '127.0.0.1'
const PORT = 2333

app.use(async (ctx) => {
  ctx.body = 'Hello World'
})

const adapter = new KoaHttpsAdapter(app)
const enabler = new HttpsEnabler({
  adapter,
  options: { host: HOST, port: PORT },
  certificateOptions: { validity: 1, domains: HOST, base: 'cert' },
})

enabler.startServer().then((res) => {
  console.log(`Server running in http://${res.host}:${res.port}`)
})

enabler.on('error', (err) => {
  console.log('error:', err)
})

enabler.on('cert-renewed', (res) => {
  console.log('cert-renewed:', res)
})
