import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './graphql/schema.js'

import { resolvers } from './graphql/resolvers.js'

import { makeContext } from './graphql/context.js'

import { ensureSchemaAndSeed } from './db/migrations.js'


async function start() {
  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json())

  // Ensure DB tables exist (basic demo)
  await ensureSchemaAndSeed()

  const httpServer = http.createServer(app)

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: makeContext,
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql', cors: false })

  const port = process.env.PORT ? Number(process.env.PORT) : 4000
  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`)
  })
}

start().catch((err) => {
  console.error('Server failed to start', err)
  process.exit(1)
})

