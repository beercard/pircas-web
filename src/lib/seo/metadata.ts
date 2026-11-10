import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { getSeoDefaults, getSiteSettings } from '@/lib/data/globals'
import { absoluteUrl } from '@/lib/routes'

/** Grupo `meta` que agrega el plugin SEO a cada documento. */
export type DocMeta =
  | {
      title?: string | null
      description?: string | null
      image?: Media | number | null
      canonicalURL?: string | null
      noIndex?: boolean | null
    }
  | null
  | undefined

type BuildArgs = {
  /** Ruta de la página (para canonical y og:url). */
  path: string
  /** Título/descripcion por defecto del contenido (si el editor no cargó meta). */
  title?: string | null
  description?: string | null
  image?: Media | number | null
  meta?: DocMeta
  type?: 'website' | 'article'
  /** El título ya incluye la marca (no aplicar plantilla). */
  absoluteTitle?: boolean
  /** Página utilitaria o variante filtrada: no indexar (los enlaces se siguen). */
  noIndex?: boolean
  /** Canonical distinta de `path` (ej: un listado filtrado apunta a su categoría). */
  canonicalPath?: string
}

const mediaUrl = (m: Media | number | null | undefined): string | null => {
  if (!m || typeof m !== 'object') return null
  const og = m.sizes?.og?.url
  return absoluteUrl(og || m.url || '')
}

/** Construye la metadata de Next (title, description, canonical, OpenGraph, Twitter, robots). */
export async function buildMetadata({
  path,
  title,
  description,
  image,
  meta,
  type = 'website',
  absoluteTitle,
  noIndex: forceNoIndex,
  canonicalPath,
}: BuildArgs): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoDefaults(), getSiteSettings()])

  const finalTitle = meta?.title || title || seo.defaultTitle
  const finalDescription = meta?.description || description || seo.defaultDescription
  const ogImage =
    mediaUrl(meta?.image) ||
    mediaUrl(image) ||
    mediaUrl(seo.defaultImage) ||
    absoluteUrl('/brand/og-default.jpg')
  const canonical = meta?.canonicalURL || absoluteUrl(canonicalPath ?? path)
  const noIndex = Boolean(meta?.noIndex || seo.noindexSite || forceNoIndex)
  const template = seo.titleTemplate || `%s | ${seo.siteName}`
  const brand = seo.siteName || settings.brandName
  const branded = template.replace('%s', finalTitle)
  // La marca se agrega si el título no la tiene y el resultado no queda demasiado largo.
  const useTemplate =
    !absoluteTitle &&
    Boolean(meta?.title || title) &&
    !finalTitle.toLowerCase().includes(String(brand).toLowerCase()) &&
    (!meta?.title || branded.length <= 70)
  const fullTitle = useTemplate ? branded : finalTitle

  return {
    title: { absolute: fullTitle },
    description: finalDescription,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: !seo.noindexSite }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type,
      locale: 'es_AR',
      siteName: seo.siteName || settings.brandName,
      url: canonical,
      title: fullTitle,
      description: finalDescription,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDescription,
      images: ogImage ? [ogImage] : undefined,
      site: seo.twitterHandle || undefined,
    },
  }
}
