import type { Media, Product } from '@/payload-types'
import { isPopulated } from '@/lib/data/populated'
import { mediaSrc } from '@/lib/media'
import type { QuoteCatalog } from '@/lib/quote/catalog'
import { unitEstimate } from '@/lib/quote/pricing'
import { ROUTES } from '@/lib/routes'

import { toShopProduct, type ShopProduct } from './config'
import type { PriceRules } from './pricing'

/**
 * La tienda muestra TODO el catálogo: los productos con precio se compran online y los que
 * se fabrican a medida aparecen con su precio estimado "desde" (del cotizador) y el botón
 * para cotizarlos. Es una sola fuente de datos: Productos del panel.
 */

export type MadeToMeasureItem = {
  id: number
  slug: string
  name: string
  category: string | null
  categorySlug: string | null
  image: { url: string; alt: string } | null
  /** Precio estimado mínimo según el cotizador (null si no tiene precio cargado). */
  fromPrice: number | null
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

const relId = (v: unknown): number | null =>
  typeof v === 'number'
    ? v
    : isPopulated(v as { id: number } | null)
      ? (v as { id: number }).id
      : null

/** Precio "desde": superficie mínima del cotizador, con la línea del producto o la más económica. */
export function fromPrice(p: Product, quote: QuoteCatalog): number | null {
  const qp = quote.products.find((x) => x.id === p.id)
  if (!qp) return null
  const ownLine = relId(p.line)
  const candidates =
    qp.pricing === 'fixed'
      ? [null]
      : ownLine && quote.lines.some((l) => l.id === ownLine)
        ? quote.lines.filter((l) => l.id === ownLine)
        : quote.lines
  const side = quote.pricing.minDimension
  const prices = candidates
    .map((line) =>
      unitEstimate(
        {
          productId: p.id,
          lineId: line?.id ?? null,
          glass: line?.glass[0]?.name ?? null,
          width: side,
          height: side,
          quantity: 1,
        },
        qp,
        line,
        quote.pricing,
      ),
    )
    .filter((n): n is number => typeof n === 'number' && n > 0)
  return prices.length ? Math.min(...prices) : null
}

export function toStoreItem(p: Product, rules: PriceRules, quote: QuoteCatalog): StoreItem | null {
  const buy = toShopProduct(p, rules)
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
      fromPrice: quote.pricing.showPrices ? fromPrice(p, quote) : null,
      quotable: quote.products.some((x) => x.id === p.id),
      quoteHref: `${ROUTES.quote}?producto=${encodeURIComponent(p.slug)}${line ? `&linea=${encodeURIComponent(line.slug)}` : ''}`,
      featured: Boolean(p.featured),
    },
  }
}

/** Precio con el que se ordena y filtra cada ítem. */
export const itemPrice = (i: StoreItem): number | null =>
  i.kind === 'buy' ? i.product.price.transfer : i.product.fromPrice
