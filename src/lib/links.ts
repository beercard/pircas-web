import { pathFor, type RoutableCollection } from './routes'
import { whatsappUrl, type WhatsAppConfig } from './whatsapp'

/** Forma del grupo `link` generado por `fields/link.ts`. */
export type CmsLink = {
  type?: 'reference' | 'custom' | 'whatsapp' | null
  newTab?: boolean | null
  label?: string | null
  reference?: {
    relationTo: string
    value: number | string | { slug?: string | null } | null
  } | null
  url?: string | null
  whatsappMessage?: string | null
  appearance?: 'primary' | 'secondary' | 'outline' | 'link' | null
}

export type ResolvedLink = {
  href: string
  label: string
  external: boolean
  newTab: boolean
  kind: 'internal' | 'external' | 'whatsapp'
  appearance: NonNullable<CmsLink['appearance']>
}

/** Convierte un enlace del CMS en un href utilizable. Devuelve null si está incompleto. */
export function resolveLink(
  link: CmsLink | null | undefined,
  whatsapp?: WhatsAppConfig,
): ResolvedLink | null {
  if (!link) return null
  const label = link.label?.trim() ?? ''
  const appearance = link.appearance ?? 'primary'

  if (link.type === 'whatsapp') {
    const href = whatsapp ? whatsappUrl(whatsapp, link.whatsappMessage) : null
    if (!href) return null
    return { href, label, external: true, newTab: true, kind: 'whatsapp', appearance }
  }

  if (link.type === 'reference') {
    const value = link.reference?.value
    const slug = value && typeof value === 'object' ? value.slug : null
    if (!slug || !link.reference) return null
    const href = pathFor(link.reference.relationTo as RoutableCollection, slug)
    return {
      href,
      label,
      external: false,
      newTab: Boolean(link.newTab),
      kind: 'internal',
      appearance,
    }
  }

  const url = link.url?.trim()
  if (!url) return null
  const external = /^(https?:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url)
  return {
    href: url,
    label,
    external,
    newTab: Boolean(link.newTab),
    kind: external ? 'external' : 'internal',
    appearance,
  }
}
