/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
import { FastifyHttpsAdapter } from '@https-enable/adapter-fastify'
import { HttpsEnabler } from '@https-enable/core'
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
})

const HOST = '127.0.0.1'
const PORT = 2333

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const adapter = new FastifyHttpsAdapter(fastify)
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
