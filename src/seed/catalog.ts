import type { Payload } from 'payload'

import { slugify } from '@/lib/slugify'

import { facts, richText, seedMedia, specs, texts } from './helpers'

/** Catálogo inicial: categorías, líneas, productos y proyectos (contenido del diseño aprobado). */

const ctx = { disableRevalidate: true }

export async function seedCatalog(payload: Payload) {
  // --- Categorías de productos -------------------------------------------------
  const categoryDefs: [string, string, string][] = [
    ['Ventanas', 'Corredizas, de abrir y con celosía, a medida.', 'Foto: ventana corrediza'],
    ['Puertas', 'Exteriores e interiores, serie 100 a 700.', 'Foto: puerta de aluminio'],
    ['Mamparas', 'Frontal o angular, con paneles Klara.', 'Foto: mampara de baño'],
    ['Vidrios', 'DVH, laminado y Stopsol.', 'Foto: detalle vidrio DVH'],
    ['Rejas', 'Hierro 3/8" y 1/2" a medida del vano.', 'Foto: reja de hierro'],
    [
      'Otras soluciones',
      'Puertas placa, granero y mosquiteros.',
      'Foto: puerta placa / puerta granero',
    ],
  ]
  const categories: Record<string, number> = {}
  for (const [i, [name, description, photo]] of categoryDefs.entries()) {
    const doc = await payload.create({
      collection: 'product-categories',
      data: {
        name,
        slug: slugify(name),
        description,
        image: await seedMedia(payload, photo, 'light'),
        order: i,
        _status: 'published',
      },
      context: ctx,
    })
    categories[name] = doc.id
  }

  // --- Líneas ------------------------------------------------------------------
  const glassBase = [
    { name: 'Float', multiplier: 1 },
    { name: 'Laminado', multiplier: 1.25 },
  ]
  const lineDefs = [
    {
      slug: 'herrero-economica',
      name: 'Herrero Económica',
      positioning: 'Económica',
      badge: false,
      tagline: 'La más económica, para ambientes de poco uso.',
      shortDescription:
        'Aberturas de aluminio de bajo costo, con vidrio de 3 mm incluido, para ambientes secundarios.',
      introHeadline: 'La opción más barata, bien hecha. Para ambientes que no se usan todo el día.',
      body: 'Perfilería liviana de aluminio con vidrio de 3 mm incluido, disponible en blanco y negro. Corredizas y rajas universales que resuelven ambientes secundarios, depósitos y obras donde el presupuesto manda. Fabricada a medida exacta del vano, igual que el resto de nuestras líneas.',
      facts: facts([
        ['3 mm', 'Vidrio de serie'],
        ['2', 'Colores disponibles'],
        ['A medida', 'Fabricación'],
      ]),
      cardHighlights: texts([
        'Vidrio de 3 mm incluido',
        'Blanco y negro',
        'Corredizas y rajas universales',
      ]),
      idealFor: 'Depósitos, ambientes secundarios o cuando el presupuesto es la prioridad.',
      features: [
        {
          title: 'Mejor precio',
          text: 'La opción más accesible del catálogo, sin cargos ocultos.',
        },
        { title: 'Entrega rápida', text: 'Perfilería de stock permanente y plazos cortos.' },
        { title: 'Mosquiteros', text: 'Adaptables a las hojas corredizas.' },
        { title: 'A medida', text: 'Se fabrica según el vano real, sin cortes ni parches.' },
      ],
      specs: specs([
        ['Vidrio', '3 mm · opción laminado o Blindex'],
        ['Colores', 'Blanco y negro'],
        ['Tipologías', 'Corredizas y rajas universales'],
        ['Mosquiteros', 'Adaptables'],
        ['Instalación', 'Profesional u autoinstalación guiada'],
      ]),
      apps: ['Depósitos', 'Ambientes secundarios', 'Lavaderos', 'Obras de bajo costo', 'Galpones'],
      faqs: [
        [
          '¿Sirve para dormitorios?',
          'Puede usarse, pero para uso diario intenso recomendamos Herrero Reforzada por su mayor rigidez estructural.',
        ],
        [
          '¿Puedo pedir vidrio de seguridad?',
          'Sí, está disponible la opción de vidrio laminado o Blindex con un adicional.',
        ],
        [
          '¿Incluye mosquitero?',
          'No de serie, pero es adaptable y lo cotizamos junto a la abertura.',
        ],
        [
          '¿La instalan ustedes?',
          'Sí, en Coronda y zona (+40 km). También podés instalarla vos con nuestras instrucciones.',
        ],
      ],
      hero: 'Foto: ventana corrediza blanca en ambiente simple, luz natural',
      app: 'Foto: lavadero con ventana corrediza blanca',
      price: 180000,
      glass: glassBase,
    },
    {
      slug: 'herrero-reforzada',
      name: 'Herrero Reforzada',
      positioning: 'Más elegida',
      badge: true,
      tagline: 'La más pedida. Aguanta el uso de todos los días.',
      shortDescription:
        'Aberturas de aluminio reforzadas, con parantes de 65 mm, para el uso diario intenso en viviendas.',
      introHeadline:
        'La que más colocamos en casas. Perfil más grueso, que aguanta abrir y cerrar todos los días.',
      body: 'Parantes de 65 mm y zócalos de 75/48 mm dan un cuerpo más sólido, con mejor cierre y durabilidad. Cubre casi cualquier tipología: corredizas, de abrir de una a tres hojas y puertas exteriores serie 100 a 700, con rejas, mosquiteros y celosías integrables al mismo sistema.',
      facts: facts([
        ['65 mm', 'Parantes'],
        ['75/48', 'Zócalos (mm)'],
        ['1–3', 'Hojas de abrir'],
      ]),
      cardHighlights: texts([
        'Parantes 65 mm · zócalos 75/48',
        'Corredizas y de abrir 1/2/3 hojas',
        'Rejas, mosquiteros y celosías',
      ]),
      idealFor: 'Dormitorios, cocinas y uso cotidiano en viviendas.',
      features: [
        { title: 'Rigidez', text: 'Perfil reforzado para hojas grandes y uso cotidiano.' },
        {
          title: 'Versatilidad',
          text: 'Corredizas, de abrir y puertas exteriores en el mismo sistema.',
        },
        { title: 'Complementos', text: 'Rejas, mosquiteros y celosías integradas.' },
        { title: 'Durabilidad', text: 'Herrajes y cierres pensados para años de servicio.' },
      ],
      specs: specs([
        ['Parantes', '65 mm'],
        ['Zócalos', '75 mm / 48 mm'],
        ['Vidrio', '3 mm entero o repartido · laminado o Blindex'],
        ['Tipologías', 'Corredizas · de abrir 1/2/3 hojas · puertas serie 100–700'],
        ['Complementos', 'Rejas, mosquiteros y celosías'],
      ]),
      apps: ['Dormitorios', 'Cocinas', 'Living', 'Frentes de vivienda', 'Obra nueva', 'Reformas'],
      faqs: [
        [
          '¿Cuál es la diferencia con la Económica?',
          'La perfilería es más robusta: parantes de 65 mm frente a un perfil liviano. Eso mejora el cierre, soporta hojas más grandes y resiste mejor el uso diario.',
        ],
        [
          '¿Puede llevar DVH?',
          'El DVH es de serie en Modena. En Reforzada se resuelve con laminado o Blindex; consultanos tu caso.',
        ],
        [
          '¿Incluye celosía?',
          'Es opcional y se cotiza junto a la abertura, en el mismo sistema de perfiles.',
        ],
        [
          '¿Qué plazo de fabricación tiene?',
          'Según medidas y cantidad, habitualmente entre 7 y 15 días hábiles.',
        ],
      ],
      hero: 'Foto: frente de vivienda con ventanas de aluminio reforzadas',
      app: 'Foto: dormitorio con ventana de abrir y reja',
      price: 260000,
      glass: glassBase,
    },
    {
      slug: 'modena',
      name: 'Modena',
      positioning: 'Alta gama',
      badge: false,
      tagline: 'La que mejor aísla del frío, el calor y el ruido.',
      shortDescription:
        'Línea de alta prestación con vidrio de 4 mm, cierre Premium y opción DVH para aislar temperatura y ruido.',
      introHeadline: 'Nuestra mejor línea: cierra bien, aísla y queda prolija.',
      body: 'Vidrio de 4 mm de serie, cierre estándar o Premium y opción DVH 4/9/4 para aislar temperatura y ruido. Perfiles de líneas finas, terminación prolija y Stopsol antirreflejo disponible. Es la que recomendamos si querés gastar menos en calefacción o vivís en una zona con ruido.',
      facts: facts([
        ['4 mm', 'Vidrio de serie'],
        ['4/9/4', 'Opción DVH'],
        ['Premium', 'Cierre disponible'],
      ]),
      cardHighlights: texts([
        'Vidrio 4 mm de serie · DVH',
        'Cierre estándar o Premium',
        'Stopsol antirreflejo',
      ]),
      idealFor: 'Quienes priorizan aislar ruido y temperatura o buscan el mejor acabado.',
      features: [
        { title: 'Aislación', text: 'DVH con cámara de aire: menos frío, calor y ruido.' },
        { title: 'Hermeticidad', text: 'Cierre Premium sin filtraciones de aire ni agua.' },
        { title: 'Estética', text: 'Perfiles finos y terminación superior.' },
        { title: 'Control solar', text: 'Stopsol antirreflejo opcional.' },
      ],
      specs: specs([
        ['Vidrio', '4 mm de serie · laminado o Blindex'],
        ['DVH', '4 mm / 9 mm cámara / 4 mm'],
        ['Cierre', 'Estándar o Premium'],
        ['Stopsol', 'Antirreflejo disponible'],
        ['Otros', 'Mamparas de baño en la misma línea'],
      ]),
      apps: [
        'Ventanales',
        'Puertas corredizas',
        'Frentes vidriados',
        'Dormitorios',
        'Obra de diseño',
        'Mamparas',
      ],
      faqs: [
        [
          '¿Cuánto aísla el DVH?',
          'La cámara de aire reduce sensiblemente la transmisión térmica y el ruido exterior respecto a un vidrio simple de 3 o 4 mm.',
        ],
        [
          '¿Qué diferencia el cierre Premium?',
          'Mejora la hermeticidad y el tacto de uso; es la opción recomendada en ventanales grandes o zonas ventosas.',
        ],
        [
          '¿Sirve para mamparas?',
          'Sí, nuestras mamparas de baño usan perfilería de esta línea con paneles Klara.',
        ],
        [
          '¿El Stopsol oscurece el ambiente?',
          'Reduce el reflejo y la carga solar manteniendo buena entrada de luz; te mostramos muestras en el local.',
        ],
      ],
      hero: 'Foto: living con ventanal corredizo Modena de piso a techo',
      app: 'Foto: puerta corrediza Modena negra con DVH',
      price: 420000,
      glass: [...glassBase, { name: 'DVH', multiplier: 1.45 }],
    },
  ]

  const lines: Record<string, number> = {}
  for (const [i, l] of lineDefs.entries()) {
    const gallery = await Promise.all(
      [
        'Foto: abertura instalada, vista general',
        'Foto: detalle de herraje y perfil',
        'Foto: interior con luz natural',
        'Foto: detalle de cierre / encuentro de hojas',
      ].map(async (d) => ({
        image: await seedMedia(payload, `${d} (${l.name})`),
      })),
    )
    const doc = await payload.create({
      collection: 'product-lines',
      data: {
        name: l.name,
        slug: l.slug,
        positioning: l.positioning,
        badge: l.badge,
        tagline: l.tagline,
        shortDescription: l.shortDescription,
        introHeadline: l.introHeadline,
        description: richText([l.body]),
        facts: l.facts,
        cardHighlights: l.cardHighlights,
        idealFor: l.idealFor,
        heroImage: await seedMedia(payload, l.hero),
        applicationImage: await seedMedia(payload, l.app),
        gallery,
        features: l.features,
        applications: texts(l.apps),
        faqs: l.faqs.map(([question, answer]) => ({ question, answer })),
        technicalSpecs: l.specs,
        quote: { pricePerM2: l.price, glassOptions: l.glass },
        order: i,
        _status: 'published',
      },
      context: ctx,
    })
    lines[l.slug] = doc.id
  }

  // --- Productos -----------------------------------------------------------------
  type P = {
    name: string
    cat: string
    desc: string
    photo: string
    line?: string
    featured?: boolean
    quote?: {
      pricing: 'line' | 'fixed'
      multiplier?: number
      pricePerM2?: number
      secondSide?: boolean
      fixedDescription?: string
    }
    audience?: string
    benefits?: string[]
  }
  const productDefs: P[] = [
    {
      name: 'Ventana corrediza',
      cat: 'Ventanas',
      desc: 'Dos, tres o cuatro hojas. Con o sin mosquitero.',
      photo: 'Foto: ventana corrediza de aluminio',
      line: 'herrero-reforzada',
      featured: true,
      quote: { pricing: 'line', multiplier: 1 },
    },
    {
      name: 'Ventana de abrir',
      cat: 'Ventanas',
      desc: 'Una, dos o tres hojas. Cierre hermético.',
      photo: 'Foto: ventana de abrir dos hojas',
      line: 'herrero-reforzada',
      featured: true,
      quote: { pricing: 'line', multiplier: 1.15 },
    },
    {
      name: 'Ventana con celosía',
      cat: 'Ventanas',
      desc: 'Control de luz y ventilación regulable.',
      photo: 'Foto: ventana con celosía',
      line: 'herrero-reforzada',
    },
    {
      name: 'Puerta de aluminio',
      cat: 'Puertas',
      desc: 'Serie 100 a 700, exterior e interior.',
      photo: 'Foto: puerta de aluminio exterior',
      line: 'herrero-reforzada',
      featured: true,
      quote: { pricing: 'line', multiplier: 1.3 },
    },
    {
      name: 'Puerta corrediza',
      cat: 'Puertas',
      desc: 'Grandes luces con paso libre total.',
      photo: 'Foto: puerta corrediza de vidrio',
      line: 'modena',
      quote: { pricing: 'line', multiplier: 1.3 },
    },
    {
      name: 'Puerta placa',
      cat: 'Otras soluciones',
      desc: 'Madera y MDF para interiores.',
      photo: 'Foto: puerta placa de madera',
    },
    {
      name: 'Puerta granero',
      cat: 'Otras soluciones',
      desc: 'Sistema colgante, ahorra espacio.',
      photo: 'Foto: puerta granero colgante',
    },
    {
      name: 'Mampara frontal',
      cat: 'Mamparas',
      desc: 'Mampara lineal con hojas corredizas. Acceso cómodo y diseño integrado al espacio.',
      photo: 'Foto: mampara frontal corrediza en baño claro',
      audience: 'Duchas lineales y bañeras',
      benefits: [
        'Cómodo y fácil acceso',
        'No ocupa espacio al abrir',
        'Se fabrica a medida exacta',
      ],
      quote: { pricing: 'fixed', pricePerM2: 390000, fixedDescription: 'Modena · Paneles Klara' },
    },
    {
      name: 'Mampara angular',
      cat: 'Mamparas',
      desc: 'Box en 90° con puerta de abrir. Cierre total y máxima contención de agua.',
      photo: 'Foto: mampara angular tipo box 90° con puerta de abrir',
      audience: 'Esquinas y duchas sin receptáculo',
      benefits: [
        'Mayor contención de agua',
        'Cierre total en esquina',
        'Se fabrica a medida exacta',
      ],
      quote: {
        pricing: 'fixed',
        pricePerM2: 390000,
        secondSide: true,
        fixedDescription: 'Modena · Paneles Klara',
      },
    },
    {
      name: 'Vidrio DVH',
      cat: 'Vidrios',
      desc: '4 mm / 9 mm cámara / 4 mm. Aislación térmica.',
      photo: 'Foto: detalle de vidrio DVH',
    },
    {
      name: 'Vidrio laminado',
      cat: 'Vidrios',
      desc: 'Seguridad: no estalla en fragmentos.',
      photo: 'Foto: vidrio laminado',
    },
    {
      name: 'Stopsol',
      cat: 'Vidrios',
      desc: 'Antirreflejo y control solar.',
      photo: 'Foto: fachada con vidrio Stopsol',
    },
    {
      name: 'Rejas de hierro',
      cat: 'Rejas',
      desc: 'Hierro 3/8" y 1/2", a medida del vano.',
      photo: 'Foto: reja de hierro',
    },
    {
      name: 'Mosquiteros',
      cat: 'Otras soluciones',
      desc: 'Adaptables a corredizas y de abrir.',
      photo: 'Foto: mosquitero corredizo',
    },
  ]

  const products: Record<string, number> = {}
  for (const [i, p] of productDefs.entries()) {
    const isSliding = p.name === 'Ventana corrediza'
    const doc = await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        slug: slugify(p.name),
        category: categories[p.cat],
        line: p.line ? lines[p.line] : undefined,
        shortDescription: p.desc,
        audience: p.audience,
        benefits: p.benefits ? texts(p.benefits) : undefined,
        featuredImage: await seedMedia(payload, p.photo, 'light'),
        featured: Boolean(p.featured),
        order: i,
        quote: p.quote
          ? {
              enabled: true,
              pricing: p.quote.pricing,
              multiplier: p.quote.multiplier ?? 1,
              pricePerM2: p.quote.pricePerM2,
              secondSide: Boolean(p.quote.secondSide),
              fixedDescription: p.quote.fixedDescription,
            }
          : { enabled: false },
        ...(isSliding
          ? {
              description: richText([
                'Dos, tres o cuatro hojas sobre perfilería reforzada de 65 mm. Deslizamiento suave, cierre firme y opción de mosquitero o reja integrada. Se fabrica a la medida exacta de tu vano.',
              ]),
              facts: facts([
                ['2–4', 'Hojas'],
                ['65 mm', 'Parantes'],
                ['3 mm', 'Vidrio base'],
              ]),
              configurations: texts([
                '2 hojas',
                '3 hojas',
                '4 hojas',
                'Con mosquitero',
                'Con reja',
              ]),
              technicalSpecifications: specs([
                ['Parantes', '65 mm', 'Características técnicas'],
                ['Zócalos', '75 / 48 mm', 'Características técnicas'],
                ['Vidrio', '3 mm entero o repartido', 'Características técnicas'],
                ['Cierre', 'Cremona reforzada', 'Características técnicas'],
                ['Perfilería', 'Aluminio línea Herrero Reforzada', 'Materiales'],
                ['Vidrio', 'Float 3 mm · laminado o Blindex opcional', 'Materiales'],
                ['Herrajes', 'Rodamientos de nylon reforzado', 'Materiales'],
                ['Medida', 'A medida exacta del vano', 'Medidas y fabricación'],
                ['Mínimo', '60 × 60 cm', 'Medidas y fabricación'],
                ['Plazo', '7 a 15 días hábiles', 'Medidas y fabricación'],
              ]),
              applicationsIntro:
                'La corrediza es la tipología más elegida en viviendas: no ocupa espacio al abrir y permite vanos amplios con hojas manejables.',
              applications: texts(['Dormitorios', 'Cocinas', 'Living', 'Galerías']),
              applicationImage: await seedMedia(
                payload,
                'Foto: ventana corrediza instalada en dormitorio con luz lateral',
              ),
              gallery: await Promise.all(
                [
                  'Foto: detalle del riel y las hojas',
                  'Foto: detalle de cierre y manija',
                  'Foto: ventana instalada con mosquitero',
                ].map(async (d) => ({ image: await seedMedia(payload, d, 'light') })),
              ),
            }
          : {}),
        _status: 'published',
      },
      context: ctx,
    })
    products[p.name] = doc.id
  }

  // --- Proyectos ---------------------------------------------------------------------
  const projectCategoryDefs = ['Ventanas', 'Puertas', 'Mamparas', 'Modena', 'Herrero']
  const projectCategories: Record<string, number> = {}
  for (const [i, name] of projectCategoryDefs.entries()) {
    const doc = await payload.create({
      collection: 'project-categories',
      data: { name, slug: slugify(name), order: i },
      context: ctx,
    })
    projectCategories[name] = doc.id
  }

  type Pr = {
    title: string
    cats: string[]
    place: string
    photo: string
    line?: string
    featured?: boolean
    products?: string[]
  }
  const projectDefs: Pr[] = [
    {
      title: 'Casa CR · Ventanal DVH',
      cats: ['Modena', 'Ventanas'],
      place: 'Coronda',
      photo: 'Foto: ventanal DVH de piso a techo en living',
      line: 'modena',
      featured: true,
      products: ['Ventana corrediza', 'Vidrio DVH', 'Stopsol'],
    },
    {
      title: 'Puerta de acceso',
      cats: ['Puertas', 'Herrero'],
      place: 'Coronda',
      photo: 'Foto: puerta de aluminio en acceso principal',
      line: 'herrero-reforzada',
      featured: true,
      products: ['Puerta de aluminio'],
    },
    {
      title: 'Corredizas en galería',
      cats: ['Ventanas', 'Herrero'],
      place: 'Arocena',
      photo: 'Foto: galería con ventanas corredizas',
      line: 'herrero-reforzada',
      products: ['Ventana corrediza'],
    },
    {
      title: 'Mampara angular',
      cats: ['Mamparas'],
      place: 'Coronda',
      photo: 'Foto: mampara angular en ducha de esquina',
      featured: true,
      products: ['Mampara angular'],
    },
    {
      title: 'Ventana con celosía',
      cats: ['Ventanas', 'Herrero'],
      place: 'Desvío Arijón',
      photo: 'Foto: ventana con celosía exterior',
      line: 'herrero-economica',
      featured: true,
      products: ['Ventana con celosía'],
    },
    {
      title: 'Frente vidriado',
      cats: ['Modena'],
      place: 'Santa Fe',
      photo: 'Foto: frente vidriado con perfiles finos',
      line: 'modena',
    },
    {
      title: 'Mampara frontal',
      cats: ['Mamparas'],
      place: 'Coronda',
      photo: 'Foto: mampara frontal sobre bañera',
      products: ['Mampara frontal'],
    },
    {
      title: 'Ventanas con reja',
      cats: ['Ventanas', 'Herrero'],
      place: 'Coronda',
      photo: 'Foto: ventanas con rejas de hierro',
      line: 'herrero-reforzada',
      products: ['Rejas de hierro'],
    },
    {
      title: 'Puerta Modena premium',
      cats: ['Puertas', 'Modena'],
      place: 'Coronda',
      photo: 'Foto: puerta corrediza Modena negra',
      line: 'modena',
      products: ['Puerta corrediza'],
    },
  ]

  for (const [i, p] of projectDefs.entries()) {
    const detailed = i === 0
    await payload.create({
      collection: 'projects',
      data: {
        title: p.title,
        slug: slugify(p.title),
        category: p.cats.map((c) => projectCategories[c]),
        location: `${p.place}, Santa Fe`,
        year: 2026,
        coverImage: await seedMedia(payload, p.photo),
        line: p.line ? lines[p.line] : undefined,
        productsUsed: (p.products ?? []).map((n) => products[n]),
        featured: Boolean(p.featured),
        order: i,
        summary: detailed
          ? 'Ventanal corredizo Modena con DVH 4/9/4 y cierre Premium para un living luminoso y sin frío.'
          : `${p.title} en ${p.place}.`,
        ...(detailed
          ? {
              openingsCount: 9,
              introHeadline: 'Querían mucha luz sin pasar frío. Lo resolvimos así.',
              description: richText([
                'Los dueños querían mucha luz en el living, pero sin pasar frío en invierno. Resolvimos el estar con un ventanal corredizo Modena con DVH 4/9/4 y cierre Premium, y unificamos el resto de la casa con la misma perfilería para que toda la casa quede igual.',
                'La medición se hizo en obra antes del revoque fino, así el marco quedó justo con la pared, sin parches ni recortes después.',
              ]),
              facts: facts([
                ['4/9/4', 'DVH con cámara'],
                ['3,60 m', 'Luz del ventanal'],
                ['Premium', 'Sistema de cierre'],
                ['En obra', 'Medición'],
              ]),
              gallery: await Promise.all(
                [
                  'Foto: interior del estar con el ventanal cerrado',
                  'Foto: detalle del encuentro marco–mampostería',
                  'Foto: detalle de herraje y cierre Premium',
                  'Foto: vista nocturna del frente iluminado',
                ].map(async (d) => ({ image: await seedMedia(payload, d) })),
              ),
            }
          : {}),
        _status: 'published',
      },
      context: ctx,
    })
  }

  return { categories, lines, products }
}
