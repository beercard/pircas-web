import { randomBytes, randomInt } from 'node:crypto'

import type { Payload } from 'payload'

import type { Order, Product } from '@/payload-types'
import { SubmissionError } from '@/lib/leads/submit'

import {
  productPricing,
  toShopConfig,
  toShopProduct,
  type ProductPricing,
  type ShopProduct,
} from './config'
import { quoteUrl } from './links'
import { sendQuoteNotification } from './notify'
import { variantText, type AccessoryValue } from './options'
import { formatPrice, quoteTotals, type PriceRules, type QuoteTotals } from './pricing'
import type { QuoteItemInput, QuoteRequestData } from './schema'
import { sendQuoteTemplate } from './whatsapp-cloud'

/** Línea del presupuesto tal como la ve el navegador (sin precios). */
export type QuoteLine = {
  product: ShopProduct
  color: string | null
  accessories: AccessoryValue[]
  quantity: number
}

type PricedLine = QuoteLine & { pricing: ProductPricing; unitList: number }

/**
 * Lee de la base los productos de la lista y normaliza cada línea (color válido, solo los
 * accesorios que el producto ofrece). Devuelve también los precios, que se usan solo en el
 * servidor.
 */
export async function loadQuoteLines(
  payload: Payload,
  items: QuoteItemInput[],
  rules: PriceRules,
): Promise<{ lines: PricedLine[]; missing: number[] }> {
  const ids = [...new Set(items.map((i) => i.productId))]
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] },
    depth: 1,
    limit: ids.length,
    pagination: false,
  })
  const byId = new Map<number, Product>(docs.map((d) => [d.id, d as Product]))

  const lines: PricedLine[] = []
  const missing: number[] = []
  for (const item of items) {
    const doc = byId.get(item.productId)
    const product = doc ? toShopProduct(doc) : null
    const pricing = doc ? productPricing(doc, rules) : null
    if (!product || !pricing) {
      missing.push(item.productId)
      continue
    }
    const color = product.colors.length
      ? (product.colors.find((c) => c.value === item.color) ?? product.colors[0]).value
      : null
    const accessories = product.accessories
      .map((a) => a.value)
      .filter((a) => item.accessories.includes(a))
    const unitList =
      pricing.list + accessories.reduce((sum, a) => sum + (pricing.accessoryPrices[a] ?? 0), 0)
    lines.push({ product, color, accessories, quantity: item.quantity, pricing, unitList })
  }
  return { lines, missing }
}

/** Versión para el navegador: sin precios. */
export const publicLines = (lines: PricedLine[]): QuoteLine[] =>
  lines.map(({ product, color, accessories, quantity }) => ({
    product,
    color,
    accessories,
    quantity,
  }))

function newQuoteNumber(): string {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `P${ymd}-${randomInt(1000, 10_000)}`
}

export type CreatedQuote = {
  orderNumber: string
  url: string
  /** ¿Se envió solo al WhatsApp del cliente (API de WhatsApp Business)? */
  whatsappSent: boolean
  totals: QuoteTotals
}

function sourceOf(a: QuoteRequestData['attribution']): string | undefined {
  if (!a) return undefined
  const utm = [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean).join(' / ')
  if (utm) return utm.slice(0, 200)
  if (a.referrer) {
    try {
      return new URL(a.referrer).hostname
    } catch {
      return undefined
    }
  }
  return undefined
}

/** Crea el presupuesto con los precios calculados en el servidor y avisa al taller. */
export async function createQuote(payload: Payload, data: QuoteRequestData): Promise<CreatedQuote> {
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  const config = toShopConfig(settings)
  if (!config.enabled)
    throw new SubmissionError('El presupuesto online no está disponible en este momento.')

  const { lines, missing } = await loadQuoteLines(payload, data.items, config.rules)
  if (missing.length || !lines.length)
    throw new SubmissionError(
      'Algunos productos ya no están disponibles. Revisá tu presupuesto e intentá de nuevo.',
    )

  const totals = quoteTotals(
    lines.map((l) => ({ unitList: l.unitList, rules: l.pricing.rules, quantity: l.quantity })),
  )
  const accessToken = randomBytes(24).toString('hex')
  const base = {
    status: 'pending' as const,
    accessToken,
    customerName: data.fullName,
    customer: { phone: data.phone, city: data.city },
    notes: data.notes || undefined,
    source: sourceOf(data.attribution),
    items: lines.map((l) => ({
      product: l.product.id,
      name: l.product.name,
      variant: variantText(l.color, l.accessories, l.product.measure) || undefined,
      sku: l.pricing.sku || undefined,
      quantity: l.quantity,
      unitPrice: l.unitList,
      subtotal: l.unitList * l.quantity,
    })),
    total: totals.list,
    transferTotal: totals.transfer,
    installments: totals.installments,
    installmentAmount: totals.installmentAmount,
    timeline: [{ date: new Date().toISOString(), label: 'Presupuesto pedido desde la web' }],
  }

  // El número es aleatorio: ante una colisión (índice único) se reintenta.
  let order: Order | null = null
  for (let attempt = 0; attempt < 4 && !order; attempt++) {
    try {
      order = await payload.create({
        collection: 'orders',
        data: { ...base, orderNumber: newQuoteNumber() },
        overrideAccess: true,
      })
    } catch (err) {
      if (attempt === 3) throw err
    }
  }
  if (!order) throw new Error('quote not created')

  const url = quoteUrl(order, accessToken)

  // Envío automático por WhatsApp (si está configurada la API): nunca hace fallar el pedido.
  let whatsappSent = false
  try {
    whatsappSent = await sendQuoteTemplate({
      to: data.phone,
      name: data.fullName.split(' ')[0],
      number: order.orderNumber,
      total: formatPrice(totals.list),
      url,
    })
    if (whatsappSent)
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { whatsappSent: true },
        overrideAccess: true,
      })
  } catch (err) {
    payload.logger.error({ err, quote: order.orderNumber }, 'whatsapp quote send failed')
  }

  try {
    await sendQuoteNotification(payload, order, settings)
  } catch (err) {
    payload.logger.error({ err, quote: order.orderNumber }, 'quote notification failed')
  }

  return { orderNumber: order.orderNumber, url, whatsappSent, totals }
}

/** Busca un presupuesto por número y token del enlace (comparación exacta en la base). */
export async function findQuoteByToken(
  payload: Payload,
  orderNumber: string,
  token: string,
): Promise<Order | null> {
  if (!/^P\d{6}-\d{4}$/.test(orderNumber) || !/^[a-f0-9]{48}$/.test(token)) return null
  const { docs } = await payload.find({
    collection: 'orders',
    where: { and: [{ orderNumber: { equals: orderNumber } }, { accessToken: { equals: token } }] },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}
