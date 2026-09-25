import type { Payload } from 'payload'

import type { Header } from '@/payload-types'

import { seedMedia, urlLink, waLink } from './helpers'

/**
 * Los dos "ambientes" del sitio: "Para tu casa" y "Obras y profesionales".
 * Crea/actualiza las dos páginas, la categoría de proyectos "Obras", el bloque de la home
 * y el menú. Idempotente: se puede correr sobre una base con contenido (usa el mismo seed
 * inicial y el script de actualización de producción).
 */

const ctx = { disableRevalidate: true }
const settings = (s: Record<string, unknown> = {}) => ({
  hidden: false,
  background: 'default' as const,
  spacing: 'md' as const,
  ...s,
})

/** Reutiliza una foto existente por su texto alternativo; si no existe, crea un marcador. */
async function photo(payload: Payload, alt: string): Promise<number> {
  const found = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return found.docs[0]?.id ?? seedMedia(payload, `Foto: ${alt}`)
}

async function upsertPage(
  payload: Payload,
  slug: string,
  data: Record<string, unknown>,
): Promise<number> {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
    ? await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: { ...data, slug, _status: 'published' } as never,
        context: ctx,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'pages',
        data: { ...data, slug, _status: 'published' } as never,
        context: ctx,
        overrideAccess: true,
      })
  return doc.id
}

const pageRef = (label: string, id: number, appearance?: 'primary' | 'outline' | 'link') => ({
  type: 'reference' as const,
  label,
  reference: { relationTo: 'pages' as const, value: id },
  ...(appearance ? { appearance } : {}),
})

