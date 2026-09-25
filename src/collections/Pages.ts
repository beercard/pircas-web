import { APIError, type CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { ALL_BLOCKS } from '@/blocks/configs'
import { slug } from '@/fields/slug'
import { revalidateCollectionHooks } from '@/hooks/revalidate'
import { previewPathFor } from '@/lib/preview'
import { PROTECTED_PAGE_SLUGS, RESERVED_PAGE_SLUGS } from '@/lib/routes'

const isProtected = (s: unknown) =>
  typeof s === 'string' && (PROTECTED_PAGE_SLUGS as readonly string[]).includes(s)

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description:
      'Páginas armadas con bloques (Nosotros, Contacto, Cotizador y cualquier página nueva). La home se edita en Configuración > Home.',
    livePreview: { url: ({ data }) => previewPathFor('pages', data?.slug as string) },
    preview: (doc) => previewPathFor('pages', doc?.slug as string),
  },
  defaultPopulate: { title: true, slug: true },
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
          label: 'Contenido',
          fields: [
            { name: 'title', label: 'Título', type: 'text', required: true, localized: true },
            {
              name: 'layout',
              label: 'Secciones',
              labels: { singular: 'Sección', plural: 'Secciones' },
              type: 'blocks',
              blocks: ALL_BLOCKS,
              required: true,
              minRows: 1,
              admin: {
                initCollapsed: true,
                description:
                  'Agregá, reordená (arrastrando) u ocultá secciones. Usá un bloque "Hero" como primera sección.',
              },
            },
          ],
        },
      ],
    },
    slug('title'),
    {
      name: 'hideFooterCta',
      label: 'Ocultar la franja final "¿Tenés una obra…?"',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Útil en páginas que ya son un formulario (Cotizador, Contacto).',
      },
    },
  ],
  hooks: {
    ...revalidateCollectionHooks('pages'),
    beforeValidate: [
      ({ data }) => {
        if (data?.slug && (RESERVED_PAGE_SLUGS as readonly string[]).includes(data.slug)) {
          throw new APIError(
            `La URL "/${data.slug}" está reservada por el sitio. Elegí otra.`,
            400,
            undefined,
            true,
          )
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (
          operation === 'update' &&
          isProtected(originalDoc?.slug) &&
          data.slug !== originalDoc?.slug
        ) {
          throw new APIError(
            `La URL de la página "${originalDoc?.title}" no se puede cambiar: está enlazada desde todo el sitio.`,
            400,
            undefined,
            true,
          )
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: 'pages',
          id,
          depth: 0,
          req,
          draft: true,
        })
        if (isProtected(doc?.slug)) {
          throw new APIError(
            `La página "${doc.title}" no se puede eliminar: es parte del recorrido principal del sitio. Podés editar su contenido.`,
            400,
            undefined,
            true,
          )
        }
      },
    ],
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 50 },
}
