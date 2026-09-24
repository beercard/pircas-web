import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { iconField } from '@/fields/icon'
import { revalidateGlobalHook } from '@/hooks/revalidate'

const keyField = (description: string) => ({
  name: 'key',
  label: 'Clave interna',
  type: 'text' as const,
  required: true,
  admin: { description, width: '30%' },
  validate: (v: string | null | undefined) =>
    !v || /^[a-z0-9_-]+$/.test(v) || 'Solo minúsculas, números, guiones o guion bajo.',
})

export const Advisor: GlobalConfig = {
  slug: 'advisor',
  label: 'Asesor virtual',
  admin: {
    group: 'Configuración',
    description:
      'Preguntas, respuestas y cómo cada respuesta suma puntos a cada línea. La línea con más puntos es la recomendada.',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'enabled', label: 'Asesor activo', type: 'checkbox', defaultValue: true },
    {
      name: 'questions',
      label: 'Preguntas',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Pregunta', plural: 'Preguntas' },
      admin: { description: 'Se muestran en este orden, una por paso.' },
      fields: [
        {
          type: 'row',
          fields: [
            keyField('Ej: prioridad'),
            {
              name: 'question',
              label: 'Pregunta',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '70%' },
            },
          ],
        },
        {
          name: 'answers',
          label: 'Respuestas',
          type: 'array',
          minRows: 2,
          maxRows: 6,
          labels: { singular: 'Respuesta', plural: 'Respuestas' },
          fields: [
            {
              type: 'row',
              fields: [
                keyField('Ej: precio'),
                {
                  name: 'label',
                  label: 'Texto',
                  type: 'text',
                  required: true,
                  localized: true,
                  admin: { width: '40%' },
                },
                { ...iconField(), admin: { width: '30%' } },
              ],
            },
            {
              name: 'weights',
              label: 'Puntos por línea',
              type: 'array',
              labels: { singular: 'Puntaje', plural: 'Puntajes' },
              admin: { description: 'Cuántos puntos suma esta respuesta a cada línea (0 a 10).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'line',
                      label: 'Línea',
                      type: 'relationship',
                      relationTo: 'product-lines',
                      required: true,
                      admin: { width: '70%' },
                    },
                    {
                      name: 'points',
                      label: 'Puntos',
                      type: 'number',
                      required: true,
                      min: 0,
                      max: 10,
                      defaultValue: 1,
                      admin: { width: '30%' },
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
      name: 'results',
      label: 'Textos de recomendación',
      type: 'array',
      labels: { singular: 'Recomendación', plural: 'Recomendaciones' },
      admin: {
        description:
          'Opcional: texto a mostrar cuando se recomienda cada línea. Si falta, se usa la descripción corta de la línea.',
      },
      fields: [
        {
          name: 'line',
          label: 'Línea',
          type: 'relationship',
          relationTo: 'product-lines',
          required: true,
        },
        { name: 'headline', label: 'Título', type: 'text', localized: true },
        { name: 'text', label: 'Texto', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'fallbackLine',
      label: 'Línea recomendada en caso de empate',
      type: 'relationship',
      relationTo: 'product-lines',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'resultEyebrow',
          label: 'Antetítulo del resultado',
          type: 'text',
          localized: true,
          defaultValue: 'Te recomendamos',
        },
        {
          name: 'quoteLabel',
          label: 'Botón cotizar',
          type: 'text',
          localized: true,
          defaultValue: 'Cotizar esta línea',
        },
        {
          name: 'restartLabel',
          label: 'Botón reiniciar',
          type: 'text',
          localized: true,
          defaultValue: 'Volver a empezar',
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('advisor')] },
}
