import type { Payload } from 'payload'

import type { Lead, Media } from '@/payload-types'
import { getSiteUrl } from '@/lib/routes'

import { dayKey } from './format'

const DAY = 86_400_000
const EXAMPLE_CREDIT = 'Foto de ejemplo'

export type SetupItem = {
  key: string
  title: string
  detail: string
  done: boolean
  href?: string
  /** Lo resuelve quien administra el hosting (variables de entorno), no el panel. */
  technical?: boolean
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

/** Datos del inicio del panel. `isSuperAdmin` suma el estado técnico y de seguridad. */
export async function getDashboardData(payload: Payload, isSuperAdmin: boolean) {
  const now = Date.now()
  const since30 = new Date(now - 30 * DAY).toISOString()
  const since60 = new Date(now - 60 * DAY).toISOString()

  const [
    recent,
    newLeads,
    last30,
    prev30,
    products,
    projects,
    pages,
    media,
    exampleMedia,
    lines,
    obrasCategory,
    settings,
    analytics,
    drafts,
    users,
  ] = await Promise.all([
    payload.find({ collection: 'leads', limit: 6, depth: 1, sort: '-createdAt' }),
    payload.count({ collection: 'leads', where: { status: { equals: 'new' } } }),
    payload.find({
      collection: 'leads',
      where: { createdAt: { greater_than_equal: since30 } },
      limit: 2000,
      depth: 0,
      pagination: false,
      select: { createdAt: true, type: true, quote: { estimatedTotal: true } },
    }),
    payload.count({
      collection: 'leads',
      where: {
        and: [
          { createdAt: { greater_than_equal: since60 } },
          { createdAt: { less_than: since30 } },
        ],
      },
    }),
    payload.count({ collection: 'products', where: { _status: { equals: 'published' } } }),
    payload.find({
      collection: 'projects',
      limit: 200,
      depth: 1,
      pagination: false,
      select: { coverImage: true, category: true, _status: true },
    }),
    payload.count({ collection: 'pages', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'media', where: { credit: { like: EXAMPLE_CREDIT } } }),
    payload.find({
      collection: 'product-lines',
      limit: 50,
      depth: 0,
      pagination: false,
      select: { name: true, datasheetFile: true },
    }),
    payload.find({
      collection: 'project-categories',
      where: { slug: { equals: 'obras' } },
      limit: 1,
      depth: 0,
    }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.findGlobal({ slug: 'analytics', depth: 0 }),
    Promise.all(
      (['products', 'product-lines', 'projects', 'pages'] as const).map((collection) =>
        payload.count({ collection, where: { _status: { equals: 'draft' } } }),
      ),
    ),
    isSuperAdmin
      ? payload.find({
          collection: 'users',
          limit: 50,
          depth: 0,
          showHiddenFields: true,
          sort: '-lastLoginAt',
        })
      : null,
  ])

  // --- Actividad: últimos 30 días + barras de los últimos 14 --------------------------------
  const leads30 = last30.docs as Pick<Lead, 'createdAt' | 'type' | 'quote'>[]
  const quotes30 = leads30.filter((l) => l.type === 'quotation')
  const quotedAmount = quotes30.reduce((sum, l) => sum + (l.quote?.estimatedTotal ?? 0), 0)
  const perDay = new Map<string, number>()
  for (const l of leads30)
    perDay.set(dayKey(l.createdAt), (perDay.get(dayKey(l.createdAt)) ?? 0) + 1)
  const chart = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now - (13 - i) * DAY)
    return { key: dayKey(date), date, count: perDay.get(dayKey(date)) ?? 0 }
  })

  // --- Guía para dejar el sitio listo -------------------------------------------------------
  const projectDocs = projects.docs
  const obrasId = obrasCategory.docs[0]?.id
  const exampleProjects = projectDocs.filter((p) => {
    const cover = p.coverImage as Media | number | null | undefined
    return typeof cover === 'object' && cover?.credit?.startsWith(EXAMPLE_CREDIT)
  }).length
  const obrasProjects = obrasId
    ? projectDocs.filter((p) =>
        (p.category ?? []).some((c) => (typeof c === 'object' ? c.id : c) === obrasId),
      ).length
    : 0
  const linesWithoutPdf = lines.docs.filter((l) => !l.datasheetFile).length
  const businessComplete = Boolean(
    settings.phone &&
    settings.whatsapp?.number &&
    settings.address?.street &&
    settings.workingHours?.length,
  )
  const siteUrl = getSiteUrl()
  const analyticsOn = Boolean(
    analytics.googleTagManagerId ||
    analytics.ga4MeasurementId ||
    process.env.GOOGLE_TAG_MANAGER_ID ||
    process.env.GA4_MEASUREMENT_ID,
  )

  const setup: SetupItem[] = [
    {
      key: 'business',
      title: 'Completá los datos del negocio',
      detail: 'Teléfono, WhatsApp, dirección y horarios que se muestran en todo el sitio.',
      done: businessComplete,
      href: '/admin/globals/site-settings',
    },
    {
      key: 'photos',
      title: 'Reemplazá las fotos de ejemplo',
      detail: exampleMedia.totalDocs
        ? `Quedan ${exampleMedia.totalDocs} fotos de ejemplo. Subí fotos reales de tus trabajos.`
        : 'Todas las fotos son propias.',
      done: exampleMedia.totalDocs === 0,
      href: `/admin/collections/media?where[credit][like]=${encodeURIComponent(EXAMPLE_CREDIT)}`,
    },
    {
      key: 'projects',
      title: 'Subí tus trabajos reales',
      detail: exampleProjects
        ? `${exampleProjects} trabajos todavía usan fotos de ejemplo.`
        : projectDocs.length
          ? 'Tus trabajos ya tienen fotos propias.'
          : 'Todavía no hay trabajos cargados.',
      done: projectDocs.length > 0 && exampleProjects === 0,
      href: '/admin/collections/projects',
    },
    {
      key: 'datasheets',
      title: 'Cargá las fichas técnicas (PDF)',
      detail: linesWithoutPdf
        ? `${linesWithoutPdf} líneas sin ficha técnica para descargar.`
        : 'Todas las líneas tienen su ficha.',
      done: lines.docs.length > 0 && linesWithoutPdf === 0,
      href: '/admin/collections/product-lines',
    },
    {
      key: 'obras',
      title: 'Mostrá obras para profesionales',
      detail: obrasProjects
        ? `${obrasProjects} trabajos en la categoría Obras.`
        : 'Asigná la categoría "Obras" a tus trabajos para mostrarlos en Obras y profesionales.',
      done: obrasProjects > 0,
      href: '/admin/collections/projects',
    },
    ...(isSuperAdmin
      ? [
          {
            key: 'analytics',
            title: 'Conectá Google Analytics',
            detail: analyticsOn
              ? 'Medición activa.'
              : 'Cargá el ID de GA4 o Tag Manager para medir visitas y consultas.',
            done: analyticsOn,
            href: '/admin/globals/analytics',
          },
          {
            key: 'spam',
            title: 'Protección antispam de formularios',
            detail: process.env.TURNSTILE_SECRET_KEY
              ? 'Activa (Cloudflare Turnstile).'
              : 'Sin claves de Turnstile: los formularios del sitio publicado no se pueden enviar.',
            done: Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.TURNSTILE_SITE_KEY),
            technical: true,
          },
          {
            key: 'email',
            title: 'Avisos de consultas por email',
            detail: process.env.SMTP_HOST
              ? 'Configurado.'
              : 'Falta configurar el correo (SMTP) para recibir cada consulta por email.',
            done: Boolean(process.env.SMTP_HOST),
            technical: true,
          },
          {
            key: 'domain',
            title: 'Dominio propio',
            detail: /vercel\.app|localhost/.test(siteUrl)
              ? 'El sitio todavía usa la dirección provisoria de Vercel.'
              : `Publicado en ${siteUrl.replace(/^https?:\/\//, '')}.`,
            done: !/vercel\.app|localhost/.test(siteUrl),
            technical: true,
          },
        ]
      : []),
  ]

  // --- Seguridad (super-admin) --------------------------------------------------------------
  const userDocs = users?.docs ?? []
  const lockedUsers = userDocs.filter(
    (u) => 'lockUntil' in u && u.lockUntil && new Date(u.lockUntil as string).getTime() > now,
  ).length

  return {
    recent: recent.docs,
    newLeads: newLeads.totalDocs,
    activity: {
      total: leads30.length,
      previous: prev30.totalDocs,
      quotes: quotes30.length,
      projects: leads30.filter((l) => l.type === 'project').length,
      quotedAmount,
      chart,
    },
    content: {
      products: products.totalDocs,
      projects: projectDocs.filter((p) => p._status === 'published').length,
      pages: pages.totalDocs,
      media: media.totalDocs,
      drafts: drafts.reduce((sum, d) => sum + d.totalDocs, 0),
    },
    setup,
    security: isSuperAdmin
      ? {
          users: userDocs.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            lastLoginAt: u.lastLoginAt ?? null,
          })),
          lockedUsers,
          spamProtection: Boolean(process.env.TURNSTILE_SECRET_KEY),
        }
      : null,
    siteUrl,
  }
}
