import type { GlobalConfig } from 'payload'

import { authenticated, superAdminField } from '@/access'
import { revalidateGlobalHook } from '@/hooks/revalidate'

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Tienda online',
  admin: {
    group: 'Configuración',
    description:
      'Descuentos, cuotas, medios de pago y envíos de la tienda. El precio de cada producto se carga en el producto ("Venta online").',
  },
  // El sitio lo lee del lado del servidor (los datos bancarios solo se muestran al cliente que compró).
  access: { read: authenticated, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'enabled',
              label: 'Tienda abierta',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Si la desactivás, se oculta la tienda y no se pueden hacer pedidos (el catálogo sigue visible).',
              },
            },
            {
              name: 'announcement',
              label: 'Cartel promocional',
              type: 'text',
              defaultValue: 'Hasta 20% off pagando por transferencia',
              admin: { description: 'Franja sobre la tienda. Vacío = no se muestra.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'transferDiscount',
                  label: '% descuento por transferencia / efectivo',
                  type: 'number',
                  min: 0,
                  max: 90,
                  defaultValue: 20,
                  admin: { width: '33%' },
                },
                {
                  name: 'mpDiscount',
                  label: '% descuento con Mercado Pago',
                  type: 'number',
                  min: 0,
                  max: 90,
                  defaultValue: 0,
                  admin: { width: '33%' },
                },
                {
                  name: 'installments',
                  label: 'Cuotas sin interés (Mercado Pago)',
                  type: 'number',
                  min: 1,
                  max: 24,
                  defaultValue: 3,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'thanksMessage',
              label: 'Mensaje de la página de gracias',
              type: 'textarea',
              defaultValue:
                'Recibimos tu pedido. Te escribimos por WhatsApp o email para coordinar el pago y la entrega.',
            },
          ],
        },
        {
          label: 'Medios de pago',
          fields: [
            {
              name: 'transfer',
              label: 'Transferencia bancaria',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Aceptar transferencia',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'holder', label: 'Titular', type: 'text', admin: { width: '50%' } },
                    { name: 'bank', label: 'Banco', type: 'text', admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'cbu', label: 'CBU / CVU', type: 'text', admin: { width: '34%' } },
                    { name: 'alias', label: 'Alias', type: 'text', admin: { width: '33%' } },
                    { name: 'cuit', label: 'CUIT', type: 'text', admin: { width: '33%' } },
                  ],
                },
                {
                  name: 'instructions',
                  label: 'Indicaciones',
                  type: 'textarea',
                  defaultValue:
                    'Transferí el total y envianos el comprobante por WhatsApp indicando tu número de pedido.',
                },
              ],
            },
            {
              name: 'mercadopago',
              label: 'Mercado Pago',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Aceptar Mercado Pago',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Con la cuenta conectada (la configura quien administra el sitio) el cliente paga online al terminar la compra. Sin conectar, el pedido queda registrado y le enviás el link de pago.',
                  },
                },
              ],
            },
            {
              name: 'cash',
              label: 'Efectivo',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Aceptar efectivo al retirar en el taller',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Envíos y retiro',
          fields: [
            {
              name: 'shippingMethods',
              label: 'Formas de entrega',
              labels: { singular: 'Forma de entrega', plural: 'Formas de entrega' },
              type: 'array',
              minRows: 1,
              admin: {
                initCollapsed: true,
                description: 'El cliente elige una al comprar. La primera es la predeterminada.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      label: 'Nombre',
                      type: 'text',
                      required: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'type',
                      label: 'Tipo',
                      type: 'select',
                      required: true,
                      defaultValue: 'delivery',
                      options: [
                        { label: 'Retiro en el taller', value: 'pickup' },
                        { label: 'Envío a domicilio', value: 'delivery' },
                      ],
                      admin: { width: '50%' },
                    },
                  ],
                },
                { name: 'description', label: 'Aclaración', type: 'text' },
                {
                  type: 'row',
                  admin: { condition: (_, s) => s?.type === 'delivery' },
                  fields: [
                    {
                      name: 'quoteLater',
                      label: 'Costo a coordinar (se informa después)',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { width: '34%' },
                    },
                    {
                      name: 'price',
                      label: 'Costo (ARS)',
                      type: 'number',
                      min: 0,
                      admin: { width: '33%', condition: (_, s) => !s?.quoteLater },
                    },
                    {
                      name: 'freeFrom',
                      label: 'Gratis desde (ARS)',
                      type: 'number',
                      min: 0,
                      admin: { width: '33%', condition: (_, s) => !s?.quoteLater },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Avisos',
          fields: [
            {
              name: 'notificationEmails',
              label: 'Emails que reciben cada pedido',
              labels: { singular: 'Email', plural: 'Emails' },
              type: 'array',
              access: { read: superAdminField, update: superAdminField },
              admin: {
                description:
                  'Si queda vacío se usan los destinatarios de las consultas (Formularios y cotizador).',
              },
              fields: [{ name: 'email', label: 'Email', type: 'email', required: true }],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('shop-settings')] },
}
