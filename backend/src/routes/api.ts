import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { flattenRole, ROLE_NAMES } from '../lib/roles.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const apiRouter = Router()

// GET /api/me  → who am I? (401 without a valid token)
apiRouter.get('/me', requireAuth, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: res.locals.user!.id },
    select: { id: true, email: true, name: true, role: { select: { name: true } } },
  })
  if (!user) {
    res.status(401).json({ error: 'invalid_token', message: 'This account no longer exists.' })
    return
  }
  res.json({ user: flattenRole(user) })
})

// GET /api/products  → protected list (401 without a valid token)
apiRouter.get('/products', requireAuth, async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  res.json({ products })
})

// GET /api/admin/users  → ADMIN only (403 for a normal user)
apiRouter.get('/admin/users', requireAuth, requireRole(ROLE_NAMES.ADMIN), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true, role: { select: { name: true } } },
  })
  res.json({ users: users.map(flattenRole) })
})

// GET /api/slow  → answers after 5 seconds (practise timeouts)
apiRouter.get('/slow', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 5000))
  res.json({ message: 'Finally done after 5 seconds.' })
})

// GET /api/error  → always fails with 500 (practise server-error handling)
apiRouter.get('/error', () => {
  throw new Error('Simulated server crash')
})
