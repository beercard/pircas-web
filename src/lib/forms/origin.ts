import { getSiteUrl } from '@/lib/routes'

/**
 * Protección CSRF para los formularios públicos: solo se aceptan pedidos JSON cuyo
 * Origin (o Referer) coincida con el sitio. Un formulario de otro dominio no puede
 * enviar `application/json` sin preflight CORS, y el Origin no se puede falsificar
 * desde un navegador.
 */
export function isAllowedOrigin(headers: Headers, requestUrl: string): boolean {
  const origin = headers.get('origin') ?? safeOrigin(headers.get('referer'))
  if (!origin) return false
  const allowed = new Set([new URL(getSiteUrl()).origin, new URL(requestUrl).origin])
  return allowed.has(origin)
}

function safeOrigin(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}
