import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { getPayload, type CollectionSlug } from 'payload'

import { CACHE_TAGS } from '@/lib/cache-tags'
import { absoluteUrl, pathFor, ROUTES, type RoutableCollection } from '@/lib/routes'

export const dynamic = 'force-dynamic'

type Entry = MetadataRoute.Sitemap[number]

const COLLECTIONS: { slug: RoutableCollection & CollectionSlug; priority: number }[] = [
  { slug: 'pages', priority: 0.8 },
  { slug: 'product-lines', priority: 0.9 },
  { slug: 'products', priority: 0.8 },
  { slug: 'projects', priority: 0.6 },
]

/**
 * Sitemap dinámico: páginas, líneas, productos y proyectos PUBLICADOS y no marcados
 * como "ocultar de buscadores". Se regenera cuando cambia cualquier contenido.
 */
const buildSitemap = unstable_cache(
  async (): Promise<Entry[]> => {
    const payload = await getPayload({ config: configPromise })
    const seo = await payload.findGlobal({ slug: 'seo-defaults', depth: 0, overrideAccess: true })
    if (seo.noindexSite) return []

    const now = new Date()
    const entries: Entry[] = [
      { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
      {
        url: absoluteUrl(ROUTES.products),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: absoluteUrl(ROUTES.lines),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: absoluteUrl(ROUTES.projects),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]

    for (const { slug, priority } of COLLECTIONS) {
      const { docs } = await payload.find({
        collection: slug,
        where: { _status: { equals: 'published' } },
        depth: 0,
        limit: 1000,
        pagination: false,
        draft: false,
        overrideAccess: true,
        select: { slug: true, updatedAt: true, meta: true },
      })
      for (const doc of docs as {
        slug?: string
        updatedAt: string
        meta?: { noIndex?: boolean | null }
      }[]) {
        if (!doc.slug || doc.meta?.noIndex) continue
        entries.push({
          url: absoluteUrl(pathFor(slug, doc.slug)),
          lastModified: new Date(doc.updatedAt),
          changeFrequency: 'monthly',
          priority,
        })
      }
    }
    return entries
  },
  ['sitemap'],
  { tags: [CACHE_TAGS.sitemap, CACHE_TAGS.all] },
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap()
}
