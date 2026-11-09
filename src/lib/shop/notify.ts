import type { Payload, PayloadRequest } from 'payload'

import type { Order, ShopSetting } from '@/payload-types'
import {
  button,
  escapeHtml,
  layout,
  table,
  textTable,
  type EmailContent,
  type Row,
} from '@/lib/email/templates'
import { absoluteUrl, ROUTES } from '@/lib/routes'
import { normalizePhone } from '@/lib/whatsapp'

import {
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  STATUS_MESSAGES,
  type OrderStatus,
} from './options'
import { formatPrice } from './pricing'

const p = (html: string) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.6">${html}</p>`

function itemsTable(order: Order): string {
  const rows = (order.items ?? [])
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #ECEAE6;font-size:14px">${escapeHtml(i.name)}${i.variant ? `<br><span style="color:#5F6066;font-size:12px">${escapeHtml(i.variant)}</span>` : ''}</td><td style="padding:10px 8px;border-bottom:1px solid #ECEAE6;font-size:14px;text-align:center;white-space:nowrap">× ${i.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #ECEAE6;font-size:14px;text-align:right;white-space:nowrap">${formatPrice(i.subtotal)}</td></tr>`,
    )
    .join('')
  const shipping =
    order.shipping?.quoteLater && !order.shippingCost
      ? 'A coordinar'
      : order.shippingCost
        ? formatPrice(order.shippingCost)
        : 'Sin costo'
  const line = (k: string, v: string, bold = false) =>
    `<tr><td colspan="2" style="padding:8px 0;font-size:${bold ? 16 : 13}px;${bold ? 'font-weight:600' : 'color:#5F6066'}">${k}</td><td style="padding:8px 0;text-align:right;white-space:nowrap;font-size:${bold ? 16 : 13}px;${bold ? 'font-weight:600' : ''}">${v}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 18px">${rows}${line('Subtotal', formatPrice(order.subtotal ?? 0))}${line(`Entrega · ${escapeHtml(order.shipping?.label ?? '')}`, shipping)}${line('Total', formatPrice(order.total ?? 0), true)}</table>`
}

const itemsText = (order: Order) =>
  (order.items ?? [])
    .map(
      (i) =>
        `- ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.quantity}: ${formatPrice(i.subtotal)}`,
    )
    .join('\n') + `\nTotal: ${formatPrice(order.total ?? 0)}`

function bankRows(settings: ShopSetting): Row[] {
  const t = settings.transfer
  return [
    ['Titular', t?.holder],
    ['Banco', t?.bank],
    ['CBU / CVU', t?.cbu],
    ['Alias', t?.alias],
    ['CUIT', t?.cuit],
  ]
}

const FOOTER =
  'PIRCAS Aberturas · Coronda, Santa Fe. Este email se envió porque hiciste un pedido en nuestra tienda.'

export function orderConfirmationEmail(
  order: Order,
  url: string,
  settings: ShopSetting,
): EmailContent {
  const first = order.customerName.split(' ')[0]
  const transfer = order.paymentMethod === 'transfer'
  const bank = bankRows(settings)
  const hasBank = bank.some(([, v]) => v)
  const html = layout(
    `¡Gracias por tu pedido, ${first}!`,
    p(
      `Recibimos tu pedido <strong>${escapeHtml(order.orderNumber)}</strong>. ${escapeHtml(STATUS_MESSAGES.pending)}`,
    ) +
      itemsTable(order) +
      table([
        ['Medio de pago', paymentMethodLabel(order.paymentMethod)],
        [
          'Entrega',
          [order.shipping?.label, order.shipping?.address, order.shipping?.city]
            .filter(Boolean)
            .join(' · '),
        ],
      ]) +
      (transfer && hasBank
        ? `<h2 style="margin:24px 0 10px;font-size:16px;font-weight:600">Datos para la transferencia</h2>` +
          table(bank) +
          (settings.transfer?.instructions
            ? p(`<br>${escapeHtml(settings.transfer.instructions)}`)
            : '')
        : '') +
      button(url, 'Ver el estado de mi pedido'),
    FOOTER,
  )
  const text = [
    `¡Gracias por tu pedido, ${first}!`,
    `Pedido ${order.orderNumber}`,
    itemsText(order),
    `Medio de pago: ${paymentMethodLabel(order.paymentMethod)}`,
    transfer && hasBank ? `Datos para la transferencia:\n${textTable(bank)}` : '',
    `Seguí tu pedido: ${url}`,
  ]
    .filter(Boolean)
    .join('\n\n')
  return { subject: `Recibimos tu pedido ${order.orderNumber} — PIRCAS Aberturas`, html, text }
}

export function orderNotificationEmail(order: Order): EmailContent {
  const admin = absoluteUrl(`/admin/collections/orders/${order.id}`)
  const rows: Row[] = [
    ['Cliente', order.customerName],
    ['Teléfono', order.customer?.phone],
    ['Email', order.customer?.email],
    ['Pago', paymentMethodLabel(order.paymentMethod)],
    [
      'Entrega',
      [
        order.shipping?.label,
        order.shipping?.address,
        order.shipping?.city,
        order.shipping?.province,
      ]
        .filter(Boolean)
        .join(' · '),
    ],
    ['Comentarios', order.notes],
  ]
  return {
    subject: `Nuevo pedido ${order.orderNumber} · ${formatPrice(order.total ?? 0)} · ${order.customerName}`,
    html: layout(
      `Nuevo pedido ${order.orderNumber}`,
      itemsTable(order) + table(rows) + button(admin, 'Abrir el pedido en el panel'),
      'Aviso automático de la tienda online.',
    ),
    text: [`Nuevo pedido ${order.orderNumber}`, itemsText(order), textTable(rows), admin].join(
      '\n\n',
    ),
  }
}

