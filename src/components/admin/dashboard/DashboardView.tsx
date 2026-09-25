import { Gutter, Link } from '@payloadcms/ui'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  ChevronRight,
  CircleCheck,
  Circle,
  House,
  Inbox,
  LockKeyhole,
  type LucideIcon,
  Package,
  ShieldCheck,
  Store,
  Wrench,
} from 'lucide-react'
import type { Payload, TypedUser } from 'payload'

import type { Lead } from '@/payload-types'
import { labelFor, LEAD_STATUSES } from '@/lib/options'
import { formatARS } from '@/lib/quote/pricing'

import { getDashboardData } from './data'
import { greeting, longDate, plural, timeAgo } from './format'

type Props = { payload: Payload; user: TypedUser | null }

type Action = { title: string; text: string; href: string; icon: LucideIcon; external?: boolean }

const TYPE_LABEL: Record<string, string> = {
  contact: 'Contacto',
  quotation: 'Cotización',
  project: 'Obra',
}

/** Resumen de una consulta en una línea (qué pidió). */
function leadSummary(lead: Lead): string {
  if (lead.type === 'quotation') {
    const items = lead.quote?.items?.length ?? 0
    const total = lead.quote?.estimatedTotal
    return [plural(items, 'abertura', 'aberturas'), total ? formatARS(total) : null]
      .filter(Boolean)
      .join(' · ')
  }
  if (lead.type === 'project')
    return [lead.project?.company, lead.project?.location].filter(Boolean).join(' · ')
  return lead.projectType || (lead.message ?? '').slice(0, 70)
}

const firstName = (user: TypedUser | null) =>
  ((user && 'name' in user && typeof user.name === 'string' && user.name) || '').split(' ')[0]

/** Decoración de marca: la P-puerta. */
function DoorDecoration() {
  return (
    <svg className="pd-hero__door" viewBox="0 0 480 680" aria-hidden="true">
      <path d="M0 0 H280 A200 200 0 0 1 280 400 H160 V680 H0 Z" fill="currentColor" />
    </svg>
  )
}

/**
 * Inicio del panel (reemplaza al de Payload). Pensado para el día a día de un comercio:
 * qué hay que atender, accesos a las tareas frecuentes, actividad y una guía para dejar
 * el sitio listo.
 */
