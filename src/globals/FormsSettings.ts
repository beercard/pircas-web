import type { GlobalConfig } from 'payload'

import { authenticated, superAdminField } from '@/access'
import { revalidateGlobalHook } from '@/hooks/revalidate'

const successFields = (name: string, label: string, title: string, message: string) => ({
  name,
  label,
  type: 'group' as const,
  fields: [
    { name: 'title', label: 'Título', type: 'text' as const, localized: true, defaultValue: title },
    {
      name: 'message',
      label: 'Mensaje',
      type: 'textarea' as const,
      localized: true,
      defaultValue: message,
    },
  ],
})

export const FormsSettings: GlobalConfig = {
  slug: 'forms-settings',
  label: 'Formularios y cotizador',
  admin: {
    group: 'Configuración',
    description:
      'Opciones del cotizador, cálculo del precio estimado, mensajes y emails. Los precios por m² se editan en cada línea y producto (sección "Cotizador online").',
  },
  // Solo el panel lo lee vía API; el sitio lo lee del lado del servidor (los emails de aviso nunca se exponen).
  access: { read: authenticated, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Cotizador',
          fields: [
            {
              name: 'needs',
              label: 'Paso 1 — ¿Qué necesitás?',
              type: 'array',
              minRows: 2,
              maxRows: 6,
              labels: { singular: 'Opción', plural: 'Opciones' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      label: 'Título',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'description',
                      label: 'Descripción',
                      type: 'text',
                      localized: true,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'categories',
                      label: 'Productos a ofrecer (categorías)',
                      type: 'relationship',
                      relationTo: 'product-categories',
                      hasMany: true,
                      admin: {
                        width: '50%',
                        description: 'Vacío = todos los productos cotizables.',
                      },
                    },
                    {
                      name: 'presetProduct',
                      label: 'Producto preseleccionado',
                      type: 'relationship',
                      relationTo: 'products',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'projectTypes',
              label: 'Tipos de proyecto (cotizador y contacto)',
              type: 'array',
              minRows: 1,
              labels: { singular: 'Tipo', plural: 'Tipos' },
              fields: [
                { name: 'label', label: 'Texto', type: 'text', required: true, localized: true },
              ],
            },
            {
              name: 'visitLabel',
              label: 'Texto de la casilla de medición en obra',
              type: 'text',
              localized: true,
              defaultValue: 'Quiero medición en obra (Coronda y zona, +40 km)',
            },
            {
              name: 'pricing',
              label: 'Precio estimado',
              type: 'group',
              fields: [
                {
                  name: 'showPrices',
                  label: 'Mostrar precios estimados',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Si se desactiva, el cotizador arma la lista sin mostrar montos.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'minArea',
                      label: 'Superficie mínima a cobrar (m²)',
                      type: 'number',
                      defaultValue: 0.5,
                      min: 0,
                      admin: { width: '33%', step: 0.1 },
                    },
                    {
                      name: 'rounding',
                      label: 'Redondear a (ARS)',
                      type: 'number',
                      defaultValue: 1000,
                      min: 1,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'minDimension',
                      label: 'Medida mínima (cm)',
                      type: 'number',
                      defaultValue: 30,
                      min: 1,
                      admin: { width: '33%' },
                    },
                  ],
                },
                {
                  name: 'maxDimension',
                  label: 'Medida máxima (cm)',
                  type: 'number',
                  defaultValue: 600,
                  min: 50,
                },
                {
                  name: 'disclaimer',
                  label: 'Aclaración de precios',
                  type: 'textarea',
                  localized: true,
                  defaultValue:
                    'Valores de referencia sin instalación ni envío. Se ajustan según medidas en obra, herrajes y terminaciones.',
                },
              ],
            },
            {
              name: 'maxItems',
              label: 'Máximo de ítems por presupuesto',
              type: 'number',
              defaultValue: 20,
              min: 1,
              max: 50,
            },
            {
              name: 'privacyNote',
              label: 'Nota de privacidad (debajo de los formularios)',
              type: 'textarea',
              localized: true,
              defaultValue:
                'Usamos tus datos solo para responder tu consulta. No los compartimos con terceros.',
            },
          ],
        },
        {
          label: 'Mensajes de éxito',
          fields: [
            successFields(
              'quoteSuccess',
              'Cotización enviada',
              'Recibimos tu consulta.',
              'Un vendedor revisa tu lista y te contacta en menos de 24 horas hábiles para ajustar el presupuesto final. Si preferís, seguí ahora mismo por WhatsApp con el detalle ya cargado.',
            ),
            successFields(
              'contactSuccess',
              'Consulta enviada',
              'Consulta enviada.',
              'Te respondemos a la brevedad.',
            ),
          ],
        },
        {
          label: 'Emails',
          fields: [
            {
              name: 'notificationEmails',
              label: 'Enviar avisos de nuevas consultas a',
              type: 'array',
              labels: { singular: 'Destinatario', plural: 'Destinatarios' },
              access: { update: superAdminField },
              admin: {
                description:
                  'Se suman a LEADS_NOTIFICATION_EMAIL del servidor. Solo un super administrador puede modificarlos.',
              },
              fields: [{ name: 'email', label: 'Email', type: 'email', required: true }],
            },
            {
              name: 'customerConfirmation',
              label: 'Email de confirmación al cliente',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  label: 'Enviar confirmación',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'subject',
                  label: 'Asunto',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Recibimos tu consulta — Pircas Aberturas',
                },
                {
                  name: 'intro',
                  label: 'Texto principal',
                  type: 'textarea',
                  localized: true,
                  defaultValue:
                    'Gracias por escribirnos. Un vendedor revisa tu consulta y te responde a la brevedad.',
                },
                {
                  name: 'closing',
                  label: 'Cierre',
                  type: 'textarea',
                  localized: true,
                  defaultValue: 'Si necesitás una respuesta inmediata, escribinos por WhatsApp.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('forms-settings')] },
}
