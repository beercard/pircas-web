import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobalHook } from '@/hooks/revalidate'
import { CACHE_TAGS } from '@/lib/cache-tags'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Datos del negocio',
  admin: {
    group: 'Configuración',
    description:
      'Datos de contacto, WhatsApp y redes. Se usan en todo el sitio (header, footer, botones, datos estructurados para Google).',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Marca',
          fields: [
            {
              name: 'brandName',
              label: 'Nombre de la marca',
              type: 'text',
              required: true,
              defaultValue: 'PIRCAS Aberturas',
            },
            { name: 'legalName', label: 'Razón social', type: 'text' },
            { name: 'tagline', label: 'Bajada de marca', type: 'text', localized: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  label: 'Logo (fondo claro)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '33%' },
                },
                {
                  name: 'logoLight',
                  label: 'Logo (fondo oscuro)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '33%' },
                },
                {
                  name: 'favicon',
                  label: 'Favicon',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '33%', description: 'PNG cuadrado de al menos 512×512.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Contacto',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'phone',
                  label: 'Teléfono (visible)',
                  type: 'text',
                  admin: { width: '50%', description: 'Ej: 342-5903814' },
                },
                { name: 'email', label: 'Email público', type: 'email', admin: { width: '50%' } },
              ],
            },
            {
              name: 'whatsapp',
              label: 'WhatsApp',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'number',
                      label: 'Número',
                      type: 'text',
                      admin: {
                        width: '50%',
                        description: 'Formato internacional sin + ni espacios. Ej: 5493425903814',
                      },
                      validate: (v: string | null | undefined) =>
                        !v ||
                        /^\d{8,15}$/.test(v) ||
                        'Solo números, con código de país (ej: 5493425903814).',
                    },
                    {
                      name: 'defaultMessage',
                      label: 'Mensaje predefinido',
                      type: 'text',
                      localized: true,
                      defaultValue: 'Hola PIRCAS, quiero pedir un presupuesto',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'showFloating',
                      label: 'Botón flotante en desktop',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'showMobileBar',
                      label: 'Barra fija en mobile (Cotizar + WhatsApp)',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'address',
              label: 'Dirección',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'street',
                      label: 'Calle y número',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                    { name: 'city', label: 'Ciudad', type: 'text', admin: { width: '25%' } },
                    { name: 'region', label: 'Provincia', type: 'text', admin: { width: '25%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'postalCode',
                      label: 'Código postal',
                      type: 'text',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'country',
                      label: 'País (código)',
                      type: 'text',
                      defaultValue: 'AR',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'mapsUrl',
                      label: 'Enlace a Google Maps',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'mapEmbedQuery',
                  label: 'Búsqueda para el mapa embebido',
                  type: 'text',
                  admin: {
                    description:
                      'Ej: "Hipólito Yrigoyen 1111, Coronda, Santa Fe". Vacío = sin mapa.',
                  },
                },
              ],
            },
            {
              name: 'coverageArea',
              label: 'Zona de cobertura',
              type: 'text',
              localized: true,
              admin: { description: 'Ej: "Coronda y zona (+40 km) · Envíos a todo el país".' },
            },
            {
              name: 'workingHours',
              label: 'Horarios de atención',
              type: 'array',
              labels: { singular: 'Horario', plural: 'Horarios' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'days',
                      label: 'Días',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '50%', description: 'Ej: Lunes a viernes' },
                    },
                    {
                      name: 'hours',
                      label: 'Horario',
                      type: 'text',
                      required: true,
                      admin: { width: '50%', description: 'Ej: 8:00 – 12:30 / 16:00 – 20:00' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Info común de productos',
          description:
            'Paneles que se agregan al final de la información técnica de todos los productos.',
          fields: [
            {
              name: 'productInfoPanels',
              label: 'Paneles comunes',
              type: 'array',
              labels: { singular: 'Panel', plural: 'Paneles' },
              admin: { description: 'Ej: "Entrega e instalación" → Retiro, Envío, Instalación.' },
              fields: [
                {
                  name: 'title',
                  label: 'Título del panel',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'rows',
                  label: 'Filas',
                  type: 'array',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          label: 'Dato',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: { width: '40%' },
                        },
                        {
                          name: 'value',
                          label: 'Valor',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: { width: '60%' },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Redes sociales',
          fields: [
            { name: 'instagram', label: 'Instagram (URL)', type: 'text' },
            { name: 'facebook', label: 'Facebook (URL)', type: 'text' },
            { name: 'youtube', label: 'YouTube (URL)', type: 'text' },
            { name: 'tiktok', label: 'TikTok (URL)', type: 'text' },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('site-settings', [CACHE_TAGS.all])] },
}
