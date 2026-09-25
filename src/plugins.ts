import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Block, Field, GroupField, Plugin } from 'payload'

import { authenticated, anyone } from '@/access'
import { revalidate } from '@/hooks/revalidate'
import { imagesOnly } from '@/fields/gallery'
import { CACHE_TAGS } from '@/lib/cache-tags'

/**
 * SEO por documento (título, descripción, imagen, canonical, noindex). Se gestiona por código,
 * no desde el panel: el grupo está oculto en el admin pero se conserva en la base y lo usa
 * buildMetadata. Si está vacío, el sitio genera título y descripción a partir del contenido.
 * (Reemplaza a @payloadcms/plugin-seo con los mismos campos: la base no cambia.)
 */
const SEO_COLLECTIONS = ['pages', 'products', 'product-lines', 'product-categories', 'projects']
const SEO_GLOBALS = ['homepage']

const seoMetaField: GroupField = {
  name: 'meta',
  label: 'SEO',
  type: 'group',
  admin: { hidden: true },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', localized: true },
    {
      name: 'canonicalURL',
      type: 'text',
      validate: (v: string | null | undefined) =>
        !v || /^https?:\/\//.test(v) || 'Debe ser una URL completa (https://…).',
    },
    { name: 'noIndex', type: 'checkbox', defaultValue: false },
  ],
}

const seoMetaPlugin: Plugin = (config) => ({
  ...config,
  collections: (config.collections ?? []).map((c) =>
    SEO_COLLECTIONS.includes(c.slug) ? { ...c, fields: [...c.fields, seoMetaField] } : c,
  ),
  globals: (config.globals ?? []).map((g) =>
    SEO_GLOBALS.includes(g.slug) ? { ...g, fields: [...g.fields, seoMetaField] } : g,
  ),
})

/**
 * Campos de foto: solo muestran imágenes al elegir de la biblioteca (Medios también guarda
 * PDFs). Se aplica a todos los campos de subida a "media" que no definan su propio filtro,
 * salvo los que aceptan documentos.
 */
const DOCUMENT_FIELDS = new Set(['datasheet', 'datasheetFile', 'file'])

function withImageFilter(fields: Field[]): Field[] {
  return fields.map((field) => {
    if (field.type === 'upload') {
      const isMediaImage =
        field.relationTo === 'media' && !field.filterOptions && !DOCUMENT_FIELDS.has(field.name)
      return isMediaImage ? { ...field, filterOptions: imagesOnly } : field
    }
    if (field.type === 'tabs')
      return {
        ...field,
        tabs: field.tabs.map((t) => ({ ...t, fields: withImageFilter(t.fields) })),
      }
    if (field.type === 'blocks')
      return {
        ...field,
        blocks: (field.blocks ?? []).map((b: Block) => ({
          ...b,
          fields: withImageFilter(b.fields),
        })),
      }
    if ('fields' in field && Array.isArray(field.fields))
      return { ...field, fields: withImageFilter(field.fields) } as Field
    return field
  })
}

const imageFieldsPlugin: Plugin = (config) => ({
  ...config,
  collections: (config.collections ?? []).map((c) => ({ ...c, fields: withImageFilter(c.fields) })),
  globals: (config.globals ?? []).map((g) => ({ ...g, fields: withImageFilter(g.fields) })),
})

/** Panel simple: sin la pestaña técnica "API" en los documentos. */
const simplePanelPlugin: Plugin = (config) => ({
  ...config,
  collections: (config.collections ?? []).map((c) => ({
    ...c,
    admin: { ...c.admin, hideAPIURL: true },
  })),
  globals: (config.globals ?? []).map((g) => ({ ...g, admin: { ...g.admin, hideAPIURL: true } })),
})

export const plugins: Plugin[] = [
  seoMetaPlugin,
  imageFieldsPlugin,
  simplePanelPlugin,
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
        // Se gestionan por código (como el resto del SEO): fuera del panel.
        hidden: true,
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
  // Vercel no tiene disco persistente: con BLOB_READ_WRITE_TOKEN los medios van a Vercel Blob.
  // Sin token (local, Docker) se siguen guardando en disco (MEDIA_DIR / public/media).
  vercelBlobStorage({
    enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    token: process.env.BLOB_READ_WRITE_TOKEN,
    // Mismo esquema de base con y sin Blob (las migraciones no dependen del entorno).
    alwaysInsertFields: true,
    collections: {
      // URL pública directa del CDN de Blob (los medios son públicos igual).
      media: { disablePayloadAccessControl: true },
    },
    // Sube directo desde el navegador: evita el límite de 4,5 MB por request de Vercel.
    clientUploads: true,
  }),
]
