import type { CollectionConfig, Where } from 'payload'

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
    defaultColumns: ['name', 'parent', 'order', '_status'],
    description:
      'Ventanas, Puertas, Mamparas… Se usan como filtros del catálogo y de la tienda. Para una subcategoría (ej: Puertas → Módena), elegí la categoría principal.',
    preview: (doc) => previewPathFor('product-categories', doc?.slug as string),
  },
  defaultSort: 'order',
  defaultPopulate: { name: true, slug: true, parent: true },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, localized: true },
    {
      name: 'parent',
      label: 'Categoría principal',
      type: 'relationship',
      relationTo: 'product-categories',
      index: true,
      // Un solo nivel: la principal no puede ser a su vez una subcategoría ni ella misma.
      filterOptions: ({ id }): Where =>
        id
          ? { and: [{ parent: { exists: false } }, { id: { not_equals: id } }] }
          : { parent: { exists: false } },
      admin: {
        position: 'sidebar',
        description: 'Vacío = es una categoría principal. Ej: "Módena" → Puertas.',
      },
    },
    { name: 'description', label: 'Descripción', type: 'textarea', localized: true },
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
    slug('name'),
    orderField,
  ],
  hooks: revalidateCollectionHooks('product-categories', ['products']),
  versions: { drafts: true, maxPerDoc: 20 },
}
