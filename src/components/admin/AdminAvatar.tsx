import type { TypedUser } from 'payload'

/**
 * Avatar del encabezado con las iniciales del usuario. Reemplaza a Gravatar, que enviaba el
 * hash del email a un servicio externo en cada carga del panel.
 */
export function AdminAvatar({ user }: { user?: TypedUser | null }) {
  const name = (user && 'name' in user && typeof user.name === 'string' && user.name) || ''
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'P'
  return (
    <span className="pircas-avatar" aria-hidden="true">
      {initials}
    </span>
  )
}
