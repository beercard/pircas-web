import { APIError, type CollectionConfig, type Field } from 'payload'

import { authenticated, nobody, superAdmin } from '@/access'
import { shopToCustomerWhatsApp } from '@/lib/shop/notify'
import { QUOTE_STATUSES, quoteStatusLabel } from '@/lib/shop/options'
import { quoteUrl } from '@/lib/shop/links'

/** Datos que cargó el cliente o calculó el sistema: visibles pero no editables. */
const ro = (field: Field): Field =>
  ({ ...field, admin: { ...(field.admin ?? {}), readOnly: true } }) as Field

/**
 * Presupuestos del sitio (slug "orders" por compatibilidad). Se crean solos cuando un
 * cliente arma su lista y deja su WhatsApp; el equipo lo contacta y marca cómo terminó.
 */
export const Orders: CollectionConfig<'orders'> = {
  slug: 'orders',
  labels: { singular: 'Presupuesto', plural: 'Presupuestos' },
  admin: {
    group: 'Ventas',
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'customerName',
      'customer.phone',
      'total',
      'status',
      'createdAt',
    ],
    listSearchableFields: ['orderNumber', 'customerName', 'customer.phone', 'customer.city'],
    description:
      'Presupuestos pedidos desde la web. Escribile al cliente por WhatsApp y cambiá el estado según cómo avance.',
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-createdAt',
  access: {
    // Solo se crean desde la web (servidor, con precios calculados ahí).
    create: nobody,
    read: authenticated,
    update: authenticated,
    delete: superAdmin,
  },
  endpoints: [
    {
      // Enlaces del presupuesto para el panel (ver como el cliente y escribirle por WhatsApp).
      path: '/:id/links',
      method: 'get',
      handler: async (req) => {
        if (!req.user) throw new APIError('No autorizado.', 401)
        const id = req.routeParams?.id
        if (typeof id !== 'string' || !/^\d+$/.test(id))
          throw new APIError('Presupuesto inválido.', 400)
        const order = await req.payload.findByID({
          collection: 'orders',
          id,
          depth: 0,
          showHiddenFields: true,
          overrideAccess: true,
        })
        const token = (order as { accessToken?: string }).accessToken ?? ''
        const trackingUrl = quoteUrl(order, token)
        return Response.json(
          { trackingUrl, whatsappUrl: shopToCustomerWhatsApp(order, trackingUrl) },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      },
    },
  ],
  fields: [
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: QUOTE_STATUSES.map((o) => ({ ...o })),
    },
    {
      name: 'actions',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/orders/OrderActions#OrderActions' } },
    },
    {
      name: 'items',
      label: 'Productos',
      labels: { singular: 'Producto', plural: 'Productos' },
      type: 'array',
      admin: { readOnly: true, initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              label: 'Producto',
              type: 'text',
              required: true,
              admin: { width: '35%' },
            },
            {
              name: 'variant',
              label: 'Color / medida / accesorios',
              type: 'text',
              admin: { width: '25%' },
            },
            {
              name: 'quantity',
              label: 'Cantidad',
              type: 'number',
              required: true,
              admin: { width: '10%' },
            },
            {
              name: 'unitPrice',
              label: 'Precio unitario',
              type: 'number',
              required: true,
              admin: { width: '15%' },
            },
            {
              name: 'subtotal',
              label: 'Subtotal',
              type: 'number',
              required: true,
              admin: { width: '15%' },
            },
          ],
        },
        { name: 'product', label: 'Ficha', type: 'relationship', relationTo: 'products' },
        { name: 'sku', label: 'Código', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        ro({ name: 'total', label: 'Total de lista', type: 'number', admin: { width: '25%' } }),
        ro({
          name: 'transferTotal',
          label: 'Con transferencia / efectivo',
          type: 'number',
          admin: { width: '25%' },
        }),
        ro({ name: 'installments', label: 'Cuotas', type: 'number', admin: { width: '25%' } }),
        ro({
          name: 'installmentAmount',
          label: 'Valor de la cuota',
          type: 'number',
          admin: { width: '25%' },
        }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Cliente',
      fields: [
        ro({ name: 'customerName', label: 'Nombre', type: 'text', required: true }),
        {
          name: 'customer',
          label: false,
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                ro({ name: 'phone', label: 'WhatsApp', type: 'text', admin: { width: '50%' } }),
                ro({ name: 'city', label: 'Localidad', type: 'text', admin: { width: '50%' } }),
              ],
            },
          ],
        },
        ro({ name: 'notes', label: 'Comentarios del cliente', type: 'textarea' }),
      ],
    },
    {
      name: 'internalNotes',
      label: 'Notas internas',
      type: 'textarea',
      admin: {
        description: 'Solo las ve el equipo. Ej: "Le mandé fotos, vuelve a escribir el lunes".',
      },
    },
    {
      name: 'timeline',
      label: 'Historial',
      labels: { singular: 'Movimiento', plural: 'Movimientos' },
      type: 'array',
      admin: { readOnly: true, initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'date',
              label: 'Fecha',
              type: 'date',
              admin: { width: '30%', date: { pickerAppearance: 'dayAndTime' } },
            },
            { name: 'label', label: 'Movimiento', type: 'text', admin: { width: '70%' } },
          ],
        },
        { name: 'note', label: 'Detalle', type: 'text' },
      ],
    },
    // --- Columna derecha -----------------------------------------------------------------
    ro({
      name: 'orderNumber',
      label: 'N.º de presupuesto',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    }),
    ro({
      name: 'whatsappSent',
      label: 'Enviado solo por WhatsApp',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'Se marca si la web se lo envió al cliente automáticamente (API de WhatsApp).',
      },
    }),
    ro({
      name: 'source',
      label: 'Origen (campaña / sitio)',
      type: 'text',
      admin: { position: 'sidebar' },
    }),
    // Token del enlace del presupuesto: nunca se expone por la API.
    {
      name: 'accessToken',
      type: 'text',
      required: true,
      index: true,
      hidden: true,
      access: { read: () => false },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation !== 'update' || !originalDoc) return data
        if (data.status && data.status !== originalDoc.status)
          data.timeline = [
            ...(data.timeline ?? originalDoc.timeline ?? []),
            { date: new Date().toISOString(), label: `Estado: ${quoteStatusLabel(data.status)}` },
          ]
        return data
      },
    ],
  },
}
