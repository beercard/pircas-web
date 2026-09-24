import type { CollectionConfig } from 'payload'

import { authenticated, anyone } from '@/access'
import { orderField, slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'

export const ProjectCategories: CollectionConfig<'project-categories'> = {
  slug: 'project-categories',
  labels: { singular: 'Categoría de proyecto', plural: 'Categorías de proyectos' },
  admin: {
    group: 'Proyectos',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    description: 'Filtros del portfolio: Ventanas, Puertas, Mamparas, Modena, Herrero…',
  },
  defaultSort: 'order',
  defaultPopulate: { name: true, slug: true },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, localized: true },
    slug('name'),
    orderField,
  ],
  hooks: revalidateCollectionHooks('project-categories', ['projects']),
}
