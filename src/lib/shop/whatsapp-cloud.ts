/**
 * Envío automático del presupuesto al WhatsApp del cliente con la API oficial de WhatsApp
 * Business (Meta Cloud API). Es opcional: sin estas variables el sitio igual muestra el
 * presupuesto en pantalla y ofrece abrirlo en WhatsApp.
 *
 *   WHATSAPP_CLOUD_TOKEN          token permanente del usuario del sistema
 *   WHATSAPP_CLOUD_PHONE_ID       id del número de WhatsApp Business
 *   WHATSAPP_QUOTE_TEMPLATE       plantilla aprobada (ej: "presupuesto_web")
 *   WHATSAPP_QUOTE_TEMPLATE_LANG  idioma de la plantilla (por defecto "es_AR")
 *
 * La plantilla recibe 4 variables en el cuerpo: {{1}} nombre, {{2}} n.º de presupuesto,
 * {{3}} total y {{4}} enlace al presupuesto.
 */

export const isWhatsAppCloudReady = () =>
  Boolean(
    process.env.WHATSAPP_CLOUD_TOKEN &&
    process.env.WHATSAPP_CLOUD_PHONE_ID &&
    process.env.WHATSAPP_QUOTE_TEMPLATE,
  )

/** Celulares argentinos: 54 9 + área + número (sin 0 ni 15). */
export function toWhatsAppNumber(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length < 8) return null
  const local = digits.startsWith('54')
    ? digits.slice(2).replace(/^9/, '')
    : digits.replace(/^0/, '')
  const clean = local.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2')
  return clean.length >= 10 ? `549${clean}` : null
}

export async function sendQuoteTemplate(input: {
  to: string
  name: string
  number: string
  total: string
  url: string
}): Promise<boolean> {
  if (!isWhatsAppCloudReady()) return false
  const to = toWhatsAppNumber(input.to)
  if (!to) return false
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_CLOUD_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: process.env.WHATSAPP_QUOTE_TEMPLATE,
          language: { code: process.env.WHATSAPP_QUOTE_TEMPLATE_LANG || 'es_AR' },
          components: [
            {
              type: 'body',
              parameters: [input.name, input.number, input.total, input.url].map((text) => ({
                type: 'text',
                text,
              })),
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!res.ok) throw new Error(`WhatsApp Cloud API ${res.status}: ${await res.text()}`)
  return true
}
