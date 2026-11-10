import type { Media, Product } from '@/payload-types'
import { isPopulated } from '@/lib/data/populated'
import { mediaSrc } from '@/lib/media'
import type { QuoteCatalog } from '@/lib/quote/catalog'
import { ROUTES } from '@/lib/routes'

import { toShopProduct, type ShopProduct } from './config'

/**
 * La tienda muestra los productos de medida estándar (se suman al presupuesto online) y,
 * aparte, los que se fabrican a medida (llevan al cotizador). Una sola fuente de datos:
 * Productos del panel. Nunca se muestran precios.
 */

export type MadeToMeasureItem = {
  id: number
  slug: string
  name: string
  category: string | null
  categorySlug: string | null
  image: { url: string; alt: string } | null
  /** ¿Se puede cotizar online (está en el cotizador)? */
  quotable: boolean
  quoteHref: string
  featured: boolean
}

export type StoreItem =
  { kind: 'buy'; product: ShopProduct } | { kind: 'measure'; product: MadeToMeasureItem }

export function productImage(p: Product): { url: string; alt: string } | null {
  const img = p.featuredImage as Media | number | null | undefined
  const media = img && typeof img === 'object' ? img : null
  const thumb = media?.sizes?.card?.url || media?.url
  return thumb ? { url: mediaSrc(thumb) ?? thumb, alt: media?.alt || p.name } : null
}

export function toStoreItem(p: Product, quote: QuoteCatalog): StoreItem | null {
  const buy = toShopProduct(p)
  if (buy) return { kind: 'buy', product: buy }
  if (!p.slug) return null
  const line = isPopulated(p.line) ? p.line : null
  return {
    kind: 'measure',
    product: {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: isPopulated(p.category) ? p.category.name : null,
      categorySlug: isPopulated(p.category) ? (p.category.slug ?? null) : null,
      image: productImage(p),
      quotable: quote.products.some((x) => x.id === p.id),
      quoteHref: `${ROUTES.quote}?producto=${encodeURIComponent(p.slug)}${line ? `&linea=${encodeURIComponent(line.slug)}` : ''}`,
      featured: Boolean(p.featured),
    },
  }
}

export type CategoryNode = {
  id: number
  name: string
  slug: string
  children: { id: number; name: string; slug: string }[]
}

/**
 * Árbol de categorías de la tienda (categoría → subcategorías), solo con las que tienen
 * productos del presupuesto. Respeta el orden del panel.
 */
export function storeCategoryTree(
  categories: { id: number; name: string; slug?: string | null; parent?: unknown }[],
  products: ShopProduct[],
): CategoryNode[] {
  const parentOf = (c: { parent?: unknown }) =>
    typeof c.parent === 'number'
      ? c.parent
      : c.parent && typeof c.parent === 'object' && 'id' in c.parent
        ? (c.parent as { id: number }).id
        : null
  const used = new Set(products.map((p) => p.categoryId).filter((id): id is number => id !== null))
  return categories
    .filter((c) => c.slug && parentOf(c) === null)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug!,
      children: categories
        .filter((s) => s.slug && parentOf(s) === c.id && used.has(s.id))
        .map((s) => ({ id: s.id, name: s.name, slug: s.slug! })),
    }))
    .filter((c) => used.has(c.id) || c.children.length > 0)
}

/** Ids de una categoría y sus subcategorías. */
export const categoryIds = (node: CategoryNode | { id: number }) => [
  node.id,
  ...('children' in node ? node.children.map((c) => c.id) : []),
]
