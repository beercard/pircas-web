/**
 * Mercado Pago (Checkout Pro) por API REST, sin SDK.
 * Se activa con MERCADOPAGO_ACCESS_TOKEN; sin esa variable el pedido se registra igual y
 * el pago con Mercado Pago se coordina a mano (link de pago).
 */

const API = 'https://api.mercadopago.com'

const token = () => process.env.MERCADOPAGO_ACCESS_TOKEN || null

export const isMercadoPagoConnected = (): boolean => Boolean(token())

export type PreferenceInput = {
  orderNumber: string
  title: string
  total: number
  installments: number
  payer: { name: string; email?: string }
  returnUrl: string
  /** URL pública del webhook (Mercado Pago no acepta localhost). */
  notificationUrl: string | null
}

/** Crea la preferencia de pago y devuelve la URL a la que se redirige al cliente. */
export async function createPreference(input: PreferenceInput): Promise<string | null> {
  const accessToken = token()
  if (!accessToken) return null
  const res = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': input.orderNumber,
    },
    body: JSON.stringify({
      // Un solo ítem por el total: el detalle queda en el pedido y el monto coincide siempre.
      items: [{ title: input.title, quantity: 1, unit_price: input.total, currency_id: 'ARS' }],
      payer: { name: input.payer.name, email: input.payer.email || undefined },
      external_reference: input.orderNumber,
      payment_methods: { installments: Math.max(1, input.installments) },
      back_urls: { success: input.returnUrl, pending: input.returnUrl, failure: input.returnUrl },
      auto_return: input.returnUrl.startsWith('https://') ? 'approved' : undefined,
      notification_url: input.notificationUrl || undefined,
      statement_descriptor: 'PIRCAS',
    }),
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`Mercado Pago respondió ${res.status}`)
  const data = (await res.json()) as { init_point?: string }
  return data.init_point ?? null
}

export type PaymentInfo = {
  id: string
  status: string
  orderNumber: string | null
  amount: number
}

/**
 * Consulta un pago directamente a Mercado Pago. El webhook nunca confía en el cuerpo que
 * recibe: solo toma el id y pregunta el estado real con nuestras credenciales.
 */
export async function getPayment(id: string): Promise<PaymentInfo | null> {
  const accessToken = token()
  if (!accessToken || !/^\d{1,30}$/.test(id)) return null
  const res = await fetch(`${API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) return null
  const p = (await res.json()) as {
    id?: number
    status?: string
    external_reference?: string
    transaction_amount?: number
  }
  return {
    id: String(p.id ?? id),
    status: p.status ?? 'unknown',
    orderNumber: p.external_reference ?? null,
    amount: p.transaction_amount ?? 0,
  }
}
