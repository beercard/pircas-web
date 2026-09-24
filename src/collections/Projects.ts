import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { factsField } from '@/fields/facts'
import { galleryField } from '@/fields/gallery'
import { defaultEditor } from '@/fields/richText'
import { featuredField, orderField, slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'
import { previewPathFor } from '@/lib/preview'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  labels: { singular: 'Proyecto', plural: 'Proyectos' },
  admin: {
    group: 'Proyectos',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'featured', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'location', 'slug'],
    description: 'Obras realizadas (portfolio).',
    livePreview: { url: ({ data }) => previewPathFor('projects', data?.slug as string) },
    preview: (doc) => previewPathFor('projects', doc?.slug as string),
  },
  defaultSort: 'order',
  defaultPopulate: {
    title: true,
    slug: true,
    location: true,
    summary: true,
    coverImage: true,
    category: true,
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Información principal',
          fields: [
            { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Categorías (filtros)',
                  type: 'relationship',
                  relationTo: 'project-categories',
                  hasMany: true,
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'location',
                  label: 'Ubicación',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', description: 'Ej: Coronda, Santa Fe.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'year',
                  label: 'Año',
                  type: 'number',
                  min: 1990,
                  max: 2100,
                  admin: { width: '50%' },
                },
                {
                  name: 'openingsCount',
                  label: 'Cantidad de aberturas',
                  type: 'number',
                  min: 1,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'summary',
              label: 'Resumen',
              type: 'textarea',
              localized: true,
              admin: { description: 'Una o dos oraciones para tarjetas y SEO.' },
            },
            {
              name: 'introHeadline',
              label: 'Frase principal',
              type: 'textarea',
              localized: true,
              admin: { description: 'Ej: "Querían mucha luz sin pasar frío. Lo resolvimos así."' },
            },
            {
              name: 'description',
              label: 'Descripción',
              type: 'richText',
              editor: defaultEditor,
              localized: true,
            },
          ],
        },
        {
          label: 'Imágenes',
          fields: [
            {
              name: 'coverImage',
              label: 'Imagen de portada',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            galleryField(),
          ],
        },
        {
          label: 'Productos e información técnica',
          fields: [
            {
              name: 'line',
              label: 'Línea principal',
              type: 'relationship',
              relationTo: 'product-lines',
              index: true,
            },
            {
              name: 'productsUsed',
              label: 'Productos utilizados',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
            factsField('facts', 'Qué llevó (datos técnicos)', 'Ej: "4/9/4" → "DVH con cámara".'),
          ],
        },
      ],
    },
    slug('title'),
    featuredField,
    orderField,
  ],
  hooks: revalidateCollectionHooks('projects', ['products']),
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
}
