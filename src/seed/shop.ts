import type { Payload } from 'payload'

import { slugify } from '@/lib/slugify'

import { seedMedia, specs } from './helpers'

/**
 * Tienda online: configuración inicial + productos de ejemplo con precio (medidas estándar,
 * como los que ofrecen las tiendas de aberturas de la zona). Idempotente: no pisa productos
 * ni configuración ya cargados.
 *
 * Los precios y las medidas son de EJEMPLO: hay que reemplazarlos por los reales.
 */

const ctx = { disableRevalidate: true }

type Example = {
  name: string
  category: string // slug de la categoría
  line?: string // slug de la línea
  price: number
  measure?: string
  colors?: ('blanco' | 'negro' | 'anodizado' | 'madera' | 'bronce')[]
  short: string
  featured?: boolean
  /** Promo: más descuento por transferencia y descuento con Mercado Pago. */
  promo?: boolean
  specs?: [string, string][]
}

const EXAMPLES: Example[] = [
  // --- Puertas -----------------------------------------------------------------------
  {
    name: 'Puerta de aluminio 36 mm tubular ciega',
    category: 'puertas',
    line: 'herrero-economica',
    price: 361500,
    measure: '0,80 × 2,00 m',
    colors: ['blanco', 'negro'],
    short:
      'Puerta de exterior ciega con hoja tubular de 36 mm. Lista para colocar, con marco y cerradura.',
    featured: true,
    promo: true,
    specs: [
      ['Hoja', 'Tubular 36 mm'],
      ['Apertura', 'Derecha o izquierda'],
      ['Incluye', 'Marco, bisagras y cerradura'],
    ],
  },
  {
    name: 'Puerta de aluminio 36 mm tubular con vidrio superior',
    category: 'puertas',
    line: 'herrero-economica',
    price: 369200,
    measure: '0,80 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Hoja tubular de 36 mm con paño de vidrio superior: entra luz sin perder privacidad.',
    promo: true,
    specs: [
      ['Hoja', 'Tubular 36 mm'],
      ['Vidrio', 'Superior, 4 mm'],
      ['Incluye', 'Marco, bisagras y cerradura'],
    ],
  },
  {
    name: 'Puerta de aluminio 36 mm tubular con vidrio lateral',
    category: 'puertas',
    line: 'herrero-economica',
    price: 369200,
    measure: '0,80 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Puerta tubular con vidrio lateral vertical. Un frente moderno para la entrada.',
    featured: true,
    promo: true,
  },
  {
    name: 'Puerta de aluminio 36 mm medio vidrio repartido',
    category: 'puertas',
    line: 'herrero-economica',
    price: 369200,
    measure: '0,80 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Mitad superior con vidrio repartido y mitad inferior tubular.',
    promo: true,
  },
  {
    name: 'Puerta de aluminio 36 mm vidrio entero con faja',
    category: 'puertas',
    line: 'herrero-reforzada',
    price: 304600,
    measure: '0,80 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Hoja de vidrio entero con faja central. Para galerías, patios y lavaderos.',
  },
  {
    name: 'Puerta de aluminio 36 mm con raja de abrir',
    category: 'puertas',
    line: 'herrero-reforzada',
    price: 536600,
    measure: '0,90 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Puerta reforzada con raja lateral de abrir para ventilar sin abrir la puerta.',
  },
  {
    name: 'Puerta doble 36 mm vidrio repartido',
    category: 'puertas',
    line: 'herrero-reforzada',
    price: 684250,
    measure: '1,20 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Puerta de dos hojas con vidrio repartido. Entrada amplia para frentes y quinchos.',
  },
  {
    name: 'Puerta y media 36 mm tubular ciega',
    category: 'puertas',
    line: 'herrero-reforzada',
    price: 612600,
    measure: '1,20 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Hoja principal más media hoja fija con vidrio stipolite.',
  },
  {
    name: 'Portón 36 mm tubular con vidrio superior',
    category: 'puertas',
    line: 'herrero-reforzada',
    price: 1246000,
    measure: '2,40 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Portón de dos hojas de abrir, tubular, con vidrio superior. Para garaje o galpón.',
    featured: true,
    promo: true,
  },
  // --- Ventanas ----------------------------------------------------------------------
  {
    name: 'Ventana corrediza 1,20 × 1,10 con vidrio',
    category: 'ventanas',
    line: 'herrero-economica',
    price: 168000,
    measure: '1,20 × 1,10 m',
    colors: ['blanco', 'negro'],
    short:
      'Ventana corrediza de dos hojas con vidrio entero de 4 mm. Medida estándar, entrega inmediata.',
    featured: true,
    specs: [
      ['Hojas', '2 corredizas'],
      ['Vidrio', 'Float 4 mm'],
      ['Mosquitero', 'Opcional'],
    ],
  },
  {
    name: 'Ventana corrediza 1,50 × 1,10 con vidrio',
    category: 'ventanas',
    line: 'herrero-economica',
    price: 196000,
    measure: '1,50 × 1,10 m',
    colors: ['blanco', 'negro'],
    short: 'Ventana corrediza de dos hojas con vidrio entero de 4 mm.',
  },
  {
    name: 'Puerta ventana 1,50 × 2,00 con umbral transitable',
    category: 'ventanas',
    line: 'herrero-economica',
    price: 260000,
    measure: '1,50 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Puerta ventana corrediza con vidrio entero y umbral transitable.',
    promo: true,
  },
  {
    name: 'Puerta ventana 2,00 × 2,00 con umbral transitable',
    category: 'ventanas',
    line: 'herrero-economica',
    price: 315400,
    measure: '2,00 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Puerta ventana corrediza de dos hojas con vidrio entero y umbral transitable.',
    featured: true,
    promo: true,
  },
  {
    name: 'Raja de abrir con vidrio',
    category: 'ventanas',
    line: 'herrero-economica',
    price: 83600,
    measure: '0,40 × 1,00 m',
    colors: ['blanco', 'negro'],
    short: 'Paño vertical de abrir para baños, pasillos y escaleras.',
  },
  {
    name: 'Ventiluz 0,60 × 0,40 con vidrio',
    category: 'ventanas',
    line: 'herrero-economica',
    price: 49800,
    measure: '0,60 × 0,40 m',
    colors: ['blanco', 'negro'],
    short: 'Ventiluz proyectante para baños y lavaderos.',
  },
  // --- Otras soluciones y accesorios ---------------------------------------------------
  {
    name: 'Puerta placa pino',
    category: 'otras-soluciones',
    price: 81900,
    measure: '0,70 × 2,00 m',
    short: 'Puerta placa de interior en pino, con marco de chapa. Lista para pintar.',
    featured: true,
  },
  {
    name: 'Puerta placa cedrillo',
    category: 'otras-soluciones',
    price: 115250,
    measure: '0,70 × 2,00 m',
    short: 'Puerta placa de interior enchapada en cedrillo, con marco de chapa.',
  },
  {
    name: 'Mosquitero para ventana corrediza',
    category: 'otras-soluciones',
    price: 21000,
    measure: 'Hasta 1,50 × 1,10 m',
    colors: ['blanco', 'negro'],
    short: 'Mosquitero corredizo de aluminio con tela de fibra de vidrio.',
  },
  {
    name: 'Mosquitero para puerta ventana',
    category: 'otras-soluciones',
    price: 67900,
    measure: 'Hasta 2,00 × 2,00 m',
    colors: ['blanco', 'negro'],
    short: 'Mosquitero corredizo para puerta ventana, con tela de fibra de vidrio.',
  },
  {
    name: 'Aireador de aluminio',
    category: 'otras-soluciones',
    price: 37400,
    measure: '0,30 × 0,30 m',
    colors: ['blanco'],
    short: 'Rejilla de ventilación con marco de aluminio para baños, cocinas y lavaderos.',
  },
  {
    name: 'Puerta reja de hierro',
    category: 'rejas',
    price: 160000,
    measure: '0,80 × 2,00 m',
    colors: ['negro'],
    short: 'Puerta reja de hierro macizo con marco, bisagras y pasador.',
  },
]

