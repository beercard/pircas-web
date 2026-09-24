/**
 * Verificación de Cloudflare Turnstile del lado del servidor.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * - Producción sin TURNSTILE_SECRET_KEY → se rechaza (falla cerrado).
 * - Desarrollo sin clave → se omite la verificación (con aviso en el log).
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileResult = { success: boolean; skipped?: boolean; errorCodes?: string[] }

type FetchLike = (input: string, init: RequestInit) => Promise<Pick<Response, 'ok' | 'json'>>

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
  {
    secret = process.env.TURNSTILE_SECRET_KEY,
    isProduction = process.env.NODE_ENV === 'production',
    fetchImpl = fetch as FetchLike,
    timeoutMs = 8000,
  }: { secret?: string; isProduction?: boolean; fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<TurnstileResult> {
  if (!secret) {
    return isProduction
      ? { success: false, errorCodes: ['missing-secret'] }
      : { success: true, skipped: true }
  }
  if (!token) return { success: false, errorCodes: ['missing-input-response'] }

  const body = new URLSearchParams({ secret, response: token })
  if (ip && ip !== 'unknown') body.set('remoteip', ip)

  try {
    const res = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return { success: false, errorCodes: ['http-error'] }
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    return { success: data.success === true, errorCodes: data['error-codes'] }
  } catch {
    return { success: false, errorCodes: ['network-error'] }
  }
}

export const turnstileSiteKey = (): string | null => process.env.TURNSTILE_SITE_KEY || null
