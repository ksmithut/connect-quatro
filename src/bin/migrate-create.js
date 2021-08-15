import process from 'node:process'
import 'dotenv/config'
import { Command } from 'commander'
import { parseConfigFromEnv } from '../config.js'
import { configureMigrateMongo } from '../utils/migrate-mongo.js'

const program = new Command()

program
  .argument('<name>')
  .description('Create a new migration file')
  .action(async name => {
    const { mongoURL } = parseConfigFromEnv(process.env)
    const migrateMongo = configureMigrateMongo({ mongoURL })
    const filepath = await migrateMongo.create(name)
    console.log(`Created migration file ${filepath}`)
  })

program.parseAsync(process.argv)