export function orderStatusEmail(
  order: Order,
  url: string,
  change: { statusChanged: boolean; paid: boolean; note?: string },
): EmailContent {
  const status = order.status as OrderStatus
  const title = change.statusChanged
    ? `Tu pedido: ${orderStatusLabel(status)}`
    : 'Recibimos tu pago'
  const lines = [
    change.statusChanged ? STATUS_MESSAGES[status] : '',
    change.paid
      ? `Registramos el pago de tu pedido (${formatPrice(order.total ?? 0)}). ¡Gracias!`
      : '',
    change.note ?? '',
  ].filter(Boolean)
  const tracking: Row[] = [
    ['Transporte', order.shipping?.carrier],
    ['Código de seguimiento', order.shipping?.trackingCode],
    ['Seguimiento', order.shipping?.trackingUrl],
  ]
  return {
    subject: `Pedido ${order.orderNumber}: ${change.statusChanged ? orderStatusLabel(status) : 'pago recibido'}`,
    html: layout(
      title,
      lines.map((l) => p(escapeHtml(l))).join('') +
        (order.status === 'shipped' ? table(tracking) : '') +
        button(url, 'Ver mi pedido'),
      FOOTER,
    ),
    text: [
      title,
      ...lines,
      order.status === 'shipped' ? textTable(tracking) : '',
      `Seguí tu pedido: ${url}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
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

const linkOf = (order: Order & { accessToken?: string | null }) =>
  absoluteUrl(`${ROUTES.order}/${order.orderNumber}?t=${order.accessToken ?? ''}`)

/** Emails al crear el pedido: confirmación al cliente + aviso al taller. */
export async function sendOrderEmails(
  payload: Payload,
  order: Order,
  url: string,
  settings: ShopSetting,
): Promise<void> {
  const tasks: Promise<unknown>[] = []
  if (order.customer?.email) {
    const mail = orderConfirmationEmail(order, url, settings)
    tasks.push(payload.sendEmail({ to: order.customer.email, ...mail }))
  }
  const to = await shopRecipients(payload, settings)
  if (to.length) {
    const mail = orderNotificationEmail(order)
    tasks.push(payload.sendEmail({ to, ...mail, replyTo: order.customer?.email || undefined }))
  } else payload.logger.warn('No hay destinatarios configurados para avisos de pedidos')
  const results = await Promise.allSettled(tasks)
  for (const r of results)
    if (r.status === 'rejected') payload.logger.error({ err: r.reason }, 'order email failed')
}

/** Email al cliente cuando cambia el estado del pedido o se registra el pago. */
export async function notifyOrderStatus(
  payload: Payload,
  order: Order,
  change: { statusChanged: boolean; paid: boolean; note?: string },
  req?: PayloadRequest,
): Promise<void> {
  const id = order.id
  try {
    if (!order.customer?.email) return
    // El token se lee dentro de la misma transacción (el pedido todavía se está guardando).
    const withToken = await payload.findByID({
      collection: 'orders',
      id,
      depth: 0,
      showHiddenFields: true,
      overrideAccess: true,
      req,
    })
    const mail = orderStatusEmail(
      order,
      linkOf({ ...order, accessToken: withToken.accessToken ?? '' }),
      change,
    )
    await payload.sendEmail({ to: order.customer.email, ...mail })
  } catch (err) {
    payload.logger.error({ err, order: id }, 'order status email failed')
  }
}

/** Mensaje de WhatsApp del cliente al taller (página de gracias). */
export function customerWhatsAppMessage(order: Order): string {
  return [
    `Hola PIRCAS, hice el pedido ${order.orderNumber} en la tienda online.`,
    ...(order.items ?? []).map(
      (i) => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.quantity}`,
    ),
    `Total: ${formatPrice(order.total ?? 0)} · ${paymentMethodLabel(order.paymentMethod)}`,
    `Entrega: ${order.shipping?.label ?? ''}`,
  ].join('\n')
}

/** Enlace para avisarle al cliente por WhatsApp desde el panel. */
export function shopToCustomerWhatsApp(order: Order, url: string): string | null {
  const digits = normalizePhone(order.customer?.phone)
  if (!digits) return null
  // Celulares argentinos: WhatsApp usa 54 9 + área + número (sin 0 ni 15).
  const local = digits.startsWith('54')
    ? digits.slice(2).replace(/^9/, '')
    : digits.replace(/^0/, '')
  const number = `549${local.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2')}`
  const text = [
    `Hola ${order.customerName.split(' ')[0]}, te escribimos de PIRCAS Aberturas por tu pedido ${order.orderNumber}.`,
    STATUS_MESSAGES[order.status as OrderStatus],
    order.paymentStatus !== 'paid'
      ? `Estado del pago: ${paymentStatusLabel(order.paymentStatus)}.`
      : '',
    `Podés ver el detalle y el seguimiento acá: ${url}`,
  ]
    .filter(Boolean)
    .join('\n')
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
