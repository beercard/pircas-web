/**
 * Limitador de frecuencia en memoria (ventana deslizante por clave).
 *
 * Suficiente para una instancia (VPS/Docker). Si el sitio corre en varias instancias
 * detrás de un balanceador, reemplazar el `store` por uno compartido (Redis, etc.):
 * la interfaz `RateLimitStore` está pensada para eso.
 */

export interface RateLimitStore {
  hit(key: string, windowMs: number, now: number): number // devuelve la cantidad de hits en la ventana
}

export class MemoryRateLimitStore implements RateLimitStore {
  private hits = new Map<string, number[]>()
  private lastSweep = 0

  hit(key: string, windowMs: number, now: number): number {
    const since = now - windowMs
    const list = (this.hits.get(key) ?? []).filter((t) => t > since)
    list.push(now)
    this.hits.set(key, list)
    // Limpieza periódica para no crecer indefinidamente.
    if (now - this.lastSweep > windowMs) {
      this.lastSweep = now
      for (const [k, v] of this.hits) {
        if (!v.some((t) => t > since)) this.hits.delete(k)
      }
    }
    return list.length
  }
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number }

export function createRateLimiter({
  limit,
  windowMs,
  store = new MemoryRateLimitStore(),
}: {
  limit: number
  windowMs: number
  store?: RateLimitStore
}) {
  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const count = store.hit(key, windowMs, now)
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: count <= limit ? 0 : Math.ceil(windowMs / 1000),
      }
    },
  }
}

/** Limitador compartido por los formularios públicos (FORM_RATE_LIMIT por IP cada 10 min). */
export const formRateLimiter = createRateLimiter({
  limit: Number(process.env.FORM_RATE_LIMIT) > 0 ? Number(process.env.FORM_RATE_LIMIT) : 5,
  windowMs: 10 * 60 * 1000,
})

/** IP del cliente detrás de un proxy (nginx / Cloudflare). */
export function clientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
