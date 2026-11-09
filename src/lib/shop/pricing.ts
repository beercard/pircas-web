/**
 * Precios de la tienda (módulo puro, sin Payload ni Next: se usa en el servidor, en el
 * navegador y en los tests).
 *
 * Como en las tiendas de aberturas de la zona, cada producto tiene un **precio de lista**
 * (el que se paga con Mercado Pago, en cuotas sin interés) y un **precio con transferencia**
 * con descuento. El efectivo al retirar usa el precio con transferencia.
 */

export type PaymentMethod = 'transfer' | 'mercadopago' | 'cash'

export type PriceRules = {
  /** % de descuento pagando por transferencia (o efectivo). */
  transferDiscount: number
  /** % de descuento sobre el precio de lista pagando con Mercado Pago (0 = sin descuento). */
  mpDiscount: number
  /** Cuotas sin interés con Mercado Pago (1 = sin cuotas). */
  installments: number
}

export const DEFAULT_PRICE_RULES: PriceRules = {
  transferDiscount: 20,
  mpDiscount: 0,
  installments: 3,
}

const pct = (n: unknown, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 && n < 100 ? n : fallback

/** Reglas efectivas de un producto: lo propio del producto pisa lo general de la tienda. */
export function resolveRules(
  own: {
    transferDiscount?: number | null
    mpDiscount?: number | null
    installments?: number | null
  },
  defaults: PriceRules,
): PriceRules {
  const installments =
    typeof own.installments === 'number' && own.installments >= 1
      ? Math.floor(own.installments)
      : defaults.installments
  return {
    transferDiscount: pct(own.transferDiscount, defaults.transferDiscount),
    mpDiscount: pct(own.mpDiscount, defaults.mpDiscount),
    installments,
  }
}

const off = (price: number, discount: number) => Math.round(price * (1 - discount / 100))

export type PriceBreakdown = {
  list: number
  transfer: number
  mercadopago: number
  installments: number
  installmentAmount: number
  transferDiscount: number
  mpDiscount: number
}

export function priceBreakdown(listPrice: number, rules: PriceRules): PriceBreakdown {
  const list = Math.max(0, Math.round(listPrice))
  const mercadopago = off(list, rules.mpDiscount)
  return {
    list,
    transfer: off(list, rules.transferDiscount),
    mercadopago,
    installments: rules.installments,
    installmentAmount: Math.round(mercadopago / Math.max(1, rules.installments)),
    transferDiscount: rules.transferDiscount,
    mpDiscount: rules.mpDiscount,
  }
}

/** Precio unitario según el medio de pago. */
export function unitPriceFor(b: PriceBreakdown, method: PaymentMethod): number {
  return method === 'mercadopago' ? b.mercadopago : b.transfer
}

export type PricedLine = { breakdown: PriceBreakdown; quantity: number }

export type ShippingQuote = { cost: number; quoteLater: boolean }

export type OrderTotals = {
  /** Suma a precio de lista. */
  subtotalList: number
  /** Ahorro por el medio de pago elegido. */
  discount: number
  subtotal: number
  shipping: number
  total: number
  itemsCount: number
}

export function orderTotals(
  lines: PricedLine[],
  method: PaymentMethod,
  shipping: ShippingQuote,
): OrderTotals {
  let subtotalList = 0
  let subtotal = 0
  let itemsCount = 0
  for (const { breakdown, quantity } of lines) {
    subtotalList += breakdown.list * quantity
    subtotal += unitPriceFor(breakdown, method) * quantity
    itemsCount += quantity
  }
  const shippingCost = shipping.quoteLater ? 0 : Math.max(0, Math.round(shipping.cost))
  return {
    subtotalList,
    discount: subtotalList - subtotal,
    subtotal,
    shipping: shippingCost,
    total: subtotal + shippingCost,
    itemsCount,
  }
}

export type ShippingMethodConfig = {
  code: string
  label: string
  type: 'pickup' | 'delivery'
  price?: number | null
  freeFrom?: number | null
  quoteLater?: boolean | null
}

/** Costo de envío: gratis desde cierto monto, o "a cotizar" (se informa después). */
export function shippingQuote(method: ShippingMethodConfig, subtotal: number): ShippingQuote {
  if (method.quoteLater) return { cost: 0, quoteLater: true }
  if (method.freeFrom && subtotal >= method.freeFrom) return { cost: 0, quoteLater: false }
  return { cost: Math.max(0, method.price ?? 0), quoteLater: false }
}

export function formatPrice(n: number): string {
  return '$ ' + Math.round(n).toLocaleString('es-AR')
}
