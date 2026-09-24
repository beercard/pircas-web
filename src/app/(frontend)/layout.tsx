import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import type { ReactNode } from 'react'

import '@/styles/globals.css'

import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts'
import { DraftModeBanner } from '@/components/layout/DraftModeBanner'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { JsonLd } from '@/components/seo/JsonLd'
import { isDraftMode } from '@/lib/data/client'
import { getSeoDefaults, getSiteSettings } from '@/lib/data/globals'
import { getSiteUrl } from '@/lib/routes'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-montserrat',
})

/**
 * Las páginas se renderizan en el servidor en cada request, leyendo el CMS a través
 * de la caché de datos etiquetada (ver lib/data/client.ts): el HTML siempre refleja lo
 * último publicado sin rebuild y el build no necesita acceso a la base de datos.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoDefaults(), getSiteSettings()])
  const favicon =
    settings.favicon && typeof settings.favicon === 'object' ? settings.favicon.url : null
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: seo.defaultTitle, template: seo.titleTemplate || `%s | ${seo.siteName}` },
    description: seo.defaultDescription,
    applicationName: seo.siteName,
    formatDetection: { telephone: false },
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    robots: seo.noindexSite ? { index: false, follow: false } : undefined,
  }
}

export const viewport: Viewport = {
  themeColor: '#26272b',
  width: 'device-width',
  initialScale: 1,
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [settings, seo, draft] = await Promise.all([
    getSiteSettings(),
    getSeoDefaults(),
    isDraftMode(),
  ])

  return (
    <html lang="es-AR" className={montserrat.variable}>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        >
          Saltar al contenido
        </a>
        {draft && <DraftModeBanner />}
        <SiteHeader />
        <main id="contenido" className="min-h-[60vh]">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={[organizationJsonLd(settings, seo), websiteJsonLd(seo)]} />
        <AnalyticsScripts />
      </body>
    </html>
  )
}
