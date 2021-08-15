import { setTimeout as wait } from 'timers/promises'

export class Timeout extends Error {
  constructor (message = 'timeout', code = 'TIMEOUT_ERROR') {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.code = code
  }
}

/**
 * Given a promise and a number of milliseconds, it will wait for the promise to
 * be fulfilled, but if it fails to resolve, it will return a rejected promise.
 * @template TValue
 * @param {Promise<TValue>} promise
 * @param {number} ms
 * @param {object} [options]
 * @param {string} [options.message]
 * @param {string} [options.code]
 */
export function timeout (promise, ms, { message, code } = {}) {
  const abortController = new AbortController()
  return Promise.race([
    promise
      .then(value => {
        abortController.abort()
        return value
      })
      .catch(err => {
        abortController.abort()
        return Promise.reject(err)
      }),
    wait(ms, 0, { signal: abortController.signal }).then(() =>
      Promise.reject(new Timeout(message, code))
    )
  ])
}
