import type { Where } from 'payload'
import { cache } from 'react'

import type { Product, ProductCategory, ProductLine } from '@/payload-types'
import { collectionTag } from '@/lib/cache-tags'

import { cachedQuery, readOptions } from './client'

const PRODUCT_TAGS = [
  collectionTag('products'),
  collectionTag('product-lines'),
  collectionTag('product-categories'),
]

export const getProductLines = cache(async (ids?: number[]): Promise<ProductLine[]> =>
  cachedQuery(
    ['lines', JSON.stringify(ids ?? [])],
    [collectionTag('product-lines')],
    async ({ payload, draft }) => {
      const { docs } = await payload.find({
        collection: 'product-lines',
        where: ids?.length ? { id: { in: ids } } : undefined,
        sort: 'order',
        depth: 1,
        limit: 50,
        ...readOptions(draft),
      })
      return docs
    },
  ),
)

export const getProductLineBySlug = cache(async (slug: string): Promise<ProductLine | null> =>
  cachedQuery(['line', slug], [collectionTag('product-lines')], async ({ payload, draft }) => {
    const { docs } = await payload.find({
      collection: 'product-lines',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      ...readOptions(draft),
    })
    return docs[0] ?? null
  }),
)

export const getProductCategories = cache(async (ids?: number[]): Promise<ProductCategory[]> =>
  cachedQuery(
    ['categories', JSON.stringify(ids ?? [])],
    [collectionTag('product-categories')],
    async ({ payload, draft }) => {
      const { docs } = await payload.find({
        collection: 'product-categories',
        where: ids?.length ? { id: { in: ids } } : undefined,
        sort: 'order',
        depth: 1,
        limit: 50,
        ...readOptions(draft),
      })
      return docs
    },
  ),
)

export type ProductFilters = {
  category?: string // slug
  line?: string // slug
  search?: string
  featured?: boolean
  categoryId?: number
  lineId?: number
  ids?: number[]
  excludeId?: number
  limit?: number
}

export const getProducts = cache(async (filters: ProductFilters = {}): Promise<Product[]> =>
  cachedQuery(['products', JSON.stringify(filters)], PRODUCT_TAGS, async ({ payload, draft }) => {
    const and: Where[] = []
    if (filters.category) and.push({ 'category.slug': { equals: filters.category } })
    if (filters.line) and.push({ 'line.slug': { equals: filters.line } })
    if (filters.categoryId) and.push({ category: { equals: filters.categoryId } })
    if (filters.lineId) and.push({ line: { equals: filters.lineId } })
    if (filters.featured) and.push({ featured: { equals: true } })
    if (filters.ids?.length) and.push({ id: { in: filters.ids } })
    if (filters.excludeId) and.push({ id: { not_equals: filters.excludeId } })
    if (filters.search) {
      and.push({
        or: [{ name: { like: filters.search } }, { shortDescription: { like: filters.search } }],
      })
    }
    const { docs } = await payload.find({
      collection: 'products',
      where: and.length ? { and } : undefined,
      sort: 'order',
      depth: 1,
      limit: filters.limit ?? 100,
      ...readOptions(draft),
    })
    return docs
  }),
)

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> =>
  cachedQuery(['product', slug], PRODUCT_TAGS, async ({ payload, draft }) => {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      ...readOptions(draft),
    })
    return docs[0] ?? null
  }),
)
