import type { Media, Product, ShopSetting } from '@/payload-types'
import { getShopSettings } from '@/lib/data/globals'
import { isPopulated } from '@/lib/data/populated'
import { mediaSrc } from '@/lib/media'

import { ACCESSORIES, COLORS, type AccessoryValue, type ColorValue } from './options'
import { DEFAULT_PRICE_RULES, resolveRules, type PriceRules } from './pricing'

/** Configuración del presupuesto online apta para el navegador (sin precios ni emails). */
export type ShopConfig = {
  enabled: boolean
  announcement: string | null
  rules: PriceRules
  /** Días de validez de los precios del presupuesto. */
  validityDays: number
}

export function toShopConfig(settings: ShopSetting | null | undefined): ShopConfig {
  return {
    enabled: settings?.enabled !== false,
    announcement: settings?.announcement?.trim() || null,
    rules: resolveRules(
      { transferDiscount: settings?.transferDiscount, installments: settings?.installments },
      DEFAULT_PRICE_RULES,
    ),
    validityDays:
      typeof settings?.validityDays === 'number' && settings.validityDays > 0
        ? settings.validityDays
        : 7,
  }
}

export const getShopConfig = async (): Promise<ShopConfig> => toShopConfig(await getShopSettings())

/**
 * Producto del presupuesto tal como lo ve el navegador: SIN precios (el precio se informa
 * recién en el presupuesto, al dejar el WhatsApp).
 */
export type ShopProduct = {
  id: number
  slug: string
  name: string
  categoryId: number | null
  category: string | null
  categorySlug: string | null
  image: { url: string; alt: string } | null
  colors: { value: ColorValue; label: string; hex: string }[]
  /** Accesorios opcionales que se pueden sumar (ventanas). */
  accessories: { value: AccessoryValue; label: string }[]
  measure: string | null
  featured: boolean
}

/** Datos de precio del producto: solo en el servidor. */
export type ProductPricing = {
  list: number
  rules: PriceRules
  accessoryPrices: Partial<Record<AccessoryValue, number>>
  sku: string | null
}

export const isSellable = (p: Product): boolean =>
  Boolean(p.shop?.enabled && typeof p.shop.price === 'number' && p.shop.price > 0)

function accessoryPrices(p: Product): Partial<Record<AccessoryValue, number>> {
  const out: Partial<Record<AccessoryValue, number>> = {}
  for (const a of p.shop?.accessories ?? []) {
    if (a?.kind && typeof a.price === 'number' && a.price >= 0) out[a.kind] = a.price
  }
  return out
}

export function toShopProduct(p: Product): ShopProduct | null {
  if (!isSellable(p) || !p.slug) return null
  const shop = p.shop!
  const img = p.featuredImage as Media | number | null | undefined
  const media = img && typeof img === 'object' ? img : null
  const thumb = media?.sizes?.card?.url || media?.url
  const prices = accessoryPrices(p)
  const category = isPopulated(p.category) ? p.category : null
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: category?.id ?? (typeof p.category === 'number' ? p.category : null),
    category: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    image: thumb ? { url: mediaSrc(thumb) ?? thumb, alt: media?.alt || p.name } : null,
    colors: COLORS.filter((c) => (shop.colors ?? []).includes(c.value)).map((c) => ({ ...c })),
    accessories: ACCESSORIES.filter((a) => a.value in prices).map((a) => ({ ...a })),
    measure: shop.measure?.trim() || null,
    featured: Boolean(p.featured),
  }
}

export function productPricing(p: Product, rules: PriceRules): ProductPricing | null {
  if (!isSellable(p)) return null
  return {
    list: p.shop!.price!,
    rules: resolveRules(p.shop!, rules),
    accessoryPrices: accessoryPrices(p),
    sku: p.shop!.sku?.trim() || null,
  }
}
