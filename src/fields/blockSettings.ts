import type { Field, GroupField } from 'payload'

/**
 * Ajustes comunes a todos los bloques: fondo, espaciado, ancla y visibilidad
 * por dispositivo (desktop / tablet / mobile).
 */
export const blockSettingsField: GroupField = {
  name: 'settings',
  label: 'Ajustes de la sección',
  type: 'group',
  admin: {
    description: 'Fondo, espaciado y en qué dispositivos se muestra.',
  },
  fields: [
    {
      name: 'hidden',
      label: 'Ocultar esta sección',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'La sección no se muestra en el sitio, pero se conserva para usarla después.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'background',
          label: 'Fondo',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Blanco', value: 'default' },
            { label: 'Gris claro', value: 'muted' },
            { label: 'Grafito (oscuro)', value: 'dark' },
            { label: 'Terracota', value: 'brand' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'spacing',
          label: 'Espaciado vertical',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Sin espacio', value: 'none' },
            { label: 'Chico', value: 'sm' },
            { label: 'Mediano', value: 'md' },
            { label: 'Grande', value: 'lg' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'anchor',
          label: 'Ancla (id)',
          type: 'text',
          admin: {
            width: '33%',
            description: 'Opcional. Permite enlazar a la sección con /pagina#ancla.',
          },
          validate: (value: string | null | undefined) =>
            !value || /^[a-z0-9-]+$/.test(value) || 'Solo minúsculas, números y guiones.',
        },
      ],
    },
    {
      name: 'hideOn',
      label: 'Ocultar en',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Desktop', value: 'desktop' },
      ],
    },
  ],
}

/** Campos de encabezado de sección reutilizables (antetítulo, título, bajada). */
export const sectionHeadingFields: Field[] = [
  { name: 'eyebrow', label: 'Antetítulo', type: 'text', localized: true },
  { name: 'title', label: 'Título', type: 'text', localized: true },
  { name: 'intro', label: 'Bajada', type: 'textarea', localized: true },
]
