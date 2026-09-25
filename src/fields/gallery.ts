import type { ArrayField, UploadField, Where } from 'payload'

/** Solo imágenes en los campos de foto (Medios también guarda PDFs). */
export const imagesOnly: Where = { mimeType: { contains: 'image' } }

/**
 * Galería: se eligen o suben varias fotos de una vez y se ordenan arrastrando.
 * El epígrafe de cada foto se edita en la propia foto (Fotos y archivos → Epígrafe).
 */
export const galleryField = (overrides: Partial<UploadField> = {}): UploadField =>
  ({
    name: 'gallery',
    label: 'Galería',
    type: 'upload',
    relationTo: 'media',
    hasMany: true,
    filterOptions: imagesOnly,
    admin: {
      description:
        'Elegí o subí varias fotos a la vez (podés arrastrarlas desde tu computadora). Arrastrá para cambiar el orden.',
      isSortable: true,
    },
    ...overrides,
  }) as UploadField

/** Campo de una foto con sugerencia de formato. */
export const imageField = ({
  name,
  label,
  required,
  hint = 'Foto horizontal, idealmente de 1600 px de ancho o más.',
  listThumbnail,
}: {
  name: string
  label: string
  required?: boolean
  hint?: string
  /** Muestra la foto como miniatura en la columna del listado. */
  listThumbnail?: boolean
}): UploadField => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  required,
  filterOptions: imagesOnly,
  admin: {
    description: hint,
    ...(listThumbnail
      ? { components: { Cell: '@/components/admin/ThumbnailCell#ThumbnailCell' } }
      : {}),
  },
})

/** Lista simple de textos (beneficios, aplicaciones, materiales, etc.). */
export const bulletListField = (name: string, label: string, singular = 'Ítem'): ArrayField => ({
  name,
  label,
  type: 'array',
  labels: { singular, plural: label },
  fields: [{ name: 'text', label: 'Texto', type: 'text', required: true, localized: true }],
})

/** Tabla de especificaciones técnicas característica / valor, agrupable. */
export const specsField = (
  name = 'technicalSpecifications',
  label = 'Especificaciones técnicas',
): ArrayField => ({
  name,
  label,
  type: 'array',
  labels: { singular: 'Especificación', plural: 'Especificaciones' },
  admin: {
    description: 'Ej: "Espesor de vidrio" → "4 mm". Se muestra como tabla (acordeón en mobile).',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          label: 'Característica',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '40%' },
        },
        {
          name: 'value',
          label: 'Valor',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '40%' },
        },
        {
          name: 'group',
          label: 'Grupo',
          type: 'text',
          localized: true,
          admin: { width: '20%', description: 'Opcional (ej: Vidrio).' },
        },
      ],
    },
  ],
})
