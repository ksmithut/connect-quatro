/**
 * @typedef {any} Game
 */

/**
 * @returns {Promise<string>}
 */
export async function createGame () {
  const res = await window.fetch('/api/games', {
    method: 'POST',
    credentials: 'same-origin'
  })
  if (res.status !== 201) throw new Error('unexpected response')
  const body = await res.json()
  if (typeof body?.code === 'string') return body.code
  throw new Error('unexpected response body')
}

/**
 * @param {string} code
 */
export async function joinGame (code) {
  const res = await window.fetch(
    `/api/games/${encodeURIComponent(code)}/join`,
    { method: 'POST', credentials: 'same-origin' }
  )
  if (res.status !== 204) throw new Error('unexpected response')
  return code
}

/**
 * @param {string} code
 * @param {object} params
 * @param {number} params.version
 * @param {number} params.column
 */
export async function placeToken (code, { version, column }) {
  const res = await window.fetch(
    `/api/games/${encodeURIComponent(code)}/tokens`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, column })
    }
  )
  if (res.status !== 204) throw new Error('unexpected response')
}

/**
 * @param {string} code
 * @param {object} params
 * @param {() => void} params.onOpen
 * @param {(data: { game: Game, version: number, playerId: string }) => void} params.onUpdate
 * @param {() => void} params.onDone
 * @param {(event: Event) => void} params.onError
 */
export function watchGame (code, { onOpen, onUpdate, onDone, onError }) {
  const eventSource = new window.EventSource(
    `/api/games/${encodeURIComponent(code)}`,
    { withCredentials: true }
  )
  /**
   * @param {Event} event
   */
  function handleOpen (event) {
    onOpen()
  }
  /**
   * @param {MessageEvent} event
   */
  function handleUpdate (event) {
    onUpdate(JSON.parse(event.data))
  }
  function handleDone () {
    close()
    onDone()
  }
  /**
   * @param {Event} event
   */
  function handleError (event) {
    onError(event)
  }
  eventSource.addEventListener('open', handleOpen)
  // @ts-ignore
  eventSource.addEventListener('update', handleUpdate)
  // @ts-ignore
  eventSource.addEventListener('done', handleDone)
  eventSource.addEventListener('error', handleError)
  function close () {
    eventSource.removeEventListener('open', handleOpen)
    eventSource.removeEventListener('message', handleUpdate)
    eventSource.removeEventListener('error', handleError)
    eventSource.close()
  }
  return close
}
