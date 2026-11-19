// The role names the code relies on. The Role table holds these rows (created by the
// migration and the seed); this file is the one place the names are spelled out in code.
export const ROLE_NAMES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES]

// Role names come from the database or from a token, so check them before trusting the type.
export function asRoleName(name: string): RoleName {
  if (name === ROLE_NAMES.ADMIN || name === ROLE_NAMES.USER) return name
  throw new Error(`Unknown role "${name}"`)
}

// The API sends the role as a plain string ("ADMIN"), not as a nested object.
export function flattenRole<T extends { role: { name: string } }>(user: T) {
  const { role, ...rest } = user
  return { ...rest, role: asRoleName(role.name) }
}
