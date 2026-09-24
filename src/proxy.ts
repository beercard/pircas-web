import { NextResponse, type NextRequest } from 'next/server'

import {
  buildRedirectMap,
  normalizePath,
  type RedirectDoc,
  type RedirectTarget,
} from '@/lib/redirects'

/**
 * Proxy (middleware) de Next: aplica las redirecciones 301/302 cargadas en el CMS.
 *
 * El mapa se lee de la API de Payload y se guarda en memoria 60 s (los cambios en el
 * panel se ven en hasta 1 minuto). Si la API no responde, el sitio sigue funcionando
 * sin redirecciones: nunca bloquea una visita.
 */

const TTL_MS = 60_000
let cached: { at: number; map: Map<string, RedirectTarget> } | null = null
let inflight: Promise<Map<string, RedirectTarget>> | null = null

function apiBase(req: NextRequest): string {
  if (process.env.INTERNAL_URL) return process.env.INTERNAL_URL.replace(/\/$/, '')
  if (process.env.VERCEL) return req.nextUrl.origin
  return `http://127.0.0.1:${process.env.PORT || 3000}`
}

async function loadRedirects(req: NextRequest): Promise<Map<string, RedirectTarget>> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.map
  if (!inflight) {
    inflight = (async () => {
      try {
        const res = await fetch(
          `${apiBase(req)}/api/redirects?limit=1000&depth=1&pagination=false`,
          {
            signal: AbortSignal.timeout(2000),
            headers: { accept: 'application/json' },
          },
        )
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = (await res.json()) as { docs?: RedirectDoc[] }
        const map = buildRedirectMap(data.docs ?? [])
        cached = { at: Date.now(), map }
        return map
      } catch {
        // Reintenta en el próximo ciclo; mientras tanto usa el último mapa conocido.
        cached = { at: Date.now() - TTL_MS + 10_000, map: cached?.map ?? new Map() }
        return cached.map
      } finally {
        inflight = null
      }
    })()
  }
  return inflight
}

export async function proxy(req: NextRequest) {
  const map = await loadRedirects(req)
  if (!map.size) return NextResponse.next()

  const { pathname, search } = req.nextUrl
  const target = map.get(normalizePath(pathname + search)) ?? map.get(normalizePath(pathname))
  if (!target) return NextResponse.next()

  const destination = /^https?:\/\//i.test(target.destination)
    ? target.destination
    : new URL(target.destination, req.nextUrl.origin).toString()
  return NextResponse.redirect(destination, target.status)
}

export const config = {
  // Todo menos panel, API, assets de Next, archivos estáticos y metadatos.
  matcher: [
    '/((?!admin|api|_next|next/|brand/|media/|favicon|icon|apple-icon|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpe?g|webp|avif|svg|ico|css|js|txt|xml|woff2?)$).*)',
  ],
}
