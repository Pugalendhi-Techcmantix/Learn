import bcrypt from 'bcryptjs'
import { Router, type CookieOptions } from 'express'
import { config } from '../lib/env.js'
import { prisma } from '../lib/prisma.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/tokens.js'

export const authRouter = Router()

const REFRESH_COOKIE = 'refresh_token'
const refreshCookieOptions: CookieOptions = {
  httpOnly: true, // page JavaScript cannot read it (protects against XSS token theft)
  sameSite: 'lax',
  secure: false, // local http only; must be true on https in production
  path: '/auth', // the browser only sends it to /auth/* routes
  maxAge: config.refreshTokenTtlSeconds * 1000,
}

// POST /auth/login  { email, password }
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'bad_request', message: 'Email and password are required.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!user || !passwordOk) {
    // Same message for "no such user" and "wrong password", so attackers can't guess emails.
    res.status(401).json({ error: 'invalid_credentials', message: 'Wrong email or password.' })
    return
  }

  res.cookie(REFRESH_COOKIE, signRefreshToken(user.id), refreshCookieOptions)
  res.json({
    accessToken: signAccessToken(user),
    expiresIn: config.accessTokenTtlSeconds,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
})

// POST /auth/refresh  (uses the refresh_token cookie)
authRouter.post('/refresh', async (req, res) => {
  const token: unknown = req.cookies?.[REFRESH_COOKIE]
  if (typeof token !== 'string') {
    res.status(401).json({ error: 'missing_refresh_token', message: 'Please log in again.' })
    return
  }

  let userId: number
  try {
    userId = verifyRefreshToken(token)
  } catch {
    res.status(401).json({ error: 'invalid_refresh_token', message: 'Please log in again.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    res.status(401).json({ error: 'invalid_refresh_token', message: 'Please log in again.' })
    return
  }

  res.json({ accessToken: signAccessToken(user), expiresIn: config.accessTokenTtlSeconds })
})

// POST /auth/logout
authRouter.post('/logout', (_req, res) => {
  const { maxAge: _maxAge, ...clearOptions } = refreshCookieOptions
  res.clearCookie(REFRESH_COOKIE, clearOptions)
  res.status(204).end()
})
