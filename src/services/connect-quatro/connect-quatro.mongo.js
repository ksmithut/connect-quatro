import { ObjectId } from 'mongodb'

/**
 * @param {import('mongodb').Db} mongoDb
 * @returns {import('./connect-quatro.service').ConnectQuatroModel}
 */
export function configureConnectQuatroModel (mongoDb) {
  /** @type {import('mongodb').Collection<import('./connect-quatro.service').GameDocument>} */
  const games = mongoDb.collection('games')

  return {
    async create ({ game, code, expiresAt }) {
      const gameDocument = {
        _id: new ObjectId(),
        game,
        code,
        expiresAt,
        version: 0
      }
      await games.insertOne(gameDocument)
      return gameDocument
    },
    async fetch ({ code }) {
      const document = await games.findOne({
        code
      })
      return document ?? null
    },
    async fetchByPlayerId ({ code, playerId }) {
      const document = await games.findOne({
        code,
        'game.players': playerId
      })
      return document ?? null
    },
    async update ({ code, version, game, expiresAt }) {
      const result = await games.findOneAndUpdate(
        { code, version },
        {
          $set: { game, expiresAt },
          $inc: { version: 1 }
        },
        { returnDocument: 'after' }
      )
      return result.value ?? null
    }
  }
}
