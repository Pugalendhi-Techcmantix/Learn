import { Router } from 'express'
import { Role } from '../../generated/client.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const apiRouter = Router()

// GET /api/me  → who am I? (401 without a valid token)
apiRouter.get('/me', requireAuth, (_req, res) => {
  res.json({ user: res.locals.user })
})

// GET /api/products  → protected list (401 without a valid token)
apiRouter.get('/products', requireAuth, async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  res.json({ products })
})

// GET /api/admin/users  → ADMIN only (403 for a normal user)
apiRouter.get('/admin/users', requireAuth, requireRole(Role.ADMIN), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  res.json({ users })
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
