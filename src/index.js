import mongodb from 'mongodb'
import { timeout } from './lib/timeout.js'
import { once } from './lib/once.js'
import { configureMongoPubSub } from './utils/pub-sub.js'
import { configureMigrateMongo } from './utils/migrate-mongo.js'
import { configureServer } from './server.js'
import { configureConnectQuatroModel } from './services/connect-quatro/connect-quatro.mongo.js'
import { configureConnectQuatroService } from './services/connect-quatro/connect-quatro.service.js'

/**
 * @param {import('./config').Config} config
 */
export function configureApp (config) {
  const { port, mongoURL, cookieSecrets } = config

  async function start () {
    const mongoClient = await mongodb.MongoClient.connect(mongoURL)
    const pubSubMongoClient = await mongodb.MongoClient.connect(mongoURL)
    const pubSub = configureMongoPubSub(pubSubMongoClient.db())

    const connectQuatroModel = configureConnectQuatroModel(mongoClient.db())
    const connectQuatroService = configureConnectQuatroService({
      connectQuatroModel,
      pubSub
    })
    const stopConnectQuatroService = await connectQuatroService.start()

    const startServer = configureServer({ cookieSecrets, connectQuatroService })
    const closeServer = await startServer(port)
    console.log(`Server listening on port ${port}`)

    return once(async () => {
      await stopConnectQuatroService()
      await pubSubMongoClient.close()
      await timeout(closeServer(), 5000)
      await mongoClient.close()
    })
  }

  async function migrateUp () {
    const migrate = configureMigrateMongo({ mongoURL })
    const { db, client } = await migrate.database.connect()
    // @ts-ignore
    const migrated = await migrate.up(db, client).finally(() => client.close())
    console.log(`${migrated.length} migrations run`)
    migrated.forEach(file => console.log(`- ${file}`))
  }

  async function migrateDown () {
    const migrate = configureMigrateMongo({ mongoURL })
    const { db, client } = await migrate.database.connect()
    const migrated = await migrate
      // @ts-ignore
      .down(db, client)
      .finally(() => client.close())
    console.log(`${migrated.length} migrations rolled back`)
    migrated.forEach(file => console.log(`- ${file}`))
  }

  return { start, migrateUp, migrateDown }
}
