import { randomInt } from 'node:crypto'
import * as dateUtils from '../../lib/date-utils.js'
import * as connectQuatro from './connect-quatro.js'

function newExpiresAt (date = new Date()) {
  return dateUtils.add(date, 1, 'hours')
}

const GAMES_CHANNEL = 'games'
const GAME_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

function generateGameCode (length = 4) {
  return new Array(length)
    .fill(null)
    .map(() => GAME_CODE_ALPHABET[randomInt(0, GAME_CODE_ALPHABET.length)])
    .join('')
}

/**
 * @typedef {ReturnType<configureConnectQuatroService>} ConnectQuatroService
 */

/**
 * @typedef {(gameData: { game: import('./connect-quatro').Game, version: number, eventId: string }?) => void} GameChangeListener
 */

/**
 * @typedef {object} GameDocument
 * @property {import('./connect-quatro').Game} game
 * @property {string} code
 * @property {Date} expiresAt
 * @property {number} version
 */

/**
 * @typedef {object} ConnectQuatroModel
 * @property {(args: { game: import('./connect-quatro').Game, code: string, expiresAt: Date }) => Promise<GameDocument>} create
 * @property {(args: { code: string }) => Promise<GameDocument | null>} fetch
 * @property {(args: { code: string, playerId: string }) => Promise<GameDocument | null>} fetchByPlayerId
 * @property {(args: { code: string, version: number, game: import('./connect-quatro').Game, expiresAt: Date }) => Promise<GameDocument | null>} update
 */

/**
 * @param {object} params
 * @param {ConnectQuatroModel} params.connectQuatroModel
 * @param {import('../../utils/pub-sub').PubSub} params.pubSub
 */
export function configureConnectQuatroService ({ connectQuatroModel, pubSub }) {
  /** @type {Map<string, Set<GameChangeListener>>} */
  const gameListeners = new Map()
  return {
    /**
     * @param {object} params
     * @param {string} params.playerId
     */
    async createGame ({ playerId }) {
      const game = await connectQuatroModel.create({
        game: connectQuatro.initialize(playerId),
        code: generateGameCode(),
        expiresAt: newExpiresAt()
      })
      await pubSub.publish({
        channel: GAMES_CHANNEL,
        data: game
      })
      return game.code
    },
    /**
     * @param {object} params
     * @param {string} params.code
     * @param {string} params.playerId
     */
    async joinGame ({ code, playerId }) {
      const document = await connectQuatroModel.fetch({ code })
      if (!document) return null
      const newGame = connectQuatro.reducer(document.game, {
        type: 'JOIN',
        payload: { playerId }
      })
      if (newGame === document.game) return null
      const updatedDocument = await connectQuatroModel.update({
        code,
        version: 0,
        game: newGame,
        expiresAt: newExpiresAt()
      })
      if (!updatedDocument) return null
      await pubSub.publish({
        channel: GAMES_CHANNEL,
        data: updatedDocument
      })
      return updatedDocument
    },
    /**
     * @param {object} params
     * @param {number} params.version
     * @param {string} params.code
     * @param {string} params.playerId
     * @param {number} params.column
     */
    async placeToken ({ code, version, playerId, column }) {
      const document = await connectQuatroModel.fetchByPlayerId({
        code,
        playerId
      })
      if (!document) return null
      const newGame = connectQuatro.reducer(document.game, {
        type: 'PLACE',
        payload: { playerId, column }
      })
      if (newGame === document.game) return null
      const updatedDocument = await connectQuatroModel.update({
        code,
        version,
        game: newGame,
        expiresAt: newExpiresAt()
      })
      if (!updatedDocument) return null
      await pubSub.publish({
        channel: GAMES_CHANNEL,
        data: updatedDocument
      })
      return updatedDocument
    },
    /**
     * @param {object} params
     * @param {string} params.code
     * @param {string} params.playerId
     * @param {string} [params.after]
     * @param {GameChangeListener} onChange
     */
    async watchGame ({ code, playerId }, onChange) {
      const game = await connectQuatroModel.fetchByPlayerId({ code, playerId })
      if (!game) return null
      const listeners = gameListeners.get(code) ?? new Set()
      setTimeout(() =>
        onChange({ game: game.game, version: game.version, eventId: '0' })
      )
      listeners.add(onChange)
      gameListeners.set(code, listeners)
      return () => {
        listeners.delete(onChange)
        if (listeners.size === 0) gameListeners.delete(code)
      }
    },
    async start () {
      return pubSub.subscribe(
        { channel: GAMES_CHANNEL },
        ({ data, id }) => {
          const listeners = gameListeners.get(data.code)
          if (!listeners) return
          for (const listener of listeners) {
            listener({ game: data.game, eventId: id, version: data.version })
          }
        },
        () => {
          for (const listeners of gameListeners.values()) {
            for (const listener of listeners) {
              listener(null)
            }
          }
          gameListeners.clear()
        }
      )
    }
  }
}
