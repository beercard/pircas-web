import type { Media, Product, ShopSetting } from '@/payload-types'
import { getShopSettings } from '@/lib/data/globals'
import { isPopulated } from '@/lib/data/populated'
import { mediaSrc } from '@/lib/media'

import { isMercadoPagoConnected } from './mercadopago'
import { COLORS, type ColorValue } from './options'
import {
  DEFAULT_PRICE_RULES,
  priceBreakdown,
  resolveRules,
  type PaymentMethod,
  type PriceBreakdown,
  type PriceRules,
  type ShippingMethodConfig,
} from './pricing'

/** Configuración de la tienda apta para el navegador (sin datos bancarios ni emails). */
export type ShopConfig = {
  enabled: boolean
  announcement: string | null
  rules: PriceRules
  shipping: (ShippingMethodConfig & { description: string | null })[]
  payments: { method: PaymentMethod; label: string; hint: string }[]
  mercadopagoOnline: boolean
}

const DEFAULT_SHIPPING: ShopConfig['shipping'] = [
  {
    code: 'retiro',
    label: 'Retiro en el taller',
    type: 'pickup',
    description: 'Coronda, Santa Fe. Sin costo.',
  },
  {
    code: 'envio',
    label: 'Envío a domicilio',
    type: 'delivery',
    quoteLater: true,
    description: 'Coordinamos el costo según tu localidad.',
  },
]

export function toShopConfig(settings: ShopSetting | null | undefined): ShopConfig {
  const rules = resolveRules(
    {
      transferDiscount: settings?.transferDiscount,
      mpDiscount: settings?.mpDiscount,
      installments: settings?.installments,
    },
    DEFAULT_PRICE_RULES,
  )
  const shipping = (settings?.shippingMethods ?? [])
    .filter((m) => m.label)
    .map((m, i) => ({
      code: m.id || `m${i}`,
      label: m.label,
      type: m.type,
      price: m.price,
      freeFrom: m.freeFrom,
      quoteLater: m.type === 'delivery' && Boolean(m.quoteLater),
      description: m.description || null,
    }))
  const mpOnline = isMercadoPagoConnected()
  const payments: ShopConfig['payments'] = []
  if (settings?.transfer?.enabled !== false)
    payments.push({
      method: 'transfer',
      label: 'Transferencia bancaria',
      // El ahorro real (cada producto puede tener su propio descuento) se calcula en el checkout.
      hint: 'Te mostramos los datos al confirmar.',
    })
  if (settings?.mercadopago?.enabled !== false)
    payments.push({
      method: 'mercadopago',
      label: 'Mercado Pago',
      hint:
        (rules.installments > 1 ? `Hasta ${rules.installments} cuotas sin interés. ` : '') +
        (mpOnline ? 'Pagás online al confirmar.' : 'Te enviamos el link de pago.'),
    })
  if (settings?.cash?.enabled !== false)
    payments.push({
      method: 'cash',
      label: 'Efectivo al retirar',
      hint: 'Pagás en el taller con el precio de transferencia.',
    })
  return {
    enabled: settings?.enabled !== false,
    announcement: settings?.announcement?.trim() || null,
    rules,
    shipping: shipping.length ? shipping : DEFAULT_SHIPPING,
    payments,
    mercadopagoOnline: mpOnline,
  }
}

export const getShopConfig = async (): Promise<ShopConfig> => toShopConfig(await getShopSettings())

/** Producto listo para la tienda (tarjeta, ficha y carrito). */
export type ShopProduct = {
  id: number
  slug: string
  name: string
  category: string | null
  categorySlug: string | null
  image: { url: string; alt: string } | null
  price: PriceBreakdown
  colors: { value: ColorValue; label: string; hex: string }[]
  measure: string | null
  sku: string | null
  /** null = sin control de stock. */
  stock: number | null
  featured: boolean
}

export const isSellable = (p: Product): boolean =>
  Boolean(p.shop?.enabled && typeof p.shop.price === 'number' && p.shop.price > 0)

export function toShopProduct(p: Product, rules: PriceRules): ShopProduct | null {
  if (!isSellable(p) || !p.slug) return null
  const shop = p.shop!
  const img = p.featuredImage as Media | number | null | undefined
  const media = img && typeof img === 'object' ? img : null
  const thumb = media?.sizes?.card?.url || media?.url
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: isPopulated(p.category) ? p.category.name : null,
    categorySlug: isPopulated(p.category) ? (p.category.slug ?? null) : null,
    image: thumb ? { url: mediaSrc(thumb) ?? thumb, alt: media?.alt || p.name } : null,
    price: priceBreakdown(shop.price!, resolveRules(shop, rules)),
    colors: COLORS.filter((c) => (shop.colors ?? []).includes(c.value)).map((c) => ({ ...c })),
    measure: shop.measure?.trim() || null,
    sku: shop.sku?.trim() || null,
    stock: shop.trackStock ? Math.max(0, shop.stock ?? 0) : null,
    featured: Boolean(p.featured),
  }
}
