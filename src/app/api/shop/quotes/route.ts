import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { isAllowedOrigin } from '@/lib/forms/origin'
import { clientIp, createRateLimiter } from '@/lib/forms/rate-limit'
import { fieldErrors } from '@/lib/forms/schemas'
import { verifyTurnstile } from '@/lib/forms/turnstile'
import { SubmissionError } from '@/lib/leads/submit'
import { createQuote } from '@/lib/shop/quote'
import { quoteRequestSchema } from '@/lib/shop/schema'

/**
 * POST /api/shop/quotes — calcula y guarda el presupuesto automático.
 * Origen (CSRF) → límite por IP → validación → antispam → precios calculados en el servidor.
 */

const MAX_BODY_BYTES = 32 * 1024
const limiter = createRateLimiter({ limit: 8, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers, req.url)) return json({ error: 'Origen no permitido.' }, 403)
  if (!req.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'Formato inválido.' }, 415)

  const ip = clientIp(req.headers)
  const limit = limiter.check(`quote:${ip}`)
  if (!limit.allowed)
    return json(
      {
        error:
          'Recibimos muchos pedidos de presupuesto seguidos. Esperá unos minutos o escribinos por WhatsApp.',
      },
      429,
      { 'Retry-After': String(limit.retryAfterSeconds) },
    )

  let raw: unknown
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_BYTES)
      return json({ error: 'El presupuesto es demasiado grande.' }, 413)
    raw = JSON.parse(text)
  } catch {
    return json({ error: 'Formato inválido.' }, 400)
  }

  const parsed = quoteRequestSchema.safeParse(raw)
  if (!parsed.success)
    return json({ error: 'Revisá los datos marcados.', fields: fieldErrors(parsed.error) }, 422)

  const payload = await getPayload({ config: configPromise })

  // Honeypot completado: probablemente un bot. Se responde "ok" sin crear nada.
  if (parsed.data.website) {
    payload.logger.warn({ ip }, 'quote honeypot triggered')
    return json({ ok: true })
  }

  // Turnstile se exige cuando está configurado; sin claves quedan el límite por IP, el
  // control de origen y el honeypot.
  if (process.env.TURNSTILE_SECRET_KEY) {
    const captcha = await verifyTurnstile(parsed.data.turnstileToken, ip)
    if (!captcha.success)
      return json(
        {
          error: 'No pudimos verificar que no seas un robot. Recargá la página e intentá de nuevo.',
        },
        400,
      )
  }

  try {
    const created = await createQuote(payload, parsed.data)
    return json({
      ok: true,
      orderNumber: created.orderNumber,
      url: created.url,
      whatsappSent: created.whatsappSent,
      total: created.totals.list,
    })
  } catch (err) {
    if (err instanceof SubmissionError) return json({ error: err.message, fields: err.fields }, 422)
    payload.logger.error({ err }, 'quote creation failed')
    return json(
      { error: 'No pudimos calcular tu presupuesto. Intentá de nuevo o escribinos por WhatsApp.' },
      500,
    )
  }
}
