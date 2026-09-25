import type { Payload } from 'payload'

import type { FormsSetting, SiteSetting } from '@/payload-types'
import {
  customerConfirmationEmail,
  leadNotificationEmail,
  type LeadSummary,
} from '@/lib/email/templates'
import type { ContactData, QuoteData } from '@/lib/forms/schemas'
import { loadQuoteCatalog } from '@/lib/quote/catalog'
import { describeItem, formatARS, unitEstimate, validDimensions } from '@/lib/quote/pricing'
import { absoluteUrl } from '@/lib/routes'
import { getWhatsAppConfig, whatsappUrl } from '@/lib/whatsapp'

/**
 * Casos de uso de los formularios públicos: guardar la consulta y enviar los emails.
 * Reciben datos YA validados por zod. El envío de emails nunca hace fallar la consulta:
 * si el SMTP falla, la consulta queda guardada y el error se registra en el log.
 */

export class SubmissionError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message)
  }
}

type Attribution = NonNullable<ContactData['attribution']>

const utmOf = (a: Attribution | undefined) => ({
  source: a?.utm_source || undefined,
  medium: a?.utm_medium || undefined,
  campaign: a?.utm_campaign || undefined,
  content: a?.utm_content || undefined,
  term: a?.utm_term || undefined,
})

const utmSummary = (a: Attribution | undefined) =>
  [a?.utm_source, a?.utm_medium, a?.utm_campaign].filter(Boolean).join(' / ') || undefined

