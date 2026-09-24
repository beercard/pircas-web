/**
 * Precio estimado del cotizador. Módulo puro compartido por el navegador (precio
 * instantáneo) y el servidor (que lo recalcula al recibir el pedido: nunca se confía
 * en montos enviados por el cliente).
 *
 *   superficie = max(mínimo, (ancho [+ lado 2]) × alto / 10.000)   [m²]
 *   tarifa     = precio por m² (de la línea o propio del producto) × multiplicador del producto
 *                × multiplicador del vidrio (solo si el precio es por línea)
 *   unitario   = redondeo(tarifa × superficie)
 */

export type PricingSettings = {
  minArea: number
  rounding: number
  minDimension: number
  maxDimension: number
}

export type QuoteProduct = {
  id: number
  name: string
  slug: string
  categoryId: number | null
  pricing: 'line' | 'fixed'
  pricePerM2: number | null
  multiplier: number
  secondSide: boolean
  fixedDescription: string | null
}

export type QuoteLine = {
  id: number
  name: string
  slug: string
  pricePerM2: number | null
  glass: { name: string; multiplier: number }[]
}

export type QuoteItemInput = {
  productId: number
  lineId?: number | null
  glass?: string | null
  width: number
  height: number
  side2?: number | null
  quantity: number
}

export const DEFAULT_PRICING: PricingSettings = {
  minArea: 0.5,
  rounding: 1000,
  minDimension: 30,
  maxDimension: 600,
}

export function areaM2(
  item: Pick<QuoteItemInput, 'width' | 'height' | 'side2'>,
  secondSide: boolean,
  minArea: number,
): number {
  const width = item.width + (secondSide && item.side2 ? item.side2 : 0)
  return Math.max(minArea, (width * item.height) / 10_000)
}

/** Precio unitario estimado, o null si faltan datos (ej: la línea no tiene precio cargado). */
export function unitEstimate(
  item: QuoteItemInput,
  product: QuoteProduct,
  line: QuoteLine | null,
  settings: PricingSettings = DEFAULT_PRICING,
): number | null {
  const base = product.pricing === 'fixed' ? product.pricePerM2 : line?.pricePerM2
  if (!base || base <= 0) return null
  let rate = base * (product.multiplier > 0 ? product.multiplier : 1)
  if (product.pricing === 'line') {
    const glass = line?.glass.find((g) => g.name === item.glass)
    if (glass && glass.multiplier > 0) rate *= glass.multiplier
  }
  const rounding = settings.rounding > 0 ? settings.rounding : 1
  return (
    Math.round((rate * areaM2(item, product.secondSide, settings.minArea)) / rounding) * rounding
  )
}

export function validDimensions(
  item: Pick<QuoteItemInput, 'width' | 'height' | 'quantity'>,
  settings: PricingSettings,
): boolean {
  const ok = (n: number) =>
    Number.isFinite(n) && n >= settings.minDimension && n <= settings.maxDimension
  return ok(item.width) && ok(item.height) && Number.isInteger(item.quantity) && item.quantity >= 1
}

export function formatARS(n: number): string {
  return '$ ' + Math.round(n).toLocaleString('es-AR')
}

/** Descripción corta del ítem: "Herrero Reforzada · Vidrio Float · 150×110 cm · ×2". */
export function describeItem(
  item: QuoteItemInput,
  product: QuoteProduct,
  line: QuoteLine | null,
): string {
  const parts: string[] = []
  if (product.pricing === 'fixed') {
    if (product.fixedDescription) parts.push(product.fixedDescription)
  } else {
    if (line) parts.push(line.name)
    if (item.glass) parts.push(`Vidrio ${item.glass}`)
  }
  const dims = `${item.width}×${item.height}${product.secondSide && item.side2 ? `×${item.side2}` : ''} cm`
  parts.push(dims, `×${item.quantity}`)
  return parts.join(' · ')
}
