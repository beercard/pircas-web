/**
 * Simplifica el sitio para enfocarlo en la venta de medidas estándar (tres líneas):
 *  - Inicio: quita "Dos formas de trabajar", "Medimos. Fabricamos. Colocamos.", el asesor
 *    virtual, "Cotizá tu proyecto" y "Gente que sabe hacer…"; deja Portada → Tres líneas →
 *    Así trabajamos → También hacemos → Mamparas.
 *  - Saca del menú y del pie los enlaces a "Para tu casa" y "Obras y profesionales", y pasa
 *    la página "Obras y profesionales" a borrador (no se borra).
 *  - Agrega el local de Santo Tomé en "Datos del negocio".
 *
 *   pnpm payload run scripts/simplify-site.ts
 *   DRY_RUN=1 para ver qué haría, sin cambiar nada.
 *   SITE_URL=https://… para vaciar el caché del sitio al terminar.
 */
import { createHash } from 'node:crypto'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const ctx = { disableRevalidate: true, skipWatermark: true }
const DRY = Boolean(process.env.DRY_RUN)
const AUDIENCE_PAGES = ['para-tu-casa', 'obras-y-profesionales']
const UNPUBLISH = ['obras-y-profesionales']
const BRANCH = { street: 'Av. Richieri esq. Mosconi', city: 'Santo Tomé', region: 'Santa Fe' }

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(msg)

type Block = { blockType: string; title?: string | null; settings?: { anchor?: string | null } }
const name = (b: Block) => `${b.blockType}${b.title ? ` “${b.title.replace(/\s+/g, ' ')}”` : ''}`

// --- Inicio ------------------------------------------------------------------------------
const home = await payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true })
const draftHome = await payload.findGlobal({
  slug: 'homepage',
  depth: 0,
  draft: true,
  overrideAccess: true,
})
// Se parte del último borrador: así no se pisan las correcciones de texto hechas en el panel
// que todavía no se publicaron (quedan publicadas junto con este cambio).
const sections = (draftHome.sections ?? home.sections ?? []) as unknown as Block[]

const isRemoved = (b: Block) =>
  ['audiences', 'statement', 'advisor'].includes(b.blockType) ||
  (b.blockType === 'textImage' && /^gente que sabe/i.test(b.title ?? '')) ||
  (b.blockType === 'process' && /^cotiz[aá] tu proyecto/i.test(b.title ?? ''))

/** Orden pedido: portada, líneas, así trabajamos, también hacemos, mamparas, y el resto. */
const rank = (b: Block) =>
  b.blockType === 'hero'
    ? 0
    : b.blockType === 'productLines'
      ? 1
      : b.blockType === 'process'
        ? 2
        : b.blockType === 'productCategories'
          ? 3
          : b.settings?.anchor === 'mamparas'
            ? 4
            : 5
const kept = sections
  .filter((b) => !isRemoved(b))
  .map((b, i) => ({ b, i }))
  .sort((x, y) => rank(x.b) - rank(y.b) || x.i - y.i)
  .map(({ b }) => b)
const homeChanged = JSON.stringify(kept) !== JSON.stringify(sections)

log(`Inicio antes:     ${sections.map(name).join(' | ')}`)
if (JSON.stringify(draftHome.sections) !== JSON.stringify(home.sections))
  log('Inicio: hay un borrador sin publicar; se publica junto con este cambio.')
log(`Inicio después:   ${kept.map(name).join(' | ')}`)

// --- Menú y pie: enlaces a las páginas de "ambientes" -----------------------------------------
const pages = await payload.find({
  collection: 'pages',
  where: { slug: { in: AUDIENCE_PAGES } },
  limit: 10,
  depth: 0,
  draft: true,
  overrideAccess: true,
})
const pageIds = new Set(pages.docs.map((p) => p.id))