export async function seedAudiences(payload: Payload) {
  // --- Categoría para antecedentes de obra (el bloque no se muestra mientras esté vacía) ---
  const cat = await payload.find({
    collection: 'project-categories',
    where: { slug: { equals: 'obras' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const obrasCategory =
    cat.docs[0]?.id ??
    (
      await payload.create({
        collection: 'project-categories',
        data: { name: 'Obras', slug: 'obras', order: 99 },
        context: ctx,
        overrideAccess: true,
      })
    ).id

  // --- Para tu casa ------------------------------------------------------------------------
  const homeOwnersPage = await upsertPage(payload, 'para-tu-casa', {
    title: 'Para tu casa',
    meta: {
      title: 'Aberturas para tu casa: ventanas, puertas y mamparas a medida',
      description:
        'Ventanas, puertas y mamparas de aluminio a medida para tu casa. Medimos, fabricamos en Coronda y colocamos. Mirá opciones, ejemplos y cotizá online.',
    },
    layout: [
      {
        blockType: 'hero',
        variant: 'editorial',
        showBreadcrumbs: true,
        eyebrow: 'Para tu casa',
        title: 'Aberturas para tu casa, medidas y colocadas por nosotros.',
        subtitle:
          'Si estás construyendo o reformando, te ayudamos a elegir, medimos en obra, fabricamos a medida y colocamos. Todo con el mismo equipo.',
        image: await photo(payload, 'living con ventanal corredizo Modena de piso a techo'),
        links: [
          { link: urlLink('Cotizar online', '/cotizador', 'primary') },
          { link: waLink('Consultar por WhatsApp') },
        ],
        settings: settings(),
      },
      {
        blockType: 'productCategories',
        title: 'Qué podemos hacer para tu casa',
        cta: urlLink('Ver todos los productos', '/productos', 'link'),
        settings: settings(),
      },
      {
        blockType: 'productLines',
        variant: 'cards',
        eyebrow: 'Opciones',
        title: 'Elegí la línea según lo que priorizás',
        intro: 'Precio, resistencia o aislación: te explicamos la diferencia sin vueltas.',
        settings: settings({ background: 'muted' }),
      },
      {
        blockType: 'process',
        variant: 'timeline',
        eyebrow: 'Medición e instalación',
        title: 'De la consulta a la colocación',
        intro: 'Sabés qué pasa en cada paso y quién se encarga.',
        decoration: true,
        steps: [
          { title: 'Consultás', text: 'Por WhatsApp, desde la web o en el local.' },
          {
            title: 'Medimos en obra',
            text: 'En Coronda y zona (+40 km) tomamos las medidas antes de fabricar.',
          },
          { title: 'Fabricamos a medida', text: 'Cortamos, armamos y controlamos en el taller.' },
          {
            title: 'Colocamos',
            text: 'Instalación profesional. Si algo no cierra bien, volvemos y lo arreglamos.',
          },
        ],
        settings: settings({ background: 'dark' }),
      },
      {
        blockType: 'advisor',
        eyebrow: 'Asesor virtual',
        title: '¿No sabés qué línea elegir?',
        intro: 'Respondé tres preguntas y te decimos cuál conviene para tu casa.',
        settings: settings(),
      },
      {
        blockType: 'projectGrid',
        eyebrow: 'Ejemplos',
        title: 'Trabajos que hicimos',
        source: 'featured',
        limit: 4,
        cta: urlLink('Ver todos los trabajos', '/proyectos', 'link'),
        settings: settings({ spacing: 'sm' }),
      },
      {
        blockType: 'faq',
        title: 'Preguntas frecuentes',
        items: [
          {
            question: '¿Tienen que venir a medir?',
            answer:
              'En Coronda y zona (más de 40 km a la redonda) medimos nosotros antes de fabricar. Si estás más lejos, te explicamos cómo tomar las medidas y te enviamos las aberturas.',
          },
          {
            question: '¿Puedo saber el precio antes?',
            answer:
              'Sí. En el cotizador armás tu lista y ves un precio estimado al instante. El presupuesto final lo ajustamos con las medidas reales.',
          },
          {
            question: '¿Ustedes colocan?',
            answer:
              'Sí, colocación profesional en Coronda y zona. Las mamparas tienen un sistema de encastre que también podés instalar vos.',
          },
          {
            question: '¿Qué pasa si algo no cierra bien?',
            answer: 'Volvemos y lo arreglamos. Respondemos por lo que fabricamos y colocamos.',
          },
          {
            question: '¿Envían a otras ciudades?',
            answer: 'Sí, enviamos a todo el país. El transporte se coordina en cada caso.',
          },
        ],
        settings: settings({ background: 'muted' }),
      },
    ],
  })

  // --- Obras y profesionales -------------------------------------------------------------------
  const prosPath = '/obras-y-profesionales'
  const prosPage = await upsertPage(payload, 'obras-y-profesionales', {
    title: 'Obras y profesionales',
    hideFooterCta: true,
    meta: {
      title: 'Aberturas para obras: arquitectos, constructoras y desarrolladores',
      description:
        'Aberturas de aluminio para obras: un responsable de principio a fin, documentación técnica por línea, cotización por planilla o planos y entregas coordinadas con la obra.',
    },
    layout: [
      {
        blockType: 'hero',
        variant: 'editorial',
        showBreadcrumbs: true,
        eyebrow: 'Obras y profesionales',
        title: 'Aberturas para obras, con un responsable de principio a fin.',
        subtitle:
          'Para arquitectos, constructoras y desarrolladores: cotizamos por planilla o planos, coordinamos entregas por etapa y colocamos con nuestro equipo.',
        image: await photo(payload, 'frente vidriado con perfiles finos'),
        links: [
          { link: urlLink('Cotizar una obra', `${prosPath}#cotizar`, 'primary') },
          { link: urlLink('Documentación técnica', `${prosPath}#documentacion`, 'outline') },
        ],
        settings: settings(),
      },
      {
        blockType: 'textImage',
        variant: 'bleed',
        eyebrow: 'Interlocutor',
        title: 'Un solo responsable para toda la obra',
        intro:
          'Desde el cómputo hasta la última colocación hablás con la misma persona de Pircas: responde por plazos, cambios y terminaciones, y coordina con la dirección de obra.',
        bullets: [
          { text: 'Cómputo y cotización por línea y tipología' },
          { text: 'Seguimiento de cambios de proyecto' },
          { text: 'Coordinación con la dirección de obra' },
          { text: 'Visitas a obra para medición y control' },
        ],
        image: await photo(payload, 'el equipo en el taller cortando y armando perfiles'),
        imagePosition: 'left',
        settings: settings({ background: 'muted', spacing: 'none' }),
      },
      {
        blockType: 'process',
        variant: 'timeline',
        eyebrow: 'Cotización y entregas',
        title: 'Cómo cotizamos y coordinamos',
        intro: 'Un proceso pensado para obras con etapas, plazos y varios gremios.',
        decoration: true,
        steps: [
          { title: 'Planos o planilla', text: 'Nos mandás la planilla de aberturas o los planos.' },
          {
            title: 'Cómputo y cotización',
            text: 'Cotizamos por línea y tipología, con alternativas si hay que ajustar costos.',
          },
          {
            title: 'Plan de entregas',
            text: 'Acordamos con la obra qué se entrega en cada etapa.',
          },
          {
            title: 'Medición y fabricación',
            text: 'Medimos los vanos terminados y fabricamos en el taller.',
          },
          {
            title: 'Colocación y entrega',
            text: 'Colocamos con nuestro equipo y revisamos cada abertura antes de entregar.',
          },
        ],
        settings: settings({ background: 'dark' }),
      },
      {
        blockType: 'productLines',
        variant: 'cards',
        eyebrow: 'Líneas',
        title: 'Líneas para especificar',
        intro: 'Tres líneas de aluminio según el uso, la exposición y el presupuesto de la obra.',
        settings: settings(),
      },
      {
        blockType: 'documents',
        eyebrow: 'Documentación',
        title: 'Documentación técnica',
        intro: 'Información de cada línea para especificar y comparar.',
        showLines: true,
        note: '¿Necesitás detalles de montaje, secciones de perfiles o planillas para tu pliego? Pedínoslos y te los enviamos.',
        cta: urlLink('Pedir documentación', `${prosPath}#cotizar`, 'link'),
        settings: settings({ background: 'muted', anchor: 'documentacion' }),
      },
      {
        blockType: 'projectGrid',
        eyebrow: 'Antecedentes',
        title: 'Obras realizadas',
        source: 'category',
        category: obrasCategory,
        limit: 6,
        settings: settings({ spacing: 'sm' }),
      },
      {
        blockType: 'contact',
        title: 'Cotizá tu obra',
        form: 'professional',
        promo: {
          eyebrow: 'Más rápido',
          text: 'Mandanos la planilla de aberturas por WhatsApp y arrancamos con el cómputo.',
          link: waLink('Enviar por WhatsApp', 'Hola Pircas, quiero cotizar una obra.', 'primary'),
        },
        showMap: false,
        settings: settings({ anchor: 'cotizar' }),
      },
    ],
  })

  // --- Home: los dos ambientes, justo después del hero -------------------------------------------
  const home = await payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true })
  const sections = (home.sections ?? []).filter((b) => b.blockType !== 'audiences')
  const audiences = {
    blockType: 'audiences' as const,
    eyebrow: '¿Qué estás buscando?',
    title: 'Dos formas de trabajar con nosotros',
    items: [
      {
        audience: 'Quien construye o reforma',
        tone: 'light' as const,
        title: 'Para tu casa',
        text: 'Ventanas, puertas y mamparas a medida, con medición e instalación.',
        bullets: [
          { text: 'Productos y líneas para cada presupuesto' },
          { text: 'Medimos, fabricamos y colocamos' },
          { text: 'Ejemplos de trabajos hechos' },
          { text: 'Cotizador online y WhatsApp' },
        ],
        image: await photo(payload, 'interior del estar con el ventanal cerrado'),
        link: pageRef('Ver opciones para tu casa', homeOwnersPage),
      },
      {
        audience: 'Arquitectos, constructoras y desarrolladores',
        tone: 'dark' as const,
        title: 'Para obras y profesionales',
        text: 'Un responsable de Pircas, documentación técnica y entregas coordinadas con la obra.',
        bullets: [
          { text: 'Un interlocutor responsable' },
          { text: 'Líneas y documentación técnica' },
          { text: 'Cotización por planilla o planos' },
          { text: 'Coordinación de entregas e instalación' },
        ],
        image: await photo(payload, 'frente de vivienda con ventanas de aluminio reforzadas'),
        link: pageRef('Ver servicio para obras', prosPage),
      },
    ],
    settings: settings({ anchor: 'para-quien' }),
  }
  const heroIndex = sections.findIndex((b) => b.blockType === 'hero')
  sections.splice(heroIndex + 1, 0, audiences as unknown as (typeof sections)[number])
  await payload.updateGlobal({
    slug: 'homepage',
    data: { sections, _status: 'published' },
    context: ctx,
    overrideAccess: true,
  })

  // --- Menú: los dos ambientes primero; Líneas y Mamparas quedan dentro de Productos --------------
  const header = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true })
  type NavRow = NonNullable<Header['navigation']>[number]
  const drop = new Set(['Inicio', 'Líneas', 'Mamparas', 'Para tu casa', 'Obras y profesionales'])
  const kept = (header.navigation ?? []).filter((n) => !drop.has(n.link?.label ?? ''))
  const navigation: NavRow[] = [
    { link: pageRef('Para tu casa', homeOwnersPage) },
    { link: pageRef('Obras y profesionales', prosPage) },
    ...kept.map((n) => {
      const firstColumn = n.megaMenu?.columns?.[0]
      if (!firstColumn || firstColumn.links?.some((l) => l.link?.label === 'Ver todas las líneas'))
        return n
      return {
        ...n,
        megaMenu: {
          ...n.megaMenu,
          columns: [
            {
              ...firstColumn,
              links: [
                ...(firstColumn.links ?? []),
                { link: urlLink('Ver todas las líneas', '/lineas') },
              ],
            },
            ...(n.megaMenu?.columns?.slice(1) ?? []),
          ],
        },
      } as NavRow
    }),
  ]
  await payload.updateGlobal({
    slug: 'header',
    data: { navigation },
    context: ctx,
    overrideAccess: true,
  })

  // --- Footer: agrega los dos ambientes a la primera columna -------------------------------------
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true })
  const columns = footer.navigation ?? []
  if (columns[0] && !columns[0].links?.some((l) => l.link?.label === 'Para tu casa')) {
    columns[0] = {
      ...columns[0],
      links: [
        { link: pageRef('Para tu casa', homeOwnersPage) },
        { link: pageRef('Obras y profesionales', prosPage) },
        ...(columns[0].links ?? []),
      ],
    }
    await payload.updateGlobal({
      slug: 'footer',
      data: { navigation: columns },
      context: ctx,
      overrideAccess: true,
    })
  }

  payload.logger.info('Secciones "Para tu casa" y "Obras y profesionales" listas ✔')
}
