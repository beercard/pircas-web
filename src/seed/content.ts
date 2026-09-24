import type { Payload } from 'payload'

import { richText, seedMedia, texts, urlLink, waLink } from './helpers'

/** Páginas, home y configuración global (textos del diseño aprobado + datos reales de pircas.com.ar). */

const ctx = { disableRevalidate: true }
type BlockSettings = {
  hidden?: boolean
  background?: 'default' | 'muted' | 'dark' | 'brand'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  anchor?: string
}
const settings = (s: BlockSettings = {}): BlockSettings => ({
  hidden: false,
  background: 'default',
  spacing: 'md',
  ...s,
})

type Catalog = {
  categories: Record<string, number>
  lines: Record<string, number>
  products: Record<string, number>
}

export async function seedContent(payload: Payload, catalog: Catalog) {
  const { categories, lines, products } = catalog
  const lineIds = Object.values(lines)
  const [eco, ref, mod] = [lines['herrero-economica'], lines['herrero-reforzada'], lines['modena']]

  // --- Datos del negocio (sitio actual) ----------------------------------------------
  await payload.updateGlobal({
    slug: 'site-settings',
    context: ctx,
    data: {
      brandName: 'Pircas Aberturas',
      tagline: 'Aberturas de aluminio fabricadas e instaladas a medida.',
      phone: '342 590 3814',
      whatsapp: {
        number: '5493425903814',
        defaultMessage: 'Hola Pircas, quiero pedir un presupuesto',
        showFloating: true,
        showMobileBar: true,
      },
      address: {
        street: 'Hipólito Yrigoyen 1111',
        city: 'Coronda',
        region: 'Santa Fe',
        country: 'AR',
        mapEmbedQuery: 'Hipólito Yrigoyen 1111, Coronda, Santa Fe',
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=Hip%C3%B3lito+Yrigoyen+1111+Coronda+Santa+Fe',
      },
      coverageArea: 'Coronda y zona · +40 km · Envíos a todo el país',
      workingHours: [
        { days: 'Lunes a viernes', hours: '8–12 y 16–20 h' },
        { days: 'Sábados', hours: '9–13 h' },
      ],
      instagram: 'https://www.instagram.com/pircas_coronda',
      facebook: 'https://www.facebook.com/pircascoronda',
      productInfoPanels: [
        {
          title: 'Entrega e instalación',
          rows: [
            { label: 'Retiro', value: 'Taller Coronda, Hipólito Yrigoyen 1111' },
            { label: 'Envío', value: 'A todo el país, transporte a coordinar' },
            { label: 'Instalación', value: 'Profesional en Coronda y zona (+40 km)' },
          ],
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'seo-defaults',
    context: ctx,
    data: {
      siteName: 'Pircas Aberturas',
      titleTemplate: '%s | Pircas Aberturas',
      defaultTitle: 'Pircas Aberturas | Aberturas de aluminio a medida en Coronda, Santa Fe',
      defaultDescription:
        'Fabricamos e instalamos aberturas de aluminio a medida: ventanas, puertas y mamparas. Líneas Herrero y Modena. Taller en Coronda, Santa Fe. Pedí tu presupuesto.',
    },
  })

  // --- Páginas ---------------------------------------------------------------------------
  const quotePage = await payload.create({
    collection: 'pages',
    context: ctx,
    data: {
      title: 'Cotizador',
      slug: 'cotizador',
      hideFooterCta: true,
      _status: 'published',
      meta: {
        title: 'Cotizá tus aberturas online',
        description:
          'Armá tu lista de aberturas de aluminio y mirá el precio estimado al instante. Ajustá el presupuesto final con un vendedor.',
      },
      layout: [
        {
          blockType: 'hero',
          variant: 'intro',
          showBreadcrumbs: true,
          title: 'Cotizá tu proyecto',
          subtitle:
            'Armá tu lista de aberturas y mirá el precio estimado al instante. El presupuesto final lo ajustás con un vendedor, por WhatsApp o en el local.',
          settings: settings(),
        },
        { blockType: 'quoteWizard', settings: settings({ spacing: 'none' }) },
      ],
    },
  })

  const contactPage = await payload.create({
    collection: 'pages',
    context: ctx,
    data: {
      title: 'Contacto',
      slug: 'contacto',
      hideFooterCta: true,
      _status: 'published',
      meta: {
        title: 'Contacto',
        description:
          'Escribinos, llamanos o vení al taller: Hipólito Yrigoyen 1111, Coronda, Santa Fe. Respondemos rápido por WhatsApp.',
      },
      layout: [
        {
          blockType: 'hero',
          variant: 'intro',
          showBreadcrumbs: true,
          title: 'Escribinos, llamanos o vení.',
          settings: settings(),
        },
        {
          blockType: 'contact',
          promo: {
            eyebrow: 'Más rápido',
            text: 'Armá tu presupuesto online y lo ajustamos juntos.',
            link: urlLink('Ir al cotizador', '/cotizador'),
          },
          showMap: false,
          settings: settings({ spacing: 'none' }),
        },
      ],
    },
  })

  const aboutPage = await payload.create({
    collection: 'pages',
    context: ctx,
    data: {
      title: 'Nosotros',
      slug: 'nosotros',
      _status: 'published',
      meta: {
        title: 'Nosotros',
        description:
          'Somos un taller de Coronda que fabrica, coloca y da la cara por cada abertura de aluminio.',
      },
      layout: [
        {
          blockType: 'hero',
          variant: 'editorial',
          showBreadcrumbs: true,
          title: 'Hacemos aberturas. Y respondemos por ellas.',
          image: await seedMedia(
            payload,
            'Foto: taller de aluminio en Coronda, perfiles ordenados y luz natural',
          ),
          settings: settings(),
        },
        {
          blockType: 'statement',
          variant: 'split',
          eyebrow: 'Quiénes somos',
          text: 'Un taller de Coronda que fabrica, coloca y da la cara.',
          body: richText([
            'Trabajamos desde Coronda, Santa Fe, con taller propio y equipo estable. Cada abertura se fabrica a la medida real del vano: medimos en obra, producimos y colocamos, de modo que la responsabilidad del encastre perfecto es nuestra y no del cliente.',
            'No vendemos de catálogo: elegimos con vos la línea, el vidrio y los herrajes según el uso, el clima y lo que querés invertir. Te decimos lo que de verdad te conviene, aunque sea lo más barato.',
          ]),
          settings: settings({ spacing: 'sm' }),
        },
        {
          blockType: 'process',
          variant: 'pillars',
          title: 'Lo que prometemos',
          decoration: true,
          steps: [
            {
              title: 'Medimos nosotros',
              text: 'Vamos a la obra y tomamos las medidas. Si no encaja, es problema nuestro.',
            },
            {
              title: 'Fabricamos acá',
              text: 'Cortamos, armamos y controlamos cada abertura en el taller.',
            },
            {
              title: 'Colocamos bien',
              text: 'Sin filtraciones de aire ni de agua. Si pasa, volvemos.',
            },
            { title: 'Explicamos claro', text: 'Te decimos qué conviene y por qué, sin vueltas.' },
            { title: 'Cumplimos plazos', text: 'Te damos una fecha y la respetamos.' },
          ],
          settings: settings({ background: 'dark' }),
        },
        {
          blockType: 'textImage',
          variant: 'bleed',
          eyebrow: 'El taller',
          title: 'Vení a ver el taller',
          intro:
            'Corte, armado y control de cada abertura en nuestro taller de Hipólito Yrigoyen 1111. Cubrimos Coronda y zona en un radio de más de 40 km, con envíos a todo el país.',
          facts: [
            { value: '+40 km', label: 'Cobertura' },
            { value: '3', label: 'Líneas' },
            { value: 'País', label: 'Envíos' },
          ],
          image: await seedMedia(payload, 'Foto: corte y armado de perfiles en el taller'),
          imagePosition: 'left',
          links: [{ link: urlLink('Visitar el local', '/contacto', 'secondary') }],
          settings: settings({ background: 'muted', spacing: 'none' }),
        },
      ],
    },
  })

  const mamparasPage = await payload.create({
    collection: 'pages',
    context: ctx,
    data: {
      title: 'Mamparas',
      slug: 'mamparas',
      _status: 'published',
      meta: {
        title: 'Mamparas de baño a medida',
        description:
          'Mamparas frontales y angulares con paneles Klara que no cortan ni estallan. A medida de tu baño, con envío a todo el país.',
      },
      layout: [
        {
          blockType: 'hero',
          variant: 'fullBleed',
          showBreadcrumbs: true,
          decoration: false,
          title: 'Mamparas de baño a medida',
          subtitle:
            'A la medida de tu baño, con paneles Klara que no cortan ni estallan. La colocás vos o te la instalamos.',
          image: await seedMedia(
            payload,
            'Foto: baño contemporáneo con mampara de vidrio, microcemento y luz natural',
          ),
          links: [{ link: urlLink('Cotizar mi mampara', '/cotizador?producto=mampara-frontal') }],
          settings: settings({ spacing: 'none' }),
        },
        {
          blockType: 'productGrid',
          variant: 'feature',
          title: 'Dos soluciones',
          intro: 'Según la geometría de tu ducha o bañera.',
          source: 'category',
          category: categories['Mamparas'],
          limit: 2,
          settings: settings(),
        },
        {
          blockType: 'benefits',
          variant: 'grid',
          marker: 'shapes',
          eyebrow: 'Características técnicas',
          title: 'Lo que hace que dure',
          intro: 'Las cuatro piezas que revisamos antes de que salga del taller.',
          items: [
            {
              title: 'Sistema de rodamientos',
              text: 'Deslizamiento suave y silencioso, diseñado para uso diario intenso.',
            },
            {
              title: 'Perfilería de aluminio',
              text: 'Alta resistencia, terminación prolija y duradera. Anodizado o blanco.',
            },
            {
              title: 'Toallero integrado',
              text: 'Funcional y práctico, de diseño minimalista incluido de serie.',
            },
            {
              title: 'Paneles Klara',
              text: 'No corta, no estalla. Liviano, durable y sin manchas de agua tras la ducha.',
            },
          ],
          settings: settings({ background: 'dark' }),
        },
        {
          blockType: 'process',
          variant: 'split',
          eyebrow: 'Fabricación a medida',
          title: 'Medís, la hacemos y la colocás en una tarde',
          body: 'Medís tu espacio, cargás las medidas en el cotizador y fabricamos la mampara exacta. El sistema de encastre es tan sencillo que podés colocarla vos mismo.',
          image: await seedMedia(
            payload,
            'Foto: cinta métrica midiendo el vano de una ducha',
            'light',
          ),
          steps: [
            {
              title: 'Medís tu espacio',
              text: 'Alto y ancho de la ducha o bañera. Sin necesidad de visita técnica.',
            },
            {
              title: 'Cotizás online',
              text: 'Cargás las medidas en el cotizador y ves el precio estimado al instante.',
            },
            {
              title: 'Ajustás con un vendedor',
              text: 'Confirmamos detalles, herrajes y terminaciones antes de fabricar.',
            },
            {
              title: 'Fabricamos y entregamos',
              text: 'Retiro en Coronda o envío a todo el país por transporte a coordinar.',
            },
            {
              title: 'Instalás en minutos',
              text: 'Encastre sencillo. También ofrecemos instalación profesional.',
            },
          ],
          decoration: false,
          settings: settings({ background: 'muted', spacing: 'sm' }),
        },
        {
          blockType: 'benefits',
          variant: 'bordered',
          marker: 'none',
          title: '¿Cómo llega tu mampara?',
          items: [
            {
              title: 'Envío a todo el país',
              text: 'Por transporte a coordinar. Consultanos costo y plazo según tu provincia.',
            },
            { title: 'Retiro en local', text: 'Taller en Coronda. Lista en 5 a 7 días hábiles.' },
            {
              title: 'Instalación profesional',
              text: 'Disponible en Coronda y zona (≤40 km), con costo fijo a confirmar.',
            },
            {
              title: 'La instalás vos',
              text: 'Sistema de encastre simple, con instrucciones paso a paso.',
            },
          ],
          settings: settings({ spacing: 'sm' }),
        },
        {
          blockType: 'video',
          title: 'Todo sobre la mampara Klara',
          url: 'https://youtube.com/shorts/gNb7XOw-h8k',
          aspect: '9/16',
          settings: settings({ spacing: 'sm', hidden: false }),
        },
      ],
    },
  })

  // --- Home ---------------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'homepage',
    context: ctx,
    data: {
      _status: 'published',
      meta: { title: 'Pircas Aberturas | Aberturas de aluminio a medida en Coronda, Santa Fe' },
      sections: [
        {
          blockType: 'hero',
          variant: 'fullBleed',
          showBreadcrumbs: false,
          decoration: true,
          eyebrow: 'Taller en Coronda, Santa Fe',
          title: 'Aberturas de aluminio hechas a medida, en nuestro taller.',
          subtitle:
            'Medimos en obra, fabricamos y colocamos. Si algo no cierra bien, volvemos y lo arreglamos.',
          image: await seedMedia(
            payload,
            'Foto: ventanal de aluminio recién colocado en una casa de la zona',
          ),
          links: [
            { link: urlLink('Solicitar presupuesto', '/cotizador', 'primary') },
            { link: urlLink('Ver productos', '/productos', 'outline') },
          ],
          highlights: [
            { title: 'Taller propio en Coronda', text: 'No revendemos: lo fabricamos acá.' },
            { title: 'Medimos nosotros', text: 'En Coronda y zona, antes de fabricar.' },
            { title: 'Colocación con garantía', text: 'Si algo falla, volvemos y lo arreglamos.' },
            { title: 'Respondemos en el día', text: 'Por WhatsApp, de lunes a viernes.' },
          ],
          settings: settings({ spacing: 'none' }),
        },
        {
          blockType: 'statement',
          variant: 'stacked',
          text: 'Medimos.\nFabricamos.\nColocamos.',
          accentLastLine: true,
          body: richText([
            'Hacemos tus aberturas de principio a fin: cortamos el perfil, armamos la hoja, ponemos el vidrio y la colocamos. Por eso te podemos decir exactamente qué llevás, cuánto tarda y cuánto va a durar.',
          ]),
          link: {
            type: 'reference',
            label: 'Conocé el taller',
            reference: { relationTo: 'pages', value: aboutPage.id },
          },
          settings: settings({ spacing: 'lg' }),
        },
        {
          blockType: 'productLines',
          variant: 'cards',
          eyebrow: 'Nuestras líneas',
          title: 'Tres líneas, según lo que necesites',
          intro: 'Te explicamos la diferencia sin vueltas: precio, resistencia o aislación.',
          settings: settings({ background: 'muted', anchor: 'lineas' }),
        },
        {
          blockType: 'productCategories',
          title: 'También hacemos',
          cta: urlLink('Ver todos los productos', '/productos', 'link'),
          settings: settings(),
        },
        {
          blockType: 'process',
          variant: 'timeline',
          eyebrow: 'Nuestro proceso',
          title: 'Así trabajamos',
          intro: 'Sin sorpresas: sabés qué pasa en cada paso y cuándo.',
          decoration: true,
          steps: [
            {
              title: 'Consulta',
              text: 'Nos contás qué necesitás por WhatsApp, web o en el local.',
            },
            { title: 'Asesoramiento', text: 'Te orientamos sobre la línea ideal para tu espacio.' },
            { title: 'Cotización', text: 'Armás tu presupuesto online y lo ajustamos juntos.' },
            {
              title: 'Fabricación',
              text: 'Producimos a medida exacta, sin cortes ni adaptaciones.',
            },
            { title: 'Instalación', text: 'Colocación profesional en Coronda y zona, o guiada.' },
          ],
          settings: settings({ background: 'dark', anchor: 'proceso' }),
        },
        {
          blockType: 'advisor',
          eyebrow: 'Asesor virtual',
          title: '¿No sabés qué línea necesitás?',
          intro:
            'Decinos qué te importa más y te decimos cuál conviene. Si seguís con dudas, pasá por el local y lo vemos juntos.',
          settings: settings({ anchor: 'asesor' }),
        },
        {
          blockType: 'textImage',
          variant: 'bleed',
          eyebrow: 'Mamparas',
          title: 'Mamparas de baño a medida',
          intro:
            'Paneles Klara que no cortan ni estallan, sobre perfil de aluminio. Frontal o de esquina, a la medida de tu baño.',
          tags: [{ text: 'Mampara frontal' }, { text: 'Mampara angular' }],
          image: await seedMedia(
            payload,
            'Foto: baño contemporáneo con mampara de vidrio y perfil de aluminio',
          ),
          imagePosition: 'left',
          links: [
            {
              link: {
                type: 'reference',
                label: 'Ver mamparas',
                reference: { relationTo: 'pages', value: mamparasPage.id },
                appearance: 'secondary',
              },
            },
          ],
          settings: settings({ background: 'muted', spacing: 'none', anchor: 'mamparas' }),
        },
        {
          blockType: 'process',
          variant: 'split',
          eyebrow: 'Cotizador online',
          title: 'Cotizá tu proyecto',
          body: 'Armá tu lista de aberturas, mirá el precio estimado al instante y ajustá el presupuesto final con un vendedor —en el local o por WhatsApp.',
          steps: texts([
            'Elegís producto y línea',
            'Cargás medidas y cantidad',
            'Sumás ítems a tu presupuesto',
            'Ves el total estimado',
            'Lo ajustás con un vendedor',
          ]).map((t) => ({ title: t.text })),
          links: [
            {
              link: {
                type: 'reference',
                label: 'Solicitar presupuesto',
                reference: { relationTo: 'pages', value: quotePage.id },
                appearance: 'primary',
              },
            },
          ],
          decoration: false,
          settings: settings(),
        },
        {
          blockType: 'projectGrid',
          eyebrow: 'Trabajos realizados',
          title: 'Trabajos que hicimos',
          source: 'featured',
          limit: 4,
          cta: urlLink('Ver todos los trabajos', '/proyectos', 'link'),
          settings: settings({ spacing: 'sm', anchor: 'galeria' }),
        },
        {
          blockType: 'textImage',
          variant: 'bleed',
          eyebrow: 'Pircas',
          title: 'Gente que sabe hacer y responde por lo que hace.',
          intro:
            'Somos un taller de Coronda. Fabricamos, colocamos y damos la cara: si una abertura nuestra tiene un problema, lo resolvemos.',
          image: await seedMedia(
            payload,
            'Foto: el equipo en el taller cortando y armando perfiles',
          ),
          imagePosition: 'left',
          decoration: true,
          links: [
            {
              link: {
                type: 'reference',
                label: 'Conocé el taller',
                reference: { relationTo: 'pages', value: aboutPage.id },
                appearance: 'link',
              },
            },
          ],
          settings: settings({ background: 'muted', spacing: 'none' }),
        },
      ],
    },
  })

  // --- Listados ---------------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'archive-pages',
    context: ctx,
    data: {
      products: {
        title: 'Todo lo que fabricamos.',
        intro:
          'Ventanas, puertas, mamparas, vidrios y rejas. Todo se hace a medida en nuestro taller de Coronda.',
        seo: { title: 'Productos: ventanas, puertas y mamparas de aluminio a medida' },
        after: [
          {
            blockType: 'quoteCta',
            variant: 'box',
            eyebrow: '¿No encontrás lo que buscás?',
            title: 'Si se puede hacer en aluminio, lo hacemos. Consultanos.',
            links: [{ link: urlLink('Solicitar presupuesto', '/cotizador') }],
            showWhatsapp: false,
            settings: settings({ spacing: 'none' }),
          },
        ],
      },
      lines: {
        title: 'Nuestras líneas',
        intro:
          'Elegí según tu prioridad: precio, resistencia o aislación. Todas se fabrican a medida.',
      },
      projects: {
        title: 'Trabajos hechos',
        intro: 'Fotos reales de obras que hicimos en Coronda y la zona.',
      },
    },
  })

  // --- Menú y footer ------------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'header',
    context: ctx,
    data: {
      navigation: [
        { link: urlLink('Inicio', '/') },
        {
          link: urlLink('Productos', '/productos'),
          megaMenu: {
            columns: [
              {
                title: 'Líneas de aberturas',
                large: true,
                links: [
                  {
                    link: {
                      type: 'reference',
                      label: 'Herrero Económica',
                      reference: { relationTo: 'product-lines', value: eco },
                    },
                  },
                  {
                    link: {
                      type: 'reference',
                      label: 'Herrero Reforzada',
                      reference: { relationTo: 'product-lines', value: ref },
                    },
                  },
                  {
                    link: {
                      type: 'reference',
                      label: 'Modena',
                      reference: { relationTo: 'product-lines', value: mod },
                    },
                  },
                ],
              },
              {
                title: 'Productos',
                links: [
                  { link: urlLink('Ventanas', '/productos?categoria=ventanas') },
                  { link: urlLink('Puertas', '/productos?categoria=puertas') },
                  { link: urlLink('Mamparas', '/mamparas') },
                  { link: urlLink('Rejas', '/productos?categoria=rejas') },
                ],
              },
              {
                title: 'Vidrios',
                links: [
                  {
                    link: {
                      type: 'reference',
                      label: 'DVH',
                      reference: { relationTo: 'products', value: products['Vidrio DVH'] },
                    },
                  },
                  {
                    link: {
                      type: 'reference',
                      label: 'Laminado',
                      reference: { relationTo: 'products', value: products['Vidrio laminado'] },
                    },
                  },
                  {
                    link: {
                      type: 'reference',
                      label: 'Stopsol',
                      reference: { relationTo: 'products', value: products['Stopsol'] },
                    },
                  },
                  { link: urlLink('Otras soluciones', '/productos?categoria=otras-soluciones') },
                ],
              },
            ],
            promo: {
              text: 'Armá tu presupuesto online y ajustalo con un vendedor.',
              link: urlLink('Ir al cotizador', '/cotizador'),
            },
          },
        },
        { link: urlLink('Líneas', '/lineas') },
        {
          link: {
            type: 'reference',
            label: 'Mamparas',
            reference: { relationTo: 'pages', value: mamparasPage.id },
          },
        },
        { link: urlLink('Proyectos', '/proyectos') },
        {
          link: {
            type: 'reference',
            label: 'Nosotros',
            reference: { relationTo: 'pages', value: aboutPage.id },
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Contacto',
            reference: { relationTo: 'pages', value: contactPage.id },
          },
        },
      ],
      cta: {
        type: 'reference',
        label: 'Solicitar presupuesto',
        reference: { relationTo: 'pages', value: quotePage.id },
      },
      showWhatsapp: true,
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: ctx,
    data: {
      cta: {
        enabled: true,
        title: '¿Tenés una obra o una reforma?',
        text: 'Mandanos las medidas o pasá por el local. Te pasamos precio sin compromiso.',
        links: [{ link: urlLink('Solicitar presupuesto', '/cotizador') }],
        showWhatsapp: true,
      },
      about: 'Aberturas de aluminio fabricadas e instaladas a medida. Coronda, Santa Fe.',
      navigation: [
        {
          title: 'Sitio',
          links: [
            { link: urlLink('Productos', '/productos') },
            { link: urlLink('Líneas', '/lineas') },
            { link: urlLink('Mamparas', '/mamparas') },
            { link: urlLink('Proyectos', '/proyectos') },
            { link: urlLink('Nosotros', '/nosotros') },
            { link: urlLink('Contacto', '/contacto') },
          ],
        },
        {
          title: 'Accesos',
          links: [
            { link: waLink('WhatsApp') },
            {
              link: {
                ...urlLink('Instagram', 'https://www.instagram.com/pircas_coronda'),
                newTab: true,
              },
            },
            { link: urlLink('Cotizador', '/cotizador') },
          ],
        },
      ],
      copyright: '© {year} Pircas Aberturas · Aberturas de aluminio',
      bottomNote: 'Coronda · Santa Fe · Argentina',
    },
  })

  // --- Asesor virtual (3 preguntas del brief; puntajes editables en el panel) --------------------
  const w = (e: number, r: number, m: number) => [
    { line: eco, points: e },
    { line: ref, points: r },
    { line: mod, points: m },
  ]
  await payload.updateGlobal({
    slug: 'advisor',
    context: ctx,
    data: {
      enabled: true,
      fallbackLine: ref,
      questions: [
        {
          key: 'prioridad',
          question: '¿Qué priorizás?',
          answers: [
            { key: 'precio', label: 'Precio', weights: w(5, 2, 0) },
            { key: 'resistencia', label: 'Resistencia', weights: w(0, 5, 3) },
            { key: 'confort', label: 'Confort', weights: w(0, 2, 5) },
            { key: 'diseno', label: 'Diseño', weights: w(0, 1, 5) },
          ],
        },
        {
          key: 'lugar',
          question: '¿Dónde es la obra?',
          answers: [
            { key: 'casa', label: 'Casa', weights: w(1, 3, 2) },
            { key: 'departamento', label: 'Departamento', weights: w(1, 2, 3) },
            { key: 'oficina', label: 'Oficina', weights: w(1, 2, 2) },
            { key: 'comercial', label: 'Local comercial', weights: w(2, 3, 1) },
          ],
        },
        {
          key: 'importancia',
          question: '¿Qué te importa más?',
          answers: [
            { key: 'aislacion', label: 'Aislación', weights: w(0, 1, 5) },
            { key: 'seguridad', label: 'Seguridad', weights: w(0, 4, 2) },
            { key: 'estetica', label: 'Estética', weights: w(0, 1, 4) },
            { key: 'funcionalidad', label: 'Funcionalidad', weights: w(3, 3, 1) },
          ],
        },
      ],
      results: [
        {
          line: eco,
          headline: 'Herrero Económica',
          text: 'La más económica para ambientes secundarios.',
        },
        {
          line: ref,
          headline: 'Herrero Reforzada',
          text: 'Parantes de 65 mm y mayor rigidez para el uso diario intenso.',
        },
        {
          line: mod,
          headline: 'Modena',
          text: 'Cierres herméticos y opción DVH para aislar frío, calor y ruido.',
        },
      ],
      resultEyebrow: 'Te recomendamos',
      quoteLabel: 'Cotizar esta línea',
      restartLabel: 'Volver a empezar',
    },
  })

  // --- Formularios y cotizador ---------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'forms-settings',
    context: ctx,
    data: {
      needs: [
        {
          label: 'Aberturas para mi casa',
          description: 'Ventanas y puertas de aluminio a medida.',
          categories: [categories['Ventanas'], categories['Puertas']],
        },
        {
          label: 'Mampara de baño',
          description: 'Frontal o angular, con paneles Klara.',
          categories: [categories['Mamparas']],
          presetProduct: products['Mampara frontal'],
        },
        { label: 'Obra completa', description: 'Varias aberturas para una vivienda u obra.' },
        {
          label: 'Reponer o reformar',
          description: 'Reemplazo de aberturas existentes.',
          categories: [categories['Ventanas'], categories['Puertas']],
        },
      ],
      projectTypes: texts([
        'Vivienda nueva',
        'Reforma o reemplazo de aberturas',
        'Mampara de baño',
        'Obra comercial',
        'Otro',
      ]).map((t) => ({ label: t.text })),
      visitLabel: 'Quiero medición en obra (Coronda y zona, +40 km)',
      pricing: {
        showPrices: true,
        minArea: 0.5,
        rounding: 1000,
        minDimension: 30,
        maxDimension: 600,
        disclaimer:
          'Precios estimados de referencia, sin instalación ni envío. Se ajustan según medidas en obra, herrajes y terminaciones. No es un presupuesto definitivo.',
      },
      maxItems: 20,
    },
  })

  return { lineIds }
}
