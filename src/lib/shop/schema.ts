import { z } from 'zod'

import { attributionSchema, emailSchema, phoneSchema } from '@/lib/forms/schemas'

import { COLORS } from './options'

const text = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim())
    .pipe(z.string().max(max, `Máximo ${max} caracteres.`))

const required = (max: number, message: string) => text(max).refine((v) => v.length > 0, message)

export const MAX_QTY = 50

export const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  color: z
    .enum(COLORS.map((c) => c.value) as [string, ...string[]])
    .nullable()
    .optional(),
  quantity: z.number().int().min(1).max(MAX_QTY),
})

export const cartSchema = z.array(cartItemSchema).min(1, 'El carrito está vacío.').max(40)

/** Datos del checkout. El servidor recalcula precios, envío y total: nunca vienen del navegador. */
export const checkoutSchema = z
  .object({
    items: cartSchema,
    fullName: required(120, 'Ingresá tu nombre y apellido.').refine(
      (v) => v.length >= 3,
      'Ingresá tu nombre y apellido.',
    ),
    email: emailSchema.refine((v) => v.length > 0, 'Ingresá tu email para enviarte el pedido.'),
    phone: phoneSchema.refine((v) => v.length > 0, 'Ingresá un teléfono o WhatsApp.'),
    document: text(20).optional().or(z.literal('')),
    shippingCode: required(60, 'Elegí una forma de entrega.'),
    address: text(160).optional().or(z.literal('')),
    city: text(100).optional().or(z.literal('')),
    province: text(60).optional().or(z.literal('')),
    zip: text(12).optional().or(z.literal('')),
    paymentMethod: z.enum(['transfer', 'mercadopago', 'cash'], 'Elegí un medio de pago.'),
    notes: text(600).optional().or(z.literal('')),
    turnstileToken: z.string().max(4096).optional(),
    website: z.string().max(200).optional(),
    attribution: attributionSchema,
  })
  .strict()

export type CheckoutData = z.infer<typeof checkoutSchema>
export type CartItemInput = z.infer<typeof cartItemSchema>
