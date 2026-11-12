/**
 * Precios del presupuesto online (módulo puro: servidor y tests).
 *
 * Los precios NUNCA se mandan al navegador del catálogo: el cliente arma su lista sin
 * precios y recibe el presupuesto calculado acá al dejar su WhatsApp.
 *
 * Cada producto tiene un precio de lista por medida (o uno solo, si es de medida única) y,
 * opcionalmente, el precio de cada accesorio. Se cargan sin IVA; el presupuesto los muestra
 * con el IVA incluido. El presupuesto informa el total de lista, el total pagando por
 * transferencia / efectivo (con descuento) y las cuotas sin interés.
 */

export type PriceRules = {
  /** % de descuento pagando por transferencia o efectivo. */
  transferDiscount: number
  /** Cuotas sin interés con tarjeta (1 = sin cuotas). */
  installments: number
}

export const DEFAULT_PRICE_RULES: PriceRules = { transferDiscount: 20, installments: 3 }

const pct = (n: unknown, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 && n < 100 ? n : fallback

/** Reglas efectivas de un producto: lo propio del producto pisa lo general. */
export function resolveRules(
  own: { transferDiscount?: number | null; installments?: number | null },
  defaults: PriceRules,
): PriceRules {
  return {
    transferDiscount: pct(own.transferDiscount, defaults.transferDiscount),
    installments:
      typeof own.installments === 'number' && own.installments >= 1
        ? Math.floor(own.installments)
        : defaults.installments,
  }
}

/** Precio final con IVA (los precios se cargan sin IVA). */
export const withVat = (price: number, vatPercent: number) =>
  Math.round(price * (1 + Math.max(0, vatPercent) / 100))

export const DEFAULT_VAT_PERCENT = 21

const off = (price: number, discount: number) => Math.round(price * (1 - discount / 100))

export type QuoteLinePrice = {
  /** Precio de lista unitario, con IVA (producto + accesorios elegidos). */
  unitList: number
  rules: PriceRules
  quantity: number
}

export type QuoteTotals = {
  /** Total a precio de lista (con tarjeta, en cuotas). */
  list: number
  /** Total pagando por transferencia o efectivo. */
  transfer: number
  saving: number
  /** Cuotas sin interés que aplican a todo el presupuesto (las menores entre los productos). */
  installments: number
  installmentAmount: number
  itemsCount: number
}

export function quoteTotals(lines: QuoteLinePrice[]): QuoteTotals {
  let list = 0
  let transfer = 0
  let itemsCount = 0
  let installments = Infinity
  for (const { unitList, rules, quantity } of lines) {
    const unit = Math.max(0, Math.round(unitList))
    list += unit * quantity
    transfer += off(unit, rules.transferDiscount) * quantity
    itemsCount += quantity
    installments = Math.min(installments, rules.installments)
  }
  const n = Number.isFinite(installments) ? Math.max(1, installments) : 1
  return {
    list,
    transfer,
    saving: list - transfer,
    installments: n,
    installmentAmount: Math.round(list / n),
    itemsCount,
  }
}

export function formatPrice(n: number): string {
  // Espacio duro: el signo nunca queda separado del número.
  return '$\u00A0' + Math.round(n).toLocaleString('es-AR')
}
