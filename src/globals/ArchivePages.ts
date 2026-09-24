import type { Field, GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { ALL_BLOCKS } from '@/blocks/configs'
import { revalidateGlobalHook } from '@/hooks/revalidate'

const archiveTab = (name: string, label: string, defaults: { title: string; intro: string }) => ({
  name,
  label,
  fields: [
    { name: 'eyebrow', label: 'Antetítulo', type: 'text', localized: true },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: defaults.title,
    },
    {
      name: 'intro',
      label: 'Bajada',
      type: 'textarea',
      localized: true,
      defaultValue: defaults.intro,
    },
    { name: 'image', label: 'Imagen de cabecera', type: 'upload', relationTo: 'media' },
    {
      name: 'after',
      label: 'Secciones debajo del listado',
      type: 'blocks',
      blocks: ALL_BLOCKS,
      admin: { initCollapsed: true, description: 'Ej: un llamado a cotizar.' },
    },
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      fields: [
        { name: 'title', label: 'Meta título', type: 'text', localized: true, maxLength: 70 },
        {
          name: 'description',
          label: 'Meta descripción',
          type: 'textarea',
          localized: true,
          maxLength: 170,
        },
        { name: 'image', label: 'Imagen para compartir', type: 'upload', relationTo: 'media' },
      ],
    },
  ] as Field[],
})

export const ArchivePages: GlobalConfig = {
  slug: 'archive-pages',
  dbName: 'archives',
  label: 'Páginas de listados',
  admin: {
    group: 'Contenido',
    description: 'Encabezados y SEO de /productos, /lineas y /proyectos.',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        archiveTab('products', 'Productos', {
          title: 'Productos',
          intro: 'Ventanas, puertas, mamparas y más, fabricados a medida en aluminio.',
        }),
        archiveTab('lines', 'Líneas', {
          title: 'Nuestras líneas',
          intro: 'Elegí según tu prioridad: precio, resistencia o máximo aislamiento.',
        }),
        archiveTab('projects', 'Proyectos', {
          title: 'Proyectos',
          intro: 'Algunas de las obras que realizamos en Coronda y la región.',
        }),
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('archive-pages')] },
}
