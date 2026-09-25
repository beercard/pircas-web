import type { CollectionConfig } from 'payload'
import path from 'path'

import { anyone, authenticated } from '@/access'
import { revalidate } from '@/hooks/revalidate'
import { CACHE_TAGS } from '@/lib/cache-tags'

/** Formato de salida de los tamaños generados: WebP de buena calidad. */
const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: {
    group: 'Contenido',
    defaultColumns: ['filename', 'alt', 'width', 'height', 'updatedAt'],
    description:
      'Biblioteca central de imágenes. Las imágenes grandes se reducen automáticamente y se generan versiones optimizadas (WebP) para cada dispositivo.',
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
      required: true,
      localized: true,
      admin: {
        description:
          'Describe la imagen para personas con lector de pantalla y para Google. Ej: "Ventana corrediza Modena en living".',
      },
    },
    { name: 'caption', label: 'Epígrafe', type: 'text', localized: true },
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
