import { createServer } from 'node:http'
import express from 'express'
import { httpListen } from './lib/http-listen.js'
import expressCookie from './lib/express-cookie.js'
import { configureConnectQuatroRouter } from './services/connect-quatro/connect-quatro.express.js'

const PUBLIC_PATH = new URL('./public/', import.meta.url).pathname
const INDEX_PATH = new URL('./public/index.html', import.meta.url).pathname

/**
 * @param {object} params
 * @param {string[]} params.cookieSecrets
 * @param {import('./services/connect-quatro/connect-quatro.service').ConnectQuatroService} params.connectQuatroService
 */
export function configureServer ({ cookieSecrets, connectQuatroService }) {
  const app = express()

  app.use(
    expressCookie({
      secrets: cookieSecrets,
      options: req => ({
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: req.protocol === 'https'
      })
    })
  )
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`)
    next()
  })
  app.use('/api', configureConnectQuatroRouter({ connectQuatroService }))
  app.use(express.static(PUBLIC_PATH))
  app.get('/*', (req, res, next) => {
    if (!req.accepts('html')) return next()
    res.sendFile(INDEX_PATH)
  })

  /**
   * @param {number} port
   */
  async function start (port) {
    const server = createServer(app)
    const closeServer = await httpListen(server, port)
    return async () => {
      await closeServer()
    }
  }
  return start
}
