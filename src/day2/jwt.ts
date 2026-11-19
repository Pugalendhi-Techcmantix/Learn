// A JWT is 3 base64url parts: header.payload.signature
// The payload is NOT encrypted, only signed. Anyone can read it, so never put secrets in it.
export type JwtPayload = {
  sub: string
  email?: string
  role?: string
  iat: number // issued at (seconds)
  exp: number // expires at (seconds)
}

export function decodeJwt(token: string): JwtPayload | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}
