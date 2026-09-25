import type { Endpoint, Where } from 'payload'

import type { Lead } from '@/payload-types'
import { labelFor, LEAD_STATUSES, LEAD_TYPES } from '@/lib/options'

import { toCsv, type CsvColumn } from './csv'

const nameOf = (rel: unknown, key = 'name'): string =>
  rel && typeof rel === 'object' && key in rel ? String((rel as Record<string, unknown>)[key]) : ''

const columns: CsvColumn<Lead>[] = [
  { header: 'Fecha', value: (l) => new Date(l.createdAt).toLocaleString('es-AR') },
  { header: 'Tipo', value: (l) => labelFor(LEAD_TYPES, l.type) },
  { header: 'Estado', value: (l) => labelFor(LEAD_STATUSES, l.status) },
  { header: 'Nombre', value: (l) => l.name },
  { header: 'Apellido', value: (l) => l.lastName },
  { header: 'Email', value: (l) => l.email },
  { header: 'Teléfono', value: (l) => l.phone },
  { header: 'Ciudad', value: (l) => l.city },
  { header: 'Tipo de proyecto', value: (l) => l.projectType },
  { header: 'Producto', value: (l) => nameOf(l.product) },
  { header: 'Línea', value: (l) => nameOf(l.productLine) },
  { header: 'Empresa / estudio', value: (l) => l.project?.company },
  { header: 'Rol', value: (l) => l.project?.role },
  { header: 'Obra y ubicación', value: (l) => l.project?.location },
  { header: 'Etapa', value: (l) => l.project?.stage },
  { header: 'Aberturas (aprox.)', value: (l) => l.project?.openings },
  { header: 'Entrega estimada', value: (l) => l.project?.timeline },
  { header: 'Planos', value: (l) => l.project?.plansUrl },
  { header: 'Qué necesita', value: (l) => l.quote?.need },
  {
    header: 'Aberturas',
    value: (l) =>
      (l.quote?.items ?? [])
        .map(
          (i) =>
            `${i.quantity ?? 1}x ${nameOf(i.product) || 'abertura'}${i.line ? ` (${nameOf(i.line)})` : ''}${i.glass ? ` vidrio ${i.glass}` : ''} ${i.width ?? '?'}x${i.height ?? '?'}${i.side2 ? `x${i.side2}` : ''} cm`,
        )
        .join(' | '),
  },
  { header: 'Total estimado', value: (l) => l.quote?.estimatedTotal },
  { header: 'Medición en obra', value: (l) => (l.quote?.visitRequested ? 'Sí' : '') },
  { header: 'Medidas', value: (l) => l.measurements },
  { header: 'Mensaje', value: (l) => l.message || l.quote?.additionalInformation },
  { header: 'Formulario', value: (l) => l.source },
  { header: 'Página de llegada', value: (l) => l.landingPage },
  { header: 'utm_source', value: (l) => l.utm?.source },
  { header: 'utm_medium', value: (l) => l.utm?.medium },
  { header: 'utm_campaign', value: (l) => l.utm?.campaign },
  { header: 'utm_content', value: (l) => l.utm?.content },
  { header: 'utm_term', value: (l) => l.utm?.term },
  {
    header: 'Notas internas',
    value: (l) => (l.internalNotes ?? []).map((n) => `${n.author ?? ''}: ${n.note}`).join(' | '),
  },
]

/**
 * GET /api/leads/export — descarga las consultas en CSV.
 * Respeta los filtros de la lista del panel (`?where[...]`). Solo usuarios del panel.
 */
export const exportLeadsEndpoint: Endpoint = {
  path: '/export',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const where = (req.query?.where as Where | undefined) ?? undefined
    const { docs } = await req.payload.find({
      collection: 'leads',
      where,
      depth: 1,
      limit: 0,
      pagination: false,
      sort: '-createdAt',
      overrideAccess: false,
      user: req.user,
      req,
    })

    const csv = toCsv(docs, columns)
    const date = new Date().toISOString().slice(0, 10)
    req.payload.logger.info({ count: docs.length, user: req.user.email }, 'leads exported')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="consultas-pircas-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}
