import { getHeader, getShopSettings, getSiteSettings } from '@/lib/data/globals'
import type { CmsLink } from '@/lib/links'
import { ROUTES } from '@/lib/routes'
import { mediaSrc } from '@/lib/media'
import { getWhatsAppConfig } from '@/lib/whatsapp'

import { HeaderClient } from './HeaderClient'
import { resolveNavigation, toSimple, type NavItem } from './nav-types'

/** Header del sitio: los datos vienen del CMS (Menú + Datos del negocio). */
export async function SiteHeader() {
  const [header, settings, shop] = await Promise.all([
    getHeader(),
    getSiteSettings(),
    getShopSettings(),
  ])
  const shopOpen = shop?.enabled !== false
  const whatsapp = getWhatsAppConfig(settings)
  const cta = toSimple(header.cta as CmsLink, whatsapp) ?? {
    href: ROUTES.quote,
    label: 'Solicitar presupuesto',
    external: false,
    newTab: false,
  }
  const logo =
    settings.logo && typeof settings.logo === 'object' && settings.logo.url
      ? {
          url: mediaSrc(settings.logo.url) ?? settings.logo.url,
          width: settings.logo.width ?? 200,
          height: settings.logo.height ?? 60,
        }
      : null

  return (
    <HeaderClient
      nav={withShop(resolveNavigation(header, whatsapp), shopOpen)}
      cta={cta}
      brandName={settings.brandName}
      logo={logo}
      shop={shopOpen}
      announcement={shopOpen ? shop?.announcement : null}
    />
  )
}

/** La tienda va al lado de Productos (el resto del menú se gestiona por código en el seed). */
function withShop(nav: NavItem[], open: boolean): NavItem[] {
  if (!open || nav.some((i) => i.href === ROUTES.shop)) return nav
  const item: NavItem = {
    href: ROUTES.shop,
    label: 'Tienda',
    external: false,
    newTab: false,
    mega: null,
  }
  const at = nav.findIndex((i) => i.href === ROUTES.products)
  return at >= 0 ? [...nav.slice(0, at + 1), item, ...nav.slice(at + 1)] : [item, ...nav]
}
