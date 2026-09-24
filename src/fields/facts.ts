import type { ArrayField } from 'payload'

/** Datos destacados "valor + etiqueta" (ej: "65 mm" · "Parantes"). */
export const factsField = (
  name = 'facts',
  label = 'Datos destacados',
  description = 'Ej: "65 mm" → "Parantes". Se muestran grandes, en terracota.',
  maxRows = 4,
): ArrayField => ({
  name,
  label,
  type: 'array',
  maxRows,
  labels: { singular: 'Dato', plural: 'Datos' },
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'value',
          label: 'Valor',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '40%' },
        },
        {
          name: 'label',
          label: 'Etiqueta',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '60%' },
        },
      ],
    },
  ],
})

/** Preguntas frecuentes (también generan datos estructurados FAQPage). */
export const faqsField = (name = 'faqs', label = 'Preguntas frecuentes'): ArrayField => ({
  name,
  label,
  type: 'array',
  labels: { singular: 'Pregunta', plural: 'Preguntas' },
  admin: { initCollapsed: true },
  fields: [
    { name: 'question', label: 'Pregunta', type: 'text', required: true, localized: true },
    { name: 'answer', label: 'Respuesta', type: 'textarea', required: true, localized: true },
  ],
})
