import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { RoleName } from '../lib/roles.js'
import { verifyAccessToken, type AuthUser } from '../lib/tokens.js'

// Lets TypeScript know that res.locals.user exists after requireAuth runs.
declare global {
  namespace Express {
    interface Locals {
      user?: AuthUser
    }
  }
}

// 401 = "Who are you?" The token is missing, invalid or expired.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'missing_token', message: 'Please log in first.' })
    return
  }

  try {
    res.locals.user = verifyAccessToken(header.slice('Bearer '.length))
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'token_expired', message: 'Your session token has expired.' })
      return
    }
    res.status(401).json({ error: 'invalid_token', message: 'Your session token is not valid.' })
  }
}

// 403 = "I know who you are, but you are not allowed." Use after requireAuth.
export function requireRole(role: RoleName) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user?.role !== role) {
      res.status(403).json({ error: 'forbidden', message: 'You do not have permission for this.' })
      return
    }
    next()
  }
}
