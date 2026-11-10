import type { Payload } from 'payload'

/**
 * SEO de las páginas fijas del sitio (se gestiona por código, no en el panel).
 * Productos, líneas, trabajos y tienda generan su título y descripción automáticamente
 * (src/lib/seo/describe.ts); acá van las páginas armadas con secciones.
 * Idempotente: se puede correr las veces que haga falta.
 */

const PAGES: Record<string, { title: string; description: string }> = {
  nosotros: {
    title: 'Quiénes somos: taller de aberturas en Coronda',
    description:
      'Somos un taller de Coronda, Santa Fe, que mide, fabrica y coloca aberturas de aluminio a medida, y da la cara por cada trabajo. Conocé cómo trabajamos.',
  },
  contacto: {
    title: 'Contacto y taller en Coronda, Santa Fe',
    description:
      'Escribinos por WhatsApp, llamanos o vení al taller: Hipólito Yrigoyen 1111, Coronda, Santa Fe. Te asesoramos y cotizamos tus aberturas de aluminio.',
  },
  cotizador: {
    title: 'Cotizá tus aberturas online',
    description:
      'Armá tu lista de ventanas, puertas y mamparas de aluminio con sus medidas y mirá el precio estimado al instante. Te confirmamos el presupuesto final.',
  },
  mamparas: {
    title: 'Mamparas de baño a medida',
    description:
      'Mamparas de baño frontales y angulares a medida, con paneles Klara que no cortan ni estallan. Fabricadas en Coronda, Santa Fe, con envío a todo el país.',
  },
  'para-tu-casa': {
    title: 'Aberturas para tu casa a medida',
    description:
      'Ventanas, puertas y mamparas de aluminio a medida para tu casa. Medimos, fabricamos en Coronda y colocamos. Mirá opciones, ejemplos y cotizá online.',
  },
  'obras-y-profesionales': {
    title: 'Aberturas para obras y profesionales',
    description:
      'Aberturas de aluminio para obras: un responsable de principio a fin, documentación técnica por línea, cotización por planos y entregas coordinadas.',
  },
}

export async function applySeo(payload: Payload): Promise<void> {
  let updated = 0
  for (const [slug, meta] of Object.entries(PAGES)) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const page = docs[0]
    if (!page) continue
    if (page.meta?.title === meta.title && page.meta?.description === meta.description) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { meta: { ...page.meta, title: meta.title, description: meta.description } },
      overrideAccess: true,
    })
    updated++
  }
  payload.logger.info(`SEO de páginas aplicado ✔ (${updated} actualizadas)`)
}
