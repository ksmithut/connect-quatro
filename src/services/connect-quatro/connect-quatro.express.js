import { randomUUID } from 'node:crypto'
import express from 'express'
import { z } from 'zod'
import * as dateUtils from '../../lib/date-utils.js'
import wrap from '../../lib/express-wrap.js'
import { getSignedCookie, setSignedCookie } from '../../lib/express-cookie.js'

const COOKIE_NAME = 'cq.id'

/**
 * @param {object} params
 * @param {import('./connect-quatro.service').ConnectQuatroService} params.connectQuatroService
 */
export function configureConnectQuatroRouter ({ connectQuatroService }) {
  const router = express.Router()

  /**
   * @param {import('express').Request} req
   */
  function refreshPlayerId (req) {
    const playerId = getSignedCookie(req, COOKIE_NAME) ?? randomUUID()
    setSignedCookie(req, COOKIE_NAME, playerId, {
      expires: dateUtils.add(new Date(), 1, 'weeks')
    })
    return playerId
  }

  const createGame = wrap(async (req, res) => {
    const playerId = refreshPlayerId(req)
    const code = await connectQuatroService.createGame({ playerId })
    res.status(201).json({ code })
  })

  const joinGame = wrap(async (req, res) => {
    const { code } = req.params
    const playerId = refreshPlayerId(req)
    const game = await connectQuatroService.joinGame({ code, playerId })
    if (!game) return res.status(400).json({ code: 'INVALID_JOIN' })
    res.sendStatus(204)
  })

  const placeTokenBodySchema = z.object({
    column: z.number(),
    version: z.number()
  })
  const placeToken = wrap(async (req, res) => {
    const { code } = req.params
    const { version, column } = placeTokenBodySchema.parse(req.body)
    const playerId = refreshPlayerId(req)
    const game = await connectQuatroService.placeToken({
      code,
      playerId,
      version,
      column
    })
    if (!game) return res.status(400).json({ code: 'INVALID_PLACE' })
    res.sendStatus(204)
  })

  const watchGame = wrap(async (req, res) => {
    const { code } = req.params
    const playerId = refreshPlayerId(req)
    const lastEventId = req.get('last-event-id')
    const close = await connectQuatroService.watchGame(
      { code, playerId, after: lastEventId },
      event => {
        if (!event) {
          res.write(renderEvent({ event: 'done' }))
          res.end()
          return
        }
        res.write(
          renderEvent({
            id: event.eventId,
            data: JSON.stringify({
              game: event.game,
              version: event.version,
              playerId
            }),
            event: 'update'
          })
        )
      }
    )
    if (!close) return res.sendStatus(404)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache'
    })
    res.write('\n')
    req.on('close', () => close())
    res.on('close', () => close())
  })

  router.post('/games', createGame)
  router.post('/games/:code/join', joinGame)
  router.post('/games/:code/tokens', express.json(), placeToken)
  router.get('/games/:code', watchGame)

  return router
}

/**
 * @param {string} string
 */
function cleanLine (string) {
  return string.replaceAll('\n', '').trim()
}

/**
 * @param {object} event
 * @param {string} [event.id]
 * @param {string} [event.event]
 * @param {number} [event.retry]
 * @param {string} [event.data]
 * @param {string} [event.comment]
 */
function renderEvent (event) {
  const lines = []
  if (event.id) lines.push(`id: ${cleanLine(event.id)}`)
  if (event.event) lines.push(`event: ${cleanLine(event.event)}`)
  if (event.retry != null) lines.push(`retry: ${event.retry}`)
  if (event.data) {
    lines.push(
      ...event.data.split('\n').map(data => `data: ${cleanLine(data)}`)
    )
  }
  if (event.comment) {
    lines.push(
      ...event.comment.split('\n').map(comment => `: ${cleanLine(comment)}`)
    )
  }
  lines.push('', '')
  return lines.join('\n')
}
