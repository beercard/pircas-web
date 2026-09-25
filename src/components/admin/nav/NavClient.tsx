'use client'

import { Link, Logout, useNav, usePreferences } from '@payloadcms/ui'
import {
  BriefcaseBusiness,
  ExternalLink,
  House,
  Images,
  Inbox,
  LayoutTemplate,
  type LucideIcon,
  Package,
  Settings,
  X,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { PircasWordmark } from '../brand/PircasWordmark'
import type { NavIconName } from './sections'

export type ClientNavSection = {
  key: string
  label: string
  icon: NavIconName
  href: string
  items: { label: string; href: string }[]
  badge?: number
}

const ICONS: Record<NavIconName, LucideIcon> = {
  home: House,
  inbox: Inbox,
  package: Package,
  briefcase: BriefcaseBusiness,
  layout: LayoutTemplate,
  images: Images,
  settings: Settings,
}

const isActive = (pathname: string, href: string, exact = false) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

/** Hasta este ancho (tablet y celular) el menú es un cajón que se abre sobre la página. */
const DRAWER_QUERY = '(max-width: 1024px)'
const isDrawer = () => window.matchMedia(DRAWER_QUERY).matches

/**
 * Menú lateral del panel. Reutiliza el mecanismo de Payload (useNav + clases `nav`) para
 * abrir/cerrar en desktop y como cajón en mobile; el contenido es propio: tareas con ícono,
 * subítems solo en la sección activa y un contador de consultas nuevas.
 */
export function NavClient({
  sections,
  adminRoute,
  siteUrl,
  user,
}: {
  sections: ClientNavSection[]
  adminRoute: string
  siteUrl: string
  user: { name: string; role: string; initials: string }
}) {
  const pathname = usePathname()
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const { getPreference } = usePreferences()
  const drawerRef = useRef<HTMLElement>(null)

  // Payload cierra el menú en pantallas de hasta 1440 px. Como en Shopify, en notebooks y
  // monitores (desde 1025 px) queda abierto salvo que el usuario lo haya cerrado; en tablet y
  // celular sigue siendo un cajón.
  useEffect(() => {
    const laptop = window.matchMedia('(min-width: 1025px) and (max-width: 1440px)')
    let timer: ReturnType<typeof setTimeout> | undefined
    const apply = () => {
      if (!laptop.matches) return
      clearTimeout(timer)
      // Después del efecto de Payload que lo cierra al cambiar de tamaño.
      timer = setTimeout(async () => {
        const pref = (await getPreference('nav')) as { open?: boolean } | undefined
        setNavOpen(typeof pref?.open === 'boolean' ? pref.open : true)
      }, 0)
    }
    apply()
    laptop.addEventListener('change', apply)
    return () => {
      clearTimeout(timer)
      laptop.removeEventListener('change', apply)
    }
  }, [getPreference, setNavOpen])

  // Cajón (tablet y celular): se cierra al elegir una página. Payload solo lo hace hasta 768 px.
  useEffect(() => {
    if (isDrawer()) setNavOpen(false)
  }, [pathname, setNavOpen])

  // Con el cajón abierto: la página de atrás no se desplaza ni recibe el foco, Escape lo cierra
  // y al cerrarlo el foco vuelve al botón que lo abrió.
  useEffect(() => {
    // Antes de hidratar navOpen es la preferencia de desktop; Payload lo cierra enseguida.
    if (!hydrated || !navOpen || !isDrawer()) return
    const root = document.documentElement
    const page = document.querySelector<HTMLElement>('.template-default__wrap')
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    root.classList.add('pircas-nav-locked')
    page?.setAttribute('inert', '')
    document.addEventListener('keydown', onKeyDown)
    drawerRef.current?.focus({ preventScroll: true })
    return () => {
      root.classList.remove('pircas-nav-locked')
      page?.removeAttribute('inert')
      document.removeEventListener('keydown', onKeyDown)
      if (opener?.isConnected && !opener.closest('.pircas-nav'))
        opener.focus({ preventScroll: true })
    }
  }, [hydrated, navOpen, setNavOpen])

  const className = [
    'nav',
    'pircas-nav',
    navOpen && 'nav--nav-open',
    shouldAnimate && 'nav--nav-animate',
    hydrated && 'nav--nav-hydrated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <aside
        ref={drawerRef}
        className={className}
        inert={!navOpen ? true : undefined}
        aria-label="Menú"
        tabIndex={-1}
      >
        <div className="nav__scroll" ref={navRef}>
          <div className="pircas-nav__brand">
            <Link
              href={adminRoute}
              className="pircas-nav__brand-link"
              aria-label="Inicio del panel"
            >
              <PircasWordmark />
            </Link>
            {/* Cerrar el cajón en tablet y celular (en desktop se usa el botón del encabezado). */}
            <button
              type="button"
              className="pircas-nav__close"
              aria-label="Cerrar menú"
              onClick={() => setNavOpen(false)}
            >
              <X aria-hidden="true" size={22} />
            </button>
          </div>

          <nav className="pircas-nav__menu" aria-label="Menú del panel">
            <ul>
              {sections.map((s) => {
                const Icon = ICONS[s.icon]
                const home = s.key === 'home'
                const active = home
                  ? isActive(pathname, s.href, true)
                  : isActive(pathname, s.href) || s.items.some((i) => isActive(pathname, i.href))
                return (
                  <li key={s.key} className={active ? 'is-active' : undefined}>
                    <Link
                      href={s.href}
                      className="pircas-nav__item"
                      aria-current={active && !s.items.length ? 'page' : undefined}
                      prefetch={false}
                    >
                      <Icon aria-hidden="true" className="pircas-nav__icon" strokeWidth={1.75} />
                      <span className="pircas-nav__label">{s.label}</span>
                      {!!s.badge && (
                        <span className="pircas-nav__badge" aria-label={`${s.badge} nuevas`}>
                          {s.badge > 99 ? '99+' : s.badge}
                        </span>
                      )}
                    </Link>
                    {active && s.items.length > 1 && (
                      <ul className="pircas-nav__sub">
                        {s.items.map((i) => {
                          const current = isActive(pathname, i.href)
                          return (
                            <li key={i.href}>
                              <Link
                                href={i.href}
                                className="pircas-nav__subitem"
                                aria-current={current ? 'page' : undefined}
                                prefetch={false}
                              >
                                {i.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="pircas-nav__footer">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pircas-nav__item pircas-nav__item--site"
            >
              <ExternalLink aria-hidden="true" className="pircas-nav__icon" strokeWidth={1.75} />
              <span className="pircas-nav__label">Ver el sitio</span>
            </a>
            <div className="pircas-nav__user">
              <Link href={`${adminRoute}/account`} className="pircas-nav__user-link">
                <span className="pircas-nav__avatar" aria-hidden="true">
                  {user.initials}
                </span>
                <span className="pircas-nav__user-text">
                  <span className="pircas-nav__user-name">{user.name}</span>
                  <span className="pircas-nav__user-role">{user.role}</span>
                </span>
              </Link>
              <Logout />
            </div>
          </div>
        </div>
      </aside>
      {/* Fondo del cajón en tablet y celular: tocarlo cierra el menú. */}
      <div className="pircas-nav__backdrop" aria-hidden="true" onClick={() => setNavOpen(false)} />
    </>
  )
}
