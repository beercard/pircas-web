/** Opciones de la tienda compartidas por el panel, el servidor y el sitio. */

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Recibido' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready', label: 'Listo para retirar' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value']

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pendiente de pago' },
  { value: 'paid', label: 'Pagado' },
  { value: 'rejected', label: 'Pago rechazado' },
  { value: 'refunded', label: 'Devuelto' },
] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]['value']

export const PAYMENT_METHODS = [
  { value: 'transfer', label: 'Transferencia bancaria' },
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'cash', label: 'Efectivo al retirar' },
] as const

export const COLORS = [
  { value: 'blanco', label: 'Blanco', hex: '#ffffff' },
  { value: 'negro', label: 'Negro', hex: '#1d1d1f' },
  { value: 'anodizado', label: 'Anodizado natural', hex: '#b9bcc0' },
  { value: 'madera', label: 'Símil madera', hex: '#8a5a33' },
  { value: 'bronce', label: 'Bronce', hex: '#5b4636' },
] as const

export type ColorValue = (typeof COLORS)[number]['value']

const labelOf = <T extends readonly { value: string; label: string }[]>(list: T, value: unknown) =>
  list.find((o) => o.value === value)?.label ?? String(value ?? '')

export const orderStatusLabel = (v: unknown) => labelOf(ORDER_STATUSES, v)
export const paymentStatusLabel = (v: unknown) => labelOf(PAYMENT_STATUSES, v)
export const paymentMethodLabel = (v: unknown) => labelOf(PAYMENT_METHODS, v)
export const colorLabel = (v: unknown) => labelOf(COLORS, v)

/** Qué le decimos al cliente en cada estado (página de seguimiento, email y WhatsApp). */
export const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: 'Recibimos tu pedido. Lo estamos revisando y te confirmamos a la brevedad.',
  confirmed: 'Tu pedido está confirmado.',
  preparing: 'Estamos preparando tu pedido en el taller.',
  ready: 'Tu pedido está listo para retirar.',
  shipped: 'Tu pedido ya salió y está en camino.',
  delivered: 'Tu pedido fue entregado. ¡Gracias por elegirnos!',
  cancelled: 'Tu pedido fue cancelado. Si tenés dudas, escribinos.',
}

/** Pasos que se muestran en el seguimiento (según sea retiro o envío). */
export function trackingSteps(pickup: boolean): OrderStatus[] {
  return ['pending', 'confirmed', 'preparing', pickup ? 'ready' : 'shipped', 'delivered']
}