async function recipients(payload: Payload, settings: FormsSetting): Promise<string[]> {
  const fromEnv = (process.env.LEADS_NOTIFICATION_EMAIL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const fromCms = (settings.notificationEmails ?? []).map((r) => r.email)
  const all = [...new Set([...fromEnv, ...fromCms].map((e) => e.toLowerCase()))]
  if (!all.length) payload.logger.warn('No hay destinatarios configurados para avisos de consultas')
  return all
}

async function sendEmails(
  payload: Payload,
  summary: LeadSummary,
  customer: { email?: string; name: string },
  settings: FormsSetting,
  site: SiteSetting,
  customerView?: { items: LeadSummary['items']; total: string | null; disclaimer: string | null },
): Promise<void> {
  const to = await recipients(payload, settings)
  const tasks: Promise<unknown>[] = []

  if (to.length) {
    const mail = leadNotificationEmail(summary)
    tasks.push(
      payload.sendEmail({
        to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: customer.email || undefined,
      }),
    )
  }

  const conf = settings.customerConfirmation
  if (customer.email && conf?.enabled !== false) {
    const mail = customerConfirmationEmail({
      subject: conf?.subject || `Recibimos tu consulta — ${site.brandName}`,
      name: customer.name,
      intro: conf?.intro || 'Recibimos tu consulta y te responderemos a la brevedad.',
      closing: conf?.closing || '',
      items: customerView?.items,
      total: customerView?.total,
      disclaimer: customerView?.disclaimer,
      whatsappUrl: whatsappUrl(getWhatsAppConfig(site)),
      brandName: site.brandName,
    })
    tasks.push(
      payload.sendEmail({
        to: customer.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    )
  }

  const results = await Promise.allSettled(tasks)
  for (const r of results) {
    if (r.status === 'rejected') payload.logger.error({ err: r.reason }, 'lead email failed')
  }
}

export async function submitContact(payload: Payload, data: ContactData): Promise<{ id: number }> {
  const [settings, site] = await Promise.all([
    payload.findGlobal({ slug: 'forms-settings', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true }),
  ])

  const isProject = data.audience === 'professional'
  const project = isProject
    ? {
        company: data.project?.company || undefined,
        role: data.project?.role || undefined,
        location: data.project?.location || undefined,
        stage: data.project?.stage || undefined,
        openings: data.project?.openings || undefined,
        timeline: data.project?.timeline || undefined,
        plansUrl: data.project?.plansUrl || undefined,
      }
    : undefined
  const lead = await payload.create({
    collection: 'leads',
    overrideAccess: true,
    data: {
      type: isProject ? 'project' : 'contact',
      project,
      status: 'new',
      name: data.name,
      lastName: data.lastName || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      city: data.city || undefined,
      projectType: data.projectType || undefined,
      product: data.productId,
      productLine: data.lineId,
      message: data.message,
      source: isProject ? 'Formulario obras y profesionales' : 'Formulario de contacto',
      landingPage: data.attribution?.landingPage || undefined,
      referrer: data.attribution?.referrer || undefined,
      utm: utmOf(data.attribution),
    },
  })

  const fullName = [data.name, data.lastName].filter(Boolean).join(' ')
  await sendEmails(
    payload,
    {
      kind: isProject ? 'project' : 'contact',
      fullName,
      project,
      email: data.email,
      phone: data.phone,
      city: data.city,
      projectType: data.projectType,
      message: data.message,
      source:
        data.pageUrl || (isProject ? 'Formulario obras y profesionales' : 'Formulario de contacto'),
      utm: utmSummary(data.attribution),
      adminUrl: absoluteUrl(`/admin/collections/leads/${lead.id}`),
    },
    { email: data.email, name: data.name },
    settings,
    site,
  )

  payload.logger.info({ leadId: lead.id, type: isProject ? 'project' : 'contact' }, 'lead created')
  return { id: lead.id }
}

export async function submitQuote(
  payload: Payload,
  data: QuoteData,
): Promise<{ id: number; total: number | null }> {
  const catalog = await loadQuoteCatalog(payload)
  if (data.items.length > catalog.maxItems) {
    throw new SubmissionError(`Podés cotizar hasta ${catalog.maxItems} aberturas por pedido.`, {
      items: 'Demasiados ítems.',
    })
  }

  // Revalida cada ítem contra el catálogo publicado y recalcula el precio en el servidor.
  const items = data.items.map((item, i) => {
    const product = catalog.products.find((p) => p.id === item.productId)
    if (!product)
      throw new SubmissionError('Uno de los productos ya no está disponible.', {
        [`items.${i}`]: 'Producto no disponible.',
      })
    const line =
      product.pricing === 'line' ? (catalog.lines.find((l) => l.id === item.lineId) ?? null) : null
    if (product.pricing === 'line' && !line) {
      throw new SubmissionError('Elegí una línea para cada abertura.', {
        [`items.${i}`]: 'Falta la línea.',
      })
    }
    if (!validDimensions(item, catalog.pricing)) {
      throw new SubmissionError(
        `Las medidas deben estar entre ${catalog.pricing.minDimension} y ${catalog.pricing.maxDimension} cm.`,
        { [`items.${i}`]: 'Medidas fuera de rango.' },
      )
    }
    const glass = line?.glass.some((g) => g.name === item.glass)
      ? item.glass
      : (line?.glass[0]?.name ?? null)
    const normalized = { ...item, glass, side2: product.secondSide ? (item.side2 ?? null) : null }
    const unit = unitEstimate(normalized, product, line, catalog.pricing)
    return {
      input: normalized,
      product,
      line,
      unit,
      total: unit !== null ? unit * item.quantity : null,
    }
  })

  const total = items.every((i) => i.total !== null)
    ? items.reduce((acc, i) => acc + (i.total ?? 0), 0)
    : null
  const [settings, site] = await Promise.all([
    payload.findGlobal({ slug: 'forms-settings', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true }),
  ])

  const measurements = items
    .map((i) => `${i.product.name}: ${describeItem(i.input, i.product, i.line)}`)
    .join('\n')

  const lead = await payload.create({
    collection: 'leads',
    overrideAccess: true,
    data: {
      type: 'quotation',
      status: 'new',
      name: data.name,
      lastName: data.lastName || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      city: data.city || undefined,
      projectType: data.projectType || undefined,
      product: items[0]?.product.id,
      productLine: items[0]?.line?.id,
      measurements,
      message: data.message || undefined,
      source: 'Cotizador online',
      landingPage: data.attribution?.landingPage || undefined,
      referrer: data.attribution?.referrer || undefined,
      utm: utmOf(data.attribution),
      quote: {
        need: data.need || undefined,
        visitRequested: data.visitRequested,
        estimatedTotal: total ?? undefined,
        additionalInformation: data.message || undefined,
        items: items.map((i) => ({
          product: i.product.id,
          line: i.line?.id,
          glass: i.input.glass ?? undefined,
          width: i.input.width,
          height: i.input.height,
          side2: i.input.side2 ?? undefined,
          quantity: i.input.quantity,
          estimate: i.total ?? undefined,
        })),
      },
    },
  })

  const show = catalog.pricing.showPrices
  const summaryItems = items.map((i) => ({
    title: i.product.name,
    description: describeItem(i.input, i.product, i.line),
    estimate: show && i.total !== null ? formatARS(i.total) : null,
  }))
  const fullName = [data.name, data.lastName].filter(Boolean).join(' ')

  await sendEmails(
    payload,
    {
      kind: 'quotation',
      fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      projectType: data.projectType,
      need: data.need,
      visitRequested: data.visitRequested,
      message: data.message,
      items: items.map((i) => ({
        title: i.product.name,
        description: describeItem(i.input, i.product, i.line),
        estimate: i.total !== null ? formatARS(i.total) : null,
      })),
      total: total !== null ? formatARS(total) : null,
      source: data.pageUrl || 'Cotizador online',
      utm: utmSummary(data.attribution),
      adminUrl: absoluteUrl(`/admin/collections/leads/${lead.id}`),
    },
    { email: data.email, name: data.name },
    settings,
    site,
    {
      items: summaryItems,
      total: show && total !== null ? formatARS(total) : null,
      disclaimer: show ? catalog.pricing.disclaimer : null,
    },
  )

  payload.logger.info({ leadId: lead.id, type: 'quotation', items: items.length }, 'lead created')
  return { id: lead.id, total: show ? total : null }
}
