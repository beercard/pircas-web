import type { Product, Project } from '@/payload-types'
import { isPopulated } from '@/lib/data/populated'
import type { ShopProduct } from '@/lib/shop/config'
import { formatPrice } from '@/lib/shop/pricing'

/**
 * Títulos y descripciones automáticos para buscadores cuando el contenido no tiene SEO
 * propio (el SEO se gestiona por código: los editores no lo cargan en el panel).
 * Describen lo que la página realmente muestra, sin relleno de palabras clave.
 */

const LOCATION = 'Coronda, Santa Fe'

/** Corta en el último espacio antes del máximo, sin dejar la oración a medias con "…". */
export function clip(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30)).replace(/[,;:.\s]+$/, '')}…`
}

const sentence = (s: string | null | undefined) => {
  const t = (s ?? '').trim()
  return t ? (/[.!?]$/.test(t) ? t : `${t}.`) : ''
}

/** ¿El nombre ya dice de qué material es? */
const namesMaterial = (name: string) =>
  /aluminio|vidrio|dvh|stopsol|laminado|reja|hierro|placa|pino|cedrillo|mosquitero|granero/i.test(
    name,
  )

export function productSeoTitle(product: Product, shop: ShopProduct | null): string {
  const name = product.name.trim()
  // Con la marca (" | Pircas Aberturas") el título queda en ~70 caracteres como máximo.
  if (shop) return name.length <= 34 ? `${name}: precio online` : name
  const material = namesMaterial(name) ? '' : ' de aluminio'
  const measure = /a medida/i.test(name) ? '' : ' a medida'
  const full = `${name}${material}${measure}`
  return full.length <= 50 ? full : name
}

export function productSeoDescription(product: Product, shop: ShopProduct | null): string {
  const category = isPopulated(product.category) ? product.category.name : null
  if (shop) {
    const p = shop.price
    const pay =
      p.transfer < p.list
        ? `${formatPrice(p.transfer)} con transferencia${p.installments > 1 ? ` o ${p.installments} cuotas sin interés de ${formatPrice(p.installmentAmount)}` : ''}`
        : `${formatPrice(p.transfer)}${p.installments > 1 ? ` o ${p.installments} cuotas sin interés` : ''}`
    return clip(
      `${product.name}${shop.measure ? ` (${shop.measure})` : ''} a ${pay}. ${sentence(product.shortDescription)} Retiro en ${LOCATION} o envío.`,
    )
  }
  return clip(
    `${sentence(product.shortDescription)} ${category ? `${category} de aluminio` : 'Aberturas de aluminio'} fabricadas a medida en nuestro taller de ${LOCATION}: medimos, fabricamos y colocamos. Cotizá online.`,
  )
}

export function projectSeoDescription(project: Project): string {
  const summary = sentence(project.summary)
  if (summary.length >= 110) return clip(summary)
  const where = [project.location, project.year].filter(Boolean).join(', ')
  // Si el resumen ya nombra la obra, no se repite.
  const lead = summary.toLowerCase().includes(project.title.toLowerCase())
    ? summary
    : `${summary} ${project.title}${where ? ` (${where})` : ''}.`
  return clip(
    `${lead} Aberturas de aluminio a medida: las medimos, fabricamos y colocamos nosotros. Mirá las fotos de la obra.`,
  )
}
