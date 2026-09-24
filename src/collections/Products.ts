import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { factsField } from '@/fields/facts'
import { bulletListField, galleryField, specsField } from '@/fields/gallery'
import { defaultEditor } from '@/fields/richText'
import { featuredField, orderField, slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'
import { previewPathFor } from '@/lib/preview'

export const Products: CollectionConfig<'products'> = {
  slug: 'products',
  labels: { singular: 'Producto', plural: 'Productos' },
  admin: {
    group: 'Catálogo',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'line', 'featured', '_status', 'updatedAt'],
    listSearchableFields: ['name', 'slug', 'shortDescription'],
    description: 'Ventanas, puertas, mamparas, vidrios, rejas y complementos.',
    livePreview: { url: ({ data }) => previewPathFor('products', data?.slug as string) },
    preview: (doc) => previewPathFor('products', doc?.slug as string),
  },
  defaultSort: 'order',
  defaultPopulate: {
    name: true,
    slug: true,
    shortDescription: true,
    featuredImage: true,
    category: true,
    line: true,
    audience: true,
    benefits: true,
    quote: true,
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
            { name: 'name', label: 'Nombre', type: 'text', required: true, localized: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Categoría',
                  type: 'relationship',
                  relationTo: 'product-categories',
                  required: true,
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'line',
                  label: 'Línea',
                  type: 'relationship',
                  relationTo: 'product-lines',
                  index: true,
                  admin: {
                    width: '50%',
                    description: 'Opcional (ej: vidrios o rejas no pertenecen a una línea).',
                  },
                },
              ],
            },
            {
              name: 'shortDescription',
              label: 'Descripción corta',
              type: 'textarea',
              required: true,
              localized: true,
              admin: { description: 'Una oración para tarjetas, listados y SEO.' },
            },
            {
              name: 'audience',
              label: 'Pensado para',
              type: 'text',
              localized: true,
              admin: {
                description: 'Ej: "Duchas lineales y bañeras". Se muestra en tarjetas grandes.',
              },
            },
            {
              name: 'description',
              label: 'Descripción completa',
              type: 'richText',
              editor: defaultEditor,
              localized: true,
            },
            factsField('facts', 'Datos destacados', 'Ej: "2–4" → "Hojas". Máximo 3.', 3),
            {
              ...bulletListField('configurations', 'Configuraciones disponibles', 'Configuración'),
              admin: {
                description:
                  'Ej: "2 hojas", "Con mosquitero", "Con reja". El cliente puede elegir una al consultar.',
              },
            },
          ],
        },
        {
          label: 'Imágenes',
          fields: [
            {
              name: 'featuredImage',
              label: 'Imagen principal',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            galleryField(),
          ],
        },
        {
          label: 'Características',
          fields: [
            bulletListField('benefits', 'Beneficios / ventajas', 'Beneficio'),
            {
              name: 'applicationsIntro',
              label: 'Dónde funciona mejor (texto)',
              type: 'textarea',
              localized: true,
            },
            bulletListField('applications', 'Aplicaciones', 'Aplicación'),
            {
              name: 'applicationImage',
              label: 'Imagen de aplicación',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Información técnica',
          description:
            'Cada "grupo" se muestra como un panel desplegable (ej: "Características técnicas", "Materiales", "Medidas y fabricación"). El panel "Entrega e instalación" es común a todos y se edita en Datos del negocio.',
          fields: [
            specsField('technicalSpecifications'),
            {
              name: 'datasheet',
              label: 'Ficha técnica (imagen/plano)',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Cotizador',
          description:
            'Cómo se calcula el precio estimado de este producto en el cotizador online.',
          fields: [
            {
              name: 'quote',
              label: false,
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Ofrecer en el cotizador',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'pricing',
                  label: 'Cálculo del precio',
                  type: 'radio',
                  defaultValue: 'line',
                  options: [
                    { label: 'Según la línea elegida (precio por m² de la línea)', value: 'line' },
                    { label: 'Precio propio por m² (ej: mamparas)', value: 'fixed' },
                  ],
                  admin: { condition: (_, s) => Boolean(s?.enabled) },
                },
                {
                  type: 'row',
                  admin: { condition: (_, s) => Boolean(s?.enabled) },
                  fields: [
                    {
                      name: 'pricePerM2',
                      label: 'Precio propio por m² (ARS)',
                      type: 'number',
                      min: 0,
                      admin: { width: '33%', condition: (_, s) => s?.pricing === 'fixed' },
                    },
                    {
                      name: 'multiplier',
                      label: 'Multiplicador del producto',
                      type: 'number',
                      defaultValue: 1,
                      min: 0.1,
                      max: 10,
                      admin: { width: '33%', step: 0.05, description: 'Ej: puertas 1.3 = +30 %.' },
                    },
                    {
                      name: 'secondSide',
                      label: 'Pide segundo lado (ej: mampara angular)',
                      type: 'checkbox',
                      admin: { width: '33%' },
                    },
                  ],
                },
                {
                  name: 'fixedDescription',
                  label: 'Descripción en el presupuesto',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Ej: "Modena · Paneles Klara". Solo para precio propio.',
                    condition: (_, s) => s?.pricing === 'fixed',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    slug('name'),
    featuredField,
    orderField,
  ],
  hooks: revalidateCollectionHooks('products', ['product-lines', 'product-categories', 'projects']),
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
}
