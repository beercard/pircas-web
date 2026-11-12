/**
 * Elimina los productos genéricos del catálogo original (los que no son del catálogo real,
 * código PIR-…), saca sus enlaces del menú y borra las categorías que quedan vacías.
 *
 *   pnpm payload run scripts/remove-legacy-catalog.ts
 *   SITE_URL=https://… para vaciar el caché del sitio al terminar.
 *   DRY_RUN=1 para ver qué haría, sin cambiar nada.
 */
import { createHash } from 'node:crypto'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const ctx = { disableRevalidate: true, skipWatermark: true }
const LEGACY_CATEGORIES = ['vidrios', 'otras-soluciones']

const payload = await getPayload({ config })

const all = await payload.find({
  collection: 'products',
  limit: 500,
  depth: 0,
  draft: true,
  overrideAccess: true,
})
const legacy = all.docs.filter((p) => !p.shop?.sku?.startsWith('PIR-'))
const ids = new Set(legacy.map((p) => p.id))

// Categorías que se van con ellos (solo si no les queda ningún producto del catálogo real).
const categoryIds = new Set<number>()
const categorySlugs = new Set<string>()
for (const slug of LEGACY_CATEGORIES) {
  const cat = (
    await payload.find({
      collection: 'product-categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
  ).docs[0]
  const keeps = all.docs.some(
    (p) =>
      !ids.has(p.id) && (typeof p.category === 'number' ? p.category : p.category?.id) === cat?.id,
  )
  if (cat && !keeps) {
    categoryIds.add(cat.id)
    categorySlugs.add(slug)
  }
}

/**
 * ¿El valor enlaza a uno de esos productos o categorías? No baja por las listas: así se detecta el ítem
 * que es el enlace, y no el grupo (columna, menú) que lo contiene.
 */
function linksLegacy(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const obj = value as Record<string, unknown>
  const target = typeof obj.value === 'object' ? (obj.value as { id?: number })?.id : obj.value
  if (obj.relationTo === 'products' && ids.has(target as number)) return true
  if (obj.relationTo === 'product-categories' && categoryIds.has(target as number)) return true
  // Enlaces escritos a mano al listado de una categoría eliminada (…?categoria=vidrios).
  const category = typeof obj.url === 'string' ? /[?&]categoria=([\w-]+)/.exec(obj.url)?.[1] : null
  if (category && categorySlugs.has(category)) return true
  return Object.values(obj).some(linksLegacy)
}

const emptiedLinks = (before: unknown, after: unknown) =>
  Array.isArray((before as { links?: unknown[] })?.links) &&
  (before as { links: unknown[] }).links.length > 0 &&
  ((after as { links?: unknown[] })?.links?.length ?? 0) === 0

/** Copia sin los enlaces a esos productos ni las columnas de menú que quedan vacías. */
function prune<T>(value: T): T {
  if (Array.isArray(value))
    return value
      .filter((item) => !linksLegacy(item))
      .map((item) => [item, prune(item)] as const)
      .filter(([before, after]) => !emptiedLinks(before, after))
      .map(([, after]) => after) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, prune(v)]),
    ) as T
  return value
}

const header = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true })
const {
  id: _id,
  createdAt: _c,
  updatedAt: _u,
  globalType: _g,
  ...headerData
} = header as unknown as Record<string, unknown>
const cleaned = prune(headerData)
const menuChanged = JSON.stringify(cleaned) !== JSON.stringify(headerData)
// DRY_RUN=1: muestra qué haría, sin cambiar nada.
if (process.env.DRY_RUN) {
  type Nav = { label?: string; megaMenu?: { columns?: { title?: string; links?: unknown[] }[] } }
  const shape = (h: unknown) =>
    ((h as { navigation?: Nav[] }).navigation ?? []).map(
      (n) =>
        `${n.label ?? '?'}[${(n.megaMenu?.columns ?? []).map((c) => `${c.title ?? '?'}:${c.links?.length ?? 0}`).join(', ')}]`,
    )
  payload.logger.info(
    `Productos a eliminar (${legacy.length}): ${legacy.map((p) => p.name).join(' · ')}`,
  )
  payload.logger.info(`Menú antes:   ${shape(headerData).join(' | ')}`)
  payload.logger.info(`Menú después: ${shape(cleaned).join(' | ')}`)
  process.exit(0)
}

if (menuChanged)
  await payload.updateGlobal({
    slug: 'header',
    data: cleaned as never,
    overrideAccess: true,
    context: { ...ctx },
  })

for (const p of legacy)
  await payload.delete({
    collection: 'products',
    id: p.id,
    overrideAccess: true,
    context: { ...ctx },
  })

let removed = 0
for (const id of categoryIds) {
  await payload.delete({
    collection: 'product-categories',
    id,
    overrideAccess: true,
    context: { ...ctx },
  })
  removed++
}

payload.logger.info(
  `Catálogo viejo: ${legacy.length} productos eliminados · menú ${menuChanged ? 'actualizado' : 'sin cambios'} · ${removed} categorías eliminadas`,
)

if (process.env.SITE_URL && process.env.DATABASE_URL) {
  const token = createHash('sha256').update(process.env.DATABASE_URL).digest('hex')
  const res = await fetch(`${process.env.SITE_URL.replace(/\/$/, '')}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-token': token },
  })
  payload.logger.info(`Caché del sitio: ${res.ok ? 'actualizado' : `no se pudo (${res.status})`}`)
}
process.exit(0)
