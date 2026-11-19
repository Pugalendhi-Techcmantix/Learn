import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/client.js'
import { requireEnv } from './env.js'

// One shared Prisma Client for the whole app (each client opens its own connection pool).
const adapter = new PrismaMariaDb({
  host: requireEnv('DB_HOST'),
  port: Number(requireEnv('DB_PORT')),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
  connectionLimit: 5,
})

export const prisma = new PrismaClient({ adapter })
