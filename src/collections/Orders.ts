import { APIError, type CollectionConfig, type Field } from 'payload'

import { authenticated, nobody, superAdmin } from '@/access'
import { absoluteUrl, ROUTES } from '@/lib/routes'
import { notifyOrderStatus, shopToCustomerWhatsApp } from '@/lib/shop/notify'
import {
  ORDER_STATUSES,
  orderStatusLabel,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  paymentStatusLabel,
} from '@/lib/shop/options'

/** Datos que cargó el cliente: visibles pero no editables. */
const ro = (field: Field): Field =>
  ({ ...field, admin: { ...(field.admin ?? {}), readOnly: true } }) as Field

export const Orders: CollectionConfig<'orders'> = {
  slug: 'orders',
  labels: { singular: 'Pedido', plural: 'Pedidos' },
  admin: {
    group: 'Ventas',
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'customerName',
      'total',
      'paymentMethod',
      'paymentStatus',
      'status',
      'createdAt',
    ],
    listSearchableFields: ['orderNumber', 'customerName', 'customer.email', 'customer.phone'],
    description:
      'Pedidos de la tienda online. Cambiá el estado a medida que avanza: el cliente recibe un email y ve el seguimiento en su enlace.',
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-createdAt',
  access: {
    // Los pedidos solo se crean desde el checkout (servidor, con validación y precios recalculados).
    create: nobody,
    read: authenticated,
    update: authenticated,
    delete: superAdmin,
  },
  endpoints: [
    {
      // Enlaces del pedido para el panel (seguimiento del cliente y aviso por WhatsApp).
      path: '/:id/links',
      method: 'get',
      handler: async (req) => {
        if (!req.user) throw new APIError('No autorizado.', 401)
        const id = req.routeParams?.id
        if (typeof id !== 'string' || !/^\d+$/.test(id)) throw new APIError('Pedido inválido.', 400)
        const order = await req.payload.findByID({
          collection: 'orders',
          id,
          depth: 0,
          showHiddenFields: true,
          overrideAccess: true,
        })
        const token = (order as { accessToken?: string }).accessToken ?? ''
        const trackingUrl = absoluteUrl(`${ROUTES.order}/${order.orderNumber}?t=${token}`)
        return Response.json(
          { trackingUrl, whatsappUrl: shopToCustomerWhatsApp(order, trackingUrl) },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      },
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Estado del pedido',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          index: true,
          options: ORDER_STATUSES.map((o) => ({ ...o })),
          admin: { width: '50%' },
        },
        {
          name: 'paymentStatus',
          label: 'Estado del pago',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          index: true,
          options: PAYMENT_STATUSES.map((o) => ({ ...o })),
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'statusNote',
      label: 'Mensaje para el cliente (opcional)',
      type: 'textarea',
      admin: {
        description:
          'Se incluye en el email del cambio de estado y queda en el historial (después se vacía). Ej: "Podés pasar a retirar de 8 a 12 h".',
      },
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
              admin: { width: '40%' },
            },
            { name: 'variant', label: 'Color / medida', type: 'text', admin: { width: '20%' } },
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
        { name: 'listPrice', label: 'Precio de lista', type: 'number' },
      ],
    },
    {
      type: 'row',
      fields: [
        ro({ name: 'subtotal', label: 'Subtotal', type: 'number', admin: { width: '25%' } }),
        ro({
          name: 'discount',
          label: 'Descuento por medio de pago',
          type: 'number',
          admin: { width: '25%' },
        }),
        {
          name: 'shippingCost',
          label: 'Envío',
          type: 'number',
          min: 0,
          admin: { width: '25%', description: 'Editable si el envío era "a coordinar".' },
        },
        ro({ name: 'total', label: 'Total', type: 'number', admin: { width: '25%' } }),
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
                ro({ name: 'email', label: 'Email', type: 'email', admin: { width: '34%' } }),
                ro({
                  name: 'phone',
                  label: 'Teléfono / WhatsApp',
                  type: 'text',
                  admin: { width: '33%' },
                }),
                ro({
                  name: 'document',
                  label: 'DNI / CUIT',
                  type: 'text',
                  admin: { width: '33%' },
                }),
              ],
            },
          ],
        },
        ro({ name: 'notes', label: 'Comentarios del cliente', type: 'textarea' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Entrega',
      fields: [
        {
          name: 'shipping',
          label: false,
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                ro({
                  name: 'label',
                  label: 'Forma de entrega',
                  type: 'text',
                  admin: { width: '50%' },
                }),
                ro({
                  name: 'type',
                  label: 'Tipo',
                  type: 'select',
                  options: [
                    { label: 'Retiro en el taller', value: 'pickup' },
                    { label: 'Envío a domicilio', value: 'delivery' },
                  ],
                  admin: { width: '25%' },
                }),
                ro({
                  name: 'quoteLater',
                  label: 'Costo a coordinar',
                  type: 'checkbox',
                  admin: { width: '25%' },
                }),
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'address', label: 'Dirección', type: 'text', admin: { width: '40%' } },
                { name: 'city', label: 'Localidad', type: 'text', admin: { width: '25%' } },
                { name: 'province', label: 'Provincia', type: 'text', admin: { width: '20%' } },
                { name: 'zip', label: 'CP', type: 'text', admin: { width: '15%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'carrier',
                  label: 'Transporte / quién lo lleva',
                  type: 'text',
                  admin: { width: '34%' },
                },
                {
                  name: 'trackingCode',
                  label: 'Código de seguimiento',
                  type: 'text',
                  admin: { width: '33%' },
                },
                {
                  name: 'trackingUrl',
                  label: 'Enlace de seguimiento',
                  type: 'text',
                  admin: { width: '33%' },
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
      type: 'textarea',
      admin: { description: 'Solo las ve el equipo.' },
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
        { name: 'note', label: 'Mensaje', type: 'text' },
      ],
    },
    // --- Columna derecha -----------------------------------------------------------------
    ro({
      name: 'orderNumber',
      label: 'N.º de pedido',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    }),
    ro({
      name: 'paymentMethod',
      label: 'Medio de pago',
      type: 'select',
      required: true,
      options: PAYMENT_METHODS.map((o) => ({ ...o })),
      admin: { position: 'sidebar' },
    }),
    ro({
      name: 'paymentReference',
      label: 'Referencia del pago (Mercado Pago)',
      type: 'text',
      admin: { position: 'sidebar' },
    }),
    // Token del enlace de seguimiento: nunca se expone por la API.
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
      ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !originalDoc) return data
        const entries: { date: string; label: string; note?: string }[] = []
        const date = new Date().toISOString()
        const note = typeof data.statusNote === 'string' ? data.statusNote.trim() : ''
        // El mensaje se usa una sola vez (historial + email) y el campo queda vacío.
        req.context.statusNote = note
        data.statusNote = null
        if (data.status && data.status !== originalDoc.status)
          entries.push({
            date,
            label: `Pedido: ${orderStatusLabel(data.status)}`,
            note: note || undefined,
          })
        if (data.paymentStatus && data.paymentStatus !== originalDoc.paymentStatus)
          entries.push({ date, label: `Pago: ${paymentStatusLabel(data.paymentStatus)}` })
        if (entries.length)
          data.timeline = [...(data.timeline ?? originalDoc.timeline ?? []), ...entries]
        // El envío "a coordinar" se carga después: el total se recalcula.
        if (typeof data.shippingCost === 'number' && data.shippingCost !== originalDoc.shippingCost)
          data.total = (data.subtotal ?? originalDoc.subtotal ?? 0) + data.shippingCost
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || req.context?.skipOrderNotify) return doc
        const statusChanged = doc.status !== previousDoc?.status
        const paid = doc.paymentStatus === 'paid' && previousDoc?.paymentStatus !== 'paid'
        if (statusChanged || paid) {
          const note = typeof req.context.statusNote === 'string' ? req.context.statusNote : ''
          await notifyOrderStatus(req.payload, doc, { statusChanged, paid, note }, req)
        }
        return doc
      },
    ],
  },
}
