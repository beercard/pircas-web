import type { CollectionConfig, Field } from 'payload'

import { authenticated, nobody, superAdmin } from '@/access'
import { exportLeadsEndpoint } from '@/lib/leads/export-endpoint'
import { LEAD_STATUSES, LEAD_TYPES } from '@/lib/options'

/** Campos que llegan del formulario: visibles pero no editables en el panel. */
const ro = (field: Field): Field =>
  ({ ...field, admin: { ...(field.admin ?? {}), readOnly: true } }) as Field

export const Leads: CollectionConfig<'leads'> = {
  slug: 'leads',
  labels: { singular: 'Consulta', plural: 'Consultas' },
  admin: {
    group: 'Consultas',
    useAsTitle: 'fullName',
    defaultColumns: [
      'fullName',
      'type',
      'email',
      'phone',
      'projectType',
      'product',
      'source',
      'status',
      'createdAt',
    ],
    listSearchableFields: ['fullName', 'email', 'phone', 'city', 'message'],
    description:
      'Consultas y pedidos de cotización recibidos desde el sitio. Cambiá el estado a medida que avanzás y agregá notas internas.',
    components: {
      beforeListTable: ['@/components/admin/ExportLeadsButton#ExportLeadsButton'],
    },
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-createdAt',
  access: {
    // Las consultas solo se crean desde los formularios públicos (servidor, con validación y antispam).
    create: nobody,
    read: authenticated,
    update: authenticated,
    delete: superAdmin,
  },
  endpoints: [exportLeadsEndpoint],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Estado',
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          options: LEAD_STATUSES.map((o) => ({ ...o })),
          admin: { width: '50%' },
        },
        ro({
          name: 'type',
          label: 'Tipo',
          type: 'select',
          required: true,
          defaultValue: 'contact',
          index: true,
          options: LEAD_TYPES.map((o) => ({ ...o })),
          admin: { width: '50%' },
        }),
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacto',
          fields: [
            ro({ name: 'fullName', label: 'Nombre completo', type: 'text', index: true }),
            {
              type: 'row',
              fields: [
                ro({
                  name: 'name',
                  label: 'Nombre',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                }),
                ro({ name: 'lastName', label: 'Apellido', type: 'text', admin: { width: '50%' } }),
              ],
            },
            {
              type: 'row',
              fields: [
                ro({
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  index: true,
                  admin: { width: '50%' },
                }),
                ro({
                  name: 'phone',
                  label: 'Teléfono / WhatsApp',
                  type: 'text',
                  admin: { width: '50%' },
                }),
              ],
            },
            {
              type: 'row',
              fields: [
                ro({ name: 'city', label: 'Ciudad', type: 'text', admin: { width: '50%' } }),
                ro({
                  name: 'projectType',
                  label: 'Tipo de proyecto',
                  type: 'text',
                  index: true,
                  admin: { width: '50%' },
                }),
              ],
            },
            {
              type: 'row',
              fields: [
                ro({
                  name: 'product',
                  label: 'Producto',
                  type: 'relationship',
                  relationTo: 'products',
                  admin: { width: '50%' },
                }),
                ro({
                  name: 'productLine',
                  label: 'Línea',
                  type: 'relationship',
                  relationTo: 'product-lines',
                  admin: { width: '50%' },
                }),
              ],
            },
            ro({ name: 'measurements', label: 'Medidas', type: 'textarea' }),
            ro({ name: 'message', label: 'Mensaje', type: 'textarea' }),
          ],
        },
        {
          label: 'Cotización',
          admin: { condition: (data) => data?.type === 'quotation' },
          fields: [
            {
              name: 'quote',
              label: false,
              type: 'group',
              fields: [
                ro({ name: 'need', label: '¿Qué necesita?', type: 'text' }),
                ro({
                  name: 'items',
                  label: 'Aberturas solicitadas',
                  type: 'array',
                  labels: { singular: 'Abertura', plural: 'Aberturas' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'product',
                          label: 'Producto',
                          type: 'relationship',
                          relationTo: 'products',
                          admin: { width: '40%' },
                        },
                        {
                          name: 'line',
                          label: 'Línea',
                          type: 'relationship',
                          relationTo: 'product-lines',
                          admin: { width: '35%' },
                        },
                        { name: 'glass', label: 'Vidrio', type: 'text', admin: { width: '25%' } },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'width',
                          label: 'Ancho (cm)',
                          type: 'number',
                          admin: { width: '20%' },
                        },
                        {
                          name: 'height',
                          label: 'Alto (cm)',
                          type: 'number',
                          admin: { width: '20%' },
                        },
                        {
                          name: 'side2',
                          label: 'Lado 2 (cm)',
                          type: 'number',
                          admin: { width: '20%' },
                        },
                        {
                          name: 'quantity',
                          label: 'Cantidad',
                          type: 'number',
                          admin: { width: '20%' },
                        },
                        {
                          name: 'estimate',
                          label: 'Estimado (ARS)',
                          type: 'number',
                          admin: { width: '20%' },
                        },
                      ],
                    },
                  ],
                }),
                {
                  type: 'row',
                  fields: [
                    ro({
                      name: 'estimatedTotal',
                      label: 'Total estimado (ARS)',
                      type: 'number',
                      admin: { width: '50%' },
                    }),
                    ro({
                      name: 'visitRequested',
                      label: 'Pidió medición en obra',
                      type: 'checkbox',
                      admin: { width: '50%' },
                    }),
                  ],
                },
                ro({
                  name: 'additionalInformation',
                  label: 'Información adicional',
                  type: 'textarea',
                }),
              ],
            },
          ],
        },
        {
          label: 'Origen',
          fields: [
            {
              type: 'row',
              fields: [
                ro({
                  name: 'source',
                  label: 'Formulario',
                  type: 'text',
                  index: true,
                  admin: { width: '50%' },
                }),
                ro({
                  name: 'landingPage',
                  label: 'Página de llegada',
                  type: 'text',
                  admin: { width: '50%' },
                }),
              ],
            },
            ro({ name: 'referrer', label: 'Referente', type: 'text' }),
            {
              name: 'utm',
              label: 'Campaña (UTM)',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: (['source', 'medium', 'campaign', 'content', 'term'] as const).map((k) =>
                    ro({ name: k, label: `utm_${k}`, type: 'text', admin: { width: '20%' } }),
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'internalNotes',
      label: 'Notas internas',
      type: 'array',
      labels: { singular: 'Nota', plural: 'Notas' },
      admin: { position: 'sidebar', initCollapsed: false },
      fields: [
        { name: 'note', label: 'Nota', type: 'textarea', required: true },
        { name: 'author', label: 'Autor', type: 'text', admin: { readOnly: true } },
        { name: 'date', label: 'Fecha', type: 'date', admin: { readOnly: true } },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (data.name !== undefined || data.lastName !== undefined) {
          data.fullName = [data.name, data.lastName].filter(Boolean).join(' ').trim()
        }
        // Firma y fecha automáticas en cada nota nueva.
        if (Array.isArray(data.internalNotes)) {
          const author = req.user ? req.user.name || req.user.email : 'Sistema'
          data.internalNotes = data.internalNotes.map((n: Record<string, unknown>) => ({
            ...n,
            author: n.author || author,
            date: n.date || new Date().toISOString(),
          }))
        }
        return data
      },
    ],
  },
  timestamps: true,
}
