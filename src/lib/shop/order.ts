import { randomBytes, randomInt } from 'node:crypto'

import type { Payload } from 'payload'

import type { Order, Product } from '@/payload-types'
import { SubmissionError } from '@/lib/leads/submit'
import { absoluteUrl, ROUTES } from '@/lib/routes'

import { toShopConfig, toShopProduct, type ShopConfig, type ShopProduct } from './config'
import { createPreference } from './mercadopago'
import { sendOrderEmails } from './notify'
import { colorLabel } from './options'
import { orderTotals, shippingQuote, unitPriceFor, type OrderTotals } from './pricing'
import type { CartItemInput, CheckoutData } from './schema'

export type PricedCartLine = {
  product: ShopProduct
  color: string | null
  quantity: number
  /** Motivo por el que no se puede comprar tal cual (sin stock, etc.). */
  issue: string | null
}

export type PricedCart = { lines: PricedCartLine[]; missing: number[] }

/** Lee los productos del carrito de la base y devuelve precios y stock actuales. */
export async function priceCart(
  payload: Payload,
  items: CartItemInput[],
  config: ShopConfig,
): Promise<PricedCart> {
  const ids = [...new Set(items.map((i) => i.productId))]
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] },
    depth: 1,
    limit: ids.length,
    pagination: false,
  })
  const byId = new Map<number, ShopProduct>()
  for (const doc of docs as Product[]) {
    const p = toShopProduct(doc, config.rules)
    if (p) byId.set(p.id, p)
  }

  const lines: PricedCartLine[] = []
  const missing: number[] = []
  const used = new Map<number, number>()
  for (const item of items) {
    const product = byId.get(item.productId)
    if (!product) {
      missing.push(item.productId)
      continue
    }
    const color = product.colors.length
      ? (product.colors.find((c) => c.value === item.color)?.value ?? null)
      : null
    let issue: string | null = null
    if (product.colors.length && !color) issue = 'Elegí un color.'
    const taken = (used.get(product.id) ?? 0) + item.quantity
    used.set(product.id, taken)
    if (product.stock !== null && taken > product.stock)
      issue = product.stock === 0 ? 'Sin stock.' : `Quedan ${product.stock} unidades.`
    lines.push({ product, color, quantity: item.quantity, issue })
  }
  return { lines, missing }
}

const variantOf = (line: PricedCartLine) =>
  [line.color ? colorLabel(line.color) : null, line.product.measure].filter(Boolean).join(' · ') ||
  undefined

function newOrderNumber(): string {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `P${ymd}-${randomInt(1000, 10_000)}`
}

export const orderUrl = (order: Pick<Order, 'orderNumber'>, token: string) =>
  absoluteUrl(`${ROUTES.order}/${order.orderNumber}?t=${token}`)

export type CreatedOrder = {
  orderNumber: string
  url: string
  /** URL de Mercado Pago para pagar ahora (si corresponde). */
  paymentUrl: string | null
  totals: OrderTotals
}

