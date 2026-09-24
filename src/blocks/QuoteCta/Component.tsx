import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { CmsLink } from '@/components/cms/CmsLink'
import { DoorShape } from '@/components/ui/Brand'
import { buttonVariants } from '@/components/ui/button-variants'
import { Section } from '@/components/ui/Section'
import type { QuoteCtaBlock as QuoteCtaBlockData } from '@/payload-types'
import { cn } from '@/lib/cn'
import { getSiteSettings } from '@/lib/data/globals'
import type { CmsLink as CmsLinkData } from '@/lib/links'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

/**
 * Llamado a la acción.
 * - band: franja terracota con título enorme (igual a la franja final del sitio).
 * - box: recuadro grafito con forma de marca, dentro del contenedor ("¿No encontrás lo que buscás?").
 */
export async function QuoteCtaBlock({
  variant,
  eyebrow,
  title,
  text,
  links,
  showWhatsapp,
  settings,
}: QuoteCtaBlockData) {
  const wa = showWhatsapp ? whatsappUrl(getWhatsAppConfig(await getSiteSettings())) : null

  if (variant === 'box') {
    return (
      <Section settings={settings} defaultSpacing="sm">
        <div className="container-site">
          <div className="flex flex-wrap items-center justify-between gap-5 bg-stone px-[clamp(1.375rem,3vw,2.75rem)] py-[34px]">
            <div className="flex flex-col gap-2">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <p className="max-w-[30ch] text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] leading-[1.15] tracking-[-0.02em]">
                {title}
              </p>
              {text && <p className="max-w-[48ch] text-sm font-normal text-muted">{text}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {(links ?? []).map((row) => (
                <CmsLink key={row.id} link={row.link as CmsLinkData} arrow />
              ))}
              {wa && (
                <TrackedAnchor
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="whatsapp_click"
                  params={{ location: 'cta_box' }}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  WhatsApp <span aria-hidden="true">→</span>
                </TrackedAnchor>
              )}
            </div>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      settings={settings}
      defaultBackground="brand"
      defaultSpacing="lg"
      className="overflow-hidden"
    >
      <DoorShape className="-top-[20%] -left-[6%] w-[clamp(300px,42vw,640px)] text-white/8" />
      <div className="container-site relative flex flex-col items-start gap-[30px]">
        {eyebrow && <p className="eyebrow text-white/80">{eyebrow}</p>}
        <h2 className="max-w-[13ch] text-[clamp(2.25rem,1.2rem+4.8vw,5.75rem)] leading-[0.98] tracking-[-0.03em]">
          {title}
        </h2>
        {text && <p className="max-w-[40ch] text-lead font-normal text-white/85">{text}</p>}
        <div className="flex w-full flex-wrap gap-3">
          {(links ?? []).map((row) => (
            <CmsLink
              key={row.id}
              link={row.link as CmsLinkData}
              dark
              brandBg
              size="lg"
              stretch
              arrow
            />
          ))}
          {wa && (
            <TrackedAnchor
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              event="whatsapp_click"
              params={{ location: 'cta_band' }}
              className={cn(
                buttonVariants({ variant: 'outline-light', size: 'lg', stretch: true }),
                'border-white/60',
              )}
            >
              WhatsApp <span aria-hidden="true">→</span>
            </TrackedAnchor>
          )}
        </div>
      </div>
    </Section>
  )
}
