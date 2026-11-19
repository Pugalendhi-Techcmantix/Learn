import bcrypt from 'bcryptjs'
import { Role } from '../generated/client.js'
import { prisma } from '../src/lib/prisma.js'

// Local test password for both seeded users. Never reuse it anywhere real.
const TEST_PASSWORD = 'Password@123'
const CATEGORIES = ['Books', 'Games', 'Music', 'Tools', 'Toys']

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)

  // upsert = create if missing, otherwise leave as is. Safe to run the seed many times.
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin', passwordHash, role: Role.ADMIN },
  })
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', name: 'Normal User', passwordHash, role: Role.USER },
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

  const users = await prisma.user.count()
  const products = await prisma.product.count()
  console.log(`Seed done: ${users} users, ${products} products`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
