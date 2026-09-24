import { slugField, type Field, type RowField, type TextField } from 'payload'

import { isValidSlug, slugify } from '@/lib/slugify'

/**
 * Slug único e indexado, generado automáticamente desde `useAsSlug`
 * (con soporte de acentos) y editable manualmente.
 */
export const slug = (useAsSlug = 'title'): RowField =>
  slugField({
    useAsSlug,
    slugify: ({ valueToSlugify }) =>
      typeof valueToSlugify === 'string' ? slugify(valueToSlugify) : undefined,
    overrides: (field) => {
      field.fields = field.fields.map((f: Field) => {
        if ('name' in f && f.name === 'slug') {
          const text = f as TextField
          return {
            ...text,
            label: 'URL (slug)',
            admin: {
              ...text.admin,
              description:
                'Parte final de la dirección web. Se genera sola a partir del nombre. Si la cambiás en un contenido publicado, creá una redirección desde la URL anterior.',
            },
            validate: (value: string | null | undefined) =>
              !value ||
              isValidSlug(value) ||
              'Solo minúsculas, números y guiones (ej: ventana-corrediza).',
          } as TextField
        }
        return f
      })
      return field
    },
  })

/** Orden manual de aparición en listados (menor = primero). */
export const orderField: Field = {
  name: 'order',
  label: 'Orden',
  type: 'number',
  defaultValue: 0,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Menor número = aparece primero.',
  },
}

export const featuredField: Field = {
  name: 'featured',
  label: 'Destacado',
  type: 'checkbox',
  defaultValue: false,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Se muestra en la home y en secciones de destacados.',
  },
}
