import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { isAllowedOrigin } from '@/lib/forms/origin'
import { clientIp, createRateLimiter } from '@/lib/forms/rate-limit'
import { toShopConfig } from '@/lib/shop/config'
import { loadQuoteLines, publicLines } from '@/lib/shop/quote'
import { quoteItemsSchema } from '@/lib/shop/schema'

/** POST /api/shop/cart — datos actuales (sin precios) de los productos de la lista del presupuesto. */

const limiter = createRateLimiter({ limit: 90, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers, req.url)) return json({ error: 'Origen no permitido.' }, 403)
  if (!limiter.check(`cart:${clientIp(req.headers)}`).allowed)
    return json({ error: 'Demasiadas solicitudes.' }, 429)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ error: 'Formato inválido.' }, 400)
  }
  const parsed = quoteItemsSchema.safeParse(raw)
  if (!parsed.success) return json({ lines: [] })

  const payload = await getPayload({ config: configPromise })
  const config = toShopConfig(await payload.findGlobal({ slug: 'shop-settings', depth: 0 }))
  const { lines } = await loadQuoteLines(payload, parsed.data, config.rules, config.vatPercent)
  return json({ lines: publicLines(lines) })
}