export async function DashboardView({ payload, user }: Props) {
  if (!user) return null
  const isSuperAdmin = 'role' in user && user.role === 'super-admin'
  const data = await getDashboardData(payload, isSuperAdmin)
  const now = new Date()
  const leadsHref = '/admin/collections/leads'
  const newLeadsHref = `${leadsHref}?where[status][equals]=new`

  const actions: Action[] = [
    {
      title: 'Responder consultas',
      text: data.newLeads
        ? `${plural(data.newLeads, 'consulta nueva', 'consultas nuevas')}`
        : 'Todo al día',
      href: data.newLeads ? newLeadsHref : leadsHref,
      icon: Inbox,
    },
    {
      title: 'Agregar un producto',
      text: 'Ventanas, puertas, mamparas…',
      href: '/admin/collections/products/create',
      icon: Package,
    },
    {
      title: 'Subir un trabajo',
      text: 'Fotos de una obra terminada',
      href: '/admin/collections/projects/create',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Cambiar fotos',
      text: 'Biblioteca de fotos y archivos',
      href: '/admin/collections/media',
      icon: Camera,
    },
    {
      title: 'Editar la página de inicio',
      text: 'Textos, fotos y secciones',
      href: '/admin/globals/homepage',
      icon: House,
    },
    {
      title: 'Datos del negocio',
      text: 'Teléfono, WhatsApp, horarios',
      href: '/admin/globals/site-settings',
      icon: Store,
    },
  ]

  const setupDone = data.setup.filter((s) => s.done).length
  const setupPct = Math.round((setupDone / Math.max(1, data.setup.length)) * 100)
  const maxBar = Math.max(1, ...data.activity.chart.map((d) => d.count))
  const trend = data.activity.total - data.activity.previous

  return (
    <Gutter className="pd">
      {/* Bienvenida */}
      <section className="pd-hero">
        <DoorDecoration />
        <div className="pd-hero__text">
          <p className="pd-hero__date">{longDate(now)}</p>
          <h1 className="pd-hero__title">
            {greeting(now)}
            {firstName(user) ? `, ${firstName(user)}` : ''}
          </h1>
          <p className="pd-hero__lead">
            {data.newLeads
              ? `Tenés ${plural(data.newLeads, 'consulta nueva', 'consultas nuevas')} esperando respuesta.`
              : 'No hay consultas pendientes. ¡Todo al día!'}
          </p>
        </div>
        <div className="pd-hero__actions">
          {data.newLeads > 0 && (
            <Link href={newLeadsHref} className="pd-btn pd-btn--primary">
              Ver consultas nuevas
            </Link>
          )}
          <a
            href={data.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pd-btn pd-btn--ghost"
          >
            Ver mi sitio <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
      </section>

      {/* Tareas frecuentes */}
      <section className="pd-section" aria-labelledby="pd-actions-title">
        <h2 id="pd-actions-title" className="pd-h2">
          ¿Qué querés hacer hoy?
        </h2>
        <div className="pd-actions">
          {actions.map((a) => (
            <Link key={a.title} href={a.href} className="pd-action">
              <span className="pd-action__icon">
                <a.icon aria-hidden="true" size={20} strokeWidth={1.75} />
              </span>
              <span className="pd-action__text">
                <strong>{a.title}</strong>
                <span>{a.text}</span>
              </span>
              <ChevronRight aria-hidden="true" size={18} className="pd-action__chevron" />
            </Link>
          ))}
        </div>
      </section>

      <div className="pd-grid">
        {/* Últimas consultas */}
        <section className="pd-card pd-card--leads" aria-labelledby="pd-leads-title">
          <header className="pd-card__head">
            <h2 id="pd-leads-title" className="pd-h2">
              Últimas consultas
            </h2>
            <Link href={leadsHref} className="pd-link">
              Ver todas
            </Link>
          </header>
          {data.recent.length === 0 ? (
            <div className="pd-empty">
              <Inbox aria-hidden="true" size={28} strokeWidth={1.5} />
              <p>
                Todavía no llegaron consultas. Cuando alguien escriba desde el sitio, la vas a ver
                acá.
              </p>
            </div>
          ) : (
            <ul className="pd-leads">
              {data.recent.map((lead) => (
                <li key={lead.id}>
                  <Link href={`${leadsHref}/${lead.id}`} className="pd-lead">
                    <span className="pd-avatar" aria-hidden="true">
                      {(lead.name || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="pd-lead__main">
                      <span className="pd-lead__name">
                        {lead.fullName || lead.name}
                        <span className={`pd-tag pd-tag--${lead.type}`}>
                          {TYPE_LABEL[lead.type] ?? lead.type}
                        </span>
                      </span>
                      <span className="pd-lead__meta">
                        {leadSummary(lead) || lead.phone || lead.email}
                      </span>
                    </span>
                    <span className="pd-lead__side">
                      <span className={`pd-status pd-status--${lead.status}`}>
                        {labelFor(LEAD_STATUSES, lead.status)}
                      </span>
                      <time dateTime={lead.createdAt}>{timeAgo(lead.createdAt, now)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pd-stack">
          {/* Actividad */}
          <section className="pd-card" aria-labelledby="pd-activity-title">
            <header className="pd-card__head">
              <h2 id="pd-activity-title" className="pd-h2">
                Últimos 30 días
              </h2>
            </header>
            <dl className="pd-stats">
              <div>
                <dt>Consultas</dt>
                <dd>
                  {data.activity.total}
                  {data.activity.previous > 0 && trend !== 0 && (
                    <span className={`pd-trend pd-trend--${trend > 0 ? 'up' : 'down'}`}>
                      {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Cotizaciones</dt>
                <dd>{data.activity.quotes}</dd>
              </div>
              <div>
                <dt>Obras</dt>
                <dd>{data.activity.projects}</dd>
              </div>
              <div>
                <dt>Monto cotizado</dt>
                <dd className="pd-stats__money">
                  {data.activity.quotedAmount ? formatARS(data.activity.quotedAmount) : '—'}
                </dd>
              </div>
            </dl>
            <div
              className="pd-chart"
              role="img"
              aria-label="Consultas por día, últimas dos semanas"
            >
              {data.activity.chart.map((d) => (
                <span
                  key={d.key}
                  className="pd-chart__bar"
                  style={{ height: `${Math.max(4, (d.count / maxBar) * 100)}%` }}
                  data-empty={d.count === 0 || undefined}
                  title={`${d.date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}: ${plural(d.count, 'consulta', 'consultas')}`}
                />
              ))}
            </div>
            <p className="pd-chart__legend">Consultas por día · últimas 2 semanas</p>
          </section>

          {/* Contenido */}
          <section className="pd-card" aria-labelledby="pd-content-title">
            <header className="pd-card__head">
              <h2 id="pd-content-title" className="pd-h2">
                Tu sitio
              </h2>
              <a href={data.siteUrl} target="_blank" rel="noopener noreferrer" className="pd-link">
                Abrir <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </header>
            <ul className="pd-counts">
              <li>
                <Link href="/admin/collections/products">
                  <strong>{data.content.products}</strong> productos
                </Link>
              </li>
              <li>
                <Link href="/admin/collections/projects">
                  <strong>{data.content.projects}</strong> trabajos
                </Link>
              </li>
              <li>
                <Link href="/admin/collections/pages">
                  <strong>{data.content.pages}</strong> páginas
                </Link>
              </li>
              <li>
                <Link href="/admin/collections/media">
                  <strong>{data.content.media}</strong> fotos y archivos
                </Link>
              </li>
            </ul>
            {data.content.drafts > 0 && (
              <p className="pd-note">
                {plural(data.content.drafts, 'borrador sin publicar', 'borradores sin publicar')}.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Guía para dejar el sitio listo */}
      <section className="pd-card pd-setup" aria-labelledby="pd-setup-title">
        <header className="pd-card__head">
          <div>
            <h2 id="pd-setup-title" className="pd-h2">
              Dejá tu sitio listo
            </h2>
            <p className="pd-muted">
              {setupDone} de {data.setup.length} tareas completas
            </p>
          </div>
          <div
            className="pd-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={setupPct}
            aria-label="Avance de la configuración"
          >
            <span style={{ width: `${setupPct}%` }} />
          </div>
        </header>
        <ul className="pd-setup__list">
          {data.setup.map((item) => (
            <li key={item.key} className={item.done ? 'is-done' : undefined}>
              {item.done ? (
                <CircleCheck aria-hidden="true" className="pd-setup__icon" size={22} />
              ) : item.technical ? (
                <Wrench aria-hidden="true" className="pd-setup__icon" size={20} />
              ) : (
                <Circle aria-hidden="true" className="pd-setup__icon" size={22} />
              )}
              <div className="pd-setup__text">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              {!item.done &&
                (item.href ? (
                  <Link href={item.href} className="pd-btn pd-btn--small">
                    Resolver
                  </Link>
                ) : item.technical ? (
                  <span className="pd-chip">Técnico</span>
                ) : null)}
            </li>
          ))}
        </ul>
      </section>

      {/* Seguridad (solo super administrador) */}
      {data.security && (
        <section className="pd-card pd-security" aria-labelledby="pd-security-title">
          <header className="pd-card__head">
            <h2 id="pd-security-title" className="pd-h2">
              Seguridad del panel
            </h2>
            <Link href="/admin/collections/users" className="pd-link">
              Usuarios
            </Link>
          </header>
          <div className="pd-security__grid">
            <ul className="pd-security__rules">
              <li>
                <ShieldCheck aria-hidden="true" size={18} /> Contraseñas de 10+ caracteres con
                letras y números
              </li>
              <li>
                <LockKeyhole aria-hidden="true" size={18} /> Bloqueo por 15 min tras 5 intentos
                fallidos
              </li>
              <li>
                <ShieldCheck aria-hidden="true" size={18} /> La sesión vence a las 8 h; cerrar
                sesión la invalida
              </li>
              <li className={data.security.spamProtection ? undefined : 'is-warning'}>
                <ShieldCheck aria-hidden="true" size={18} /> Antispam en formularios:{' '}
                {data.security.spamProtection ? 'activo' : 'pendiente'}
              </li>
              {data.security.lockedUsers > 0 && (
                <li className="is-warning">
                  <LockKeyhole aria-hidden="true" size={18} />{' '}
                  {plural(data.security.lockedUsers, 'cuenta bloqueada', 'cuentas bloqueadas')}{' '}
                  ahora por intentos fallidos
                </li>
              )}
            </ul>
            <ul className="pd-users">
              {data.security.users.map((u) => (
                <li key={u.id}>
                  <span className="pd-avatar pd-avatar--small" aria-hidden="true">
                    {(u.name || u.email).slice(0, 1).toUpperCase()}
                  </span>
                  <span className="pd-users__main">
                    <strong>{u.name}</strong>
                    <span>{u.role === 'super-admin' ? 'Super administrador' : 'Editor'}</span>
                  </span>
                  <span className="pd-users__last">
                    {u.lastLoginAt
                      ? `Entró ${timeAgo(u.lastLoginAt, now)}`
                      : 'Sin ingresos registrados'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Gutter>
  )
}
