import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { factsField } from '@/fields/facts'
import { galleryField, imageField } from '@/fields/gallery'
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
    defaultColumns: ['coverImage', 'title', 'category', 'location', '_status'],
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
    // --- Lo esencial -----------------------------------------------------------------------
    {
      name: 'title',
      label: 'Título del trabajo',
      type: 'text',
      required: true,
      localized: true,
      admin: { placeholder: 'Ej: Casa en Coronda · Ventanal DVH' },
    },
    {
      name: 'summary',
      label: 'Resumen',
      type: 'textarea',
      localized: true,
      admin: {
        placeholder: 'Qué hicimos, en una o dos oraciones.',
        description: 'Se muestra en tarjetas y listados.',
      },
    },
    {
      type: 'collapsible',
      label: 'Fotos',
      admin: { initCollapsed: false },
      fields: [
        imageField({
          name: 'coverImage',
          label: 'Foto de portada',
          required: true,
          listThumbnail: true,
          hint: 'La que se ve en la tarjeta del trabajo. Horizontal, idealmente 1600 px de ancho.',
        }),
        galleryField({ label: 'Fotos de la obra' }),
      ],
    },
    // --- Organización (columna derecha) ------------------------------------------------
    {
      name: 'category',
      label: 'Categorías',
      type: 'relationship',
      relationTo: 'project-categories',
      hasMany: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Para los filtros. "Obras" lo muestra en Obras y profesionales.',
      },
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      localized: true,
      admin: { position: 'sidebar', placeholder: 'Ej: Coronda, Santa Fe' },
    },
    {
      type: 'row',
      admin: { position: 'sidebar' },
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
          label: 'Aberturas',
          type: 'number',
          min: 1,
          admin: { width: '50%' },
        },
      ],
    },
    // --- Detalle (plegado) ---------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Historia de la obra',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'introHeadline',
          label: 'Frase principal',
          type: 'textarea',
          localized: true,
          admin: { placeholder: 'Ej: Querían mucha luz sin pasar frío. Lo resolvimos así.' },
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
      type: 'collapsible',
      label: 'Productos y datos técnicos',
      admin: { initCollapsed: true },
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
    slug('title'),
    featuredField,
    orderField,
  ],
  hooks: revalidateCollectionHooks('projects', ['products']),
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
}
