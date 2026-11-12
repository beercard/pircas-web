/**
 * Carga masiva del catálogo real (Word + fotos del Drive) en la tienda. Idempotente: cada
 * producto se identifica por su código (PIR-…) y cada foto por su contenido.
 *
 *   pnpm payload run scripts/import-catalog.ts
 *
 * Lee `catalogo-import/` (fuera del repo): catalog.json (productos, medidas y precios sin
 * IVA), photos.json y la carpeta fotos/. Las fotos se llevan a un lienzo 4:3 (para que la
 * tarjeta muestre la abertura entera) y reciben la marca de agua.
 * Además deja las categorías del Drive y elimina los productos de ejemplo (código EJ-…).
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../src/payload.config'
import { openingRatio } from '../src/lib/media/opening-ratio'
import { applyWatermark } from '../src/lib/media/watermark'
import { slugify } from '../src/lib/slugify'
import { richText, specs } from '../src/seed/helpers'

const DIR = path.resolve(process.cwd(), process.env.CATALOG_DIR || 'catalogo-import')
// Ojo: cada llamada recibe una copia. El almacenamiento en la nube marca el contexto al subir
// un archivo; si se comparte el mismo objeto, las fotos siguientes no se suben.
const ctx = { disableRevalidate: true, skipWatermark: true }

type Row = {
  measure: string
  color: 'blanco' | 'negro' | null
  option: string | null
  price: number
}
type Doc = {
  title: string
  desc: string[]
  specs: [string, string][]
  notes: string[]
  rows: Row[]
}
type Photo = { path: string; folder: string; hash: string; n: number }

type Rule = {
  /** Texto que identifica el título del Word. */
  match: RegExp
  sku: string
  category: string
  line?: string
  /** Carpeta de fotos y, si hace falta, filtro por nombre de archivo. */
  photos: { folder: string; file?: RegExp }[]
  optionLabel?: string
  choices?: { label: string; values: string[] }[]
  featured?: boolean
  /** Posición de la foto que va como principal (por defecto, la primera). */
  lead?: number
}

const ECO = 'herrero-economica'
const REF = 'herrero-reforzada'
const V = '1. Ventanas'
const P36 = '5. Puertas/2. Reforzadas 36 mm'
const PB = '6. Puerta Balcón'
const GIRO = { label: 'Giro', values: ['Derecha', 'Izquierda'] }
const VIDRIO = { label: 'Vidrio', values: ['Repartido', 'Entero'] }

const door = (model: string, n: number, extra: Partial<Rule> = {}): Rule => ({
  match: new RegExp(`Modelo ${model}\\b`),
  sku: `PIR-P36-${model}`,
  category: 'puertas-reforzadas-36-mm',
  line: REF,
  photos: [{ folder: P36, file: new RegExp(`(^|\\s)${model}[.\\s]`) }],
  choices: [GIRO],
  featured: n === 0,
  ...extra,
})

