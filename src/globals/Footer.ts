import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { linkArrayField, linkField } from '@/fields/link'
import { revalidateGlobalHook } from '@/hooks/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pie de página (footer)',
  admin: {
    group: 'Configuración',
    description:
      'Franja final de llamado a la acción, columnas de enlaces y copyright. Dirección, teléfono y horarios se toman de "Datos del negocio".',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'cta',
      label: 'Franja final (antes del footer)',
      type: 'group',
      admin: {
        description:
          'Se muestra en todas las páginas salvo en las que la desactiven (ej: Cotizador y Contacto).',
      },
      fields: [
        { name: 'enabled', label: 'Mostrar franja', type: 'checkbox', defaultValue: true },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: '¿Tenés una obra o una reforma?',
        },
        {
          name: 'text',
          label: 'Texto',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Mandanos las medidas o pasá por el local. Te pasamos precio sin compromiso.',
        },
        linkArrayField({ maxRows: 1 }),
        {
          name: 'showWhatsapp',
          label: 'Agregar botón de WhatsApp',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'about',
      label: 'Texto de presentación',
      type: 'textarea',
      localized: true,
      defaultValue: 'Aberturas de aluminio fabricadas e instaladas a medida. Coronda, Santa Fe.',
    },
    {
      name: 'navigation',
      label: 'Columnas de enlaces',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Columna', plural: 'Columnas' },
      fields: [
        {
          name: 'title',
          label: 'Título (opcional, solo para lectores de pantalla)',
          type: 'text',
          localized: true,
        },
        {
          name: 'links',
          label: 'Enlaces',
          type: 'array',
          labels: { singular: 'Enlace', plural: 'Enlaces' },
          fields: [linkField()],
        },
      ],
    },
    {
      name: 'copyright',
      label: 'Copyright',
      type: 'text',
      localized: true,
      admin: { description: 'Usá {year} para el año actual.' },
      defaultValue: '© {year} Pircas Aberturas · Aberturas de aluminio',
    },
    {
      name: 'bottomNote',
      label: 'Texto inferior derecho',
      type: 'text',
      localized: true,
      defaultValue: 'Coronda · Santa Fe · Argentina',
    },
    {
      name: 'legalLinks',
      label: 'Enlaces legales',
      type: 'array',
      maxRows: 4,
      fields: [linkField()],
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('footer')] },
}
