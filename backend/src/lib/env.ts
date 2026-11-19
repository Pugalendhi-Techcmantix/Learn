import 'dotenv/config'

// Read a required variable from .env. Stops the app with a clear message if it is missing.
// (An empty value like `DB_PASSWORD=` is allowed: XAMPP's root user has no password.)
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`Missing ${name} in backend/.env`)
  }
  return value
}

export const config = {
  port: Number(requireEnv('PORT')),
  clientOrigin: requireEnv('CLIENT_ORIGIN'),
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  accessTokenTtlSeconds: Number(requireEnv('ACCESS_TOKEN_TTL_SECONDS')),
  refreshTokenTtlSeconds: Number(requireEnv('REFRESH_TOKEN_TTL_SECONDS')),
}
