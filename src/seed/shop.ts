import type { Payload } from 'payload'

import type { Product } from '@/payload-types'

import { slugify } from '@/lib/slugify'

import { seedMedia, specs } from './helpers'

/**
 * Presupuesto online: categorías de la tienda (con subcategorías), configuración y
 * productos de EJEMPLO en medidas estándar (precios ocultos en la web). Idempotente:
 *   - crea lo que falta,
 *   - actualiza solo los productos de ejemplo (código "EJ-…"), nunca los cargados a mano.
 *
 * Los precios y las medidas son de EJEMPLO: hay que reemplazarlos por los reales.
 */

const ctx = { disableRevalidate: true }

type Cat = {
  slug: string
  name: string
  parent?: string
  /** Categoría existente que se reutiliza (y se renombra) en lugar de crear otra. */
  reuse?: string
}

/** Categorías de la tienda, en el orden en que se muestran. */
const CATEGORIES: Cat[] = [
  { slug: 'ventanas-corredizas', name: 'Ventanas corredizas' },
  { slug: 'raja', name: 'Raja' },
  { slug: 'brazo-de-empuje', name: 'Brazo de empuje' },
  { slug: 'panos-fijos', name: 'Paños fijos' },
  { slug: 'puertas', name: 'Puertas', reuse: 'puertas' },
  { slug: 'puertas-economicas-25-mm', name: 'Puertas económicas 25 mm', parent: 'puertas' },
  { slug: 'puertas-reforzadas-36-mm', name: 'Puertas reforzadas 36 mm', parent: 'puertas' },
  { slug: 'puertas-modena', name: 'Puertas Módena', parent: 'puertas' },
  { slug: 'puerta-balcon', name: 'Puerta balcón' },
  {
    slug: 'puerta-balcon-economica',
    name: 'Puerta balcón económica sin umbral transitable',
    parent: 'puerta-balcon',
  },
  { slug: 'puerta-balcon-reforzada', name: 'Puerta balcón reforzada', parent: 'puerta-balcon' },
  { slug: 'puerta-balcon-modena', name: 'Puerta balcón Módena', parent: 'puerta-balcon' },
  { slug: 'puertas-placa', name: 'Puertas placa' },
  { slug: 'puertas-placa-pino', name: 'Puerta placa pino', parent: 'puertas-placa' },
  { slug: 'puertas-placa-cedrillo', name: 'Puerta placa cedrillo', parent: 'puertas-placa' },
  { slug: 'puertas-placa-mdf', name: 'Puerta placa MDF', parent: 'puertas-placa' },
  { slug: 'aireadores', name: 'Aireadores' },
  { slug: 'rejas', name: 'Rejas y mosquiteros', reuse: 'rejas' },
  { slug: 'mamparas', name: 'Mamparas de baño', reuse: 'mamparas' },
  { slug: 'mamparas-pano-fijo', name: 'Mampara paño fijo', parent: 'mamparas' },
  { slug: 'mamparas-corrediza', name: 'Mampara corrediza', parent: 'mamparas' },
  { slug: 'mamparas-box', name: 'Mampara box', parent: 'mamparas' },
]

/** Categorías del catálogo a medida que quedan después de las de la tienda. */
const AFTER = ['ventanas', 'vidrios', 'otras-soluciones']

type Acc = { celosia?: number; mosquitero?: number; reja?: number }

type Example = {
  name: string
  category: string
  /** Categoría de donde tomar una foto (las de ejemplo usan fotos ya cargadas). */
  photo: string
  line?: string
  price: number
  measure: string
  colors?: ('blanco' | 'negro')[]
  accessories?: Acc
  short: string
  featured?: boolean
  promo?: boolean
  specs?: [string, string][]
}

const BW: ('blanco' | 'negro')[] = ['blanco', 'negro']