const RULES: Rule[] = [
  {
    match: /^Ventana corrediza económica – vidrio entero$/,
    sku: 'PIR-VCE-VE',
    category: 'ventanas-economicas',
    line: ECO,
    photos: [{ folder: `${V}/1. Economicas/Ventana corrediza vidrio entero` }],
    featured: true,
    lead: 3,
  },
  {
    match: /^Ventana corrediza económica – vidrio repartido$/,
    sku: 'PIR-VCE-VR',
    category: 'ventanas-economicas',
    line: ECO,
    photos: [{ folder: `${V}/1. Economicas/Ventana corrediza vidrio repartido` }],
  },
  {
    match: /^Ventana corrediza económica – vidrio entero con reja$/,
    sku: 'PIR-VCE-REJA',
    category: 'ventanas-economicas',
    line: ECO,
    photos: [{ folder: `${V}/1. Economicas/Ventana corrediza vidrio entero con reja` }],
    optionLabel: 'Reja',
  },
  {
    match: /^Ventana corrediza reforzada – vidrio entero$/,
    sku: 'PIR-VCR-VE',
    category: 'ventanas-reforzadas',
    line: REF,
    photos: [{ folder: `${V}/2. Reforzada/Ventana corrediza reforzada vidrio entero` }],
    featured: true,
    lead: 1,
  },
  {
    match: /^Ventana corrediza reforzada – vidrio repartido$/,
    sku: 'PIR-VCR-VR',
    category: 'ventanas-reforzadas',
    line: REF,
    photos: [{ folder: `${V}/2. Reforzada/Ventana corrediza reforzada vidrio repartido` }],
  },
  {
    match: /^Ventana corrediza reforzada con celosía corrediza/,
    sku: 'PIR-VCR-CEL',
    category: 'ventanas-reforzadas',
    line: REF,
    photos: [{ folder: `${V}/2. Reforzada/Ventana corrediza reforzada vidrio entero con celosia` }],
  },
  {
    match: /^Raja de abrir económica/,
    sku: 'PIR-RAJA-E',
    category: 'raja',
    line: ECO,
    photos: [{ folder: '2. Rajas' }],
  },
  {
    match: /^Ventana brazo de empuje reforzada/,
    sku: 'PIR-BRAZO-R',
    category: 'brazo-de-empuje',
    line: REF,
    photos: [{ folder: '3. Brazo de empuje' }],
  },
  {
    match: /^Paño fijo reforzado/,
    sku: 'PIR-PFIJO-R',
    category: 'panos-fijos',
    line: REF,
    photos: [{ folder: '4. Paño fijos' }],
  },
  door('210', 0, { optionLabel: 'Postigo', choices: [VIDRIO, GIRO] }),
  door('211', 1, { optionLabel: 'Postigo', choices: [VIDRIO, GIRO] }),
  door('212', 2, { optionLabel: 'Postigo', choices: [VIDRIO, GIRO] }),
  door('213', 3),
  door('214', 4),
  door('215', 5),
  door('216', 6),
  door('217', 7),
  door('312', 8),
  door('706', 9),
  {
    match: /^Puerta balcón corrediza económica – vidrio entero$/,
    sku: 'PIR-PBE-VE',
    category: 'puerta-balcon-economica',
    line: ECO,
    photos: [{ folder: `${PB}/1. Economica`, file: /V\.E/ }],
    featured: true,
  },
  {
    match: /^Puerta balcón corrediza económica – vidrio repartido$/,
    sku: 'PIR-PBE-VR',
    category: 'puerta-balcon-economica',
    line: ECO,
    photos: [{ folder: `${PB}/1. Economica`, file: /V\.R/ }],
  },
  {
    match: /^Puerta balcón corrediza reforzada – vidrio entero$/,
    sku: 'PIR-PBR-VE',
    category: 'puerta-balcon-reforzada',
    line: REF,
    photos: [{ folder: `${PB}/2. Reforzada/Puerta corrediza balcón reforzada` }],
  },
  {
    match: /^Puerta balcón corrediza reforzada – vidrio repartido$/,
    sku: 'PIR-PBR-VR',
    category: 'puerta-balcon-reforzada',
    line: REF,
    photos: [{ folder: `${PB}/2. Reforzada/Puerta corrediza balcón reforzada vidrio repartido` }],
  },
  {
    match: /^Puerta balcón corrediza reforzada con celosía corrediza – vidrio entero$/,
    sku: 'PIR-PBR-CEL-VE',
    category: 'puerta-balcon-reforzada',
    line: REF,
    photos: [
      { folder: `${PB}/2. Reforzada/Puerta corrediza balcón reforzada con celosia corrediza` },
    ],
  },
  {
    match: /^Puerta balcón corrediza reforzada con celosía corrediza – vidrio repartido$/,
    sku: 'PIR-PBR-CEL-VR',
    category: 'puerta-balcon-reforzada',
    line: REF,
    photos: [
      { folder: `${PB}/2. Reforzada/Puerta corrediza balcón reforzada con celosia corrediza` },
    ],
  },
  {
    match: /^Aireador/,
    sku: 'PIR-AIRE',
    category: 'aireadores',
    line: ECO,
    photos: [{ folder: '8. Aireadores' }],
  },
  {
    match: /^Mosquitero para ventana corrediza económica/,
    sku: 'PIR-MOSQ-E',
    category: 'rejas',
    line: ECO,
    photos: [{ folder: '9. Rejas y mosquiteros', file: /\.png$/ }],
  },
  {
    match: /^Mosquitero para ventana corrediza reforzada/,
    sku: 'PIR-MOSQ-R',
    category: 'rejas',
    line: REF,
    photos: [{ folder: '9. Rejas y mosquiteros', file: /\.png$/ }],
  },
  {
    match: /^Reja de hierro/,
    sku: 'PIR-REJA',
    category: 'rejas',
    photos: [{ folder: '9. Rejas y mosquiteros', file: /\.jpe?g$/ }],
    optionLabel: 'Hierro',
  },
]

