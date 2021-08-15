import { once } from 'node:events'
import { promisify } from 'node:util'

/**
 * Starts the given http server and returns a function that closes the server
 * @param {import('http').Server} server
 * @param {number} port
 */
export async function httpListen (server, port) {
  await once(server.listen(port), 'listening')
  return promisify(server.close.bind(server))
}
