import { pathFor, type RoutableCollection } from './routes'

/**
 * Redirecciones administradas desde el CMS (SEO → Redirecciones).
 * Módulo puro: lo usan el proxy (runtime) y los tests.
 */

export type RedirectDoc = {
  from: string
  type?: string | null
  to?: {
    type?: 'reference' | 'custom' | null
    url?: string | null
    reference?: { relationTo: string; value: number | { slug?: string | null } | null } | null
  } | null
}

export type RedirectTarget = { destination: string; status: 301 | 302 }

/** Normaliza una ruta para comparar: minúsculas, sin barra final, sin dominio. */
export function normalizePath(input: string): string {
  let path = input.trim()
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname + new URL(path).search
  } catch {
    // se usa tal cual
  }
  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1) path = path.replace(/\/+$/, '')
  return decodeURIComponent(path).toLowerCase()
}

export function resolveDestination(doc: RedirectDoc): string | null {
  const to = doc.to
  if (!to) return null
  if (to.type === 'reference' || (!to.url && to.reference)) {
    const value = to.reference?.value
    const slug = value && typeof value === 'object' ? value.slug : null
    return slug && to.reference
      ? pathFor(to.reference.relationTo as RoutableCollection, slug)
      : null
  }
  return to.url?.trim() || null
}

export function buildRedirectMap(docs: RedirectDoc[]): Map<string, RedirectTarget> {
  const map = new Map<string, RedirectTarget>()
  for (const doc of docs) {
    if (!doc.from) continue
    const destination = resolveDestination(doc)
    if (!destination) continue
    const from = normalizePath(doc.from)
    // Evita bucles triviales (una URL que redirige a sí misma).
    if (!/^https?:\/\//i.test(destination) && normalizePath(destination) === from) continue
    map.set(from, { destination, status: doc.type === '302' ? 302 : 301 })
  }
  return map
}
