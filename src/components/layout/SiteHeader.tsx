import { getHeader, getSiteSettings } from '@/lib/data/globals'
import type { CmsLink } from '@/lib/links'
import { ROUTES } from '@/lib/routes'
import { mediaSrc } from '@/lib/media'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

import { HeaderClient } from './HeaderClient'
import { resolveNavigation, toSimple } from './nav-types'

/** Header del sitio: los datos vienen del CMS (Menú + Datos del negocio). */
export async function SiteHeader() {
  const [header, settings] = await Promise.all([getHeader(), getSiteSettings()])
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
      nav={resolveNavigation(header, whatsapp)}
      cta={cta}
      whatsappHref={whatsappUrl(whatsapp)}
      showWhatsapp={header.showWhatsapp !== false}
      brandName={settings.brandName}
      logo={logo}
    />
  )
}
