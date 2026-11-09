'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/data/client'
import { clientIp, createRateLimiter } from '@/lib/forms/rate-limit'
import { ROUTES } from '@/lib/routes'

const limiter = createRateLimiter({ limit: 8, windowMs: 10 * 60 * 1000 })

export type LookupState = { error: string | null }

/** Busca un pedido por número + email y lleva a su página de seguimiento. */
export async function lookupOrder(_prev: LookupState, form: FormData): Promise<LookupState> {
  const number = String(form.get('number') ?? '')
    .trim()
    .toUpperCase()
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
  if (!/^P\d{6}-\d{4}$/.test(number) || !/^\S+@\S+\.\S+$/.test(email) || email.length > 160)
    return { error: 'Revisá el número de pedido (ej: P261109-1234) y el email.' }

  const ip = clientIp(await headers())
  if (!limiter.check(`lookup:${ip}`).allowed)
    return { error: 'Demasiados intentos. Esperá unos minutos o escribinos por WhatsApp.' }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'orders',
    where: { and: [{ orderNumber: { equals: number } }, { 'customer.email': { equals: email } }] },
    depth: 0,
    limit: 1,
    showHiddenFields: true,
    overrideAccess: true,
  })
  const order = docs[0] as ((typeof docs)[number] & { accessToken?: string }) | undefined
  if (!order?.accessToken)
    return { error: 'No encontramos un pedido con esos datos. Revisá el número y el email.' }
  redirect(`${ROUTES.order}/${order.orderNumber}?t=${order.accessToken}`)
}