/** Crea el pedido con precios, envío y total recalculados en el servidor. */
export async function createOrder(payload: Payload, data: CheckoutData): Promise<CreatedOrder> {
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  const config = toShopConfig(settings)
  if (!config.enabled)
    throw new SubmissionError('La tienda no está tomando pedidos en este momento.')

  const payment = config.payments.find((p) => p.method === data.paymentMethod)
  if (!payment)
    throw new SubmissionError('Elegí un medio de pago.', {
      paymentMethod: 'Elegí un medio de pago.',
    })

  const shippingMethod = config.shipping.find((m) => m.code === data.shippingCode)
  if (!shippingMethod)
    throw new SubmissionError('Elegí una forma de entrega.', {
      shippingCode: 'Elegí una forma de entrega.',
    })
  if (data.paymentMethod === 'cash' && shippingMethod.type !== 'pickup')
    throw new SubmissionError('El pago en efectivo es solo para retiro en el taller.', {
      paymentMethod: 'El efectivo es solo para retiro en el taller.',
    })
  if (shippingMethod.type === 'delivery') {
    const fields: Record<string, string> = {}
    if (!data.address) fields.address = 'Ingresá la dirección de entrega.'
    if (!data.city) fields.city = 'Ingresá la localidad.'
    if (Object.keys(fields).length)
      throw new SubmissionError('Completá la dirección de entrega.', fields)
  }

  const cart = await priceCart(payload, data.items, config)
  if (cart.missing.length || !cart.lines.length)
    throw new SubmissionError('Algunos productos ya no están disponibles. Revisá tu carrito.')
  const blocked = cart.lines.find((l) => l.issue)
  if (blocked)
    throw new SubmissionError(`${blocked.product.name}: ${blocked.issue} Revisá tu carrito.`)

  const pricedLines = cart.lines.map((l) => ({ breakdown: l.product.price, quantity: l.quantity }))
  const goods = orderTotals(pricedLines, data.paymentMethod, { cost: 0, quoteLater: false })
  const shipping = shippingQuote(shippingMethod, goods.subtotal)
  const totals = orderTotals(pricedLines, data.paymentMethod, shipping)

  const accessToken = randomBytes(24).toString('hex')
  const base = {
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    paymentMethod: data.paymentMethod,
    accessToken,
    customerName: data.fullName,
    customer: { email: data.email, phone: data.phone, document: data.document || undefined },
    notes: data.notes || undefined,
    items: cart.lines.map((l) => {
      const unit = unitPriceFor(l.product.price, data.paymentMethod)
      return {
        product: l.product.id,
        name: l.product.name,
        variant: variantOf(l),
        sku: l.product.sku || undefined,
        quantity: l.quantity,
        listPrice: l.product.price.list,
        unitPrice: unit,
        subtotal: unit * l.quantity,
      }
    }),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingCost: totals.shipping,
    total: totals.total,
    shipping: {
      label: shippingMethod.label,
      type: shippingMethod.type,
      quoteLater: shipping.quoteLater,
      address: data.address || undefined,
      city: data.city || undefined,
      province: data.province || undefined,
      zip: data.zip || undefined,
    },
    timeline: [{ date: new Date().toISOString(), label: 'Pedido recibido desde la tienda online' }],
  }

  // El número es aleatorio: ante una colisión (índice único) se reintenta.
  let order: Order | null = null
  for (let attempt = 0; attempt < 4 && !order; attempt++) {
    try {
      order = await payload.create({
        collection: 'orders',
        data: { ...base, orderNumber: newOrderNumber() },
        overrideAccess: true,
      })
    } catch (err) {
      if (attempt === 3) throw err
    }
  }
  if (!order) throw new Error('order not created')

  // Descuenta stock de los productos que lo controlan.
  for (const l of cart.lines) {
    if (l.product.stock === null) continue
    try {
      const current = await payload.findByID({ collection: 'products', id: l.product.id, depth: 0 })
      await payload.update({
        collection: 'products',
        id: l.product.id,
        data: {
          shop: { ...current.shop, stock: Math.max(0, (current.shop?.stock ?? 0) - l.quantity) },
        },
        overrideAccess: true,
      })
    } catch (err) {
      payload.logger.error({ err, product: l.product.id }, 'stock update failed')
    }
  }

  const url = orderUrl(order, accessToken)

  let paymentUrl: string | null = null
  if (data.paymentMethod === 'mercadopago' && config.mercadopagoOnline) {
    try {
      const site = absoluteUrl('/')
      paymentUrl = await createPreference({
        orderNumber: order.orderNumber,
        title: `Pedido ${order.orderNumber} — PIRCAS Aberturas`,
        total: totals.total,
        installments: config.rules.installments,
        payer: { name: data.fullName, email: data.email },
        returnUrl: url,
        notificationUrl: site.startsWith('https://')
          ? absoluteUrl('/api/shop/mercadopago/webhook')
          : null,
      })
    } catch (err) {
      payload.logger.error({ err, order: order.orderNumber }, 'mercadopago preference failed')
    }
  }

  // Los emails nunca hacen fallar el pedido.
  try {
    await sendOrderEmails(payload, order, url, settings)
  } catch (err) {
    payload.logger.error({ err, order: order.orderNumber }, 'order emails failed')
  }

  return { orderNumber: order.orderNumber, url, paymentUrl, totals }
}

/** Busca un pedido por número y token del enlace (comparación exacta en la base). */
export async function findOrderByToken(
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
