/**
 * Plantillas de email (HTML con estilos en línea, compatibles con clientes de correo
 * + versión texto plano). Todo dato ingresado por el usuario se escapa.
 */

export type EmailContent = { subject: string; html: string; text: string }

export const escapeHtml = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const BRAND = '#B8502C'
const INK = '#26272B'
const MUTED = '#5F6066'

function layout(title: string, body: string, footer: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#FAF9F7;font-family:Montserrat,Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #ECEAE6">
<tr><td style="background:${INK};padding:22px 28px;color:#fff;font-size:15px;letter-spacing:4px;font-weight:600">PIRCAS <span style="font-size:9px;letter-spacing:3px;font-weight:500;opacity:.8">ABERTURAS</span></td></tr>
<tr><td style="height:4px;background:${BRAND}"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;font-weight:500">${escapeHtml(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #ECEAE6;font-size:12px;color:${MUTED}">${footer}</td></tr>
</table></td></tr></table></body></html>`
}

type Row = [label: string, value: unknown]

function table(rows: Row[]): string {
  const visible = rows.filter(([, v]) => v !== undefined && v !== null && v !== '')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">${visible
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #ECEAE6;color:${MUTED};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #ECEAE6;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>`
}

const textTable = (rows: Row[]) =>
  rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

function button(href: string, label: string): string {
  return `<p style="margin:24px 0 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-radius:0 999px 999px 0">${escapeHtml(label)}</a></p>`
}

export type LeadSummary = {
  kind: 'contact' | 'quotation'
  fullName: string
  email?: string
  phone?: string
  city?: string
  projectType?: string
  message?: string
  need?: string
  visitRequested?: boolean
  items?: { title: string; description: string; estimate: string | null }[]
  total?: string | null
  source?: string
  utm?: string
  adminUrl: string
}

/** Aviso interno al equipo por una consulta o cotización nueva. */
export function leadNotificationEmail(lead: LeadSummary): EmailContent {
  const isQuote = lead.kind === 'quotation'
  const subject = `${isQuote ? 'Nueva cotización' : 'Nueva consulta'}: ${lead.fullName}${lead.city ? ` (${lead.city})` : ''}`
  const rows: Row[] = [
    ['Nombre', lead.fullName],
    ['Email', lead.email],
    ['Teléfono', lead.phone],
    ['Ciudad', lead.city],
    ['Proyecto', lead.projectType],
    ['Necesita', lead.need],
    ['Medición en obra', lead.visitRequested ? 'Sí' : undefined],
    ['Mensaje', lead.message],
    ['Origen', lead.source],
    ['Campaña', lead.utm],
  ]
  const items = lead.items?.length
    ? `<h2 style="margin:24px 0 8px;font-size:15px;font-weight:600">Aberturas</h2>${table(
        lead.items.map((i) => [i.title, `${i.description}${i.estimate ? ` — ${i.estimate}` : ''}`]),
      )}${lead.total ? `<p style="margin:12px 0 0;font-size:15px"><strong>Total estimado:</strong> ${escapeHtml(lead.total)}</p>` : ''}`
    : ''
  const html = layout(
    subject,
    `${table(rows)}${items}${button(lead.adminUrl, 'Ver en el panel')}`,
    'Aviso automático del sitio web de PIRCAS.',
  )
  const text = [
    subject,
    '',
    textTable(rows),
    ...(lead.items?.length
      ? [
          '',
          'Aberturas:',
          ...lead.items.map(
            (i) => `- ${i.title}: ${i.description}${i.estimate ? ` — ${i.estimate}` : ''}`,
          ),
        ]
      : []),
    lead.total ? `Total estimado: ${lead.total}` : '',
    '',
    `Ver en el panel: ${lead.adminUrl}`,
  ].join('\n')
  return { subject, html, text }
}

/** Confirmación al cliente (textos editables en el CMS). */
export function customerConfirmationEmail(opts: {
  subject: string
  name: string
  intro: string
  closing: string
  items?: LeadSummary['items']
  total?: string | null
  disclaimer?: string | null
  whatsappUrl?: string | null
  brandName: string
}): EmailContent {
  const greeting = `Hola ${opts.name},`
  const items = opts.items?.length
    ? `<h2 style="margin:24px 0 8px;font-size:15px;font-weight:600">Tu lista</h2>${table(
        opts.items.map((i) => [i.title, `${i.description}${i.estimate ? ` — ${i.estimate}` : ''}`]),
      )}${opts.total ? `<p style="margin:12px 0 0"><strong>Total estimado:</strong> ${escapeHtml(opts.total)}</p>` : ''}${
        opts.disclaimer
          ? `<p style="margin:8px 0 0;font-size:12px;color:${MUTED}">${escapeHtml(opts.disclaimer)}</p>`
          : ''
      }`
    : ''
  const body = `<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(greeting)}</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${MUTED}">${escapeHtml(opts.intro)}</p>${items}
<p style="margin:18px 0 0;font-size:15px;line-height:1.6;color:${MUTED}">${escapeHtml(opts.closing)}</p>${
    opts.whatsappUrl ? button(opts.whatsappUrl, 'Escribinos por WhatsApp') : ''
  }`
  const html = layout(
    opts.subject,
    body,
    `${escapeHtml(opts.brandName)} · Este es un mensaje automático, podés responderlo.`,
  )
  const text = [
    greeting,
    '',
    opts.intro,
    ...(opts.items?.length
      ? [
          '',
          'Tu lista:',
          ...opts.items.map(
            (i) => `- ${i.title}: ${i.description}${i.estimate ? ` — ${i.estimate}` : ''}`,
          ),
        ]
      : []),
    opts.total ? `Total estimado: ${opts.total}` : '',
    opts.disclaimer ?? '',
    '',
    opts.closing,
    opts.whatsappUrl ? `WhatsApp: ${opts.whatsappUrl}` : '',
  ]
    .filter((l) => l !== undefined)
    .join('\n')
  return { subject: opts.subject, html, text }
}
