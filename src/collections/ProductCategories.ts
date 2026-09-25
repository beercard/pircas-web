import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { orderField, slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'
import { previewPathFor } from '@/lib/preview'

export const ProductCategories: CollectionConfig<'product-categories'> = {
  slug: 'product-categories',
  labels: { singular: 'Categoría de producto', plural: 'Categorías de productos' },
  admin: {
    group: 'Catálogo',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', '_status'],
    description: 'Ventanas, Puertas, Mamparas, Vidrios, Rejas… Se usan como filtros del catálogo.',
    preview: (doc) => previewPathFor('product-categories', doc?.slug as string),
  },
  defaultSort: 'order',
  defaultPopulate: { name: true, slug: true },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, localized: true },
    { name: 'description', label: 'Descripción', type: 'textarea', localized: true },
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
    slug('name'),
    orderField,
  ],
  hooks: revalidateCollectionHooks('product-categories', ['products']),
  versions: { drafts: true, maxPerDoc: 20 },
}
