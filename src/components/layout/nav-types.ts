import type { Header } from '@/payload-types'
import { resolveLink, type CmsLink } from '@/lib/links'
import type { WhatsAppConfig } from '@/lib/whatsapp'

/** Datos de navegación ya resueltos (serializables, aptos para componentes cliente). */
export type SimpleLink = { href: string; label: string; external: boolean; newTab: boolean }

export type MegaMenu = {
  columns: { title: string; large: boolean; links: SimpleLink[] }[]
  promo: { text: string; link: SimpleLink } | null
}

export type NavItem = SimpleLink & { mega: MegaMenu | null }

export function toSimple(
  link: CmsLink | null | undefined,
  whatsapp: WhatsAppConfig,
): SimpleLink | null {
  const r = resolveLink(link, whatsapp)
  return r?.label ? { href: r.href, label: r.label, external: r.external, newTab: r.newTab } : null
}

export function resolveNavigation(header: Header, whatsapp: WhatsAppConfig): NavItem[] {
  return (header.navigation ?? []).flatMap((item) => {
    const link = toSimple(item.link as CmsLink, whatsapp)
    if (!link) return []
    const columns = (item.megaMenu?.columns ?? [])
      .map((col) => ({
        title: col.title,
        large: Boolean(col.large),
        links: (col.links ?? [])
          .map((l) => toSimple(l.link as CmsLink, whatsapp))
          .filter((l): l is SimpleLink => l !== null),
      }))
      .filter((c) => c.links.length > 0)
    const promoLink = toSimple(item.megaMenu?.promo?.link as CmsLink, whatsapp)
    const promo =
      item.megaMenu?.promo?.text && promoLink
        ? { text: item.megaMenu.promo.text, link: promoLink }
        : null
    return [{ ...link, mega: columns.length || promo ? { columns, promo } : null }]
  })
}

export const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