const EXAMPLES: Example[] = [
  // --- Ventanas corredizas ----------------------------------------------------------------
  {
    name: 'Ventana corrediza 1,20 × 1,10 con vidrio',
    category: 'ventanas-corredizas',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 168000,
    measure: '1,20 × 1,10 m',
    accessories: { celosia: 98000, mosquitero: 21000, reja: 64000 },
    short: 'Ventana corrediza de dos hojas con vidrio entero de 4 mm. Medida estándar.',
    featured: true,
    specs: [
      ['Hojas', '2 corredizas'],
      ['Vidrio', 'Float 4 mm'],
    ],
  },
  {
    name: 'Ventana corrediza 1,50 × 1,10 con vidrio',
    category: 'ventanas-corredizas',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 196000,
    measure: '1,50 × 1,10 m',
    accessories: { celosia: 118000, mosquitero: 24000, reja: 78000 },
    short: 'Ventana corrediza de dos hojas con vidrio entero de 4 mm.',
    featured: true,
  },
  {
    name: 'Ventana corrediza 2,00 × 1,10 con vidrio',
    category: 'ventanas-corredizas',
    photo: 'ventanas',
    line: 'herrero-reforzada',
    price: 238000,
    measure: '2,00 × 1,10 m',
    accessories: { celosia: 152000, mosquitero: 29000, reja: 98000 },
    short: 'Ventana corrediza amplia para livings y dormitorios, con vidrio entero.',
  },
  // --- Raja -------------------------------------------------------------------------------
  {
    name: 'Raja de abrir con vidrio',
    category: 'raja',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 83600,
    measure: '0,40 × 1,00 m',
    accessories: { mosquitero: 9800, reja: 26000 },
    short: 'Paño vertical de abrir para baños, pasillos y escaleras.',
  },
  {
    name: 'Raja de abrir 0,40 × 0,60 con vidrio',
    category: 'raja',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 69800,
    measure: '0,40 × 0,60 m',
    accessories: { mosquitero: 7600, reja: 19500 },
    short: 'Raja de abrir compacta para ventilar baños y lavaderos.',
  },
  // --- Brazo de empuje --------------------------------------------------------------------
  {
    name: 'Ventiluz 0,60 × 0,40 con vidrio',
    category: 'brazo-de-empuje',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 49800,
    measure: '0,60 × 0,40 m',
    accessories: { mosquitero: 7200, reja: 16800 },
    short: 'Ventiluz con brazo de empuje para baños y lavaderos.',
  },
  {
    name: 'Ventana brazo de empuje 0,60 × 0,60',
    category: 'brazo-de-empuje',
    photo: 'ventanas',
    line: 'herrero-reforzada',
    price: 92500,
    measure: '0,60 × 0,60 m',
    accessories: { mosquitero: 11800, reja: 24000 },
    short: 'Ventana proyectante con brazo de empuje: ventila aunque llueva.',
  },
  // --- Paños fijos ------------------------------------------------------------------------
  {
    name: 'Paño fijo 1,00 × 1,00 con vidrio',
    category: 'panos-fijos',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 74900,
    measure: '1,00 × 1,00 m',
    accessories: { reja: 39000 },
    short: 'Paño fijo con vidrio entero para sumar luz sin abrir.',
  },
  {
    name: 'Paño fijo 1,50 × 1,00 con vidrio',
    category: 'panos-fijos',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 96500,
    measure: '1,50 × 1,00 m',
    accessories: { reja: 52000 },
    short: 'Paño fijo apaisado para livings, cocinas y escaleras.',
  },
  // --- Puertas ----------------------------------------------------------------------------
  {
    name: 'Puerta económica 25 mm ciega',
    category: 'puertas-economicas-25-mm',
    photo: 'puertas',
    line: 'herrero-economica',
    price: 214000,
    measure: '0,80 × 2,00 m',
    short: 'Puerta de exterior con hoja de 25 mm, ciega. Lista para colocar.',
  },
  {
    name: 'Puerta económica 25 mm con vidrio superior',
    category: 'puertas-economicas-25-mm',
    photo: 'puertas',
    line: 'herrero-economica',
    price: 229000,
    measure: '0,80 × 2,00 m',
    short: 'Hoja de 25 mm con paño de vidrio superior. Para patios y lavaderos.',
  },
  {
    name: 'Puerta de aluminio 36 mm tubular ciega',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 361500,
    measure: '0,80 × 2,00 m',
    short: 'Puerta de exterior ciega con hoja tubular de 36 mm, con marco y cerradura.',
    featured: true,
    promo: true,
    specs: [
      ['Hoja', 'Tubular 36 mm'],
      ['Incluye', 'Marco, bisagras y cerradura'],
    ],
  },
  {
    name: 'Puerta de aluminio 36 mm tubular con vidrio superior',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 369200,
    measure: '0,80 × 2,00 m',
    short: 'Hoja tubular de 36 mm con paño de vidrio superior.',
    promo: true,
  },
  {
    name: 'Puerta de aluminio 36 mm tubular con vidrio lateral',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 369200,
    measure: '0,80 × 2,00 m',
    short: 'Puerta tubular con vidrio lateral vertical. Un frente moderno para la entrada.',
    featured: true,
    promo: true,
  },
  {
    name: 'Puerta de aluminio 36 mm medio vidrio repartido',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 369200,
    measure: '0,80 × 2,00 m',
    short: 'Mitad superior con vidrio repartido y mitad inferior tubular.',
  },
  {
    name: 'Puerta de aluminio 36 mm vidrio entero con faja',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 304600,
    measure: '0,80 × 2,00 m',
    short: 'Hoja de vidrio entero con faja central. Para galerías, patios y lavaderos.',
  },
  {
    name: 'Puerta de aluminio 36 mm con raja de abrir',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 536600,
    measure: '0,90 × 2,00 m',
    short: 'Puerta reforzada con raja lateral de abrir para ventilar.',
  },
  {
    name: 'Puerta doble 36 mm vidrio repartido',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 684250,
    measure: '1,20 × 2,00 m',
    short: 'Puerta de dos hojas con vidrio repartido para frentes y quinchos.',
  },
  {
    name: 'Puerta y media 36 mm tubular ciega',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 612600,
    measure: '1,20 × 2,00 m',
    short: 'Hoja principal más media hoja fija con vidrio stipolite.',
  },
  {
    name: 'Portón 36 mm tubular con vidrio superior',
    category: 'puertas-reforzadas-36-mm',
    photo: 'puertas',
    line: 'herrero-reforzada',
    price: 1246000,
    measure: '2,40 × 2,00 m',
    short: 'Portón de dos hojas de abrir, tubular, con vidrio superior.',
  },
  {
    name: 'Puerta Módena con vidrio entero',
    category: 'puertas-modena',
    photo: 'puertas',
    line: 'modena',
    price: 489000,
    measure: '0,80 × 2,00 m',
    short: 'Puerta línea Módena con vidrio entero: perfiles robustos y mejor hermeticidad.',
    featured: true,
  },
  {
    name: 'Puerta Módena ciega',
    category: 'puertas-modena',
    photo: 'puertas',
    line: 'modena',
    price: 512000,
    measure: '0,80 × 2,00 m',
    short: 'Puerta línea Módena con panel ciego para accesos principales.',
  },
  // --- Puerta balcón ----------------------------------------------------------------------
  {
    name: 'Puerta balcón económica 1,50 × 2,00',
    category: 'puerta-balcon-economica',
    photo: 'ventanas',
    line: 'herrero-economica',
    price: 224000,
    measure: '1,50 × 2,00 m',
    accessories: { mosquitero: 52000, reja: 112000 },
    short: 'Puerta balcón corrediza económica, sin umbral transitable, con vidrio entero.',
  },
  {
    name: 'Puerta ventana 1,50 × 2,00 con umbral transitable',
    category: 'puerta-balcon-reforzada',
    photo: 'ventanas',
    line: 'herrero-reforzada',
    price: 260000,
    measure: '1,50 × 2,00 m',
    accessories: { celosia: 210000, mosquitero: 67900, reja: 118000 },
    short: 'Puerta balcón corrediza reforzada con vidrio entero y umbral transitable.',
    promo: true,
  },
  {
    name: 'Puerta ventana 2,00 × 2,00 con umbral transitable',
    category: 'puerta-balcon-reforzada',
    photo: 'ventanas',
    line: 'herrero-reforzada',
    price: 315400,
    measure: '2,00 × 2,00 m',
    accessories: { celosia: 260000, mosquitero: 79000, reja: 148000 },
    short: 'Puerta balcón de dos hojas con vidrio entero y umbral transitable.',
    featured: true,
    promo: true,
  },
  {
    name: 'Puerta balcón Módena 1,50 × 2,00',
    category: 'puerta-balcon-modena',
    photo: 'ventanas',
    line: 'modena',
    price: 598000,
    measure: '1,50 × 2,00 m',
    accessories: { mosquitero: 79000, reja: 128000 },
    short: 'Puerta balcón línea Módena: más aislación y un cierre más firme.',
  },
  // --- Puertas placa ----------------------------------------------------------------------
  {
    name: 'Puerta placa pino',
    category: 'puertas-placa-pino',
    photo: 'otras-soluciones',
    price: 81900,
    measure: '0,70 × 2,00 m',
    colors: [],
    short: 'Puerta placa de interior en pino, con marco de chapa. Lista para pintar.',
    featured: true,
  },
  {
    name: 'Puerta placa cedrillo',
    category: 'puertas-placa-cedrillo',
    photo: 'otras-soluciones',
    price: 115250,
    measure: '0,70 × 2,00 m',
    colors: [],
    short: 'Puerta placa de interior enchapada en cedrillo, con marco de chapa.',
  },
  {
    name: 'Puerta placa MDF para pintar',
    category: 'puertas-placa-mdf',
    photo: 'otras-soluciones',
    price: 72900,
    measure: '0,70 × 2,00 m',
    colors: ['blanco'],
    short: 'Puerta placa de interior en MDF con fondo blanco, con marco de chapa.',
  },
  // --- Aireadores -------------------------------------------------------------------------
  {
    name: 'Aireador de aluminio',
    category: 'aireadores',
    photo: 'otras-soluciones',
    price: 37400,
    measure: '0,30 × 0,30 m',
    short: 'Rejilla de ventilación con marco de aluminio para baños, cocinas y lavaderos.',
  },
  {
    name: 'Aireador regulable 0,20 × 0,20',
    category: 'aireadores',
    photo: 'otras-soluciones',
    price: 28900,
    measure: '0,20 × 0,20 m',
    short: 'Aireador con persiana regulable para controlar la ventilación.',
  },
  // --- Rejas y mosquiteros ----------------------------------------------------------------
  {
    name: 'Reja para ventana 1,50 × 1,10',
    category: 'rejas',
    photo: 'rejas',
    price: 78000,
    measure: '1,50 × 1,10 m',
    short: 'Reja de hierro macizo para ventana, con grampas para amurar.',
  },
  {
    name: 'Puerta reja de hierro',
    category: 'rejas',
    photo: 'rejas',
    price: 160000,
    measure: '0,80 × 2,00 m',
    colors: ['negro'],
    short: 'Puerta reja de hierro macizo con marco, bisagras y pasador.',
  },
  {
    name: 'Mosquitero para ventana corrediza',
    category: 'rejas',
    photo: 'otras-soluciones',
    price: 21000,
    measure: 'Hasta 1,50 × 1,10 m',
    short: 'Mosquitero corredizo de aluminio con tela de fibra de vidrio.',
  },
  {
    name: 'Mosquitero para puerta ventana',
    category: 'rejas',
    photo: 'otras-soluciones',
    price: 67900,
    measure: 'Hasta 2,00 × 2,00 m',
    short: 'Mosquitero corredizo para puerta ventana, con tela de fibra de vidrio.',
  },
  // --- Mamparas de baño -------------------------------------------------------------------
  {
    name: 'Mampara paño fijo 0,80 × 1,80',
    category: 'mamparas-pano-fijo',
    photo: 'mamparas',
    price: 189000,
    measure: '0,80 × 1,80 m',
    short: 'Paño fijo para duchas abiertas, con paneles que no cortan ni estallan.',
  },
  {
    name: 'Mampara corrediza 1,20 × 1,80',
    category: 'mamparas-corrediza',
    photo: 'mamparas',
    price: 329000,
    measure: '1,20 × 1,80 m',
    short: 'Mampara frontal corrediza para ducha o bañera.',
    featured: true,
  },
  {
    name: 'Mampara box 0,80 × 0,80 × 1,80',
    category: 'mamparas-box',
    photo: 'mamparas',
    price: 412000,
    measure: '0,80 × 0,80 × 1,80 m',
    short: 'Mampara box angular para receptáculos de ducha cuadrados.',
  },
]

