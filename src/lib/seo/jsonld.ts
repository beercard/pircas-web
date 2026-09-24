import type { Media, Product, SeoDefault, SiteSetting } from '@/payload-types'
import { absoluteUrl, getSiteUrl } from '@/lib/routes'

/** Generadores de datos estructurados (schema.org) a partir de datos del CMS. */

type Json = Record<string, unknown>

const img = (m: Media | number | null | undefined) =>
  m && typeof m === 'object' && m.url ? absoluteUrl(m.url) : undefined

const compact = <T extends Json>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as T

export function organizationJsonLd(settings: SiteSetting, seo: SeoDefault): Json {
  const siteUrl = getSiteUrl()
  const a = settings.address
  const sameAs = [settings.instagram, settings.facebook, settings.youtube, settings.tiktok].filter(
    Boolean,
  )
  return compact({
    '@context': 'https://schema.org',
    '@type': seo.organizationType || 'HomeAndConstructionBusiness',
    '@id': `${siteUrl}/#organization`,
    name: settings.brandName,
    legalName: settings.legalName,
    url: siteUrl,
    logo: img(settings.logo) ?? absoluteUrl('/brand/logo-pircas.png'),
    image: img(seo.defaultImage) ?? absoluteUrl('/brand/logo-pircas.png'),
    description: seo.defaultDescription,
    telephone: settings.whatsapp?.number ? `+${settings.whatsapp.number}` : settings.phone,
    email: settings.email,
    address: a?.street
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: a.street,
          addressLocality: a.city,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country || 'AR',
        })
      : undefined,
    hasMap: a?.mapsUrl || undefined,
    areaServed: settings.coverageArea,
    sameAs: sameAs.length ? sameAs : undefined,
  })
}

export function websiteJsonLd(seo: SeoDefault): Json {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: seo.siteName,
    url: siteUrl,
    inLanguage: 'es-AR',
    publisher: { '@id': `${siteUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/productos?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export type Crumb = { name: string; path: string }

export function breadcrumbJsonLd(items: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

/** Producto sin precio (se cotiza a medida): no se declara `offers` para no generar datos falsos. */
export function productJsonLd(product: Product, path: string, brandName: string): Json {
  const images = [
    img(product.featuredImage),
    ...(product.gallery ?? []).map((g) => img(g.image)),
  ].filter(Boolean)
  const category = typeof product.category === 'object' ? product.category?.name : undefined
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.meta?.description || product.shortDescription,
    image: images.length ? images : undefined,
    url: absoluteUrl(path),
    category,
    brand: { '@type': 'Brand', name: brandName },
    manufacturer: { '@id': `${getSiteUrl()}/#organization` },
    additionalProperty: product.technicalSpecifications?.length
      ? product.technicalSpecifications.map((s) => ({
          '@type': 'PropertyValue',
          name: s.label,
          value: s.value,
        }))
      : undefined,
  })
}

export function faqJsonLd(items: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  }
}
