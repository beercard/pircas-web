import { z } from 'zod'

// Mensajes de validación genéricos en español.
z.config(z.locales.es())

/**
 * Esquemas de validación compartidos por el navegador (react-hook-form) y el servidor
 * (route handler). El servidor SIEMPRE vuelve a validar: la validación del cliente es
 * solo para dar feedback inmediato.
 */

// Quita caracteres de control (excepto saltos de línea) y espacios extremos.
const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim())
    .pipe(z.string().max(max, `Máximo ${max} caracteres.`))

const optionalText = (max: number) => clean(max).optional().or(z.literal(''))

export const phoneSchema = clean(40).refine(
  (v) => v === '' || /^[+\d\s().-]{6,40}$/.test(v),
  'Revisá el teléfono.',
)

export const emailSchema = clean(160).refine(
  (v) => v === '' || z.email().safeParse(v).success,
  'Revisá el email.',
)

export const attributionSchema = z
  .object({
    utm_source: optionalText(200),
    utm_medium: optionalText(200),
    utm_campaign: optionalText(200),
    utm_content: optionalText(200),
    utm_term: optionalText(200),
    landingPage: optionalText(300),
    referrer: optionalText(300),
  })
  .partial()
  .optional()

/** Campos comunes a todos los formularios públicos (antispam + atribución). */
const baseFields = {
  turnstileToken: z.string().max(4096).optional(),
  /** Honeypot: campo oculto que un humano nunca completa. */
  website: z.string().max(200).optional(),
  attribution: attributionSchema,
  pageUrl: optionalText(300),
}

const requireContact = <T extends { email?: string; phone?: string }>(data: T) =>
  Boolean(data.email || data.phone)
const contactIssue = { message: 'Ingresá al menos tu email o teléfono.', path: ['email'] }

// ---------------------------------------------------------------------------
// Contacto (general y "Obras y profesionales")
// ---------------------------------------------------------------------------

export const PROFESSIONAL_ROLES = [
  'Arquitecto/a o estudio',
  'Constructora',
  'Desarrollador/a',
  'Otro',
] as const
export const PROJECT_STAGES = [
  'Anteproyecto',
  'Proyecto / documentación',
  'Licitación / cómputo',
  'Obra en curso',
] as const

const urlText = clean(500).refine(
  (v) => v === '' || /^https?:\/\/\S+$/i.test(v),
  'Pegá un enlace que empiece con https://',
)

/** Datos de la obra (solo formulario profesional). */
export const projectInfoSchema = z.object({
  company: optionalText(120),
  role: optionalText(60),
  location: optionalText(160),
  stage: optionalText(60),
  openings: optionalText(40),
  timeline: optionalText(80),
  plansUrl: urlText.optional().or(z.literal('')),
})

export const contactSchema = z
  .object({
    name: clean(80).pipe(z.string().min(2, 'Ingresá tu nombre.')),
    lastName: optionalText(80),
    email: emailSchema.optional().default(''),
    phone: phoneSchema.optional().default(''),
    city: optionalText(80),
    projectType: optionalText(80),
    productId: z.coerce.number().int().positive().optional(),
    lineId: z.coerce.number().int().positive().optional(),
    message: clean(3000).pipe(z.string().min(5, 'Contanos un poco más.')),
    audience: z.enum(['general', 'professional']).optional(),
    project: projectInfoSchema.optional(),
    ...baseFields,
  })
  .refine(requireContact, contactIssue)
  .refine((d) => d.audience !== 'professional' || Boolean(d.project?.location), {
    message: 'Indicá la obra y dónde es.',
    path: ['project', 'location'],
  })

export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>

// ---------------------------------------------------------------------------
// Cotización
// ---------------------------------------------------------------------------

export const quoteItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  lineId: z.coerce.number().int().positive().nullable().optional(),
  glass: optionalText(60).nullable(),
  width: z.coerce.number().positive().max(10_000),
  height: z.coerce.number().positive().max(10_000),
  side2: z.coerce.number().positive().max(10_000).nullable().optional(),
  quantity: z.coerce.number().int().min(1).max(99),
})

export const quoteContactSchema = z
  .object({
    projectType: optionalText(80),
    visitRequested: z.boolean().optional().default(false),
    name: clean(80).pipe(z.string().min(2, 'Ingresá tu nombre.')),
    lastName: optionalText(80),
    phone: phoneSchema.optional().default(''),
    email: emailSchema.optional().default(''),
    city: optionalText(80),
    message: optionalText(3000),
  })
  .refine(requireContact, contactIssue)

export const quoteSchema = z
  .object({
    need: optionalText(120),
    items: z.array(quoteItemSchema).min(1, 'Agregá al menos una abertura.').max(50),
    projectType: optionalText(80),
    visitRequested: z.boolean().optional().default(false),
    name: clean(80).pipe(z.string().min(2, 'Ingresá tu nombre.')),
    lastName: optionalText(80),
    phone: phoneSchema.optional().default(''),
    email: emailSchema.optional().default(''),
    city: optionalText(80),
    message: optionalText(3000),
    ...baseFields,
  })
  .refine(requireContact, contactIssue)

export type QuoteInput = z.input<typeof quoteSchema>
export type QuoteData = z.output<typeof quoteSchema>
export type QuoteContactInput = z.input<typeof quoteContactSchema>
export type QuoteContactData = z.output<typeof quoteContactSchema>

/** Errores de zod como { campo: mensaje } para mostrarlos en el formulario. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form'
    if (!out[key]) out[key] = issue.message
  }
  return out
}
