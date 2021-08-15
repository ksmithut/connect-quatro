import { ObjectId } from 'mongodb'

/**
 * @typedef {object} Message
 * @property {string} id
 * @property {string} channel
 * @property {any} data
 */

/**
 * @typedef {object} PubSub
 * @property {(message: { channel: string, data: any }) => Promise<string>} publish
 * @property {(params: { channel: string }, onMessage: (message: Message) => void, onClose: () => void) => Promise<() => Promise<void>>} subscribe
 */

/**
 * @param {import('mongodb').Db} mongoDb
 * @param {object} [params]
 * @param {string} [params.collectionName]
 * @returns {PubSub}
 */
export function configureMongoPubSub (
  mongoDb,
  { collectionName = 'messages' } = {}
) {
  const messages = mongoDb.collection(collectionName)

  return {
    async publish ({ channel, data }) {
      const id = new ObjectId()
      await messages.insertOne({ _id: id, channel, data })
      return id.toHexString()
    },
    async subscribe ({ channel }, onMessage, onClose) {
      const query = {
        channel,
        _id: { $gt: new ObjectId() }
      }
      const cursor = messages.find(query, {
        tailable: true,
        awaitData: true
      })
      cursor.on('close', () => onClose())
      cursor
        .forEach(doc => {
          if (!doc.data) return
          onMessage({
            channel: doc.channel,
            data: doc.data,
            id: doc._id.toHexString()
          })
        })
        .then(() => close())
        .catch(async error => {
          if (error.message === 'server is closed') return
          return close()
        })
      async function close () {
        if (!cursor.closed) await cursor.close()
      }
      return close
    }
  }
}
