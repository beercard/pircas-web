import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { isAllowedOrigin } from '@/lib/forms/origin'
import { clientIp, formRateLimiter } from '@/lib/forms/rate-limit'
import { contactSchema, fieldErrors, quoteSchema } from '@/lib/forms/schemas'
import { verifyTurnstile } from '@/lib/forms/turnstile'
import { submitContact, submitQuote, SubmissionError } from '@/lib/leads/submit'

/**
 * POST /api/forms/contact · POST /api/forms/quote
 *
 * 1. Origen (CSRF) y tipo de contenido   4. Turnstile (server-side)
 * 2. Límite de frecuencia por IP          5. Guardar la consulta
 * 3. Validación con zod                   6. Emails (aviso + confirmación)
 */

const MAX_BODY_BYTES = 64 * 1024

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

export async function POST(req: NextRequest, { params }: { params: Promise<{ form: string }> }) {
  const { form } = await params
  if (form !== 'contact' && form !== 'quote') return json({ error: 'Formulario inexistente.' }, 404)

  if (!isAllowedOrigin(req.headers, req.url)) return json({ error: 'Origen no permitido.' }, 403)
  if (!req.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'Formato inválido.' }, 415)

  const ip = clientIp(req.headers)
  const limit = formRateLimiter.check(`${form}:${ip}`)
  if (!limit.allowed) {
    return json(
      { error: 'Recibimos muchos envíos seguidos. Esperá unos minutos o escribinos por WhatsApp.' },
      429,
      { 'Retry-After': String(limit.retryAfterSeconds) },
    )
  }

  const payload = await getPayload({ config: configPromise })

  let raw: unknown
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_BYTES) return json({ error: 'El envío es demasiado grande.' }, 413)
    raw = JSON.parse(text)
  } catch {
    return json({ error: 'Formato inválido.' }, 400)
  }

  const parsed = form === 'contact' ? contactSchema.safeParse(raw) : quoteSchema.safeParse(raw)
  if (!parsed.success) {
    return json({ error: 'Revisá los datos marcados.', fields: fieldErrors(parsed.error) }, 422)
  }

  // Honeypot completado: probablemente un bot. Se responde "ok" sin guardar nada.
  if (parsed.data.website) {
    payload.logger.warn({ form, ip }, 'honeypot triggered')
    return json({ ok: true })
  }

  const captcha = await verifyTurnstile(parsed.data.turnstileToken, ip)
  if (captcha.skipped)
    payload.logger.warn('Turnstile no configurado: verificación omitida (solo desarrollo)')
  if (!captcha.success) {
    payload.logger.warn({ form, ip, codes: captcha.errorCodes }, 'turnstile failed')
    return json(
      { error: 'No pudimos verificar que no seas un robot. Recargá la página e intentá de nuevo.' },
      400,
    )
  }

  try {
    if (form === 'contact') {
      const result = await submitContact(payload, contactSchema.parse(raw))
      return json({ ok: true, id: result.id })
    }
    const result = await submitQuote(payload, quoteSchema.parse(raw))
    return json({ ok: true, id: result.id, total: result.total })
  } catch (err) {
    if (err instanceof SubmissionError) return json({ error: err.message, fields: err.fields }, 422)
    payload.logger.error({ err, form }, 'form submission failed')
    return json(
      { error: 'No pudimos enviar tu consulta. Intentá de nuevo o escribinos por WhatsApp.' },
      500,
    )
  }
}
