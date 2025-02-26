/* eslint-disable no-console */
import { ExpressHttpsAdapter } from '@https-enable/adapter-express'
import { HttpsEnabler } from '@https-enable/core'
import express from 'express'

const HOST = '127.0.0.1'
const PORT = 2333

const app = express()

app.get('/', (req, res) => {
  res.send({ msg: 'hello world' })
  res.end()
})

const enabler = new HttpsEnabler({
  adapter: new ExpressHttpsAdapter(app),
  options: { host: HOST, port: PORT },
  certificateOptions: { validity: 1, domains: HOST },
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
