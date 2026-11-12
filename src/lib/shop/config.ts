import type { Media, Product, ShopSetting } from '@/payload-types'
import { getShopSettings } from '@/lib/data/globals'
import { isPopulated } from '@/lib/data/populated'
import { mediaSrc } from '@/lib/media'

import { ACCESSORIES, COLORS, type AccessoryValue, type ColorValue } from './options'
import { DEFAULT_PRICE_RULES, DEFAULT_VAT_PERCENT, resolveRules, type PriceRules } from './pricing'
import type { ChoiceGroup, VariantKey, VariantRow } from './variants'

/** Configuración del presupuesto online apta para el navegador (sin precios ni emails). */
export type ShopConfig = {
  enabled: boolean
  announcement: string | null
  rules: PriceRules
  /** Días de validez de los precios del presupuesto. */
  validityDays: number
  /** % de IVA que se suma a los precios cargados (0 = ya son finales). */
  vatPercent: number
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
    vatPercent:
      typeof settings?.vatPercent === 'number' &&
      settings.vatPercent >= 0 &&
      settings.vatPercent <= 50
        ? settings.vatPercent
        : DEFAULT_VAT_PERCENT,
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
  /** Medida única (productos sin "Medidas y precios"). */
  measure: string | null
  /** Cantidad de medidas para elegir (0 = medida única). */
  measureCount: number
  /** Combinaciones disponibles, sin precios. Solo viaja en la ficha del producto. */
  variants?: VariantKey[]
  /** Título del selector de opción (ej. "Reja"). */
  optionLabel: string | null
  /** Elecciones que no cambian el precio (giro, tipo de vidrio…). */
  choices: ChoiceGroup[]
  featured: boolean
}

/** Datos de precio del producto: solo en el servidor. */
export type ProductPricing = {
  /** Precio de medida única (0 si el producto tiene medidas con precio). */
  list: number
  /** Medidas con precio (vacío = medida única). */
  variants: VariantRow[]
  rules: PriceRules
  accessoryPrices: Partial<Record<AccessoryValue, number>>
  sku: string | null
}

/** Filas válidas de "Medidas y precios" (medida y precio cargados). */
export function variantRows(p: Product): VariantRow[] {
  return (p.shop?.variants ?? []).flatMap((v) =>
    v?.measure?.trim() && typeof v.price === 'number' && v.price > 0
      ? [
          {
            measure: v.measure.trim(),
            color: v.color ?? null,
            option: v.option?.trim() || null,
            price: v.price,
          },
        ]
      : [],
  )
}

const choiceGroups = (p: Product): ChoiceGroup[] =>
  (p.shop?.choices ?? []).flatMap((c) => {
    const values = (c?.values ?? []).map((v) => v.trim()).filter(Boolean)
    return c?.label?.trim() && values.length ? [{ label: c.label.trim(), values }] : []
  })

export const isSellable = (p: Product): boolean =>
  Boolean(
    p.shop?.enabled &&
    ((typeof p.shop.price === 'number' && p.shop.price > 0) || variantRows(p).length > 0),
  )

function accessoryPrices(p: Product): Partial<Record<AccessoryValue, number>> {
  const out: Partial<Record<AccessoryValue, number>> = {}
  for (const a of p.shop?.accessories ?? []) {
    if (a?.kind && typeof a.price === 'number' && a.price >= 0) out[a.kind] = a.price
  }
  return out
}

/**
 * `full` agrega las combinaciones de medida / color / opción (sin precios): solo para la
 * ficha del producto, para no engordar los listados.
 */
export function toShopProduct(p: Product, { full = false } = {}): ShopProduct | null {
  if (!isSellable(p) || !p.slug) return null
  const shop = p.shop!
  const img = p.featuredImage as Media | number | null | undefined
  const media = img && typeof img === 'object' ? img : null
  const thumb = media?.sizes?.card?.url || media?.url
  const prices = accessoryPrices(p)
  const category = isPopulated(p.category) ? p.category : null
  const rows = variantRows(p)
  // Con medidas, los colores salen de las filas (si el precio cambia por color).
  const rowColors = new Set(rows.map((r) => r.color).filter(Boolean))
  const colorValues = rowColors.size ? [...rowColors] : (shop.colors ?? [])
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: category?.id ?? (typeof p.category === 'number' ? p.category : null),
    category: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    image: thumb ? { url: mediaSrc(thumb) ?? thumb, alt: media?.alt || p.name } : null,
    colors: COLORS.filter((c) => colorValues.includes(c.value)).map((c) => ({ ...c })),
    accessories: ACCESSORIES.filter((a) => a.value in prices).map((a) => ({ ...a })),
    measure: rows.length ? null : shop.measure?.trim() || null,
    measureCount: new Set(rows.map((r) => r.measure)).size,
    ...(full && rows.length
      ? { variants: rows.map(({ measure, color, option }) => ({ measure, color, option })) }
      : {}),
    optionLabel: shop.optionLabel?.trim() || null,
    choices: choiceGroups(p),
    featured: Boolean(p.featured),
  }
}

export function productPricing(p: Product, rules: PriceRules): ProductPricing | null {
  if (!isSellable(p)) return null
  return {
    list: p.shop!.price ?? 0,
    variants: variantRows(p),
    rules: resolveRules(p.shop!, rules),
    accessoryPrices: accessoryPrices(p),
    sku: p.shop!.sku?.trim() || null,
  }
}
