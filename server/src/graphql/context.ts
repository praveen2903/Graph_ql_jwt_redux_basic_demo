import type { Request, Response } from 'express'
import { getUserFromAuthHeader } from '../services/auth.js'


export async function makeContext({ req }: { req: Request }) {
  const authHeader = req.headers.authorization
  const user = await getUserFromAuthHeader(authHeader)
  return {
    user,
    req,
  }
}

export type GraphQLContext = {
  user: Awaited<ReturnType<typeof getUserFromAuthHeader>>
  req: Request
}

