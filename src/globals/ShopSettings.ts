import type { GlobalConfig } from 'payload'

import { authenticated, superAdminField } from '@/access'
import { revalidateGlobalHook } from '@/hooks/revalidate'

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Presupuesto online',
  admin: {
    group: 'Configuración',
    description:
      'Cómo se calcula el presupuesto automático de la web. El precio de cada producto (y de sus accesorios) se carga en el producto, en "Presupuesto online". Los precios no se muestran en la web: el cliente los ve en su presupuesto.',
  },
  // El sitio lo lee del lado del servidor.
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
              label: 'Presupuesto online activo',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Si lo desactivás, se oculta la tienda y no se pueden pedir presupuestos (el catálogo sigue visible).',
              },
            },
            {
              name: 'announcement',
              label: 'Cartel promocional',
              type: 'text',
              defaultValue: 'Presupuesto automático en el acto por WhatsApp',
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
                  name: 'installments',
                  label: 'Cuotas sin interés con tarjeta',
                  type: 'number',
                  min: 1,
                  max: 24,
                  defaultValue: 3,
                  admin: { width: '33%' },
                },
                {
                  name: 'validityDays',
                  label: 'Validez del presupuesto (días)',
                  type: 'number',
                  min: 1,
                  max: 90,
                  defaultValue: 7,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'thanksMessage',
              label: 'Mensaje junto al presupuesto',
              type: 'textarea',
              defaultValue:
                'Te escribimos por WhatsApp para resolver tus dudas, coordinar la entrega o la colocación.',
            },
          ],
        },
        {
          label: 'Avisos',
          fields: [
            {
              name: 'notificationEmails',
              label: 'Emails que reciben cada presupuesto',
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
