import type { Order } from '@/payload-types'
import { absoluteUrl, ROUTES } from '@/lib/routes'

/** Enlace privado del presupuesto (número + token). */
export const quoteUrl = (order: Pick<Order, 'orderNumber'>, token: string) =>
  absoluteUrl(`${ROUTES.quoteResult}/${order.orderNumber}?t=${token}`)