const W = 1600
const H = 1200

/**
 * Lienzo 4:3 con la foto entera: los bordes se continúan hacia los costados (los fondos son
 * de estudio, lisos), así la tarjeta muestra la abertura completa sin recortarla.
 */
async function productCanvas(input: Buffer): Promise<Buffer> {
  const fg = await sharp(input).rotate().resize(W, H, { fit: 'inside' }).toBuffer()
  const { width = W, height = H } = await sharp(fg).metadata()
  const x = Math.floor((W - width) / 2)
  const y = Math.floor((H - height) / 2)
  return sharp(fg)
    .extend({
      left: x,
      right: W - width - x,
      top: y,
      bottom: H - height - y,
      extendWith: 'copy',
    })
    .jpeg({ quality: 90 })
    .toBuffer()
}

/** Primeras oraciones de la descripción, para tarjetas y buscadores. */
function shortOf(text: string, max = 210): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  let out = ''
  for (const s of sentences) {
    if (out && (out + s).length > max) break
    out += s
  }
  return (out || text).trim().slice(0, 300)
}

const payload = await getPayload({ config })
const catalog = JSON.parse(readFileSync(path.join(DIR, 'catalog.json'), 'utf8')) as {
  products: Doc[]
}
const photos = JSON.parse(readFileSync(path.join(DIR, 'photos.json'), 'utf8')) as Photo[]

const idBySlug = async (collection: 'product-categories' | 'product-lines', slug: string) => {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  if (!docs[0]) throw new Error(`No existe ${collection} "${slug}"`)
  return docs[0].id
}

const mediaCache = new Map<string, number>()
async function mediaFor(photo: Photo, alt: string): Promise<number> {
  const original = readFileSync(path.join(DIR, photo.path))
  const tag = createHash('md5').update(original).digest('hex').slice(0, 12)
  const cached = mediaCache.get(tag)
  if (cached) return cached
  const found = await payload.find({
    collection: 'media',
    where: { filename: { contains: tag } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const existing = found.docs[0]
  const file = async () => {
    const data = await applyWatermark(await productCanvas(original))
    return { data, mimetype: 'image/jpeg', name: `${slugify(alt)}-${tag}.jpg`, size: data.length }
  }
  let id = existing?.id
  if (existing && process.env.REFRESH_PHOTOS) {
    // REFRESH_PHOTOS=1 vuelve a generar las fotos ya cargadas (cambios de lienzo o de marca).
    await payload.update({
      collection: 'media',
      id: existing.id,
      data: { watermarked: true, openingRatio: await openingRatio(original) },
      file: await file(),
      overrideAccess: true,
      overwriteExistingFiles: true,
      context: { ...ctx },
    })
  } else if (existing && existing.openingRatio == null) {
    // Foto ya cargada sin proporción: se completa el dato, sin tocar el archivo.
    const ratio = await openingRatio(original)
    if (ratio)
      await payload.update({
        collection: 'media',
        id: existing.id,
        data: { openingRatio: ratio },
        overrideAccess: true,
        context: { ...ctx },
      })
  } else if (!existing) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt, watermarked: true, openingRatio: await openingRatio(original) },
      file: await file(),
      overrideAccess: true,
      context: { ...ctx },
    })
    id = doc.id
  }
  mediaCache.set(tag, id!)
  return id!
}

