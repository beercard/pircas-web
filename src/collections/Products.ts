import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { factsField } from '@/fields/facts'
import { bulletListField, galleryField, imageField, specsField } from '@/fields/gallery'
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
    defaultColumns: ['featuredImage', 'name', 'category', 'line', '_status'],
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
    // --- Lo esencial (como en Tiendanube / Shopify) ------------------------------------
    {
      name: 'name',
      label: 'Nombre del producto',
      type: 'text',
      required: true,
      localized: true,
      admin: { placeholder: 'Ej: Ventana corrediza' },
    },
    {
      name: 'shortDescription',
      label: 'Descripción corta',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        placeholder: 'Una o dos oraciones: qué es y para qué sirve.',
        description: 'Se muestra en tarjetas, listados y buscadores.',
      },
    },
    {
      type: 'collapsible',
      label: 'Fotos',
      admin: { initCollapsed: false },
      fields: [
        imageField({
          name: 'featuredImage',
          label: 'Foto principal',
          required: true,
          listThumbnail: true,
          hint: 'La que se ve en tarjetas y listados. Horizontal, idealmente 1600 px de ancho.',
        }),
        galleryField({ label: 'Más fotos' }),
      ],
    },
    // --- Organización (columna derecha) ------------------------------------------------
    {
      name: 'category',
      label: 'Categoría',
      type: 'relationship',
      relationTo: 'product-categories',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'line',
      label: 'Línea',
      type: 'relationship',
      relationTo: 'product-lines',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Opcional (vidrios o rejas no pertenecen a una línea).',
      },
    },
    // --- Detalle (plegado) ---------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Descripción y detalles',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'description',
          label: 'Descripción completa',
          type: 'richText',
          editor: defaultEditor,
          localized: true,
        },
        {
          name: 'audience',
          label: 'Pensado para',
          type: 'text',
          localized: true,
          admin: { placeholder: 'Ej: Duchas lineales y bañeras' },
        },
        factsField('facts', 'Datos destacados', 'Ej: "2–4" → "Hojas". Máximo 3.', 3),
        {
          ...bulletListField('configurations', 'Configuraciones disponibles', 'Configuración'),
          admin: {
            description: 'Ej: "2 hojas", "Con mosquitero", "Con reja".',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Beneficios y usos',
      admin: { initCollapsed: true },
      fields: [
        bulletListField('benefits', 'Beneficios / ventajas', 'Beneficio'),
        {
          name: 'applicationsIntro',
          label: 'Dónde funciona mejor',
          type: 'textarea',
          localized: true,
        },
        bulletListField('applications', 'Aplicaciones', 'Aplicación'),
        imageField({ name: 'applicationImage', label: 'Foto de aplicación' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Ficha técnica',
      admin: {
        initCollapsed: true,
        description:
          'Cada "grupo" se muestra como un panel desplegable (ej: "Materiales", "Medidas"). "Entrega e instalación" es común a todos y se edita en Datos del negocio.',
      },
      fields: [
        specsField('technicalSpecifications'),
        {
          name: 'datasheet',
          label: 'Ficha técnica (imagen o plano)',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Cotizador online',
      admin: {
        initCollapsed: true,
        description: 'Cómo se calcula el precio estimado de este producto en el cotizador.',
      },
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
    slug('name'),
    featuredField,
    orderField,
  ],
  hooks: revalidateCollectionHooks('products', ['product-lines', 'product-categories', 'projects']),
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
}
