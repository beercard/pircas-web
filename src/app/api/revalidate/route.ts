import { createHash, timingSafeEqual } from 'node:crypto'

import type { NextRequest } from 'next/server'

import { revalidate } from '@/hooks/revalidate'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { clientIp, createRateLimiter } from '@/lib/forms/rate-limit'

/**
 * POST /api/revalidate — vacía el caché de datos del sitio.
 *
 * Lo usan los scripts de carga masiva (`payload run`), que escriben en la base por fuera de
 * Next y por eso no pueden invalidar el caché ellos mismos. Se autoriza con una clave
 * derivada de la conexión a la base (solo la conoce quien ya tiene acceso a la base):
 *   x-revalidate-token: sha256(DATABASE_URL)
 */

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(req: NextRequest) {
  if (!limiter.check(`revalidate:${clientIp(req.headers)}`).allowed)
    return json({ error: 'Demasiadas solicitudes.' }, 429)

  const secret = process.env.DATABASE_URL
  const given = req.headers.get('x-revalidate-token') ?? ''
  if (!secret) return json({ error: 'No disponible.' }, 503)
  const expected = createHash('sha256').update(secret).digest()
  const valid = /^[a-f0-9]{64}$/.test(given) && timingSafeEqual(expected, Buffer.from(given, 'hex'))
  if (!valid) return json({ error: 'No autorizado.' }, 401)

  revalidate([CACHE_TAGS.all])
  return json({ ok: true })
}
