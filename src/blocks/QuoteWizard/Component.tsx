import Link from 'next/link'

import { QuoteWizard } from '@/components/quote/QuoteWizard'
import { buttonVariants } from '@/components/ui/button-variants'
import { Section } from '@/components/ui/Section'
import type { QuoteWizardBlock as QuoteWizardBlockData } from '@/payload-types'
import { getSiteSettings } from '@/lib/data/globals'
import { turnstileSiteKey } from '@/lib/forms/turnstile'
import { getQuoteCatalog } from '@/lib/quote/catalog'
import { ROUTES } from '@/lib/routes'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

/** Cotizador online (5 pasos + presupuesto). Opciones y precios desde el CMS. */
export async function QuoteWizardBlock({ settings }: QuoteWizardBlockData) {
  const [catalog, site] = await Promise.all([getQuoteCatalog(), getSiteSettings()])
  // Sin productos a medida cargados: en lugar de una página vacía, se ofrece la tienda
  // (presupuesto online por medidas estándar) y el contacto directo.
  if (!catalog.products.length) {
    const wa = whatsappUrl(
      getWhatsAppConfig(site),
      'Hola Pircas, quiero cotizar una abertura a medida.',
    )
    return (
      <Section settings={settings} defaultSpacing="none" className="pb-section-sm">
        <div className="container-site">
          <div className="flex max-w-[44rem] flex-col items-start gap-6 border border-line bg-white p-[clamp(1.5rem,4vw,3rem)]">
            <p className="eyebrow">Presupuesto online</p>
            <h2 className="text-h3">Armá tu presupuesto con las medidas estándar</h2>
            <p className="max-w-[52ch] text-base leading-[1.7] font-normal text-muted">
              Elegí el producto, la medida y el color en la tienda y recibí el precio en el acto. Si
              necesitás una medida especial, escribinos y te la cotizamos.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href={ROUTES.shop} className={buttonVariants({ variant: 'primary' })}>
                Ir a la tienda
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </Section>
    )
  }
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
