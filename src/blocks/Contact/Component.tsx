import type { ReactNode } from 'react'

import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { CmsLink } from '@/components/cms/CmsLink'
import { ContactForm } from '@/components/forms/ContactForm'
import { DoorShape } from '@/components/ui/Brand'
import { Section } from '@/components/ui/Section'
import type { ContactBlock as ContactBlockData } from '@/payload-types'
import { getFormsSettings, getSiteSettings } from '@/lib/data/globals'
import { turnstileSiteKey } from '@/lib/forms/turnstile'
import type { CmsLink as CmsLinkData } from '@/lib/links'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

/** Datos del local + recuadro al cotizador + formulario de consulta. */
export async function ContactBlock({ title, promo, showMap, settings }: ContactBlockData) {
  const [site, forms] = await Promise.all([getSiteSettings(), getFormsSettings()])
  const wa = whatsappUrl(getWhatsAppConfig(site))
  const a = site.address
  const instagramHandle = site.instagram?.match(/instagram\.com\/([^/?#]+)/)?.[1]

  const rows: { label: string; value: ReactNode }[] = []
  if (a?.street)
    rows.push({
      label: 'Local',
      value: a.mapsUrl ? (
        <TrackedAnchor
          href={a.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          event="map_click"
          params={{ location: 'contact' }}
          className="group inline-block hover:text-brand"
          title="Ver en Google Maps"
        >
          {a.street}
          <br />
          {[a.city, a.region, 'Argentina'].filter(Boolean).join(', ')}
          <span className="mt-1.5 block text-eyebrow font-medium tracking-[0.18em] text-brand-ink uppercase group-hover:underline">
            Cómo llegar →
          </span>
        </TrackedAnchor>
      ) : (
        <>
          {a.street}
          <br />
          {[a.city, a.region, 'Argentina'].filter(Boolean).join(', ')}
        </>
      ),
    })
  if (site.workingHours?.length)
    rows.push({
      label: 'Horario',
      value: site.workingHours.map((h) => (
        <span key={h.id} className="block">
          {h.days} · {h.hours}
        </span>
      )),
    })
  if (site.phone)
    rows.push({
      label: 'Teléfono',
      value: (
        <TrackedAnchor
          href={`tel:+${(site.whatsapp?.number ?? site.phone).replace(/\D/g, '')}`}
          event="phone_click"
          params={{ location: 'contact' }}
          className="hover:text-brand"
        >
          {site.phone}
        </TrackedAnchor>
      ),
    })
  if (wa)
    rows.push({
      label: 'WhatsApp',
      value: (
        <TrackedAnchor
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          event="whatsapp_click"
          params={{ location: 'contact' }}
          className="hover:text-brand"
        >
          Escribinos directo →
        </TrackedAnchor>
      ),
    })
  if (site.instagram)
    rows.push({
      label: 'Instagram',
      value: (
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand"
        >
          {instagramHandle ? `@${instagramHandle}` : 'Instagram'}
        </a>
      ),
    })
  if (site.coverageArea) rows.push({ label: 'Cobertura', value: site.coverageArea })

  return (
    <Section settings={settings} defaultSpacing="none" className="pb-section-sm">
      <div className="container-site flex flex-col gap-[clamp(2rem,4vw,4rem)]">
        {title && <h2 className="max-w-[18ch] text-h1">{title}</h2>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] items-start gap-[clamp(2rem,5vw,6.25rem)]">
          <div className="flex flex-col gap-[30px]">
            <dl className="grid grid-cols-[110px_1fr] gap-x-5 gap-y-[18px] border-t border-line-strong pt-[26px] text-[0.906rem] leading-normal font-normal">
              {rows.map((r) => (
                <div key={r.label} className="contents">
                  <dt className="pt-0.5 text-eyebrow font-medium tracking-[0.2em] text-muted uppercase">
                    {r.label}
                  </dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>

            {promo?.text && (
              <div className="on-dark relative flex flex-col gap-3.5 overflow-hidden bg-ink px-7 py-8 text-white">
                <DoorShape className="-right-[26px] -bottom-[46px] w-[150px] text-white/7" />
                {promo.eyebrow && <p className="eyebrow relative">{promo.eyebrow}</p>}
                <p className="relative max-w-[26ch] text-[clamp(1.125rem,0.95rem+0.6vw,1.5rem)] leading-[1.3] tracking-[-0.015em]">
                  {promo.text}
                </p>
                {promo.link?.label && (
                  <CmsLink
                    link={promo.link as CmsLinkData}
                    dark
                    size="sm"
                    arrow
                    className="relative mt-2 self-start"
                  />
                )}
              </div>
            )}

            {showMap && a?.mapEmbedQuery && (
              <iframe
                title={`Mapa: ${a.mapEmbedQuery}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(a.mapEmbedQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full border-0 grayscale"
              />
            )}
          </div>

          <ContactForm
            projectTypes={(forms.projectTypes ?? []).map((t) => t.label)}
            turnstileSiteKey={turnstileSiteKey()}
            success={{
              title: forms.contactSuccess?.title ?? 'Consulta enviada.',
              message: forms.contactSuccess?.message ?? '',
            }}
            privacyNote={forms.privacyNote}
          />
        </div>
      </div>
    </Section>
  )
}
