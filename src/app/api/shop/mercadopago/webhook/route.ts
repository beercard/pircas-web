import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { getPayment } from '@/lib/shop/mercadopago'

/**
 * Webhook de Mercado Pago. No se confía en el cuerpo recibido: solo se toma el id del pago
 * y se consulta su estado real a Mercado Pago con las credenciales del servidor.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  let id = url.searchParams.get('data.id') || url.searchParams.get('id')
  const topic = url.searchParams.get('type') || url.searchParams.get('topic')
  try {
    const body = (await req.json()) as { type?: string; data?: { id?: string | number } }
    if (body?.data?.id) id = String(body.data.id)
    if (body?.type && body.type !== 'payment') return new Response(null, { status: 200 })
  } catch {
    // Notificación sin cuerpo JSON: se usan los parámetros de la URL.
  }
  if (topic && topic !== 'payment') return new Response(null, { status: 200 })
  if (!id) return new Response(null, { status: 200 })

  const payment = await getPayment(id)
  if (!payment?.orderNumber) return new Response(null, { status: 200 })

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: payment.orderNumber } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const order = docs[0]
  if (!order || order.paymentMethod !== 'mercadopago') return new Response(null, { status: 200 })

  try {
    if (payment.status === 'approved' && order.paymentStatus !== 'paid') {
      if (payment.amount + 1 < (order.total ?? 0)) {
        payload.logger.warn(
          { order: order.orderNumber, payment: payment.id },
          'payment amount lower than order total',
        )
      } else {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            paymentStatus: 'paid',
            paymentReference: payment.id,
            status: order.status === 'pending' ? 'confirmed' : order.status,
          },
          overrideAccess: true,
        })
      }
    } else if (payment.status === 'rejected' && order.paymentStatus === 'pending') {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { paymentStatus: 'rejected', paymentReference: payment.id },
        overrideAccess: true,
      })
    }
  } catch (err) {
    payload.logger.error({ err, order: order.orderNumber }, 'mercadopago webhook failed')
    return new Response(null, { status: 500 })
  }
  return new Response(null, { status: 200 })
}
