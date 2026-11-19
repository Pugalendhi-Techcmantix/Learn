import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'
import { ROLE_NAMES } from '../src/lib/roles.js'

const CATEGORIES = ['Books', 'Games', 'Music', 'Tools', 'Toys']

const ROLES = [
  { name: ROLE_NAMES.ADMIN, description: 'Full access, including the admin API' },
  { name: ROLE_NAMES.USER, description: 'Standard access' },
]

async function main() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Refusing to seed test users outside NODE_ENV=development.')
  }

  const testPassword = process.env.SEED_TEST_PASSWORD
  if (!testPassword) {
    throw new Error('SEED_TEST_PASSWORD is required for local development seeds.')
  }

  // Roles first: users point at them through roleId.
  // upsert = create if missing, otherwise update. Safe to run the seed many times.
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    })
  }

  const passwordHash = await bcrypt.hash(testPassword, 10)

  // update is empty on purpose: an existing user keeps their current role and password.
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash,
      role: { connect: { name: ROLE_NAMES.ADMIN } },
    },
  })
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Normal User',
      passwordHash,
      role: { connect: { name: ROLE_NAMES.USER } },
    },
  })

  // Products: wipe and recreate so the list is always the same 20 rows.
  await prisma.product.deleteMany()
  await prisma.product.createMany({
    data: Array.from({ length: 20 }, (_, i) => ({
      name: `Product ${i + 1}`,
      category: CATEGORIES[i % CATEGORIES.length]!,
      price: ((i + 1) * 7.5).toFixed(2),
    })),
  })

  const [roles, users, products] = await Promise.all([
    prisma.role.count(),
    prisma.user.count(),
    prisma.product.count(),
  ])
  console.log(`Seed done: ${roles} roles, ${users} users, ${products} products`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
