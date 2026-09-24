import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { factsField, faqsField } from '@/fields/facts'
import { bulletListField, galleryField, specsField } from '@/fields/gallery'
import { defaultEditor } from '@/fields/richText'
import { orderField, slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'
import { previewPathFor } from '@/lib/preview'

export const ProductLines: CollectionConfig<'product-lines'> = {
  slug: 'product-lines',
  labels: { singular: 'Línea', plural: 'Líneas' },
  admin: {
    group: 'Catálogo',
    useAsTitle: 'name',
    defaultColumns: ['name', 'positioning', 'order', '_status', 'updatedAt'],
    description:
      'Líneas de aberturas (Herrero Económica, Herrero Reforzada, Modena). Cada una tiene su página en /lineas/…',
    livePreview: { url: ({ data }) => previewPathFor('product-lines', data?.slug as string) },
    preview: (doc) => previewPathFor('product-lines', doc?.slug as string),
  },
  defaultSort: 'order',
  defaultPopulate: {
    name: true,
    slug: true,
    positioning: true,
    tagline: true,
    shortDescription: true,
    heroImage: true,
    badge: true,
    cardHighlights: true,
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
                  name: 'positioning',
                  label: 'Etiqueta (posicionamiento)',
                  type: 'text',
                  localized: true,
                  admin: {
                    width: '50%',
                    description: 'Ej: "Económica", "Más elegida", "Alta gama".',
                  },
                },
                {
                  name: 'badge',
                  label: 'Destacar etiqueta en terracota',
                  type: 'checkbox',
                  admin: {
                    width: '50%',
                    description: 'Para la línea recomendada (ej: "Más elegida").',
                  },
                },
              ],
            },
            {
              name: 'tagline',
              label: 'Frase corta',
              type: 'text',
              required: true,
              localized: true,
              admin: { description: 'Ej: "La más pedida. Aguanta el uso de todos los días."' },
            },
            {
              name: 'shortDescription',
              label: 'Descripción corta (SEO y listados)',
              type: 'textarea',
              required: true,
              localized: true,
            },
            {
              name: 'introHeadline',
              label: 'Título de introducción',
              type: 'textarea',
              localized: true,
              admin: { description: 'Frase grande al inicio de la página de la línea.' },
            },
            {
              name: 'description',
              label: 'Texto de introducción',
              type: 'richText',
              editor: defaultEditor,
              localized: true,
            },
            factsField('facts', 'Datos destacados', 'Ej: "65 mm" → "Parantes". Máximo 4.'),
            {
              ...bulletListField('cardHighlights', 'Puntos para la tarjeta', 'Punto'),
              maxRows: 4,
              admin: {
                description: '3 puntos cortos que se muestran en la tarjeta de la línea (home).',
              },
            },
            {
              name: 'idealFor',
              label: 'Ideal para',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Imágenes',
          fields: [
            {
              name: 'heroImage',
              label: 'Imagen principal',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'applicationImage',
              label: 'Imagen de aplicaciones',
              type: 'upload',
              relationTo: 'media',
            },
            galleryField(),
          ],
        },
        {
          label: 'Características',
          fields: [
            {
              name: 'features',
              label: 'Beneficios clave',
              type: 'array',
              maxRows: 8,
              labels: { singular: 'Beneficio', plural: 'Beneficios' },
              fields: [
                { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
                { name: 'text', label: 'Texto', type: 'textarea', localized: true },
              ],
            },
            bulletListField('applications', 'Aplicaciones', 'Aplicación'),
            faqsField(),
          ],
        },
        {
          label: 'Información técnica',
          fields: [specsField('technicalSpecs')],
        },
        {
          label: 'Cotizador',
          description: 'Valores de referencia para el precio estimado del cotizador online.',
          fields: [
            {
              name: 'quote',
              label: false,
              type: 'group',
              fields: [
                {
                  name: 'pricePerM2',
                  label: 'Precio de referencia por m² (ARS)',
                  type: 'number',
                  min: 0,
                  admin: { description: 'Vacío = la línea no se ofrece en el cotizador.' },
                },
                {
                  name: 'glassOptions',
                  label: 'Opciones de vidrio',
                  type: 'array',
                  labels: { singular: 'Vidrio', plural: 'Vidrios' },
                  admin: {
                    description:
                      'El multiplicador ajusta el precio: 1 = sin recargo, 1.25 = +25 %.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'name',
                          label: 'Vidrio',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: { width: '60%' },
                        },
                        {
                          name: 'multiplier',
                          label: 'Multiplicador',
                          type: 'number',
                          required: true,
                          defaultValue: 1,
                          min: 0.1,
                          max: 10,
                          admin: { width: '40%', step: 0.05 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    slug('name'),
    orderField,
  ],
  hooks: revalidateCollectionHooks('product-lines', ['products', 'projects']),
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
}
