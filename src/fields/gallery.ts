import type { ArrayField } from 'payload'

export const galleryField = (overrides: Partial<ArrayField> = {}): ArrayField =>
  ({
    name: 'gallery',
    label: 'Galería',
    type: 'array',
    labels: { singular: 'Imagen', plural: 'Imágenes' },
    admin: {
      description: 'Arrastrá las filas para cambiar el orden de las imágenes.',
      initCollapsed: true,
    },
    fields: [
      { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media', required: true },
      { name: 'caption', label: 'Epígrafe', type: 'text', localized: true },
    ],
    ...overrides,
  }) as ArrayField

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
