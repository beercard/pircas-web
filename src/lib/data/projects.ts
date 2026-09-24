import type { Where } from 'payload'
import { cache } from 'react'

import type { Project, ProjectCategory } from '@/payload-types'
import { collectionTag } from '@/lib/cache-tags'

import { cachedQuery, readOptions } from './client'

const TAGS = [
  collectionTag('projects'),
  collectionTag('project-categories'),
  collectionTag('products'),
]

export const getProjectCategories = cache(async (): Promise<ProjectCategory[]> =>
  cachedQuery(
    ['project-categories'],
    [collectionTag('project-categories')],
    async ({ payload }) => {
      const { docs } = await payload.find({
        collection: 'project-categories',
        sort: 'order',
        depth: 0,
        limit: 50,
        overrideAccess: false,
      })
      return docs
    },
  ),
)

export type ProjectFilters = {
  category?: string // slug
  featured?: boolean
  ids?: number[]
  excludeId?: number
  productId?: number
  limit?: number
  sort?: 'order' | '-createdAt'
}

export const getProjects = cache(async (filters: ProjectFilters = {}): Promise<Project[]> =>
  cachedQuery(['projects', JSON.stringify(filters)], TAGS, async ({ payload, draft }) => {
    const and: Where[] = []
    if (filters.category) and.push({ 'category.slug': { equals: filters.category } })
    if (filters.featured) and.push({ featured: { equals: true } })
    if (filters.ids?.length) and.push({ id: { in: filters.ids } })
    if (filters.excludeId) and.push({ id: { not_equals: filters.excludeId } })
    if (filters.productId) and.push({ productsUsed: { contains: filters.productId } })
    const { docs } = await payload.find({
      collection: 'projects',
      where: and.length ? { and } : undefined,
      sort: filters.sort ?? 'order',
      depth: 1,
      limit: filters.limit ?? 100,
      ...readOptions(draft),
    })
    return docs
  }),
)

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> =>
  cachedQuery(['project', slug], TAGS, async ({ payload, draft }) => {
    const { docs } = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      ...readOptions(draft),
    })
    return docs[0] ?? null
  }),
)

export type ProjectPage = { docs: Project[]; totalDocs: number; totalPages: number; page: number }

/** Listado paginado para /proyectos (filtro por categoría). */
export const getProjectsPage = cache(
  async ({
    category,
    page = 1,
    limit = 9,
  }: {
    category?: string
    page?: number
    limit?: number
  }): Promise<ProjectPage> =>
    cachedQuery(
      ['projects-page', category ?? '', String(page), String(limit)],
      TAGS,
      async ({ payload, draft }) => {
        const res = await payload.find({
          collection: 'projects',
          where: category ? { 'category.slug': { equals: category } } : undefined,
          sort: 'order',
          depth: 1,
          page,
          limit,
          ...readOptions(draft),
        })
        return {
          docs: res.docs,
          totalDocs: res.totalDocs,
          totalPages: res.totalPages,
          page: res.page ?? page,
        }
      },
    ),
)
