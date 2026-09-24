'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { buttonVariants } from '@/components/ui/button-variants'
import { BrandLogo, DoorShape } from '@/components/ui/Brand'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/cn'

import { MobileMenu } from './MobileMenu'
import { isActivePath, type NavItem, type SimpleLink } from './nav-types'

type Props = {
  nav: NavItem[]
  cta: SimpleLink
  whatsappHref: string | null
  showWhatsapp: boolean
  brandName: string
  logo: { url: string; width: number; height: number } | null
}

export function HeaderLogo({ brandName, logo }: Pick<Props, 'brandName' | 'logo'>) {
  if (logo) {
    return (
      <Image
        src={logo.url}
        alt={brandName}
        width={logo.width}
        height={logo.height}
        priority
        className="h-10 w-auto"
      />
    )
  }
  return <BrandLogo />
}

/**
 * Header sticky de 84 px. Sobre heros oscuros (páginas con `[data-over-hero]`) es
 * transparente con texto blanco hasta hacer scroll — resuelto con CSS `:has()` para
 * que no haya parpadeo en la carga. En desktop, un ítem puede abrir un mega menú.
 */
export function HeaderClient({ nav, cta, whatsappHref, showWhatsapp, brandName, logo }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [megaIndex, setMegaIndex] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaId = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cierra el mega menú al navegar (ajuste de estado durante el render, patrón recomendado por React).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMegaIndex(null)
  }

  useEffect(() => {
    if (megaIndex === null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMegaIndex(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [megaIndex])

  const openMega = (i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaIndex(i)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaIndex(null), 120)
  }

  const mega = megaIndex !== null ? nav[megaIndex]?.mega : null

  return (
    <header
      className="site-header sticky top-0 z-[60] h-header bg-paper/94 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-[14px] transition-[background-color,color,box-shadow] duration-350"
      data-scrolled={scrolled}
      data-mega={megaIndex !== null}
    >
      <div className="container-site flex h-full items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label={`${brandName} — Inicio`}>
          <HeaderLogo brandName={brandName} logo={logo} />
        </Link>

        <nav aria-label="Principal" className="hidden h-full xl:block">
          <ul className="flex h-full items-stretch gap-[clamp(0.875rem,2.2vw,2rem)] text-eyebrow tracking-[0.18em] uppercase">
            {nav.map((item, i) => {
              const active = isActivePath(pathname, item.href)
              const linkClass = cn(
                'flex h-full items-center gap-2 border-b hover:text-brand',
                active ? 'border-brand text-brand' : 'border-transparent',
              )
              return (
                <li
                  key={`${item.href}-${item.label}`}
                  className="flex"
                  onMouseEnter={item.mega ? () => openMega(i) : undefined}
                  onMouseLeave={item.mega ? scheduleClose : undefined}
                >
                  <Link
                    href={item.href}
                    className={linkClass}
                    aria-current={active ? 'page' : undefined}
                    target={item.newTab ? '_blank' : undefined}
                  >
                    {item.label}
                  </Link>
                  {item.mega && (
                    <button
                      type="button"
                      className="-ml-1 flex items-center px-1 text-[8px] opacity-70 hover:text-brand"
                      aria-expanded={megaIndex === i}
                      aria-controls={megaId}
                      aria-label={`Submenú de ${item.label}`}
                      onClick={() => (megaIndex === i ? setMegaIndex(null) : openMega(i))}
                    >
                      <span aria-hidden="true">▾</span>
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3.5">
          {showWhatsapp && whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden py-3.5 text-eyebrow tracking-[0.18em] uppercase hover:text-brand 2xl:inline"
              onClick={() => track('whatsapp_click', { location: 'header' })}
            >
              WhatsApp
            </a>
          )}
          <Link
            href={cta.href}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'sm' }),
              'hidden sm:inline-flex',
            )}
          >
            {cta.label}
          </Link>
          <MobileMenu
            nav={nav}
            cta={cta}
            whatsappHref={whatsappHref}
            brandName={brandName}
            pathname={pathname}
          />
        </div>
      </div>

      {/* Mega menú (desktop) */}
      {mega && (
        <div
          id={megaId}
          onMouseEnter={() => megaIndex !== null && openMega(megaIndex)}
          onMouseLeave={scheduleClose}
          className="absolute inset-x-0 top-full hidden border-t border-line bg-paper text-ink shadow-float xl:block"
        >
          <div className="container-site grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-12 pt-11 pb-12">
            {mega.columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3.5">
                <p
                  className={cn(
                    'text-[0.625rem] tracking-[0.3em] uppercase',
                    col.large ? 'text-brand' : 'text-muted',
                  )}
                >
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className={cn(
                          'hover:text-brand',
                          col.large ? 'text-lg tracking-[-0.01em]' : 'text-sm',
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {mega.promo && (
              <Link
                href={mega.promo.link.href}
                className="relative col-start-4 flex flex-col justify-between gap-6 overflow-hidden bg-ink p-7 text-white hover:bg-brand"
              >
                <DoorShape className="-right-5 -bottom-10 w-[120px] text-white/8" />
                <span className="relative text-base leading-snug">{mega.promo.text}</span>
                <span className="relative text-eyebrow tracking-[0.18em] uppercase">
                  {mega.promo.link.label} →
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
