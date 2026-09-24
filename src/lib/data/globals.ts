import { cache } from 'react'

import type { Config } from '@/payload-types'
import { globalTag } from '@/lib/cache-tags'

import { cachedQuery } from './client'

type GlobalSlug = keyof Config['globals']

/**
 * Lee un global del CMS (cacheado y etiquetado).
 * Los globals se leen del lado del servidor con acceso total: nunca pasar el
 * objeto completo a componentes cliente si contiene datos internos (ej: emails de aviso).
 */
export const getGlobal = cache(
  async <S extends GlobalSlug>(slug: S, depth = 1): Promise<Config['globals'][S]> =>
    cachedQuery(
      [`global`, slug, String(depth)],
      [globalTag(slug)],
      async ({ payload, draft }) =>
        (await payload.findGlobal({
          slug,
          depth,
          draft: draft && slug === 'homepage',
          overrideAccess: true,
        })) as Config['globals'][S],
    ),
)

export const getSiteSettings = () => getGlobal('site-settings')
export const getHeader = () => getGlobal('header', 1)
export const getFooter = () => getGlobal('footer', 1)
export const getSeoDefaults = () => getGlobal('seo-defaults')
export const getHomepage = () => getGlobal('homepage', 2)
export const getArchivePages = () => getGlobal('archive-pages', 1)
export const getAdvisor = () => getGlobal('advisor', 1)
export const getFormsSettings = () => getGlobal('forms-settings', 1)
export const getAnalyticsSettings = () => getGlobal('analytics', 0)