async function findBySlug(
  payload: Payload,
  collection: 'product-categories' | 'product-lines' | 'products',
  slug: string,
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

async function seedCategories(payload: Payload): Promise<Map<string, number>> {
  const ids = new Map<string, number>()
  let order = 0
  for (const c of CATEGORIES) {
    const parent = c.parent ? (ids.get(c.parent) ?? null) : null
    const existing = await findBySlug(payload, 'product-categories', c.reuse ?? c.slug)
    const data = { name: c.name, parent, order: order++, _status: 'published' as const }
    const doc = existing
      ? await payload.update({
          collection: 'product-categories',
          id: existing.id,
          data,
          overrideAccess: true,
          context: ctx,
        })
      : await payload.create({
          collection: 'product-categories',
          data: { ...data, slug: c.slug },
          overrideAccess: true,
          context: ctx,
        })
    ids.set(c.slug, doc.id)
  }
  for (const slug of AFTER) {
    const doc = await findBySlug(payload, 'product-categories', slug)
    if (doc)
      await payload.update({
        collection: 'product-categories',
        id: doc.id,
        data: { order: order++ },
        overrideAccess: true,
        context: ctx,
      })
  }
  return ids
}

export async function seedShop(payload: Payload): Promise<void> {
  // --- Configuración: solo si sigue la de la tienda anterior (cartel de descuentos) ------
  const settings = await payload.findGlobal({
    slug: 'shop-settings',
    depth: 0,
    overrideAccess: true,
  })
  if (!settings.announcement || /transferencia/i.test(settings.announcement)) {
    await payload.updateGlobal({
      slug: 'shop-settings',
      data: {
        enabled: true,
        announcement: 'Presupuesto automático en el acto por WhatsApp',
        transferDiscount: settings.transferDiscount ?? 20,
        installments: settings.installments ?? 3,
        validityDays: 7,
        thanksMessage:
          'Te escribimos por WhatsApp para resolver tus dudas, coordinar la entrega o la colocación.',
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  const categories = await seedCategories(payload)

  // --- Fotos: se reutilizan las de los productos ya cargados de cada categoría ------------
  const photos = new Map<string, number[]>()
  const photoFor = async (slug: string, i: number) => {
    if (!photos.has(slug)) {
      const cat = await findBySlug(payload, 'product-categories', slug)
      const { docs } = cat
        ? await payload.find({
            collection: 'products',
            where: {
              and: [{ category: { equals: cat.id } }, { 'shop.enabled': { not_equals: true } }],
            },
            limit: 20,
            depth: 0,
            draft: true,
            overrideAccess: true,
          })
        : { docs: [] }
      photos.set(slug, [
        ...new Set(
          docs.map((d) => d.featuredImage).filter((v): v is number => typeof v === 'number'),
        ),
      ])
    }
    const list = photos.get(slug)!
    return list.length ? list[i % list.length] : seedMedia(payload, `Foto: ${slug}`, 'light')
  }

  let created = 0
  let updated = 0
  for (const [i, ex] of EXAMPLES.entries()) {
    const slug = slugify(ex.name)
    const category = categories.get(ex.category)
    if (!category) continue
    const line = ex.line ? await findBySlug(payload, 'product-lines', ex.line) : null
    const shop = {
      enabled: true,
      price: ex.price,
      measure: ex.measure,
      colors: ex.colors ?? BW,
      accessories: Object.entries(ex.accessories ?? {}).map(([kind, price]) => ({
        kind: kind as 'celosia' | 'mosquitero' | 'reja',
        price,
      })),
      transferDiscount: ex.promo ? 35 : null,
      installments: null,
    }
    const existing = (await findBySlug(payload, 'products', slug)) as Product | null
    if (existing) {
      // Solo se tocan los de ejemplo: los productos reales no se modifican.
      if (!existing.shop?.sku?.startsWith('EJ-')) continue
      await payload.update({
        collection: 'products',
        id: existing.id,
        data: { category, line: line?.id ?? null, shop: { ...shop, sku: existing.shop!.sku } },
        overrideAccess: true,
        context: ctx,
      })
      updated++
      continue
    }
    await payload.create({
      collection: 'products',
      data: {
        name: ex.name,
        slug,
        shortDescription: ex.short,
        featuredImage: await photoFor(ex.photo, i),
        category,
        line: line?.id ?? undefined,
        featured: Boolean(ex.featured),
        order: 100 + i,
        technicalSpecifications: specs([['Medida', ex.measure], ...(ex.specs ?? [])]),
        quote: { enabled: false },
        shop: { ...shop, sku: `EJ-${String(200 + i)}` },
        _status: 'published',
      },
      overrideAccess: true,
      context: ctx,
    })
    created++
  }
  payload.logger.info(
    `Presupuesto online listo ✔ (${categories.size} categorías · ${created} productos de ejemplo creados · ${updated} actualizados)`,
  )
}
