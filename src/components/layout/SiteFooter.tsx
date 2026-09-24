import Link from 'next/link'

import { TrackedAnchor } from '@/components/analytics/TrackedAnchor'
import { CmsLink } from '@/components/cms/CmsLink'
import { buttonVariants } from '@/components/ui/button-variants'
import { BrandLogo, DoorShape } from '@/components/ui/Brand'
import { cn } from '@/lib/cn'
import { getFooter, getSiteSettings } from '@/lib/data/globals'
import type { CmsLink as CmsLinkData } from '@/lib/links'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

/** Franja final terracota ("¿Tenés una obra o una reforma?"). Se oculta con [data-hide-footer-cta]. */
async function FooterCta() {
  const [footer, settings] = await Promise.all([getFooter(), getSiteSettings()])
  const cta = footer.cta
  if (!cta?.enabled || !cta.title) return null
  const wa = cta.showWhatsapp ? whatsappUrl(getWhatsAppConfig(settings)) : null

  return (
    <section
      className="footer-cta on-dark relative overflow-hidden bg-brand px-gutter py-[clamp(4.5rem,10vw,9.375rem)] text-white"
      aria-label={cta.title}
    >
      <DoorShape className="-top-[20%] -left-[6%] w-[clamp(300px,42vw,640px)] text-white/8" />
      <div className="relative mx-auto flex max-w-site flex-col items-start gap-[30px]">
        <h2 className="max-w-[13ch] text-[clamp(2.25rem,1.2rem+4.8vw,5.75rem)] leading-[0.98] tracking-[-0.03em]">
          {cta.title}
        </h2>
        {cta.text && <p className="max-w-[40ch] text-lead font-normal text-white/85">{cta.text}</p>}
        <div className="flex w-full flex-wrap gap-3">
          {(cta.links ?? []).map((row) => (
            <CmsLink
              key={row.id}
              link={row.link as CmsLinkData}
              variant="light"
              size="lg"
              arrow
              className="flex-[1_1_15rem] justify-between sm:flex-none sm:justify-start"
            />
          ))}
          {wa && (
            <TrackedAnchor
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              event="whatsapp_click"
              params={{ location: 'footer_cta' }}
              className={cn(
                buttonVariants({ variant: 'outline-light', size: 'lg' }),
                'flex-[1_1_15rem] justify-between border-white/60 sm:flex-none sm:justify-start',
              )}
            >
              WhatsApp <span aria-hidden="true">→</span>
            </TrackedAnchor>
          )}
        </div>
      </div>
    </section>
  )
}

export async function SiteFooter() {
  const [footer, settings] = await Promise.all([getFooter(), getSiteSettings()])
  const wa = whatsappUrl(getWhatsAppConfig(settings))
  const a = settings.address
  const copyright = (footer.copyright || `© {year} ${settings.brandName}`).replace(
    '{year}',
    String(new Date().getFullYear()),
  )

  return (
    <>
      <FooterCta />
      <footer className="on-dark relative overflow-hidden bg-ink px-gutter pt-[clamp(3.5rem,7vw,6rem)] pb-14 text-white">
        <DoorShape className="right-gutter -bottom-[32%] w-[clamp(180px,26vw,380px)] text-white/5" />
        <div className="relative mx-auto grid max-w-site grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-10">
          <div className="flex flex-col gap-[18px]">
            <Link href="/" aria-label={`${settings.brandName} — Inicio`} className="self-start">
              <BrandLogo />
            </Link>
            {footer.about && (
              <p className="max-w-[30ch] text-[0.84rem] leading-relaxed font-normal text-white/65">
                {footer.about}
              </p>
            )}
          </div>

          {(footer.navigation ?? []).map((col) => (
            <nav key={col.id} aria-label={col.title || 'Enlaces'}>
              <ul className="flex flex-col gap-3 text-label tracking-[0.18em] uppercase">
                {(col.links ?? []).map((l) => (
                  <li key={l.id}>
                    <CmsLink
                      link={l.link as CmsLinkData}
                      plain
                      className="text-white hover:text-brand-soft"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <address className="flex flex-col gap-2.5 text-[0.84rem] leading-relaxed font-normal text-white/65 not-italic">
            {a?.street && (
              <span>
                {a.street}
                <br />
                {[a.city, a.region].filter(Boolean).join(', ')}
              </span>
            )}
            {settings.phone && (
              <TrackedAnchor
                href={`tel:+${(settings.whatsapp?.number ?? settings.phone).replace(/\D/g, '')}`}
                event="phone_click"
                params={{ location: 'footer' }}
                className="text-white hover:text-brand-soft"
              >
                {settings.phone}
              </TrackedAnchor>
            )}
            {(settings.workingHours ?? []).map((h) => (
              <span key={h.id}>
                {h.days} · {h.hours}
              </span>
            ))}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="break-all text-white hover:text-brand-soft"
              >
                {settings.email}
              </a>
            )}
          </address>
        </div>

        <div className="relative mx-auto mt-[52px] flex max-w-site flex-wrap justify-between gap-3 border-t border-white/12 pt-[22px] text-[0.72rem] font-normal tracking-[0.06em] text-white/50">
          <span>{copyright}</span>
          {!!footer.legalLinks?.length && (
            <ul className="flex flex-wrap gap-x-5">
              {footer.legalLinks.map((l) => (
                <li key={l.id}>
                  <CmsLink link={l.link as CmsLinkData} plain className="hover:text-white" />
                </li>
              ))}
            </ul>
          )}
          {footer.bottomNote && <span>{footer.bottomNote}</span>}
        </div>
      </footer>

      {/* Barra fija mobile: WhatsApp + Presupuesto */}
      <MobileCtaBar whatsappHref={wa} show={settings.whatsapp?.showMobileBar !== false} />
      {/* Botón flotante desktop */}
      {wa && settings.whatsapp?.showFloating !== false && (
        <TrackedAnchor
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          event="whatsapp_click"
          params={{ location: 'floating' }}
          className={cn(
            buttonVariants({ variant: 'dark', size: 'sm' }),
            'floating-wa fixed right-6 bottom-6 z-40 hidden shadow-float md:inline-flex',
          )}
        >
          WhatsApp <span aria-hidden="true">→</span>
        </TrackedAnchor>
      )}
    </>
  )
}

function MobileCtaBar({ whatsappHref, show }: { whatsappHref: string | null; show: boolean }) {
  if (!show) return null
  return (
    <div
      data-mobile-cta-bar
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/12 bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {whatsappHref ? (
        <TrackedAnchor
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          event="whatsapp_click"
          params={{ location: 'mobile_bar' }}
          className="flex h-[62px] items-center justify-center text-eyebrow tracking-[0.18em] text-white uppercase"
        >
          WhatsApp
        </TrackedAnchor>
      ) : (
        <Link
          href="/contacto"
          className="flex h-[62px] items-center justify-center text-eyebrow tracking-[0.18em] text-white uppercase"
        >
          Contacto
        </Link>
      )}
      <Link
        href="/cotizador"
        className="flex h-[62px] items-center justify-center bg-brand text-eyebrow tracking-[0.18em] text-white uppercase"
      >
        Presupuesto
      </Link>
    </div>
  )
}
