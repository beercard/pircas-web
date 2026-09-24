import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { linkField } from '@/fields/link'
import { revalidateGlobalHook } from '@/hooks/revalidate'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Menú (header)',
  admin: {
    group: 'Configuración',
    description:
      'Menú principal. Un ítem puede tener un menú desplegable grande (columnas de enlaces + recuadro destacado). Arrastrá para reordenar.',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'navigation',
      label: 'Ítems del menú',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Ítem', plural: 'Ítems' },
      fields: [
        linkField(),
        {
          name: 'megaMenu',
          label: 'Menú desplegable (opcional)',
          type: 'group',
          admin: { description: 'Solo en desktop. En mobile se muestra el enlace principal.' },
          fields: [
            {
              name: 'columns',
              label: 'Columnas',
              type: 'array',
              maxRows: 3,
              labels: { singular: 'Columna', plural: 'Columnas' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Título',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '60%' },
                    },
                    {
                      name: 'large',
                      label: 'Enlaces grandes',
                      type: 'checkbox',
                      admin: { width: '40%', description: 'Ej: la columna de líneas.' },
                    },
                  ],
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
              name: 'promo',
              label: 'Recuadro destacado',
              type: 'group',
              fields: [
                { name: 'text', label: 'Texto', type: 'text', localized: true },
                linkField({ name: 'link', label: 'Enlace', requireLabel: false }),
              ],
            },
          ],
        },
      ],
    },
    linkField({ name: 'cta', label: 'Botón destacado (ej: Solicitar presupuesto)' }),
  ],
  hooks: { afterChange: [revalidateGlobalHook('header')] },
}
