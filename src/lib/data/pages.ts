import { cache } from 'react'

import type { Page } from '@/payload-types'
import { collectionTag } from '@/lib/cache-tags'

import { cachedQuery, readOptions } from './client'

export const getPageBySlug = cache(async (slug: string): Promise<Page | null> =>
  cachedQuery(['page', slug], [collectionTag('pages')], async ({ payload, draft }) => {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      ...readOptions(draft),
    })
    return docs[0] ?? null
  }),
)
