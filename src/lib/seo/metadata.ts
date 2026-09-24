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
}: BuildArgs): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoDefaults(), getSiteSettings()])

  const finalTitle = meta?.title || title || seo.defaultTitle
  const finalDescription = meta?.description || description || seo.defaultDescription
  const ogImage =
    mediaUrl(meta?.image) ||
    mediaUrl(image) ||
    mediaUrl(seo.defaultImage) ||
    absoluteUrl('/brand/og-default.jpg')
  const canonical = meta?.canonicalURL || absoluteUrl(path)
  const noIndex = Boolean(meta?.noIndex || seo.noindexSite)
  const useTemplate = !absoluteTitle && !meta?.title && Boolean(title)
  const template = seo.titleTemplate || `%s | ${seo.siteName}`
  const fullTitle = useTemplate ? template.replace('%s', finalTitle) : finalTitle

  return {
    title: { absolute: fullTitle },
    description: finalDescription,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
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
