import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { factsField } from '@/fields/facts'
import { bulletListField, galleryField, imageField, specsField } from '@/fields/gallery'
import { defaultEditor } from '@/fields/richText'
import { featuredField, orderField, slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'
import { watermarkMedia } from '@/lib/media/watermark'
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
    shop: true,
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
    // --- Presupuesto online: precio oculto, colores y accesorios -------------------------
    {
      type: 'collapsible',
      label: 'Presupuesto online (tienda)',
      admin: {
        initCollapsed: false,
        description:
          'Activalo para que el producto aparezca en la Tienda con el botón "Agregar al presupuesto". El precio NO se muestra en la web: el cliente lo ve en el presupuesto que recibe al dejar su WhatsApp.',
      },
      fields: [
        {
          name: 'shop',
          label: false,
          type: 'group',
          fields: [
            {
              name: 'enabled',
              label: 'Ofrecer en el presupuesto online',
              type: 'checkbox',
              defaultValue: false,
              index: true,
            },
            {
              type: 'row',
              admin: { condition: (_, s) => Boolean(s?.enabled) },
              fields: [
                {
                  name: 'price',
                  label: 'Precio de lista (ARS, oculto)',
                  type: 'number',
                  min: 0,
                  index: true,
                  admin: {
                    width: '50%',
                    description:
                      'Sin IVA. Para productos de una sola medida. Si cargás "Medidas y precios" abajo, este precio no se usa.',
                  },
                  validate: (
                    value: number | null | undefined,
                    { siblingData }: { siblingData: { enabled?: boolean; variants?: unknown[] } },
                  ) =>
                    !siblingData?.enabled ||
                    (typeof value === 'number' && value > 0) ||
                    (siblingData.variants?.length ?? 0) > 0
                      ? true
                      : 'Ingresá el precio, o cargá las medidas con su precio.',
                },
                {
                  name: 'sku',
                  label: 'Código (SKU)',
                  type: 'text',
                  admin: { width: '50%', description: 'Opcional. Tu código interno.' },
                },
              ],
            },
            {
              type: 'row',
              admin: { condition: (_, s) => Boolean(s?.enabled) },
              fields: [
                {
                  name: 'measure',
                  label: 'Medida estándar',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: 'Ej: 1,50 × 1,10 m',
                    description:
                      'Para productos de una sola medida. Con "Medidas y precios" se completa sola.',
                  },
                },
                {
                  name: 'colors',
                  label: 'Colores',
                  type: 'select',
                  hasMany: true,
                  defaultValue: ['blanco', 'negro'],
                  options: [
                    { label: 'Blanco', value: 'blanco' },
                    { label: 'Negro', value: 'negro' },
                  ],
                  admin: { width: '50%', description: 'El cliente elige uno.' },
                },
              ],
            },
            {
              name: 'variants',
              label: 'Medidas y precios',
              labels: { singular: 'Medida', plural: 'Medidas' },
              type: 'array',
              admin: {
                condition: (_, s) => Boolean(s?.enabled),
                initCollapsed: true,
                description:
                  'Una fila por cada combinación que tiene precio propio: medida, color (si cambia el precio) y opción (por ejemplo "Reja 3/8" o "Con postigo"). Precios sin IVA: el IVA se suma en el presupuesto. El cliente elige la medida en la ficha del producto.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'measure',
                      label: 'Medida',
                      type: 'text',
                      required: true,
                      admin: { width: '30%', placeholder: 'Ej: 1,20 × 1,10 m' },
                    },
                    {
                      name: 'color',
                      label: 'Color',
                      type: 'select',
                      options: [
                        { label: 'Blanco', value: 'blanco' },
                        { label: 'Negro', value: 'negro' },
                      ],
                      admin: { width: '20%', description: 'Vacío = cualquiera.' },
                    },
                    {
                      name: 'option',
                      label: 'Opción',
                      type: 'text',
                      admin: { width: '25%', description: 'Vacío = sin opciones.' },
                    },
                    {
                      name: 'price',
                      label: 'Precio (ARS, sin IVA)',
                      type: 'number',
                      required: true,
                      min: 1,
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              admin: { condition: (_, s) => Boolean(s?.enabled && s?.variants?.length) },
              fields: [
                {
                  name: 'optionLabel',
                  label: 'Nombre de la opción',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: 'Ej: Reja, Postigo',
                    description: 'Título del selector de "Opción" en la ficha.',
                  },
                },
              ],
            },
            {
              name: 'choices',
              label: 'Otras elecciones (sin cambio de precio)',
              labels: { singular: 'Elección', plural: 'Elecciones' },
              type: 'array',
              maxRows: 4,
              admin: {
                condition: (_, s) => Boolean(s?.enabled),
                initCollapsed: true,
                description:
                  'Lo que el cliente elige y no cambia el precio. Ej: Giro → Derecha, Izquierda. Vidrio → Repartido, Entero.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      label: 'Título',
                      type: 'text',
                      required: true,
                      admin: { width: '35%' },
                    },
                    {
                      name: 'values',
                      label: 'Valores',
                      type: 'text',
                      hasMany: true,
                      required: true,
                      admin: { width: '65%', description: 'Escribí cada valor y Enter.' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'accessories',
              label: 'Accesorios opcionales',
              labels: { singular: 'Accesorio', plural: 'Accesorios' },
              type: 'array',
              admin: {
                condition: (_, s) => Boolean(s?.enabled),
                description:
                  'Para ventanas: celosía, mosquitero y reja. El cliente los suma si quiere; el precio se agrega al presupuesto.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'kind',
                      label: 'Accesorio',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Celosía', value: 'celosia' },
                        { label: 'Mosquitero', value: 'mosquitero' },
                        { label: 'Reja', value: 'reja' },
                      ],
                      admin: { width: '50%' },
                    },
                    {
                      name: 'price',
                      label: 'Precio (ARS, oculto)',
                      type: 'number',
                      required: true,
                      min: 0,
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              admin: { condition: (_, s) => Boolean(s?.enabled) },
              fields: [
                {
                  name: 'transferDiscount',
                  label: '% descuento por transferencia',
                  type: 'number',
                  min: 0,
                  max: 90,
                  admin: { width: '50%', description: 'Vacío = el general.' },
                },
                {
                  name: 'installments',
                  label: 'Cuotas sin interés',
                  type: 'number',
                  min: 1,
                  max: 24,
                  admin: { width: '50%', description: 'Vacío = las generales.' },
                },
              ],
            },
          ],
        },
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
  hooks: (() => {
    const hooks = revalidateCollectionHooks('products', [
      'product-lines',
      'product-categories',
      'projects',
    ])
    return {
      ...hooks,
      afterChange: [
        // Al publicar, las fotos del producto reciben la marca de agua (una sola vez).
        async ({ doc, req, context }) => {
          if (doc?._status !== 'published' || context?.skipWatermark) return doc
          const idOf = (v: unknown) =>
            typeof v === 'number'
              ? v
              : v && typeof v === 'object'
                ? (v as { id?: number }).id
                : null
          const ids = [doc.featuredImage, ...(doc.gallery ?? []), doc.applicationImage]
            .map(idOf)
            .filter((id): id is number => typeof id === 'number')
          if (ids.length) await watermarkMedia(req.payload, ids)
          return doc
        },
        ...(hooks.afterChange ?? []),
      ],
    }
  })(),
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
}
