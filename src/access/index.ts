import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

export const ROLES = ['super-admin', 'editor'] as const
export type Role = (typeof ROLES)[number]

type MaybeUser = PayloadRequest['user']

export const hasRole = (user: MaybeUser, role: Role): boolean =>
  Boolean(user && 'role' in user && user.role === role)

export const isSuperAdminUser = (user: MaybeUser): boolean => hasRole(user, 'super-admin')

/** Cualquier usuario logueado del panel (super-admin o editor). */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const superAdmin: Access = ({ req: { user } }) => isSuperAdminUser(user)

export const anyone: Access = () => true

export const nobody: Access = () => false

/**
 * Público: solo documentos publicados. Usuarios del panel: todo (incluye borradores).
 * Requiere `versions.drafts` en la colección.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  const where: Where = { _status: { equals: 'published' } }
  return where
}

/** El super-admin ve a todos; un editor solo su propio usuario. */
export const selfOrSuperAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdminUser(user)) return true
  const where: Where = { id: { equals: user.id } }
  return where
}

export const superAdminField: FieldAccess = ({ req: { user } }) => isSuperAdminUser(user)
