import jwt from 'jsonwebtoken'
import type { Role } from '../../generated/client.js'
import { config } from './env.js'

export type AuthUser = {
  id: number
  email: string
  role: Role
}

// Access token: short life (30s here, so you can watch it expire). Sent in the Authorization header.
export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ sub: String(user.id), email: user.email, role: user.role }, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtlSeconds,
  })
}

// Refresh token: long life. Stored in an httpOnly cookie, so page JavaScript cannot read it.
export function signRefreshToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenTtlSeconds,
  })
}

// Both verify functions throw jwt.TokenExpiredError or jwt.JsonWebTokenError when the token is bad.
export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, config.jwtAccessSecret) as jwt.JwtPayload
  return { id: Number(payload.sub), email: String(payload.email), role: payload.role as Role }
}

export function verifyRefreshToken(token: string): number {
  const payload = jwt.verify(token, config.jwtRefreshSecret) as jwt.JwtPayload
  return Number(payload.sub)
}
