import type { CollectionConfig } from 'payload'
import path from 'path'

import { anyone, authenticated } from '@/access'
import { revalidate } from '@/hooks/revalidate'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { altFromFilename } from '@/lib/media-alt'

/** Formato de salida de los tamaños generados: WebP de buena calidad. */
const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Foto o archivo', plural: 'Fotos y archivos' },
  admin: {
    group: 'Contenido',
    defaultColumns: ['filename', 'alt', 'caption', 'updatedAt'],
    listSearchableFields: ['filename', 'alt', 'caption'],
    description:
      'Arrastrá fotos desde tu computadora (podés subir varias a la vez). Se optimizan solas para cada dispositivo.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Qué muestra la foto (para Google y lectores de pantalla). Si lo dejás vacío, se completa solo con el nombre del archivo.',
      },
    },
    {
      name: 'caption',
      label: 'Epígrafe',
      type: 'text',
      localized: true,
      admin: { description: 'Opcional. Se muestra debajo de la foto en las galerías.' },
    },
    { name: 'credit', label: 'Crédito / autor', type: 'text' },
  ],
  upload: {
    // Carpeta de archivos subidos (volumen en Docker). Relativa al directorio de trabajo.
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'public/media'),
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'application/pdf',
    ],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumbnail',
    // Muestra la foto elegida dentro de cada campo de foto (más fácil de reconocer).
    displayPreview: true,
    // El original se limita a 2560 px de ancho para evitar archivos gigantes.
    resizeOptions: { width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 85 } },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre', formatOptions: webp },
      { name: 'card', width: 768, height: 576, position: 'centre', formatOptions: webp },
      { name: 'mobile', width: 828, withoutEnlargement: true, formatOptions: webp },
      { name: 'tablet', width: 1280, withoutEnlargement: true, formatOptions: webp },
      { name: 'desktop', width: 1920, withoutEnlargement: true, formatOptions: webp },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
  },
  hooks: {
    beforeChange: [
      // Texto alternativo automático si quedó vacío (subidas rápidas y carga masiva).
      ({ data, originalDoc }) => {
        if (!data.alt?.trim()) data.alt = altFromFilename(data.filename ?? originalDoc?.filename)
        return data
      },
    ],
    // Una imagen puede aparecer en cualquier página: invalida todo el contenido.
    afterChange: [
      ({ doc, req }) => {
        revalidate([CACHE_TAGS.all], req)
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        revalidate([CACHE_TAGS.all], req)
        return doc
      },
    ],
  },
}
