import { QuoteWizard } from '@/components/quote/QuoteWizard'
import { Section } from '@/components/ui/Section'
import type { QuoteWizardBlock as QuoteWizardBlockData } from '@/payload-types'
import { getSiteSettings } from '@/lib/data/globals'
import { turnstileSiteKey } from '@/lib/forms/turnstile'
import { getQuoteCatalog } from '@/lib/quote/catalog'
import { getWhatsAppConfig } from '@/lib/whatsapp'

/** Cotizador online (5 pasos + presupuesto). Opciones y precios desde el CMS. */
export async function QuoteWizardBlock({ settings }: QuoteWizardBlockData) {
  const [catalog, site] = await Promise.all([getQuoteCatalog(), getSiteSettings()])
  if (!catalog.products.length) return null
  const a = site.address
  return (
    <Section settings={settings} defaultSpacing="none" className="pb-section-sm">
      <div className="container-site">
        <QuoteWizard
          catalog={catalog}
          turnstileSiteKey={turnstileSiteKey()}
          whatsappNumber={getWhatsAppConfig(site).number}
          addressLine={a?.street ? [a.street, a.city].filter(Boolean).join(' · ') : null}
        />
      </div>
    </Section>
  )
}