async function idBySlug(
  payload: Payload,
  collection: 'product-categories' | 'product-lines',
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
  return docs[0]?.id ?? null
}

export async function seedShop(payload: Payload): Promise<void> {
  // --- Configuración: solo si todavía no se cargaron formas de entrega ------------------
  const settings = await payload.findGlobal({
    slug: 'shop-settings',
    depth: 0,
    overrideAccess: true,
  })
  if (!settings.shippingMethods?.length) {
    await payload.updateGlobal({
      slug: 'shop-settings',
      data: {
        enabled: true,
        announcement: 'Hasta 35% off pagando por transferencia · 3 cuotas sin interés',
        transferDiscount: 20,
        mpDiscount: 0,
        installments: 3,
        shippingMethods: [
          {
            label: 'Retiro en el taller',
            type: 'pickup',
            description: 'Coronda, Santa Fe. Te avisamos cuando esté listo. Sin costo.',
          },
          {
            label: 'Envío a domicilio',
            type: 'delivery',
            quoteLater: true,
            description: 'Coronda y la región. Coordinamos el costo según tu localidad.',
          },
        ],
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  // --- Productos de ejemplo --------------------------------------------------------------
  const photos = new Map<string, number[]>()
  const photoFor = async (category: string, categoryId: number, i: number) => {
    if (!photos.has(category)) {
      const { docs } = await payload.find({
        collection: 'products',
        where: { category: { equals: categoryId } },
        limit: 20,
        depth: 0,
        draft: true,
        overrideAccess: true,
      })
      photos.set(category, [
        ...new Set(
          docs.map((d) => d.featuredImage).filter((v): v is number => typeof v === 'number'),
        ),
      ])
    }
    const list = photos.get(category)!
    return list.length ? list[i % list.length] : seedMedia(payload, `Foto: ${category}`, 'light')
  }

  let created = 0
  for (const [i, ex] of EXAMPLES.entries()) {
    const slug = slugify(ex.name)
    const exists = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    if (exists.docs.length) continue
    const category = await idBySlug(payload, 'product-categories', ex.category)
    if (!category) {
      payload.logger.warn(`Tienda: no existe la categoría "${ex.category}" (se omite ${ex.name})`)
      continue
    }
    const line = ex.line ? await idBySlug(payload, 'product-lines', ex.line) : null
    await payload.create({
      collection: 'products',
      data: {
        name: ex.name,
        slug,
        shortDescription: ex.short,
        featuredImage: await photoFor(ex.category, category, i),
        category,
        line: line ?? undefined,
        featured: Boolean(ex.featured),
        order: 100 + i,
        technicalSpecifications: specs([
          ...(ex.measure ? ([['Medida', ex.measure]] as [string, string][]) : []),
          ...(ex.specs ?? []),
        ]),
        quote: { enabled: false },
        shop: {
          enabled: true,
          price: ex.price,
          sku: `EJ-${String(i + 1).padStart(3, '0')}`,
          measure: ex.measure,
          colors: ex.colors ?? [],
          transferDiscount: ex.promo ? 35 : undefined,
          mpDiscount: ex.promo ? 18 : undefined,
          trackStock: false,
        },
        _status: 'published',
      },
      overrideAccess: true,
      context: ctx,
    })
    created++
  }
  payload.logger.info(`Tienda online lista ✔ (${created} productos de ejemplo creados)`)
}
