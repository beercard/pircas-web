import type { Field, GroupField } from 'payload'

export const LINKABLE_COLLECTIONS = ['pages', 'products', 'product-lines', 'projects'] as const

export const BUTTON_APPEARANCES = [
  { label: 'Principal (terracota)', value: 'primary' },
  { label: 'Secundario (grafito)', value: 'secondary' },
  { label: 'Contorno', value: 'outline' },
  { label: 'Texto', value: 'link' },
] as const

type LinkOptions = {
  name?: string
  label?: string
  /** Muestra el selector de estilo de botón. */
  appearance?: boolean
  /** Hace obligatorio el texto del enlace. */
  requireLabel?: boolean
  overrides?: Partial<GroupField>
}

/**
 * Enlace editable: a una página/producto/línea/proyecto del CMS, a una URL
 * (interna o externa) o directo a WhatsApp con mensaje predefinido.
 */
export const linkField = ({
  name = 'link',
  label = 'Enlace',
  appearance = false,
  requireLabel = true,
  overrides = {},
}: LinkOptions = {}): GroupField => {
  const fields: Field[] = [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Tipo de enlace',
          type: 'radio',
          defaultValue: 'custom',
          options: [
            { label: 'Contenido del sitio', value: 'reference' },
            { label: 'URL', value: 'custom' },
            { label: 'WhatsApp', value: 'whatsapp' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'newTab',
          label: 'Abrir en pestaña nueva',
          type: 'checkbox',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          label: 'Texto',
          type: 'text',
          localized: true,
          required: requireLabel,
          admin: { width: '50%' },
        },
        {
          name: 'reference',
          label: 'Contenido',
          type: 'relationship',
          relationTo: [...LINKABLE_COLLECTIONS],
          admin: {
            width: '50%',
            condition: (_, sibling) => sibling?.type === 'reference',
          },
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Ruta interna (/cotizador) o URL completa (https://…).',
            condition: (_, sibling) => sibling?.type === 'custom',
          },
        },
        {
          name: 'whatsappMessage',
          label: 'Mensaje de WhatsApp',
          type: 'text',
          localized: true,
          admin: {
            width: '50%',
            description: 'Opcional. Si queda vacío se usa el mensaje por defecto.',
            condition: (_, sibling) => sibling?.type === 'whatsapp',
          },
        },
      ],
    },
  ]

  if (appearance) {
    fields.push({
      name: 'appearance',
      label: 'Estilo',
      type: 'select',
      defaultValue: 'primary',
      options: BUTTON_APPEARANCES.map((a) => ({ ...a })),
    })
  }

  return {
    name,
    label,
    type: 'group',
    admin: { hideGutter: true },
    fields,
    ...overrides,
  }
}

/** Lista de botones (ej: CTAs del hero). */
export const linkArrayField = ({
  name = 'links',
  label = 'Botones',
  maxRows = 2,
}: { name?: string; label?: string; maxRows?: number } = {}): Field => ({
  name,
  label,
  type: 'array',
  maxRows,
  labels: { singular: 'Botón', plural: 'Botones' },
  fields: [linkField({ appearance: true })],
})
