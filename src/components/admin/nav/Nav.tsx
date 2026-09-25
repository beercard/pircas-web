import type { Payload, SanitizedPermissions, TypedUser, VisibleEntities } from 'payload'

import { getSiteUrl } from '@/lib/routes'

import { type ClientNavSection, NavClient } from './NavClient'
import { entityPath, NAV_SECTIONS, type NavEntity } from './sections'

type Props = {
  payload: Payload
  permissions: SanitizedPermissions
  user: TypedUser | null
  visibleEntities: VisibleEntities
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'P'

/** Menú lateral (servidor): arma las secciones según los permisos del usuario. */
export async function PircasNav({ payload, permissions, user, visibleEntities }: Props) {
  const adminRoute = payload.config.routes.admin
  const canSee = ({ type, slug }: NavEntity) =>
    (visibleEntities[type] as string[]).includes(slug) &&
    Boolean((permissions?.[type] as Record<string, { read?: unknown }> | undefined)?.[slug]?.read)

  const newLeads = canSee({ type: 'collections', slug: 'leads' })
    ? (await payload.count({ collection: 'leads', where: { status: { equals: 'new' } } })).totalDocs
    : 0

  const sections = NAV_SECTIONS.flatMap((s): ClientNavSection[] => {
    if (s.href !== undefined)
      return [
        { key: s.key, label: s.label, icon: s.icon, href: `${adminRoute}${s.href}`, items: [] },
      ]
    const items = (s.items ?? [])
      .filter((i) => canSee(i.entity))
      .map((i) => ({ label: i.label, href: `${adminRoute}${entityPath(i.entity)}` }))
    if (!items.length) return []
    return [
      {
        key: s.key,
        label: s.label,
        icon: s.icon,
        href: items[0].href,
        items: items.length > 1 ? items : [],
        badge: s.badge === 'newLeads' ? newLeads : undefined,
      },
    ]
  })

  const name = (user && 'name' in user && typeof user.name === 'string' && user.name) || 'Usuario'
  const role =
    user && 'role' in user && user.role === 'super-admin' ? 'Super administrador' : 'Editor'

  return (
    <NavClient
      sections={sections}
      adminRoute={adminRoute}
      siteUrl={getSiteUrl()}
      user={{ name, role, initials: initialsOf(name) }}
    />
  )
}
