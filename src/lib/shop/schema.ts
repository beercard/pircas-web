import { z } from 'zod'

import { attributionSchema, phoneSchema } from '@/lib/forms/schemas'

import { ACCESSORIES, COLORS } from './options'

const text = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim())
    .pipe(z.string().max(max, `Máximo ${max} caracteres.`))

const required = (max: number, message: string) => text(max).refine((v) => v.length > 0, message)

export const MAX_QTY = 50

export const quoteItemSchema = z.object({
  productId: z.number().int().positive(),
  color: z
    .enum(COLORS.map((c) => c.value) as [string, ...string[]])
    .nullable()
    .optional(),
  accessories: z
    .array(z.enum(ACCESSORIES.map((a) => a.value) as [string, ...string[]]))
    .max(ACCESSORIES.length)
    .optional()
    .transform((v) => [...new Set(v ?? [])].sort()),
  /** Medida elegida (productos con varias medidas). */
  measure: text(60).nullable().optional(),
  /** Opción con precio propio (ej. "Reja 3/8"). */
  option: text(60).nullable().optional(),
  /** Elecciones sin cambio de precio, una por grupo (ej. giro, vidrio). */
  choices: z.array(text(60)).max(4).optional(),
  quantity: z.number().int().min(1).max(MAX_QTY),
})

export const quoteItemsSchema = z
  .array(quoteItemSchema)
  .min(1, 'Tu presupuesto está vacío.')
  .max(40)

/** Pedido de presupuesto (como Lagoon: nombre, WhatsApp y localidad). Los precios se calculan en el servidor. */
export const quoteRequestSchema = z
  .object({
    items: quoteItemsSchema,
    fullName: required(120, 'Ingresá tu nombre.').refine(
      (v) => v.length >= 2,
      'Ingresá tu nombre.',
    ),
    phone: phoneSchema.refine(
      (v) => v.replace(/\D/g, '').length >= 8,
      'Ingresá tu WhatsApp con código de área (solo números).',
    ),
    city: required(100, 'Ingresá tu localidad.'),
    notes: text(600).optional().or(z.literal('')),
    turnstileToken: z.string().max(4096).optional(),
    website: z.string().max(200).optional(),
    attribution: attributionSchema,
  })
  .strict()

export type QuoteRequestData = z.infer<typeof quoteRequestSchema>
export type QuoteItemInput = z.infer<typeof quoteItemSchema>
