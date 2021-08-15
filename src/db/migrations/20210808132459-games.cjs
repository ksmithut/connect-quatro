'use strict'

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
exports.up = async function up (db, client) {
  await client.withSession(async session => {
    const games = await db.createCollection('games', {
      session
    })
    await games.createIndexes(
      [
        { key: { code: 1 }, name: 'unique_code', unique: true },
        { key: { expiresAt: 1 }, name: 'expires', expireAfterSeconds: 0 },
        { key: { code: 1, 'games.players': 1 }, name: 'game_lookup' }
      ],
      { session }
    )
  })
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
exports.down = async function down (db, client) {
  await client.withSession(async session => {
    await db.dropCollection('games', { session })
  })
}
