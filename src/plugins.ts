import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateDescription, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import type { Field, Plugin } from 'payload'

import { authenticated, anyone } from '@/access'
import { revalidate } from '@/hooks/revalidate'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { absoluteUrl, pathFor, type RoutableCollection } from '@/lib/routes'

type SeoDoc = {
  title?: string
  name?: string
  slug?: string
  shortDescription?: string
  summary?: string
}

const SEO_COLLECTIONS = ['pages', 'products', 'product-lines', 'product-categories', 'projects']

const generateTitle: GenerateTitle<SeoDoc> = ({ doc }) => doc?.title || doc?.name || ''

const generateDescription: GenerateDescription<SeoDoc> = ({ doc }) =>
  (doc?.shortDescription || doc?.summary || '').slice(0, 160)

const generateURL: GenerateURL<SeoDoc> = ({ doc, collectionConfig }) =>
  collectionConfig && doc?.slug
    ? absoluteUrl(pathFor(collectionConfig.slug as RoutableCollection, doc.slug))
    : absoluteUrl('/')

/** Campos SEO extra: canonical y exclusión de buscadores por documento. */
const extraSeoFields: Field[] = [
  {
    name: 'canonicalURL',
    label: 'URL canónica (opcional)',
    type: 'text',
    admin: {
      description:
        'Solo si este contenido está duplicado en otra URL. Vacío = se usa la URL propia de la página.',
    },
    validate: (v: string | null | undefined) =>
      !v || /^https?:\/\//.test(v) || 'Debe ser una URL completa (https://…).',
  },
  {
    name: 'noIndex',
    label: 'Ocultar de buscadores (noindex)',
    type: 'checkbox',
    defaultValue: false,
  },
]

export const plugins: Plugin[] = [
  seoPlugin({
    collections: SEO_COLLECTIONS,
    globals: ['homepage'],
    uploadsCollection: 'media',
    tabbedUI: true,
    generateTitle,
    generateDescription,
    generateURL,
    fields: ({ defaultFields }) => [...defaultFields, ...extraSeoFields],
  }),
  redirectsPlugin({
    collections: ['pages', 'products', 'product-lines', 'projects'],
    redirectTypes: ['301', '302'],
    redirectTypeFieldOverride: {
      label: 'Tipo de redirección',
      defaultValue: '301',
      admin: {
        description: '301 = permanente (recomendado para URLs viejas). 302 = temporal.',
      },
    },
    overrides: {
      labels: { singular: 'Redirección', plural: 'Redirecciones' },
      admin: {
        group: 'SEO',
        description:
          'Redirigí URLs viejas o cambiadas a su nueva dirección para no perder visitas ni posicionamiento. Los cambios se aplican en hasta 1 minuto.',
        defaultColumns: ['from', 'to', 'type', 'updatedAt'],
      },
      access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              label: 'Desde (URL vieja)',
              admin: { description: 'Ruta relativa que empieza con /. Ej: /ventanas-modena' },
              validate: (v: unknown) =>
                (typeof v === 'string' && /^\/[^\s]*$/.test(v)) ||
                'Debe empezar con / y no contener espacios.',
            } as Field
          }
          if ('name' in field && field.name === 'to') {
            return { ...field, label: 'Hacia' } as Field
          }
          return field
        }),
      hooks: {
        afterChange: [
          ({ doc, req }) => {
            revalidate([CACHE_TAGS.redirects], req)
            return doc
          },
        ],
      },
    },
  }),
]
