/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
export async function up (db, client) {
  await client.withSession(async session => {})
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
export async function down (db, client) {
  await client.withSession(async session => {})
}