/** Categorías de la tienda: las mismas carpetas del Drive, en ese orden. */
const CATEGORIES: { slug: string; name: string; parent?: string }[] = [
  { slug: 'ventanas', name: 'Ventanas' },
  { slug: 'ventanas-economicas', name: 'Ventanas económicas', parent: 'ventanas' },
  { slug: 'ventanas-reforzadas', name: 'Ventanas reforzadas', parent: 'ventanas' },
  { slug: 'ventanas-modena', name: 'Ventanas Módena', parent: 'ventanas' },
  { slug: 'raja', name: 'Rajas' },
  { slug: 'brazo-de-empuje', name: 'Brazo de empuje' },
  { slug: 'panos-fijos', name: 'Paños fijos' },
  { slug: 'puertas', name: 'Puertas' },
  { slug: 'puertas-economicas-25-mm', name: 'Puertas económicas 25 mm', parent: 'puertas' },
  { slug: 'puertas-reforzadas-36-mm', name: 'Puertas reforzadas 36 mm', parent: 'puertas' },
  { slug: 'puertas-modena', name: 'Puertas Módena', parent: 'puertas' },
  { slug: 'puerta-balcon', name: 'Puerta balcón' },
  { slug: 'puerta-balcon-economica', name: 'Puerta balcón económica', parent: 'puerta-balcon' },
  { slug: 'puerta-balcon-reforzada', name: 'Puerta balcón reforzada', parent: 'puerta-balcon' },
  { slug: 'puerta-balcon-modena', name: 'Puerta balcón Módena', parent: 'puerta-balcon' },
  { slug: 'puertas-placa', name: 'Puerta placa' },
  { slug: 'aireadores', name: 'Aireadores' },
  { slug: 'rejas', name: 'Rejas y mosquiteros' },
  { slug: 'mamparas', name: 'Mamparas de baño' },
]
/** Categorías que ya no van (se borran solo si quedaron vacías). */
const OBSOLETE = [
  'ventanas-corredizas',
  'puertas-placa-pino',
  'puertas-placa-cedrillo',
  'puertas-placa-mdf',
  'mamparas-pano-fijo',
  'mamparas-corrediza',
  'mamparas-box',
]