/** ¿El valor es un enlace a una de esas páginas? (no baja por las listas). */
function linksAudience(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const obj = value as Record<string, unknown>
  const target = typeof obj.value === 'object' ? (obj.value as { id?: number })?.id : obj.value
  if (obj.relationTo === 'pages' && pageIds.has(target as number)) return true
  if (typeof obj.url === 'string' && AUDIENCE_PAGES.some((s) => obj.url === `/${s}`)) return true
  return Object.values(obj).some(linksAudience)
}
function prune<T>(value: T): T {
  if (Array.isArray(value)) return value.filter((i) => !linksAudience(i)).map(prune) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, prune(v)]),
    ) as T
  return value
}
const strip = (doc: unknown) => {
  const {
    id: _i,
    createdAt: _c,
    updatedAt: _u,
    globalType: _g,
    ...data
  } = doc as Record<string, unknown>
  return data
}

const labels = (h: Record<string, unknown>) =>
  ((h.navigation ?? []) as { link?: { label?: string }; title?: string; links?: unknown[] }[])
    .map((n) => n.link?.label ?? `${n.title ?? 'columna'}:${n.links?.length ?? 0}`)
    .join(' | ')

const header = strip(await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true }))
const footer = strip(await payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true }))
const newHeader = prune(header)
const newFooter = prune(footer)
const headerChanged = JSON.stringify(newHeader) !== JSON.stringify(header)
const footerChanged = JSON.stringify(newFooter) !== JSON.stringify(footer)
log(`Menú antes:   ${labels(header)}`)
log(`Menú después: ${labels(newHeader)}`)
log(`Pie antes:    ${labels(footer)}`)
log(`Pie después:  ${labels(newFooter)}`)

// --- Página de obras a borrador ------------------------------------------------------------
const toUnpublish = pages.docs.filter(
  (p) => UNPUBLISH.includes(p.slug ?? '') && p._status === 'published',
)
log(`Páginas a borrador: ${toUnpublish.map((p) => p.title).join(', ') || 'ninguna'}`)

// --- Local de Santo Tomé ---------------------------------------------------------------------
const site = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
const branches = site.branches ?? []
const hasBranch = branches.some((b) => /santo tom[eé]/i.test(b.city ?? ''))
log(`Local de Santo Tomé: ${hasBranch ? 'ya estaba' : 'se agrega'}`)

if (DRY) {
  log('DRY_RUN: no se cambió nada.')
  process.exit(0)
}

if (homeChanged)
  await payload.updateGlobal({
    slug: 'homepage',
    data: { sections: kept, _status: 'published' } as never,
    overrideAccess: true,
    context: { ...ctx },
  })
if (headerChanged)
  await payload.updateGlobal({
    slug: 'header',
    data: newHeader as never,
    overrideAccess: true,
    context: { ...ctx },
  })
if (footerChanged)
  await payload.updateGlobal({
    slug: 'footer',
    data: newFooter as never,
    overrideAccess: true,
    context: { ...ctx },
  })
for (const p of toUnpublish)
  await payload.update({
    collection: 'pages',
    id: p.id,
    data: { _status: 'draft' },
    overrideAccess: true,
    context: { ...ctx },
  })
if (!hasBranch)
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { branches: [...branches, BRANCH] },
    overrideAccess: true,
    context: { ...ctx },
  })

log(
  `Listo: inicio ${homeChanged ? 'actualizado' : 'sin cambios'} · menú ${headerChanged ? 'actualizado' : 'sin cambios'} · pie ${footerChanged ? 'actualizado' : 'sin cambios'} · ${toUnpublish.length} página(s) a borrador · local ${hasBranch ? 'sin cambios' : 'agregado'}`,
)

if (process.env.SITE_URL && process.env.DATABASE_URL) {
  const token = createHash('sha256').update(process.env.DATABASE_URL).digest('hex')
  const res = await fetch(`${process.env.SITE_URL.replace(/\/$/, '')}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-token': token },
  })
  log(`Caché del sitio: ${res.ok ? 'actualizado' : `no se pudo (${res.status})`}`)
}
process.exit(0)
