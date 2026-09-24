import { describe, expect, it, vi } from 'vitest'

import { isAllowedOrigin } from '@/lib/forms/origin'
import { createRateLimiter, clientIp } from '@/lib/forms/rate-limit'
import { verifyTurnstile } from '@/lib/forms/turnstile'

const okFetch = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }))

describe('Turnstile (verificación en el servidor)', () => {
  it('acepta un token válido y envía secreto, token e IP', async () => {
    const fetchImpl = okFetch({ success: true })
    const r = await verifyTurnstile('token-ok', '1.2.3.4', { secret: 's3cr3t', fetchImpl })
    expect(r.success).toBe(true)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('challenges.cloudflare.com/turnstile/v0/siteverify')
    const body = init.body as URLSearchParams
    expect(body.get('secret')).toBe('s3cr3t')
    expect(body.get('response')).toBe('token-ok')
    expect(body.get('remoteip')).toBe('1.2.3.4')
  })

  it('rechaza un token inválido', async () => {
    const r = await verifyTurnstile('bad', '1.2.3.4', {
      secret: 's',
      fetchImpl: okFetch({ success: false, 'error-codes': ['invalid-input-response'] }),
    })
    expect(r).toEqual({ success: false, errorCodes: ['invalid-input-response'] })
  })

  it('rechaza si falta el token', async () => {
    expect(
      (await verifyTurnstile(undefined, undefined, { secret: 's', fetchImpl: okFetch({}) }))
        .success,
    ).toBe(false)
  })

  it('rechaza ante errores de red o HTTP', async () => {
    const failing = vi.fn(async () => {
      throw new Error('boom')
    })
    expect(
      (await verifyTurnstile('t', undefined, { secret: 's', fetchImpl: failing })).success,
    ).toBe(false)
    expect(
      (await verifyTurnstile('t', undefined, { secret: 's', fetchImpl: okFetch({}, false) }))
        .success,
    ).toBe(false)
  })

  it('en producción sin clave falla cerrado; en desarrollo se omite', async () => {
    expect(await verifyTurnstile('t', undefined, { secret: '', isProduction: true })).toEqual({
      success: false,
      errorCodes: ['missing-secret'],
    })
    expect(await verifyTurnstile('t', undefined, { secret: '', isProduction: false })).toEqual({
      success: true,
      skipped: true,
    })
  })
})

describe('límite de frecuencia', () => {
  it('permite N envíos por ventana y bloquea el siguiente', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 })
    const now = 1_000_000
    expect(limiter.check('ip', now).allowed).toBe(true)
    expect(limiter.check('ip', now + 1).allowed).toBe(true)
    expect(limiter.check('ip', now + 2).allowed).toBe(true)
    const blocked = limiter.check('ip', now + 3)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    // Otra IP no se ve afectada; la ventana vence.
    expect(limiter.check('otra', now + 3).allowed).toBe(true)
    expect(limiter.check('ip', now + 2000).allowed).toBe(true)
  })

  it('obtiene la IP detrás de proxies', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))).toBe('9.9.9.9')
    expect(
      clientIp(new Headers({ 'cf-connecting-ip': '8.8.8.8', 'x-forwarded-for': '1.1.1.1' })),
    ).toBe('8.8.8.8')
    expect(clientIp(new Headers())).toBe('unknown')
  })
})

describe('protección de origen (CSRF)', () => {
  it('acepta el mismo origen y rechaza otros o ninguno', () => {
    const url = 'http://localhost:3000/api/forms/contact'
    expect(isAllowedOrigin(new Headers({ origin: 'http://localhost:3000' }), url)).toBe(true)
    expect(isAllowedOrigin(new Headers({ referer: 'http://localhost:3000/contacto' }), url)).toBe(
      true,
    )
    expect(isAllowedOrigin(new Headers({ origin: 'https://sitio-malicioso.com' }), url)).toBe(false)
    expect(isAllowedOrigin(new Headers(), url)).toBe(false)
  })
})