const findCategory = async (slug: string) =>
  (
    await payload.find({
      collection: 'product-categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
  ).docs[0] ?? null

const categoryIds = new Map<string, number>()
for (const [order, c] of CATEGORIES.entries()) {
  const data = {
    name: c.name,
    parent: c.parent ? (categoryIds.get(c.parent) ?? null) : null,
    order,
    _status: 'published' as const,
  }
  const existing = await findCategory(c.slug)
  const doc = existing
    ? await payload.update({
        collection: 'product-categories',
        id: existing.id,
        data,
        overrideAccess: true,
        context: { ...ctx },
      })
    : await payload.create({
        collection: 'product-categories',
        data: { ...data, slug: c.slug },
        overrideAccess: true,
        context: { ...ctx },
      })
  categoryIds.set(c.slug, doc.id)
}

let created = 0
let updated = 0
const skipped: string[] = []

for (const [i, doc] of catalog.products.entries()) {
  const rule = RULES.find((r) => r.match.test(doc.title))
  if (!rule) {
    skipped.push(doc.title)
    continue
  }
  const mine = [
    ...new Map(
      rule.photos
        .flatMap((sel) =>
          photos.filter(
            (p) => p.folder === sel.folder && (!sel.file || sel.file.test(path.basename(p.path))),
          ),
        )
        .map((p) => [p.hash, p]),
    ).values(),
  ]
  if (!mine.length) {
    skipped.push(`${doc.title} (sin fotos)`)
    continue
  }
  if (rule.lead && mine[rule.lead]) mine.unshift(...mine.splice(rule.lead, 1))
  const name = doc.title.replace(/\s+/g, ' ').trim()
  const mediaIds: number[] = []
  for (const p of mine) mediaIds.push(await mediaFor(p, name))

  const colors = [...new Set(doc.rows.map((r) => r.color).filter(Boolean))] as (
    'blanco' | 'negro'
  )[]
  const data = {
    name,
    shortDescription: shortOf(doc.desc[0] ?? name),
    description: richText([
      ...doc.desc,
      ...(doc.notes.length ? ['Para tener en cuenta:', ...doc.notes.map((n) => `• ${n}`)] : []),
    ]),
    featuredImage: mediaIds[0],
    gallery: mediaIds.slice(1),
    category: await idBySlug('product-categories', rule.category),
    line: rule.line ? await idBySlug('product-lines', rule.line) : null,
    featured: Boolean(rule.featured),
    order: 10 + i,
    technicalSpecifications: specs(doc.specs.map(([k, v]) => [k, v, 'Ficha técnica'])),
    shop: {
      enabled: true,
      sku: rule.sku,
      price: Math.min(...doc.rows.map((r) => r.price)),
      measure: null,
      colors: colors.length ? colors : (['blanco'] as 'blanco'[]),
      variants: doc.rows.map((r) => ({
        measure: r.measure,
        color: r.color,
        option: r.option,
        price: r.price,
      })),
      optionLabel: rule.optionLabel ?? null,
      choices: rule.choices ?? [],
      accessories: [],
    },
    _status: 'published' as const,
  }

  const existing = await payload.find({
    collection: 'products',
    where: { 'shop.sku': { equals: rule.sku } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    await payload.update({
      collection: 'products',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
      context: { ...ctx },
    })
    updated++
  } else {
    await payload.create({
      collection: 'products',
      data: { ...data, slug: slugify(name) },
      overrideAccess: true,
      context: { ...ctx },
    })
    created++
  }
  payload.logger.info(
    `${rule.sku} · ${name} · ${doc.rows.length} precios · ${mediaIds.length} fotos`,
  )
}

// Fotos de categorías y líneas (home, menú, listados): también salen del Drive.
const MAMP = '10. Mamparas de baño'
const PLACA = '7. Puerta Placa'
const SECTION_PHOTOS: {
  collection: 'product-categories' | 'product-lines'
  slug: string
  folder: string
  /** Posición de la foto dentro de la carpeta (por defecto, la primera). */
  index?: number
}[] = [
  {
    collection: 'product-categories',
    slug: 'ventanas-economicas',
    folder: `${V}/1. Economicas/Ventana corrediza vidrio entero`,
    index: 2,
  },
  {
    collection: 'product-categories',
    slug: 'ventanas',
    folder: `${V}/2. Reforzada/Ventana corrediza reforzada vidrio entero con celosia`,
    index: 1,
  },
  {
    collection: 'product-categories',
    slug: 'ventanas-reforzadas',
    folder: `${V}/2. Reforzada/Ventana corrediza reforzada vidrio repartido`,
  },
  { collection: 'product-categories', slug: 'raja', folder: '2. Rajas' },
  { collection: 'product-categories', slug: 'brazo-de-empuje', folder: '3. Brazo de empuje' },
  { collection: 'product-categories', slug: 'panos-fijos', folder: '4. Paño fijos' },
  { collection: 'product-categories', slug: 'puertas', folder: P36, index: 14 },
  {
    collection: 'product-categories',
    slug: 'puertas-economicas-25-mm',
    folder: '5. Puertas/1. Económicas 25 mm',
  },
  { collection: 'product-categories', slug: 'puertas-reforzadas-36-mm', folder: P36 },
  { collection: 'product-categories', slug: 'puertas-modena', folder: '5. Puertas/3. Modena' },
  {
    collection: 'product-categories',
    slug: 'puerta-balcon',
    folder: `${PB}/2. Reforzada/Puerta corrediza balcón reforzada`,
  },
  {
    collection: 'product-categories',
    slug: 'puerta-balcon-economica',
    folder: `${PB}/1. Economica`,
  },
  {
    collection: 'product-categories',
    slug: 'puerta-balcon-reforzada',
    folder: `${PB}/2. Reforzada/Puerta corrediza balcón reforzada con celosia corrediza`,
  },
  { collection: 'product-categories', slug: 'puerta-balcon-modena', folder: `${PB}/3. Módena` },
  { collection: 'product-categories', slug: 'puertas-placa', folder: PLACA, index: 5 },
  { collection: 'product-categories', slug: 'aireadores', folder: '8. Aireadores', index: 3 },
  { collection: 'product-categories', slug: 'rejas', folder: '9. Rejas y mosquiteros' },
  { collection: 'product-categories', slug: 'mamparas', folder: MAMP, index: 1 },
  {
    collection: 'product-lines',
    slug: ECO,
    folder: `${V}/1. Economicas/Ventana corrediza vidrio entero`,
    index: 1,
  },
  {
    collection: 'product-lines',
    slug: REF,
    folder: `${V}/2. Reforzada/Ventana corrediza reforzada vidrio repartido`,
    index: 1,
  },
  { collection: 'product-lines', slug: 'modena', folder: '5. Puertas/3. Modena', index: 1 },
]

let sections = 0
for (const sec of SECTION_PHOTOS) {
  const inFolder = photos.filter((p) => p.folder === sec.folder)
  const photo = inFolder[sec.index ?? 0] ?? inFolder[0]
  const found = await payload.find({
    collection: sec.collection,
    where: { slug: { equals: sec.slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const target = found.docs[0]
  if (!photo || !target) continue
  const media = await mediaFor(photo, (target as { name?: string }).name ?? sec.slug)
  if (sec.collection === 'product-categories')
    await payload.update({
      collection: 'product-categories',
      id: target.id,
      data: { image: media },
      overrideAccess: true,
      context: { ...ctx },
    })
  else
    await payload.update({
      collection: 'product-lines',
      id: target.id,
      data: { heroImage: media },
      overrideAccess: true,
      context: { ...ctx },
    })
  sections++
}

// Productos de ejemplo de la tienda (código EJ-…, precios ficticios): se eliminan.
const examples = await payload.find({
  collection: 'products',
  where: { 'shop.sku': { like: 'EJ-' } },
  limit: 200,
  depth: 0,
  draft: true,
  overrideAccess: true,
})
for (const ex of examples.docs)
  await payload.delete({
    collection: 'products',
    id: ex.id,
    overrideAccess: true,
    context: { ...ctx },
  })

// Categorías que ya no están en el Drive: se borran si quedaron sin productos.
let removed = 0
for (const slug of OBSOLETE) {
  const cat = await findCategory(slug)
  if (!cat) continue
  const used = await payload.count({
    collection: 'products',
    where: { category: { equals: cat.id } },
    overrideAccess: true,
  })
  if (used.totalDocs > 0) continue
  await payload.delete({
    collection: 'product-categories',
    id: cat.id,
    overrideAccess: true,
    context: { ...ctx },
  })
  removed++
}

payload.logger.info(
  `Catálogo: ${created} creados · ${updated} actualizados · ${sections} fotos de categorías y líneas · ${examples.docs.length} de ejemplo eliminados · ${removed} categorías viejas eliminadas${skipped.length ? ` · sin cargar: ${skipped.join(' | ')}` : ''}`,
)
// El script escribe por fuera de Next: se le pide al sitio que vacíe su caché de datos.
// SITE_URL=https://… (el sitio que usa esta misma base).
if (process.env.SITE_URL && process.env.DATABASE_URL) {
  const token = createHash('sha256').update(process.env.DATABASE_URL).digest('hex')
  const res = await fetch(`${process.env.SITE_URL.replace(/\/$/, '')}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-token': token },
  })
  payload.logger.info(`Caché del sitio: ${res.ok ? 'actualizado' : `no se pudo (${res.status})`}`)
}

process.exit(0)
