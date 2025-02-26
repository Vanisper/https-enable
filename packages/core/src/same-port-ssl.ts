/* eslint-disable no-sequences */
import type { Prettify } from '@https-enable/types'
import type { AppType, SamePortOptions } from './type'
import http from 'node:http'
import net from 'node:net'
import process from 'node:process'
import tls from 'node:tls'
import { verifyCertificate } from '@https-enable/mkcert'

/**
 *
 * @param app
 * @param options
 * @link https://gist.github.com/Coolchickenguy/a424ab0f4d32f024b39cd8cdd2b912ae
 */
export function samePortSSL(app: AppType, options: SamePortOptions) {
  const isRedirect = options.redirect ?? false
  const host = options.host
  const port = Number(options.port)

  // The tcp server that receves all the requests
  const tcpserver = net.createServer()
  // The normal server ( MUST be http or else it will try sorting the encription out itself and will fail in this configuration)
  // This is just as secure as the normal nodejs https server
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  let server = http.createServer(options, app)
  // A server that redirect all the requests to https, you could have this be the normal server too.
  const redirectServer
    = http.createServer(isRedirect
      ? (req, res) => (res.writeHead(302, { location: `https://${req.headers.host || req.url}` }), res.end())
      : app)

  // Make the proxy server listen
  tcpserver.listen(port, host)

  // Handle request
  tcpserver.on('connection', (socket) => {
    // Detect http or https/tls handskake
    socket.once('data', (data) => {
      // Buffer incomeing requests
      socket.pause()
      // Detect if the provided handshake data is TLS by checking if it starts with 22, which TLS always dose
      if (data[0] === 22) {
        // Https
        // You may use this socket as a TLS socket, meaning you can attach this to the same http server
        const sock = new tls.TLSSocket(socket, { isServer: true, ...options })
        // Add the TLS socket as a connection to the main http server
        server.emit('connection', sock)
        // Append data to start of data buffer
        socket.unshift(data)
      }
      else {
        // Http
        // Emit the socket to the redirect server
        redirectServer.emit('connection', socket)
        // Http views the events, meaning I can just refire the eventEmiter
        socket.emit('data', data)
      }
      // Resume socket
      process.nextTick(() => socket.resume())
    })
  })

  class ServerInstance {
    isAlive: boolean = true

    /**
     * Kill the server
     * @returns A promise that resolves when the server ends
     */
    kill() {
      return new Promise<void>((resolve, fail) => {
        tcpserver.close((err) => {
          if (typeof err === 'undefined') {
            server.closeAllConnections()
            redirectServer.closeAllConnections()
            this.isAlive = false
            resolve()
          }
          else {
            fail(err)
          }
        })
      })
    }

    /**
     * Change the server options
     * @param newOptions The new server options
     * @param newOptions.cert cert content
     * @param newOptions.key key content
     */
    async refresh(newOptions: { cert: string, key: string }) {
      if (newOptions && newOptions.cert && newOptions.key && typeof newOptions.cert === 'string' && typeof newOptions.key === 'string') {
        const verify = await verifyCertificate(newOptions.key, newOptions.cert)
        if (!verify.match)
          return

        // 证书校验有效再更新 server
        options = { ...options, ...newOptions }
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        return server = http.createServer(options, app)
      }
    }
  }

  return new Promise<ServerInstance>(resolve => tcpserver.on('listening', () => resolve(new ServerInstance())))
}

export type ServerInstance = Prettify<Awaited<ReturnType<typeof samePortSSL>>>
