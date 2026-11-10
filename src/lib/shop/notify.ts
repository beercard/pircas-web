import type { Payload } from 'payload'

import type { Order, ShopSetting } from '@/payload-types'
import {
  layout,
  table,
  textTable,
  button,
  escapeHtml,
  type EmailContent,
  type Row,
} from '@/lib/email/templates'
import { absoluteUrl } from '@/lib/routes'

import { toWhatsAppNumber } from './whatsapp-cloud'
import { formatPrice } from './pricing'

function itemsTable(order: Order): string {
  const rows = (order.items ?? [])
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #ECEAE6;font-size:14px">${escapeHtml(i.name)}${i.variant ? `<br><span style="color:#5F6066;font-size:12px">${escapeHtml(i.variant)}</span>` : ''}</td><td style="padding:10px 8px;border-bottom:1px solid #ECEAE6;font-size:14px;text-align:center;white-space:nowrap">× ${i.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #ECEAE6;font-size:14px;text-align:right;white-space:nowrap">${formatPrice(i.subtotal)}</td></tr>`,
    )
    .join('')
  const line = (k: string, v: string, bold = false) =>
    `<tr><td colspan="2" style="padding:8px 0;font-size:${bold ? 16 : 13}px;${bold ? 'font-weight:600' : 'color:#5F6066'}">${k}</td><td style="padding:8px 0;text-align:right;white-space:nowrap;font-size:${bold ? 16 : 13}px;${bold ? 'font-weight:600' : ''}">${v}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 18px">${rows}${line('Total de lista', formatPrice(order.total ?? 0), true)}${order.transferTotal && order.transferTotal < (order.total ?? 0) ? line('Con transferencia / efectivo', formatPrice(order.transferTotal)) : ''}</table>`
}

const itemsText = (order: Order) =>
  (order.items ?? [])
    .map(
      (i) =>
        `• ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.quantity}: ${formatPrice(i.subtotal)}`,
    )
    .join('\n')

/** Líneas de totales para los mensajes de WhatsApp. */
function totalsText(order: Order): string[] {
  const total = order.total ?? 0
  return [
    `Total: ${formatPrice(total)}`,
    order.transferTotal && order.transferTotal < total
      ? `Con transferencia o efectivo: ${formatPrice(order.transferTotal)}`
      : '',
    order.installments && order.installments > 1 && order.installmentAmount
      ? `O ${order.installments} cuotas sin interés de ${formatPrice(order.installmentAmount)}`
      : '',
  ].filter(Boolean)
}

export function quoteNotificationEmail(order: Order): EmailContent {
  const admin = absoluteUrl(`/admin/collections/orders/${order.id}`)
  const rows: Row[] = [
    ['Cliente', order.customerName],
    ['WhatsApp', order.customer?.phone],
    ['Localidad', order.customer?.city],
    ['Comentarios', order.notes],
    ['Origen', order.source],
  ]
  return {
    subject: `Nuevo presupuesto web ${order.orderNumber} · ${formatPrice(order.total ?? 0)} · ${order.customerName}`,
    html: layout(
      `Nuevo presupuesto ${order.orderNumber}`,
      itemsTable(order) + table(rows) + button(admin, 'Abrir el presupuesto en el panel'),
      'Aviso automático del presupuesto online. Escribile al cliente por WhatsApp para cerrar la venta.',
    ),
    text: [
      `Nuevo presupuesto ${order.orderNumber}`,
      itemsText(order),
      totalsText(order).join('\n'),
      textTable(rows),
      admin,
    ].join('\n\n'),
  }
}

async function shopRecipients(payload: Payload, settings: ShopSetting): Promise<string[]> {
  const own = (settings.notificationEmails ?? []).map((r) => r.email)
  const env = (process.env.LEADS_NOTIFICATION_EMAIL ?? '').split(',').map((s) => s.trim())
  let fallback: string[] = []
  if (!own.length) {
    const forms = await payload.findGlobal({ slug: 'forms-settings', depth: 0 })
    fallback = (forms.notificationEmails ?? []).map((r) => r.email)
  }
  return [...new Set([...own, ...env, ...fallback].filter(Boolean).map((e) => e.toLowerCase()))]
}

/** Aviso al taller de cada presupuesto pedido. */
export async function sendQuoteNotification(
  payload: Payload,
  order: Order,
  settings: ShopSetting,
): Promise<void> {
  const to = await shopRecipients(payload, settings)
  if (!to.length) {
    payload.logger.warn('No hay destinatarios configurados para avisos de presupuestos')
    return
  }
  await payload.sendEmail({ to, ...quoteNotificationEmail(order) })
}

/** Mensaje que el cliente nos manda desde la página del presupuesto (le queda guardado en su chat). */
export function customerQuoteMessage(order: Order, url: string): string {
  return [
    `Hola PIRCAS, soy ${order.customerName}. Pedí el presupuesto ${order.orderNumber} en la web:`,
    itemsText(order),
    ...totalsText(order),
    order.customer?.city ? `Localidad: ${order.customer.city}` : '',
    `Ver presupuesto: ${url}`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Enlace para escribirle al cliente por WhatsApp desde el panel, con su presupuesto. */
export function shopToCustomerWhatsApp(order: Order, url: string): string | null {
  const number = toWhatsAppNumber(order.customer?.phone)
  if (!number) return null
  const text = [
    `Hola ${order.customerName.split(' ')[0]}, te escribimos de PIRCAS Aberturas por tu presupuesto ${order.orderNumber}:`,
    itemsText(order),
    ...totalsText(order),
    `Podés verlo completo acá: ${url}`,
    '¿Querés que lo avancemos o tenés alguna consulta?',
  ].join('\n')
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
